import { AppError } from "../utils/errors.js";

export function requestTimeout(ms = 60_000) {
  return (req, res, next) => {
    req.setTimeout(ms, () => {
      next(new AppError("AI analysis took too long. Please try again.", 504, "AI_TIMEOUT"));
    });
    next();
  };
}
