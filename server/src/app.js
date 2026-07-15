import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { analysisRouter } from "./routes/analysisRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestTimeout } from "./middleware/requestTimeout.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: "200kb" }));
  app.use(requestTimeout());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    standardHeaders: "draft-8",
    legacyHeaders: false
  }));

  app.use("/api/health", healthRouter);
  app.use("/api/analyze", analysisRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
