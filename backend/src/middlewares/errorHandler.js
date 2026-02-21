const { HttpError } = require("../utils/httpError");

const notFoundHandler = (_req, _res, next) => {
  next(new HttpError(404, "Route not found", null, "ROUTE_NOT_FOUND"));
};

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const payload = {
      code: err.code,
      message: err.message,
    };

    if (err.details) {
      payload.details = err.details;
    }

    return res.status(err.statusCode).json(payload);
  }

  console.error(err);
  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error"
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
