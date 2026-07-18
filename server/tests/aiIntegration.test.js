import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { setOpenAIClientForTests } from "../src/config/openaiClient.js";
import { setAiServiceConfigForTests } from "../src/services/aiAnalysisService.js";
import {
  configureAiSuccess,
  createAnalysis,
  createFakeOpenAIClient,
  parsedResponse,
  resetAiTestDoubles,
  testAiConfig
} from "./helpers/aiTestHelpers.js";

const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

function analyzeRequest() {
  return request(app).post("/api/analyze");
}

function textIncident() {
  return analyzeRequest()
    .field("situationType", "suspicious_received")
    .field("preferredLanguage", "English")
    .field("suspiciousText", "Fake bank verification message");
}

describe("OpenAI analysis integration", () => {
  afterEach(() => {
    resetAiTestDoubles();
  });

  it("missing OPENAI_API_KEY returns HTTP 503", async () => {
    setAiServiceConfigForTests({ ...testAiConfig, OPENAI_API_KEY: "" });

    const res = await textIncident().expect(503);

    expect(res.body).toEqual({
      error: {
        code: "AI_NOT_CONFIGURED",
        message: "AI analysis is temporarily unavailable. Please try again later."
      }
    });
  });

  it("missing OPENAI_MODEL returns HTTP 503", async () => {
    setAiServiceConfigForTests({ ...testAiConfig, OPENAI_MODEL: "" });

    const res = await textIncident().expect(503);

    expect(res.body.error.code).toBe("AI_NOT_CONFIGURED");
  });

  it("valid text-only request calls the injected AI client", async () => {
    const client = configureAiSuccess();

    await textIncident().expect(200);

    expect(client.calls).toHaveLength(1);
    expect(client.calls[0].body.model).toBe(testAiConfig.OPENAI_MODEL);
    expect(client.calls[0].body.input[1].content[0].type).toBe("input_text");
  });

  it("valid screenshot request passes validated image evidence to the AI client", async () => {
    const client = configureAiSuccess();

    await analyzeRequest()
      .field("situationType", "suspicious_received")
      .field("preferredLanguage", "English")
      .attach("evidenceFiles", validPng, { filename: "screenshot.png", contentType: "image/png" })
      .expect(200);

    const imageInput = client.calls[0].body.input[1].content.find((item) => item.type === "input_image");

    expect(imageInput.image_url).toMatch(/^data:image\/png;base64,/);
    expect(imageInput.detail).toBe("high");
  });

  it("successful service result returns HTTP 200 with server-controlled fields", async () => {
    configureAiSuccess();

    const res = await textIncident().expect(200);

    expect(res.body.analysisId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(res.body.language).toBe("English");
    expect(res.body.moneyTransferred).toBe(false);
    expect(res.body.officialHelp).toEqual({
      showCybercrimeHelpline: true,
      showReportingPortal: true,
      showBankContactAdvice: false
    });
    expect(res.body.safetyDisclaimer).toContain("AI-assisted guidance");
  });

  it("server sets moneyTransferred from situationType", async () => {
    configureAiSuccess();

    const res = await analyzeRequest()
      .field("situationType", "money_transferred")
      .field("preferredLanguage", "English")
      .field("incidentDescription", "I transferred money after a call.")
      .expect(200);

    expect(res.body.moneyTransferred).toBe(true);
    expect(res.body.officialHelp.showBankContactAdvice).toBe(true);
  });

  it("server adds localized safetyDisclaimer", async () => {
    configureAiSuccess();

    const res = await analyzeRequest()
      .field("situationType", "suspicious_received")
      .field("preferredLanguage", "Hindi")
      .field("suspiciousText", "Fake bank message")
      .expect(200);

    expect(res.body.language).toBe("Hindi");
    expect(res.body.safetyDisclaimer).toContain("AI-सहायित");
  });

  it("immediate actions are sorted by priority", async () => {
    configureAiSuccess();

    const res = await textIncident().expect(200);

    expect(res.body.immediateActions.map((action) => action.priority)).toEqual([1, 2]);
  });

  it("malformed structured output is rejected after one retry", async () => {
    const client = createFakeOpenAIClient({
      responses: [{ output_parsed: { bad: true }, output: [] }, { output_parsed: { bad: true }, output: [] }]
    });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await textIncident().expect(502);

    expect(client.calls).toHaveLength(2);
    expect(res.body.error.code).toBe("AI_INVALID_RESPONSE");
  });

  it("missing output_parsed is rejected", async () => {
    const client = createFakeOpenAIClient({
      responses: [{ output_parsed: null, output: [] }, { output_parsed: null, output: [] }]
    });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await textIncident().expect(502);

    expect(res.body.error.code).toBe("AI_INVALID_RESPONSE");
  });

  it("model refusal returns the safe HTTP 422 response", async () => {
    const client = createFakeOpenAIClient({
      responses: [
        {
          output_parsed: null,
          output: [{ type: "message", content: [{ type: "refusal", refusal: "raw refusal" }] }]
        }
      ]
    });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await textIncident().expect(422);

    expect(res.body).toEqual({
      error: {
        code: "AI_ANALYSIS_REFUSED",
        message: "The submitted evidence could not be analyzed. Review the content and try again."
      }
    });
  });

  it("timeout returns HTTP 504", async () => {
    const error = new Error("request timeout");
    error.name = "APIConnectionTimeoutError";
    const client = createFakeOpenAIClient({ error });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await textIncident().expect(504);

    expect(res.body.error.code).toBe("AI_ANALYSIS_TIMEOUT");
  });

  it("authentication failure returns a safe HTTP 503 response", async () => {
    const error = new Error("secret auth provider details");
    error.status = 401;
    const client = createFakeOpenAIClient({ error });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await textIncident().expect(503);

    expect(res.body.error.code).toBe("AI_AUTHENTICATION_FAILED");
    expect(JSON.stringify(res.body)).not.toContain("secret auth provider details");
  });

  it("provider rate limit returns a safe response", async () => {
    const error = new Error("raw provider rate limit body");
    error.status = 429;
    const client = createFakeOpenAIClient({ error });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await textIncident().expect(503);

    expect(res.body.error.code).toBe("AI_PROVIDER_BUSY");
    expect(JSON.stringify(res.body)).not.toContain("raw provider rate limit body");
  });

  it("provider service failure does not expose raw errors", async () => {
    const error = new Error("provider stack trace with private details");
    error.status = 500;
    const client = createFakeOpenAIClient({ error });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await textIncident().expect(503);

    expect(res.body.error.code).toBe("AI_SERVICE_UNAVAILABLE");
    expect(JSON.stringify(res.body)).not.toContain("provider stack trace");
  });

  it("successful API responses do not expose provider or submitted raw data", async () => {
    const analysis = createAnalysis({ reportSummary: "A safe generated summary." });
    const client = createFakeOpenAIClient({ responses: [parsedResponse(analysis)] });
    setAiServiceConfigForTests(testAiConfig);
    setOpenAIClientForTests(client);

    const res = await analyzeRequest()
      .field("situationType", "suspicious_received")
      .field("preferredLanguage", "English")
      .field("suspiciousText", "RAW SUBMITTED SUSPICIOUS TEXT")
      .attach("evidenceFiles", validPng, { filename: "private.png", contentType: "image/png" })
      .expect(200);

    const body = JSON.stringify(res.body);

    expect(body).not.toContain("RAW SUBMITTED SUSPICIOUS TEXT");
    expect(body).not.toContain("resp_should_not_be_returned");
    expect(body).not.toContain("test-key");
    expect(body).not.toContain(validPng.toString("base64"));
    expect(body).not.toContain("buffer");
    expect(body).not.toContain("You are FraudFirst");
    expect(body).not.toContain("test-multimodal-model");
  });
});
