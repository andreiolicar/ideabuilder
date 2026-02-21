class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const httpError = (statusCode, message, details = null) =>
  new HttpError(statusCode, message, details);

module.exports = {
  HttpError,
  httpError
};
