const { Op, Transaction } = require("sequelize");
const { Project, Document, CreditLedger, sequelize } = require("../../models");
const { httpError } = require("../../utils/httpError");
const creditsService = require("../credits/credits.service");
const geminiService = require("../../services/geminiService");

const PAGE_SIZE = 10;

const sortMap = {
  recent: [["createdAt", "DESC"]],
  az: [["title", "ASC"]]
};
const ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;
const PLACEHOLDER_TITLE = "Projeto em geracao";

const runWithStrongIsolation = async (work) => {
  try {
    return await sequelize.transaction(
      { isolationLevel: ISOLATION_LEVELS.SERIALIZABLE },
      work
    );
  } catch (error) {
    if (!String(error?.message || "").toLowerCase().includes("isolation")) {
      throw error;
    }

    return sequelize.transaction(
      { isolationLevel: ISOLATION_LEVELS.REPEATABLE_READ },
      work
    );
  }
};

const listProjects = async (userId, query) => {
  const where = {
    userId,
    status: {
      [Op.ne]: "FAILED"
    }
  };

  if (query.search) {
    where.title = { [Op.iLike]: `%${query.search}%` };
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.tag) {
    where.tags = { [Op.contains]: [query.tag] };
  }

  const page = query.page || 1;
  const offset = (page - 1) * PAGE_SIZE;
  const order = sortMap[query.sort] || sortMap.recent;

  const { rows, count } = await Project.findAndCountAll({
    where,
    order,
    limit: PAGE_SIZE,
    offset
  });
  const balance = await creditsService.getBalance(userId);

  return {
    items: rows,
    meta: {
      page,
      pageSize: PAGE_SIZE,
      totalItems: count,
      totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
      balance
    }
  };
};

const getProjectById = async (userId, projectId) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      userId
    },
    include: [
      {
        model: Document,
        as: "documents"
      }
    ]
  });

  if (!project) {
    throw httpError(404, "Project not found");
  }

  return project;
};

const updateProject = async (userId, projectId, payload) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      userId
    }
  });

  if (!project) {
    throw httpError(404, "Project not found");
  }

  if (payload.title !== undefined) {
    project.title = payload.title;
  }

  if (payload.category !== undefined) {
    project.category = payload.category;
  }

  if (payload.tags !== undefined) {
    project.tags = payload.tags;
  }

  await project.save();
  return project;
};

const getExistingGenerationByIdempotency = async (
  userId,
  idempotencyKey,
  options = {}
) => {
  if (!idempotencyKey) {
    return null;
  }

  return CreditLedger.findOne({
    where: {
      userId,
      idempotencyKey,
      type: "DEBIT",
      reason: "GENERATION"
    },
    order: [["createdAt", "DESC"]],
    transaction: options.transaction,
    lock: options.lock
  });
};

const generateProject = async (userId, payload, idempotencyKey) => {
  if (!idempotencyKey) {
    throw httpError(400, "Idempotency-Key header is required");
  }

  const existingGeneration = await getExistingGenerationByIdempotency(
    userId,
    idempotencyKey
  );

  if (existingGeneration?.projectId) {
    return { projectId: existingGeneration.projectId };
  }

  const balance = await creditsService.getBalance(userId);
  if (balance < 1) {
    throw httpError(402, "Insufficient credits to generate project");
  }

  let projectId = null;
  let debitApplied = false;

  try {
    const creationResult = await runWithStrongIsolation(async (transaction) => {
      const existingInTx = await getExistingGenerationByIdempotency(
        userId,
        idempotencyKey,
        { transaction, lock: transaction.LOCK.UPDATE }
      );
      if (existingInTx?.projectId) {
        return {
          projectId: existingInTx.projectId,
          created: false
        };
      }

      const txBalance = await creditsService.getBalance(userId, { transaction });
      if (txBalance < 1) {
        throw httpError(402, "Insufficient credits to generate project");
      }

      const project = await Project.create(
        {
          userId,
          title: payload.title?.trim() || PLACEHOLDER_TITLE,
          category: payload.category || null,
          tags: payload.tags,
          promptPayload: payload,
          status: "GENERATING"
        },
        { transaction }
      );

      const debitEntry = await creditsService.debitForGeneration(
        userId,
        project.id,
        idempotencyKey,
        {
          transaction
        }
      );

      if (debitEntry.projectId && debitEntry.projectId !== project.id) {
        await project.destroy({ transaction });
        return {
          projectId: debitEntry.projectId,
          created: false
        };
      }

      if (!debitEntry.projectId) {
        await debitEntry.update({ projectId: project.id }, { transaction });
      }

      return {
        projectId: project.id,
        created: true
      };
    });

    if (!creationResult.created) {
      return { projectId: creationResult.projectId };
    }

    projectId = creationResult.projectId;
    debitApplied = true;

    const generated = await geminiService.generateProjectDocs(payload);
    const finalTitle =
      payload.title?.trim() || generated.suggested_title?.trim() || PLACEHOLDER_TITLE;

    await runWithStrongIsolation(async (transaction) => {
      const project = await Project.findOne({
        where: {
          id: projectId,
          userId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!project) {
        throw httpError(404, "Project not found");
      }

      await project.update(
        {
          title: finalTitle,
          status: "READY"
        },
        { transaction }
      );

      await Document.bulkCreate(
        [
          {
            projectId,
            type: "GENERAL",
            contentMd: generated.general_md
          },
          {
            projectId,
            type: "TECH_SPECS",
            contentMd: generated.tech_specs_md
          },
          {
            projectId,
            type: "ROADMAP",
            contentMd: generated.roadmap_md
          }
        ],
        { transaction }
      );
    });

    return { projectId };
  } catch (error) {
    if (projectId && debitApplied) {
      try {
        await runWithStrongIsolation(async (transaction) => {
          await Project.update(
            { status: "FAILED" },
            {
              where: {
                id: projectId,
                userId
              },
              transaction
            }
          );

          await creditsService.creditRefund(
            userId,
            projectId,
            `${idempotencyKey}-refund`,
            { transaction }
          );
        });
      } catch (refundError) {
        console.error("[projectsService] refund/failed-status flow error:", refundError);
      }
    }

    throw error;
  }
};

const deleteProject = async (userId, projectId) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      userId
    }
  });

  if (!project) {
    throw httpError(404, "Project not found");
  }

  await project.destroy();
};

module.exports = {
  listProjects,
  getProjectById,
  updateProject,
  generateProject,
  deleteProject
};
