import { incidentRequestSchema } from "../schemas/incidentRequestSchema.js";
import { ApiError } from "../utils/ApiError.js";
import { validateEvidenceFiles } from "../utils/evidenceValidation.js";
import { normalizeFormData } from "../utils/normalizeFormData.js";

function issueToFields(issues) {
  const fields = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (field && !fields[field]) {
      fields[field] = issue.message;
    }
  }

  return fields;
}

function hasMeaningfulText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nullable(value) {
  return value ?? null;
}

function hasTransactionDetails(transaction) {
  return Object.entries(transaction).some(([key, value]) => key !== "currency" && value !== null);
}

export async function validateIncidentRequest(req, res, next) {
  try {
    const evidenceFiles = await validateEvidenceFiles(req.files || []);
    const formData = normalizeFormData(req.body);
    const parsed = incidentRequestSchema.safeParse(formData);

    if (!parsed.success) {
      next(
        new ApiError(
          "Review the incident details and try again.",
          400,
          "INVALID_INCIDENT_DETAILS",
          true,
          issueToFields(parsed.error.issues)
        )
      );
      return;
    }

    const data = parsed.data;
    const hasSuspiciousText = hasMeaningfulText(data.suspiciousText);
    const hasIncidentDescription = hasMeaningfulText(data.incidentDescription);

    if (evidenceFiles.length === 0 && !hasSuspiciousText && !hasIncidentDescription) {
      next(
        new ApiError(
          "Add at least one screenshot, suspicious message, or incident description.",
          400,
          "EVIDENCE_REQUIRED"
        )
      );
      return;
    }

    const transaction = {
      amount: nullable(data.amount),
      currency: data.currency ?? "INR",
      date: nullable(data.transactionDate),
      time: nullable(data.transactionTime),
      paymentMethod: nullable(data.paymentMethod),
      bankOrWallet: nullable(data.bankOrWallet),
      transactionId: nullable(data.transactionId),
      upiId: nullable(data.upiId)
    };

    req.incidentRequest = {
      situationType: data.situationType,
      suspiciousText: nullable(data.suspiciousText),
      preferredLanguage: data.preferredLanguage,
      incidentDescription: nullable(data.incidentDescription),
      transaction,
      suspectedSource: {
        phone: nullable(data.suspectedPhone),
        email: nullable(data.suspectedEmail),
        url: nullable(data.suspiciousUrl),
        impersonatedEntity: nullable(data.impersonatedEntity)
      },
      evidenceFiles
    };

    req.incidentRequestSummary = {
      situationType: data.situationType,
      preferredLanguage: data.preferredLanguage,
      evidenceFileCount: evidenceFiles.length,
      hasSuspiciousText,
      hasIncidentDescription,
      hasTransactionDetails: hasTransactionDetails(transaction)
    };

    next();
  } catch (err) {
    next(err);
  }
}
