import { Router } from "express";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "FraudFirst API",
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(env.OPENAI_API_KEY && env.OPENAI_MODEL)
  });
});
