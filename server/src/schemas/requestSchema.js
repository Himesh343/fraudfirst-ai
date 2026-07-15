import { z } from "zod";

const trimmed = (max = 500) => z.string().trim().max(max).optional().default("");

export const analyzeRequestSchema = z.object({
  situationType: z.enum(["suspicious_received", "money_transferred"], {
    message: "Please choose what happened."
  }),
  suspiciousText: trimmed(12000),
  preferredLanguage: z.enum(["English", "Hindi", "Kannada"]).default("English"),
  incidentDescription: trimmed(3000),
  amount: trimmed(60),
  currency: trimmed(12),
  transactionDate: trimmed(30),
  transactionTime: trimmed(20),
  paymentMethod: z.enum(["UPI", "Bank transfer", "Debit card", "Credit card", "Digital wallet", "QR code", "Cash deposit", "Other", "Not sure", ""]).default(""),
  bankOrWallet: trimmed(120),
  transactionId: trimmed(160),
  upiId: trimmed(160),
  suspectedPhone: trimmed(80),
  suspectedEmail: trimmed(160),
  suspiciousUrl: trimmed(500),
  impersonatedEntity: trimmed(180),
  privacyConfirmed: z.coerce.boolean().refine(Boolean, "Please confirm the privacy acknowledgement.")
}).superRefine((data, ctx) => {
  const hasText = data.suspiciousText.length >= 8;
  const hasDescription = data.incidentDescription.length >= 20;
  if (!hasText && !hasDescription) {
    ctx.addIssue({
      code: "custom",
      path: ["incidentDescription"],
      message: "Add a meaningful description when no message is provided."
    });
  }
});

export function validateAnalyzePayload(body, fileCount) {
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return parsed;
  }
  const hasEvidence = fileCount > 0 || parsed.data.suspiciousText.length >= 8 || parsed.data.incidentDescription.length >= 20;
  if (!hasEvidence) {
    return {
      success: false,
      error: {
        issues: [{ path: ["evidence"], message: "Please provide a screenshot, pasted message or meaningful incident description." }]
      }
    };
  }
  return parsed;
}
