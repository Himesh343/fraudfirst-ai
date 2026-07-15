import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().optional().default("")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error("Invalid server environment configuration.");
}

export const env = {
  ...parsed.data,
  aiConfigured: Boolean(parsed.data.OPENAI_API_KEY && parsed.data.OPENAI_MODEL)
};
