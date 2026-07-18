import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const analysisRateLimiter = rateLimit({
  windowMs: env.ANALYSIS_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  limit: env.ANALYSIS_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: "ANALYSIS_RATE_LIMIT_EXCEEDED",
        message: "Too many analysis requests. Please wait and try again."
      }
    });
  }
});
