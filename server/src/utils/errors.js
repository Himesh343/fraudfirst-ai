export class AppError extends Error {
  constructor(message, statusCode = 500, code = "SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export const safeErrorMessage = "We could not complete the AI analysis. Your entered information has been preserved. Please try again.";
