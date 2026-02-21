class HttpError extends Error {
  constructor(statusCode, message, details = null, code = null) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
    this.code = code || `HTTP_${statusCode}`;
  }
}

const httpError = (statusCode, message, details = null, code = null) =>
  new HttpError(statusCode, message, details, code);

module.exports = {
  HttpError,
  httpError
};
