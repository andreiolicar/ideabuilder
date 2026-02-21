const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { httpError } = require("../utils/httpError");

const auth = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(httpError(401, "Unauthorized"));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);

    if (!payload?.sub || !payload?.role) {
      return next(httpError(401, "Invalid token payload"));
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email || null
    };

    return next();
  } catch (_error) {
    return next(httpError(401, "Invalid or expired token"));
  }
};

module.exports = auth;
