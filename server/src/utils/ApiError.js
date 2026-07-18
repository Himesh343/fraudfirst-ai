export class ApiError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR", isOperational = true, fields = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.fields = fields;
  }
}
