import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}

const booleanSchema = z
  .union([z.boolean(), z.string()])
  .default("false")
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    return ["true", "1", "yes"].includes(value.trim().toLowerCase());
  });

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(5000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CLIENT_ORIGIN: z.string().trim().optional(),
    TRUST_PROXY: booleanSchema,
    OPENAI_API_KEY: z.string().optional().default(""),
    OPENAI_MODEL: z.string().optional().default(""),
    OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
    OPENAI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(4000),
    OPENAI_IMAGE_DETAIL: z.enum(["low", "high", "auto", "original"]).default("high"),
    ANALYSIS_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
    ANALYSIS_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10)
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === "production" && !value.CLIENT_ORIGIN) {
      ctx.addIssue({
        code: "custom",
        path: ["CLIENT_ORIGIN"],
        message: "CLIENT_ORIGIN is required in production."
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => (issue.path.join(".") || "ENV") + ": " + issue.message)
    .join("; ");

  throw new Error("Invalid server environment configuration. " + message);
}

const clientOrigin = parsed.data.CLIENT_ORIGIN || "http://localhost:5173";
const clientOrigins = clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of clientOrigins) {
  try {
    new URL(origin);
  } catch {
    throw new Error("Invalid server environment configuration. CLIENT_ORIGIN must contain valid URL origins.");
  }
}

export const env = {
  PORT: parsed.data.PORT,
  NODE_ENV: parsed.data.NODE_ENV,
  CLIENT_ORIGIN: clientOrigin,
  CLIENT_ORIGINS: clientOrigins,
  TRUST_PROXY: parsed.data.TRUST_PROXY,
  OPENAI_API_KEY: parsed.data.OPENAI_API_KEY,
  OPENAI_MODEL: parsed.data.OPENAI_MODEL,
  OPENAI_TIMEOUT_MS: parsed.data.OPENAI_TIMEOUT_MS,
  OPENAI_MAX_OUTPUT_TOKENS: parsed.data.OPENAI_MAX_OUTPUT_TOKENS,
  OPENAI_IMAGE_DETAIL: parsed.data.OPENAI_IMAGE_DETAIL,
  ANALYSIS_RATE_LIMIT_WINDOW_MINUTES: parsed.data.ANALYSIS_RATE_LIMIT_WINDOW_MINUTES,
  ANALYSIS_RATE_LIMIT_MAX: parsed.data.ANALYSIS_RATE_LIMIT_MAX
};
