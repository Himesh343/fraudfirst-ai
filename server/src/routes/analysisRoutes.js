import { Router } from "express";
import { analyzeController } from "../controllers/analysisController.js";
import { evidenceUpload, validateUploadedFiles } from "../middleware/upload.js";

export const analysisRouter = Router();

analysisRouter.post("/", evidenceUpload, validateUploadedFiles, analyzeController);
