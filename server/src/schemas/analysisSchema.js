import { z } from "zod";

const nullableString = z.string().nullable();
const detailList = z.array(z.object({
  label: z.string(),
  description: z.string()
}));

export const analysisSchema = z.object({
  analysisId: z.string(),
  language: z.enum(["English", "Hindi", "Kannada"]),
  risk: z.object({
    level: z.enum(["low", "medium", "high", "critical"]),
    label: z.string(),
    confidence: z.enum(["limited", "moderate", "strong"]),
    summary: z.string(),
    indicators: z.array(z.object({
      title: z.string(),
      explanation: z.string(),
      evidence: z.string()
    }))
  }),
  suspectedScam: z.object({
    category: z.string(),
    description: z.string()
  }),
  moneyTransferred: z.boolean(),
  extractedDetails: z.object({
    amount: nullableString,
    currency: nullableString,
    transactionId: nullableString,
    transactionDate: nullableString,
    transactionTime: nullableString,
    paymentMethod: nullableString,
    bankOrWallet: nullableString,
    upiId: nullableString,
    phoneNumbers: z.array(z.string()),
    emails: z.array(z.string()),
    urls: z.array(z.string()),
    impersonatedEntity: nullableString
  }),
  immediateActions: z.array(z.object({
    priority: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    urgent: z.boolean()
  })),
  evidence: z.object({
    found: detailList,
    missing: detailList,
    recommended: detailList
  }),
  timeline: z.array(z.object({
    date: nullableString,
    time: nullableString,
    title: z.string(),
    description: z.string(),
    source: z.enum(["user_provided", "ai_extracted"])
  })),
  officialHelp: z.object({
    showCybercrimeHelpline: z.boolean(),
    showReportingPortal: z.boolean(),
    showBankContactAdvice: z.boolean()
  }),
  reportSummary: z.string(),
  limitations: z.array(z.string()),
  safetyDisclaimer: z.string()
});
