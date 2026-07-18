import { Router } from "express";
import { validateIncidentAnalysis } from "../controllers/analysisController.js";
import { analysisRateLimiter } from "../middleware/analysisRateLimiter.js";
import { parseIncidentMultipart, requireMultipartFormData } from "../middleware/uploadMiddleware.js";
import { validateIncidentRequest } from "../middleware/validateIncidentRequest.js";
import { logger } from "../utils/logger.js";

export const analysisRouter = Router();

analysisRouter.post(
  "/",
  analysisRateLimiter,
  requireMultipartFormData,
  (req, res, next) => {
    logger.info("Incident validation request received");
    next();
  },
  parseIncidentMultipart,
  validateIncidentRequest,
  validateIncidentAnalysis
);
