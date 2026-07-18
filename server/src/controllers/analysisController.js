import { randomUUID } from "node:crypto";
import { analyzeIncident } from "../services/aiAnalysisService.js";
import { buildOfficialHelp, getSafetyDisclaimer } from "../utils/localizedSafetyContent.js";
import { logger } from "../utils/logger.js";

function sortActions(actions) {
  return [...actions].sort((first, second) => first.priority - second.priority);
}

export async function validateIncidentAnalysis(req, res, next) {
  const incident = req.incidentRequest;
  const startedAt = Date.now();
  const abortController = new AbortController();

  const abortRequest = () => abortController.abort();
  req.on("aborted", abortRequest);

  logger.info("AI analysis request started", {
    files: incident.evidenceFiles.length,
    language: incident.preferredLanguage
  });

  try {
    const modelAnalysis = await analyzeIncident(incident, { signal: abortController.signal });
    const moneyTransferred = incident.situationType === "money_transferred";

    const response = {
      analysisId: randomUUID(),
      language: incident.preferredLanguage,
      risk: modelAnalysis.risk,
      suspectedScam: modelAnalysis.suspectedScam,
      moneyTransferred,
      extractedDetails: modelAnalysis.extractedDetails,
      immediateActions: sortActions(modelAnalysis.immediateActions),
      evidence: modelAnalysis.evidence,
      timeline: modelAnalysis.timeline,
      officialHelp: buildOfficialHelp(incident),
      reportSummary: modelAnalysis.reportSummary,
      limitations: modelAnalysis.limitations,
      safetyDisclaimer: getSafetyDisclaimer(incident.preferredLanguage)
    };

    logger.info("AI analysis completed", {
      files: incident.evidenceFiles.length,
      status: 200,
      durationMs: Date.now() - startedAt
    });

    res.status(200).json(response);
  } catch (err) {
    logger.info("AI analysis failed", {
      code: err.code || "AI_ANALYSIS_FAILED",
      status: err.statusCode || 500,
      durationMs: Date.now() - startedAt
    });
    next(err);
  } finally {
    req.off("aborted", abortRequest);

    if (incident?.evidenceFiles) {
      incident.evidenceFiles.length = 0;
    }
  }
}
