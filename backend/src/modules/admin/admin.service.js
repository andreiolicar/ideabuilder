const { Op, Transaction } = require("sequelize");
const { User, CreditLedger, sequelize } = require("../../models");
const creditsService = require("../credits/credits.service");
const { httpError } = require("../../utils/httpError");

const PAGE_SIZE = 10;
const ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;

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

const listUsers = async ({ search, page = 1 }) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * PAGE_SIZE;

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: {
      exclude: ["passwordHash"],
      include: [
        [
          sequelize.literal(`COALESCE((
            SELECT SUM(CASE WHEN cl.type = 'CREDIT' THEN cl.amount ELSE -cl.amount END)
            FROM credit_ledger cl
            WHERE cl.user_id = "User"."id"
          ), 0)`),
          "balance"
        ]
      ]
    },
    order: [["createdAt", "DESC"]],
    limit: PAGE_SIZE,
    offset
  });

  const items = rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    balance: Number(user.get("balance") || 0)
  }));

  return {
    items,
    meta: {
      page,
      pageSize: PAGE_SIZE,
      totalItems: count,
      totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE))
    }
  };
};

const adjustCredits = async ({ userId, delta, adminId }) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw httpError(404, "User not found");
  }

  return runWithStrongIsolation(async (transaction) => {
    await creditsService.adminAdjust(userId, delta, adminId, null, { transaction });
    const newBalance = await creditsService.getBalance(userId, { transaction });

    return {
      userId,
      newBalance
    };
  });
};

const listLedger = async ({ userId, page = 1 }) => {
  const where = {};

  if (userId) {
    where.userId = userId;
  }

  const offset = (page - 1) * PAGE_SIZE;

  const { rows, count } = await CreditLedger.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: PAGE_SIZE,
    offset
  });

  return {
    items: rows,
    meta: {
      page,
      pageSize: PAGE_SIZE,
      totalItems: count,
      totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE))
    }
  };
};

module.exports = {
  listUsers,
  adjustCredits,
  listLedger
};
