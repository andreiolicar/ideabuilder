const bcrypt = require("bcrypt");
const { User, sequelize } = require("../../models");
const { httpError } = require("../../utils/httpError");
const emailService = require("../../services/email/email.service");
const verificationCodeService = require("../../services/verificationCode/verificationCode.service");
const authService = require("../auth/auth.service");

const PURPOSE = {
  EMAIL_CHANGE: "EMAIL_CHANGE",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  PASSWORD_RESET: "PASSWORD_RESET"
};

const SALT_ROUNDS = 12;

const getUserOrThrow = async (userId, options = {}) => {
  const user = await User.findByPk(userId, options);
  if (!user) {
    throw httpError(404, "User not found");
  }
  return user;
};

const getProfile = async (userId) => {
  const user = await getUserOrThrow(userId, {
    attributes: ["id", "name", "email", "role", "createdAt"]
  });
  return user;
};

const updateProfile = async (userId, payload) => {
  const user = await getUserOrThrow(userId);
  await user.update({ name: payload.name.trim() });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
};

const requestEmailChangeCode = async (userId, newEmail) => {
  const normalizedEmail = newEmail.toLowerCase();
  const user = await getUserOrThrow(userId, {
    attributes: ["id", "name", "email"]
  });

  if (normalizedEmail === user.email) {
    throw httpError(400, "Novo e-mail deve ser diferente do atual");
  }

  const existing = await User.findOne({
    where: { email: normalizedEmail },
    attributes: ["id"]
  });
  if (existing) {
    throw httpError(409, "E-mail ja esta em uso");
  }

  const { code } = await verificationCodeService.requestCode({
    userId,
    email: normalizedEmail,
    purpose: PURPOSE.EMAIL_CHANGE
  });

  await emailService.enqueueEmail("SECURITY_CODE", {
    userId,
    toEmail: normalizedEmail,
    force: true,
    payload: {
      code,
      context: "Confirmacao de troca de e-mail"
    }
  });
};

const confirmEmailChange = async (userId, newEmail, code) => {
  const normalizedEmail = newEmail.toLowerCase();

  return sequelize.transaction(async (transaction) => {
    const user = await getUserOrThrow(userId, { transaction });
    const existing = await User.findOne({
      where: { email: normalizedEmail },
      attributes: ["id"],
      transaction
    });

    if (existing && existing.id !== userId) {
      throw httpError(409, "E-mail ja esta em uso");
    }

    await verificationCodeService.verifyCode(
      {
        userId,
        email: normalizedEmail,
        purpose: PURPOSE.EMAIL_CHANGE,
        code
      },
      { transaction }
    );

    await user.update({ email: normalizedEmail }, { transaction });
  });

  await authService.revokeAllSessions(userId);
};

const requestPasswordChangeCode = async (userId) => {
  const user = await getUserOrThrow(userId, {
    attributes: ["id", "email"]
  });

  const { code } = await verificationCodeService.requestCode({
    userId,
    email: user.email,
    purpose: PURPOSE.PASSWORD_CHANGE
  });

  await emailService.enqueueEmail("SECURITY_CODE", {
    userId,
    toEmail: user.email,
    force: true,
    payload: {
      code,
      context: "Confirmacao de troca de senha"
    }
  });
};

const confirmPasswordChange = async (userId, code, newPassword) => {
  const user = await getUserOrThrow(userId, {
    attributes: ["id", "email"]
  });

  await sequelize.transaction(async (transaction) => {
    await verificationCodeService.verifyCode(
      {
        userId,
        email: user.email,
        purpose: PURPOSE.PASSWORD_CHANGE,
        code
      },
      { transaction }
    );

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.update(
      { passwordHash },
      {
        where: { id: userId },
        transaction
      }
    );
  });

  await authService.revokeAllSessions(userId);
};

module.exports = {
  getProfile,
  updateProfile,
  requestEmailChangeCode,
  confirmEmailChange,
  requestPasswordChangeCode,
  confirmPasswordChange,
  PURPOSE
};
