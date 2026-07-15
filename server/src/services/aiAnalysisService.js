import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { fraudAnalysisPrompt } from "../prompts/fraudAnalysisPrompt.js";
import { analysisSchema } from "../schemas/analysisSchema.js";
import { AppError } from "../utils/errors.js";

function buildUserText(payload, files) {
  return JSON.stringify({
    task: "Analyse the following cyber-fraud incident evidence and return only the requested structured result.",
    preferredLanguage: payload.preferredLanguage,
    situationType: payload.situationType,
    moneyTransferredByUserSelection: payload.situationType === "money_transferred",
    pastedSuspiciousText: payload.suspiciousText || null,
    incidentDescription: payload.incidentDescription || null,
    transactionDetails: {
      amount: payload.amount || null,
      currency: payload.currency || null,
      transactionDate: payload.transactionDate || null,
      transactionTime: payload.transactionTime || null,
      paymentMethod: payload.paymentMethod || null,
      bankOrWallet: payload.bankOrWallet || null,
      transactionId: payload.transactionId || null,
      upiId: payload.upiId || null,
      suspectedPhone: payload.suspectedPhone || null,
      suspectedEmail: payload.suspectedEmail || null,
      suspiciousUrl: payload.suspiciousUrl || null,
      impersonatedEntity: payload.impersonatedEntity || null
    },
    evidenceInventory: files.map((file) => ({
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    }))
  });
}

function buildContent(payload, files) {
  const content = [{ type: "input_text", text: buildUserText(payload, files) }];
  for (const file of files) {
    content.push({
      type: "input_image",
      image_url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      detail: "high"
    });
  }
  return content;
}

export async function analyzeIncident(payload, files = []) {
  if (!env.aiConfigured) {
    throw new AppError("AI analysis is temporarily unavailable. Please try again later.", 503, "AI_NOT_CONFIGURED");
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 55_000 });
  const input = [
    { role: "developer", content: fraudAnalysisPrompt },
    { role: "user", content: buildContent(payload, files) }
  ];

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await openai.responses.parse({
        model: env.OPENAI_MODEL,
        input,
        text: {
          format: zodTextFormat(analysisSchema, "fraudfirst_analysis")
        }
      });

      const parsed = response.output_parsed;
      const checked = analysisSchema.safeParse({
        ...parsed,
        analysisId: parsed?.analysisId || `ff-${crypto.randomUUID()}`
      });
      if (!checked.success) {
        throw new AppError("The AI response could not be verified.", 502, "INVALID_AI_RESPONSE");
      }
      return checked.data;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError?.status === 429) {
    throw new AppError("Analysis is busy right now. Please wait a moment and try again.", 429, "RATE_LIMITED");
  }
  if (lastError?.code === "ETIMEDOUT" || lastError?.name === "TimeoutError") {
    throw new AppError("AI analysis took too long. Please try again.", 504, "AI_TIMEOUT");
  }
  throw new AppError("We could not verify the AI analysis. Please try again.", 502, "INVALID_AI_RESPONSE");
}
