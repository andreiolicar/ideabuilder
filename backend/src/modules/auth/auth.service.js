const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const env = require("../../config/env");
const { User, RefreshToken, sequelize } = require("../../models");
const { httpError } = require("../../utils/httpError");

const SALT_ROUNDS = 12;

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

const signRefreshToken = (user, jti) =>
  jwt.sign({ sub: user.id, jti }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });

const decodeRefreshPayload = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (_error) {
    throw httpError(401, "Invalid or expired refresh token");
  }
};

const createRefreshTokenRecord = async (userId, refreshToken, exp, options = {}) => {
  const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

  return RefreshToken.create(
    {
      userId,
      tokenHash,
      expiresAt: new Date(exp * 1000),
      revokedAt: null
    },
    options
  );
};

const findMatchingRefreshToken = async (userId, refreshToken, options = {}) => {
  const tokenRows = await RefreshToken.findAll({
    where: {
      userId,
      revokedAt: null
    },
    order: [["created_at", "DESC"]],
    ...options
  });

  for (const row of tokenRows) {
    const isMatch = await bcrypt.compare(refreshToken, row.tokenHash);
    if (isMatch) {
      return row;
    }
  }

  return null;
};

const issueTokenPair = async (user, options = {}) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, uuidv4());
  const payload = decodeRefreshPayload(refreshToken);

  await createRefreshTokenRecord(user.id, refreshToken, payload.exp, options);

  return {
    accessToken,
    refreshToken
  };
};

const register = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({
    where: {
      email: normalizedEmail
    }
  });

  if (existingUser) {
    throw httpError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await sequelize.transaction(async (transaction) => {
    const user = await User.create(
      {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "USER"
      },
      { transaction }
    );

    const tokens = await issueTokenPair(user, { transaction });
    return {
      user,
      ...tokens
    };
  });

  return {
    user: sanitizeUser(result.user),
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({
    where: {
      email: normalizedEmail
    }
  });

  if (!user) {
    throw httpError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw httpError(401, "Invalid credentials");
  }

  const tokens = await issueTokenPair(user);

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

const refreshSession = async ({ refreshToken }) => {
  const payload = decodeRefreshPayload(refreshToken);
  const userId = payload.sub;

  const rotated = await sequelize.transaction(async (transaction) => {
    const matchingToken = await findMatchingRefreshToken(userId, refreshToken, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!matchingToken) {
      throw httpError(401, "Refresh token is revoked or not recognized");
    }

    if (matchingToken.expiresAt <= new Date()) {
      throw httpError(401, "Refresh token expired");
    }

    await matchingToken.update(
      {
        revokedAt: new Date()
      },
      { transaction }
    );

    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      throw httpError(401, "User not found");
    }

    const tokens = await issueTokenPair(user, { transaction });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  });

  return rotated;
};

const logout = async ({ refreshToken }) => {
  const payload = decodeRefreshPayload(refreshToken);
  const userId = payload.sub;

  const tokenRow = await findMatchingRefreshToken(userId, refreshToken);

  if (!tokenRow) {
    throw httpError(401, "Refresh token is revoked or not recognized");
  }

  await tokenRow.update({
    revokedAt: new Date()
  });
};

module.exports = {
  register,
  login,
  refreshSession,
  logout
};
