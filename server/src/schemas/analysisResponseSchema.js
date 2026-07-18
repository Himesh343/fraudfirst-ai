import { z } from "zod";

const text = (max) => z.string().trim().min(1).max(max);
const nullableText = (max) => z.string().trim().max(max).nullable();
const dateOrNull = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const timeOrNull = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable();

const riskIndicatorSchema = z
  .object({
    title: text(120),
    explanation: text(700),
    evidence: text(250)
  })
  .strict();

const actionSchema = z
  .object({
    priority: z.number().int().positive(),
    title: text(140),
    description: text(800),
    urgent: z.boolean()
  })
  .strict();

const evidenceItemSchema = z
  .object({
    label: text(120),
    description: text(600)
  })
  .strict();

const timelineItemSchema = z
  .object({
    date: dateOrNull,
    time: timeOrNull,
    title: text(140),
    description: text(800),
    source: z.enum(["user_provided", "ai_extracted"])
  })
  .strict();

export const analysisModelResponseSchema = z
  .object({
    risk: z
      .object({
        level: z.enum(["low", "medium", "high", "critical"]),
        label: text(80),
        confidence: z.enum(["limited", "moderate", "strong"]),
        summary: text(1200),
        indicators: z.array(riskIndicatorSchema).max(10)
      })
      .strict(),
    suspectedScam: z
      .object({
        category: text(120),
        description: text(1000)
      })
      .strict(),
    extractedDetails: z
      .object({
        amount: nullableText(80),
        currency: nullableText(20),
        transactionId: nullableText(160),
        transactionDate: dateOrNull,
        transactionTime: timeOrNull,
        paymentMethod: nullableText(80),
        bankOrWallet: nullableText(160),
        upiId: nullableText(160),
        phoneNumbers: z.array(text(60)).max(10),
        emails: z.array(text(160)).max(10),
        urls: z.array(text(500)).max(10),
        impersonatedEntity: nullableText(160)
      })
      .strict(),
    immediateActions: z.array(actionSchema).min(1).max(10),
    evidence: z
      .object({
        found: z.array(evidenceItemSchema).max(15),
        missing: z.array(evidenceItemSchema).max(15),
        recommended: z.array(evidenceItemSchema).max(15)
      })
      .strict(),
    timeline: z.array(timelineItemSchema).max(20),
    reportSummary: text(3000),
    limitations: z.array(text(500)).max(10)
  })
  .strict();
