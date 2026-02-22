const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { AuthVerificationCode } = require("../../models");
const { httpError } = require("../../utils/httpError");

const CODE_LENGTH = 6;
const EXPIRES_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const RESEND_WINDOW_MS = 60 * 60 * 1000;
const MAX_RESEND_PER_WINDOW = 5;
const HASH_ROUNDS = 10;

const generateCode = () => {
  const min = 10 ** (CODE_LENGTH - 1);
  const max = 10 ** CODE_LENGTH - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const getLatestRecord = async ({ userId = null, email, purpose, transaction }) => {
  const where = { email, purpose };
  if (userId) {
    where.userId = userId;
  }

  return AuthVerificationCode.findOne({
    where,
    order: [["createdAt", "DESC"]],
    transaction
  });
};

const requestCode = async ({ userId = null, email, purpose }, options = {}) => {
  const transaction = options.transaction;
  const now = new Date();
  const record = await getLatestRecord({ userId, email, purpose, transaction });

  if (record && record.lastSentAt) {
    const elapsedMs = now.getTime() - new Date(record.lastSentAt).getTime();
    if (elapsedMs < RESEND_COOLDOWN_MS) {
      throw httpError(429, "Aguarde antes de solicitar novo codigo");
    }
  }

  const withinWindow =
    record?.windowStartsAt &&
    now.getTime() - new Date(record.windowStartsAt).getTime() < RESEND_WINDOW_MS;

  const resendCount = withinWindow ? Number(record?.resendCount || 0) : 0;
  if (resendCount >= MAX_RESEND_PER_WINDOW) {
    throw httpError(429, "Limite de solicitacoes de codigo atingido");
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, HASH_ROUNDS);
  const expiresAt = new Date(now.getTime() + EXPIRES_MINUTES * 60 * 1000);

  if (record) {
    await record.update(
      {
        userId: userId || record.userId || null,
        email,
        codeHash,
        expiresAt,
        attemptCount: 0,
        maxAttempts: MAX_ATTEMPTS,
        resendCount: withinWindow ? resendCount + 1 : 1,
        windowStartsAt: withinWindow ? record.windowStartsAt : now,
        lastSentAt: now,
        consumedAt: null
      },
      { transaction }
    );

    return { code, record };
  }

  const created = await AuthVerificationCode.create(
    {
      userId,
      email,
      purpose,
      codeHash,
      expiresAt,
      attemptCount: 0,
      maxAttempts: MAX_ATTEMPTS,
      resendCount: 1,
      windowStartsAt: now,
      lastSentAt: now
    },
    { transaction }
  );

  return { code, record: created };
};

const verifyCode = async ({ userId = null, email, purpose, code }, options = {}) => {
  const transaction = options.transaction;
  const record = await getLatestRecord({ userId, email, purpose, transaction });

  if (!record || record.consumedAt) {
    throw httpError(400, "Codigo invalido ou expirado");
  }

  if (record.expiresAt <= new Date()) {
    throw httpError(400, "Codigo expirado");
  }

  if (Number(record.attemptCount || 0) >= Number(record.maxAttempts || MAX_ATTEMPTS)) {
    throw httpError(400, "Codigo expirado");
  }

  const isValid = await bcrypt.compare(code, record.codeHash);
  if (!isValid) {
    await record.update(
      { attemptCount: Number(record.attemptCount || 0) + 1 },
      { transaction }
    );
    throw httpError(400, "Codigo invalido ou expirado");
  }

  await record.update({ consumedAt: new Date() }, { transaction });
  return record;
};

module.exports = {
  requestCode,
  verifyCode
};
