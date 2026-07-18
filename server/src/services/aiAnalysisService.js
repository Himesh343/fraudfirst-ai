import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { getOpenAIClient } from "../config/openaiClient.js";
import { buildFraudAnalysisPrompt } from "../prompts/fraudAnalysisPrompt.js";
import { analysisModelResponseSchema } from "../schemas/analysisResponseSchema.js";
import { ApiError } from "../utils/ApiError.js";
import { buildAnalysisText, buildImageInputItems } from "../utils/buildAnalysisInput.js";

let testConfig = null;

function getConfig() {
  return testConfig || env;
}

export function setAiServiceConfigForTests(config) {
  testConfig = config;
}

export function resetAiServiceConfigForTests() {
  testConfig = null;
}

function isConfigured(config) {
  return Boolean(config.OPENAI_API_KEY && config.OPENAI_MODEL);
}

function createAnalysisInput(incident, config, correctiveInstruction = "") {
  const userContent = [
    {
      type: "input_text",
      text: buildAnalysisText(incident) + correctiveInstruction
    },
    ...buildImageInputItems(incident.evidenceFiles, config.OPENAI_IMAGE_DETAIL)
  ];

  return [
    {
      role: "system",
      content: buildFraudAnalysisPrompt(incident.preferredLanguage)
    },
    {
      role: "user",
      content: userContent
    }
  ];
}

function hasRefusal(response) {
  if (!response?.output || !Array.isArray(response.output)) {
    return false;
  }

  return response.output.some((item) =>
    item?.type === "message" &&
    Array.isArray(item.content) &&
    item.content.some((content) => content?.type === "refusal")
  );
}

function containsHtml(value) {
  if (typeof value === "string") {
    return /<[^>]+>/.test(value);
  }

  if (Array.isArray(value)) {
    return value.some(containsHtml);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(containsHtml);
  }

  return false;
}

function validateParsedOutput(response) {
  if (hasRefusal(response)) {
    throw new ApiError(
      "The submitted evidence could not be analyzed. Review the content and try again.",
      422,
      "AI_ANALYSIS_REFUSED"
    );
  }

  if (!response?.output_parsed) {
    throw new ApiError("The AI analysis could not be completed. Please try again.", 502, "AI_INVALID_RESPONSE");
  }

  const parsed = analysisModelResponseSchema.safeParse(response.output_parsed);

  if (!parsed.success || containsHtml(parsed.data)) {
    throw new ApiError("The AI analysis could not be completed. Please try again.", 502, "AI_INVALID_RESPONSE");
  }

  return parsed.data;
}

function isTimeoutError(err) {
  return (
    err?.code === "ETIMEDOUT" ||
    err?.code === "ECONNABORTED" ||
    err?.name === "APIConnectionTimeoutError" ||
    err?.name === "TimeoutError" ||
    err?.message?.toLowerCase().includes("timeout")
  );
}

function isStructuredOutputError(err) {
  return (
    err instanceof ZodError ||
    err instanceof SyntaxError ||
    err?.code === "AI_INVALID_RESPONSE" ||
    err?.name === "ZodError"
  );
}

function mapProviderError(err) {
  if (err instanceof ApiError) {
    return err;
  }

  if (isTimeoutError(err)) {
    return new ApiError("The analysis took too long. Please try again.", 504, "AI_ANALYSIS_TIMEOUT");
  }

  if (err?.status === 401 || err?.status === 403) {
    return new ApiError("AI analysis is temporarily unavailable. Please try again later.", 503, "AI_AUTHENTICATION_FAILED");
  }

  if (err?.status === 429) {
    return new ApiError("The AI service is currently busy. Please wait and try again.", 503, "AI_PROVIDER_BUSY");
  }

  if (err?.status >= 500) {
    return new ApiError("AI analysis is temporarily unavailable. Please try again later.", 503, "AI_SERVICE_UNAVAILABLE");
  }

  if (isStructuredOutputError(err)) {
    return new ApiError("The AI analysis could not be completed. Please try again.", 502, "AI_INVALID_RESPONSE");
  }

  return new ApiError("We could not complete the AI analysis. Please try again.", 502, "AI_ANALYSIS_FAILED");
}

async function callResponsesParse(client, incident, config, signal, correctiveInstruction) {
  const body = {
    model: config.OPENAI_MODEL,
    input: createAnalysisInput(incident, config, correctiveInstruction),
    text: {
      format: zodTextFormat(analysisModelResponseSchema, "fraud_analysis")
    },
    max_output_tokens: config.OPENAI_MAX_OUTPUT_TOKENS
  };

  return client.responses.parse(body, {
    timeout: config.OPENAI_TIMEOUT_MS,
    signal,
    maxRetries: 0
  });
}

async function callWithTimeout(client, incident, config, incomingSignal, correctiveInstruction) {
  const controller = new AbortController();
  let timeoutReached = false;

  const timeout = setTimeout(() => {
    timeoutReached = true;
    controller.abort();
  }, config.OPENAI_TIMEOUT_MS);

  const abortFromIncoming = () => controller.abort();

  if (incomingSignal?.aborted) {
    controller.abort();
  } else if (incomingSignal) {
    incomingSignal.addEventListener("abort", abortFromIncoming, { once: true });
  }

  try {
    return await callResponsesParse(client, incident, config, controller.signal, correctiveInstruction);
  } catch (err) {
    if (timeoutReached) {
      throw new ApiError("The analysis took too long. Please try again.", 504, "AI_ANALYSIS_TIMEOUT");
    }

    throw err;
  } finally {
    clearTimeout(timeout);

    if (incomingSignal) {
      incomingSignal.removeEventListener("abort", abortFromIncoming);
    }
  }
}

async function runAttempt(client, incident, config, signal, correctiveInstruction = "") {
  const response = await callWithTimeout(client, incident, config, signal, correctiveInstruction);
  return validateParsedOutput(response);
}

export async function analyzeIncident(incident, options = {}) {
  const config = options.config || getConfig();

  if (!isConfigured(config)) {
    throw new ApiError("AI analysis is temporarily unavailable. Please try again later.", 503, "AI_NOT_CONFIGURED");
  }

  const client = options.client || getOpenAIClient(config);

  if (!client) {
    throw new ApiError("AI analysis is temporarily unavailable. Please try again later.", 503, "AI_NOT_CONFIGURED");
  }

  try {
    return await runAttempt(client, incident, config, options.signal);
  } catch (err) {
    const mapped = mapProviderError(err);

    if (mapped.code !== "AI_INVALID_RESPONSE") {
      throw mapped;
    }

    try {
      return await runAttempt(
        client,
        incident,
        config,
        options.signal,
        "\n\nCORRECTIVE INSTRUCTION: The previous response failed schema validation. Return every required field exactly according to the structured schema, using null for unknown scalar values and empty arrays for missing lists."
      );
    } catch (retryErr) {
      const retryMapped = mapProviderError(retryErr);

      if (retryMapped.code === "AI_INVALID_RESPONSE") {
        throw new ApiError("The AI analysis could not be completed. Please try again.", 502, "AI_INVALID_RESPONSE");
      }

      throw retryMapped;
    }
  }
}
