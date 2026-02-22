const { Transaction, UniqueConstraintError } = require("sequelize");
const { CreditLedger, User, sequelize } = require("../../models");
const { httpError } = require("../../utils/httpError");
const emailService = require("../../services/email/email.service");

const ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;

const sumBalance = async (userId, transaction) => {
  const result = await CreditLedger.findOne({
    attributes: [
      [
        sequelize.literal(
          "COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END), 0)"
        ),
        "balance"
      ]
    ],
    where: { userId },
    raw: true,
    transaction
  });

  return Number(result?.balance || 0);
};

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

const runInTransaction = async (work, options = {}) => {
  if (options.transaction) {
    return work(options.transaction);
  }

  return runWithStrongIsolation(work);
};

const getBalance = async (userId, options = {}) => {
  return sumBalance(userId, options.transaction);
};

const notifyCreditChange = async (entry, transaction) => {
  try {
    const user = await User.findByPk(entry.userId, {
      attributes: ["id", "email", "name"],
      transaction
    });

    if (!user?.email) {
      return;
    }

    const newBalance = await sumBalance(entry.userId, transaction);
    await emailService.enqueueEmail(
      "CREDITS_CHANGED",
      {
        userId: user.id,
        toEmail: user.email,
        payload: {
          name: user.name,
          email: user.email,
          type: entry.type,
          reason: entry.reason,
          amount: entry.amount,
          projectId: entry.projectId || null,
          performedBy: entry.performedBy || null,
          newBalance
        }
      },
      { transaction }
    );
  } catch (error) {
    console.error("[email] credits notification failed:", error.message);
  }
};

const debitForGeneration = async (userId, projectId, idempotencyKey, options = {}) => {
  if (!idempotencyKey) {
    throw httpError(400, "Idempotency key is required");
  }

  return runInTransaction(async (transaction) => {
    const existing = await CreditLedger.findOne({
      where: {
        userId,
        idempotencyKey,
        type: "DEBIT",
        reason: "GENERATION"
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (existing) {
      return existing;
    }

    try {
      const created = await CreditLedger.create(
        {
          userId,
          projectId,
          type: "DEBIT",
          amount: 1,
          reason: "GENERATION",
          idempotencyKey
        },
        { transaction }
      );
      await notifyCreditChange(created, transaction);
      return created;
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) {
        throw error;
      }

      return CreditLedger.findOne({
        where: {
          userId,
          idempotencyKey,
          type: "DEBIT",
          reason: "GENERATION"
        },
        transaction
      });
    }
  }, options);
};

const creditRefund = async (userId, projectId, idempotencyKey, options = {}) => {
  const where = idempotencyKey
    ? {
        userId,
        idempotencyKey,
        type: "CREDIT",
        reason: "REFUND"
      }
    : null;

  return runInTransaction(async (transaction) => {
    if (where) {
      const existing = await CreditLedger.findOne({
        where,
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (existing) {
        return existing;
      }
    }

    try {
      const created = await CreditLedger.create(
        {
          userId,
          projectId,
          type: "CREDIT",
          amount: 1,
          reason: "REFUND",
          idempotencyKey: idempotencyKey || null
        },
        { transaction }
      );
      await notifyCreditChange(created, transaction);
      return created;
    } catch (error) {
      if (!(error instanceof UniqueConstraintError) || !where) {
        throw error;
      }

      return CreditLedger.findOne({ where, transaction });
    }
  }, options);
};

const adminAdjust = async (userId, delta, adminId, _note, options = {}) => {
  if (!Number.isInteger(delta) || delta === 0) {
    throw httpError(400, "Delta must be a non-zero integer");
  }

  return runInTransaction(async (transaction) => {
    const created = await CreditLedger.create(
      {
        userId,
        type: delta > 0 ? "CREDIT" : "DEBIT",
        amount: Math.abs(delta),
        reason: "ADMIN_ADJUST",
        performedBy: adminId || null
      },
      { transaction }
    );
    await notifyCreditChange(created, transaction);
    return created;
  }, options);
};

module.exports = {
  getBalance,
  debitForGeneration,
  creditRefund,
  adminAdjust
};
