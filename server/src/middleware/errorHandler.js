import multer from "multer";
import { env } from "../config/env.js";
import { AppError, safeErrorMessage } from "../utils/errors.js";

export function notFoundHandler(req, res, next) {
  next(new AppError("The requested resource was not found.", 404, "NOT_FOUND"));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(statusCode).json({
      error: {
        code: err.code,
        message: err.code === "LIMIT_FILE_SIZE" ? "One of the evidence files is too large." : "The uploaded evidence could not be accepted."
      }
    });
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || statusCode < 500;
  const message = isOperational ? err.message : safeErrorMessage;

  res.status(statusCode).json({
    error: {
      code: err.code || "SERVER_ERROR",
      message,
      ...(env.NODE_ENV !== "production" && isOperational ? {} : {})
    }
  });
}
