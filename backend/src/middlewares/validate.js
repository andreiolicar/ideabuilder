const { ZodError } = require("zod");
const { httpError } = require("../utils/httpError");

const validate = (schema) => (req, _res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }

    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }

    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }

    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(
        httpError(400, "Validation failed", error.flatten(), "VALIDATION_ERROR")
      );
    }

    return next(error);
  }
};

module.exports = validate;
