const { httpError } = require("../utils/httpError");

const requireRole = (role) => (req, _res, next) => {
  if (!req.user) {
    return next(httpError(401, "Unauthorized"));
  }

  if (req.user.role !== role) {
    return next(httpError(403, "Forbidden"));
  }

  return next();
};

module.exports = requireRole;
