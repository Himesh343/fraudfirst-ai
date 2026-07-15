import { validateAnalyzePayload } from "../schemas/requestSchema.js";
import { analyzeIncident } from "../services/aiAnalysisService.js";
import { AppError } from "../utils/errors.js";

export async function analyzeController(req, res, next) {
  const files = req.files || [];
  const parsed = validateAnalyzePayload(req.body, files.length);
  if (!parsed.success) {
    return next(new AppError(parsed.error.issues[0]?.message || "Please check the submitted details.", 400, "INVALID_INPUT"));
  }

  try {
    const analysis = await analyzeIncident(parsed.data, files);
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
}
