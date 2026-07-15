import { Router } from "express";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.json({ status: "ok", aiConfigured: env.aiConfigured });
});
