const { HttpError } = require("../utils/httpError");

const notFoundHandler = (_req, _res, next) => {
  next(new HttpError(404, "Route not found"));
};

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
