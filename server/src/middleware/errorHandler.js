import multer from "multer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const defaultMessage = "Something went wrong on the server.";

function normalizeMulterError(err) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new ApiError("Each screenshot must be 5 MB or smaller.", 413, "FILE_TOO_LARGE");
  }

  if (err.code === "LIMIT_FILE_COUNT" || (err.code === "LIMIT_UNEXPECTED_FILE" && err.field === "evidenceFiles")) {
    return new ApiError("You can upload a maximum of 4 screenshots.", 400, "TOO_MANY_FILES");
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return new ApiError("Use the evidenceFiles field for screenshot uploads.", 400, "UNEXPECTED_FILE_FIELD");
  }

  return new ApiError("Review the incident details and try again.", 400, "INVALID_INCIDENT_DETAILS");
}

function normalizeError(err) {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof multer.MulterError) {
    return normalizeMulterError(err);
  }

  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return new ApiError("The request body contains invalid JSON.", 400, "INVALID_JSON");
  }

  if (err?.type === "entity.too.large") {
    return new ApiError("The request body is too large.", 413, "PAYLOAD_TOO_LARGE");
  }

  return new ApiError(defaultMessage, 500, "INTERNAL_SERVER_ERROR", false);
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const normalizedError = normalizeError(err);

  if (!normalizedError.isOperational) {
    logger.error("Unexpected server failure", {
      code: normalizedError.code,
      method: req.method,
      path: req.originalUrl
    });
  }

  const message =
    normalizedError.isOperational || env.NODE_ENV !== "production"
      ? normalizedError.message
      : defaultMessage;

  res.status(normalizedError.statusCode).json({
    error: {
      code: normalizedError.code,
      message,
      ...(normalizedError.fields ? { fields: normalizedError.fields } : {})
    }
  });
}
