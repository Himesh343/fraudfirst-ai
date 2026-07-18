import OpenAI from "openai";
import { env } from "./env.js";

let testClient = null;

export function getOpenAIClient(config = env) {
  if (testClient) {
    return testClient;
  }

  if (!config.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: config.OPENAI_API_KEY,
    timeout: config.OPENAI_TIMEOUT_MS,
    maxRetries: 0
  });
}

export function setOpenAIClientForTests(client) {
  testClient = client;
}

export function resetOpenAIClientForTests() {
  testClient = null;
}
