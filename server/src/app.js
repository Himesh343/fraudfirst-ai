import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";
import { analysisRouter } from "./routes/analysisRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { ApiError } from "./utils/ApiError.js";

const allowedOrigins = env.CLIENT_ORIGINS;

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new ApiError("Browser origin is not allowed.", 403, "ORIGIN_NOT_ALLOWED"));
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: false }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(generalRateLimiter);

  app.get("/api", (req, res) => {
    res.json({
      name: "FraudFirst API",
      status: "running",
      message: "AI cyber-fraud emergency assistance backend"
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/analyze", analysisRouter);
  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
