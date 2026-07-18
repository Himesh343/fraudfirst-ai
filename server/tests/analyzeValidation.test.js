import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { configureAiSuccess, resetAiTestDoubles } from "./helpers/aiTestHelpers.js";

const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

function analyzeRequest() {
  return request(app).post("/api/analyze");
}

function requiredFields(req) {
  return req.field("situationType", "suspicious_received").field("preferredLanguage", "English");
}

describe("POST /api/analyze validation", () => {
  beforeEach(() => {
    configureAiSuccess();
  });

  afterEach(() => {
    resetAiTestDoubles();
  });

  it("valid text-only suspicious incident returns HTTP 200", async () => {
    const res = await requiredFields(analyzeRequest())
      .field("suspiciousText", "Your account will be blocked unless you click this link now.")
      .expect(200);

    expect(res.body.status).toBeUndefined();
    expect(res.body.analysisId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(res.body.language).toBe("English");
    expect(res.body.moneyTransferred).toBe(false);
  });

  it("valid screenshot-only incident returns HTTP 200", async () => {
    const res = await requiredFields(analyzeRequest())
      .attach("evidenceFiles", validPng, { filename: "screenshot.png", contentType: "image/png" })
      .expect(200);

    expect(res.body.analysisId).toBeTruthy();
    expect(res.body.risk.level).toBe("high");
  });

  it("valid screenshot and text incident returns HTTP 200", async () => {
    const res = await requiredFields(analyzeRequest())
      .field("incidentDescription", "I received this payment warning and saved the screenshot.")
      .attach("evidenceFiles", validPng, { filename: "warning.png", contentType: "image/png" })
      .expect(200);

    expect(res.body.reportSummary).toBeTruthy();
  });

  it("missing situationType returns HTTP 400", async () => {
    const res = await analyzeRequest()
      .field("preferredLanguage", "English")
      .field("suspiciousText", "Suspicious payment message")
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_INCIDENT_DETAILS");
    expect(res.body.error.fields.situationType).toBeTruthy();
  });

  it("invalid situationType returns HTTP 400", async () => {
    const res = await analyzeRequest()
      .field("situationType", "lost_card")
      .field("preferredLanguage", "English")
      .field("suspiciousText", "Suspicious payment message")
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_INCIDENT_DETAILS");
    expect(res.body.error.fields.situationType).toBeTruthy();
  });

  it("invalid preferredLanguage returns HTTP 400", async () => {
    const res = await analyzeRequest()
      .field("situationType", "suspicious_received")
      .field("preferredLanguage", "Spanish")
      .field("suspiciousText", "Suspicious payment message")
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_INCIDENT_DETAILS");
    expect(res.body.error.fields.preferredLanguage).toBeTruthy();
  });

  it("request without meaningful evidence returns HTTP 400", async () => {
    const res = await requiredFields(analyzeRequest()).expect(400);

    expect(res.body).toEqual({
      error: {
        code: "EVIDENCE_REQUIRED",
        message: "Add at least one screenshot, suspicious message, or incident description."
      }
    });
  });

  it("whitespace-only text is rejected as missing evidence", async () => {
    const res = await requiredFields(analyzeRequest())
      .field("suspiciousText", "     ")
      .field("incidentDescription", "\n\t  ")
      .expect(400);

    expect(res.body.error.code).toBe("EVIDENCE_REQUIRED");
  });

  it("invalid email is rejected", async () => {
    const res = await requiredFields(analyzeRequest())
      .field("suspiciousText", "Suspicious payment message")
      .field("suspectedEmail", "not-an-email")
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_INCIDENT_DETAILS");
    expect(res.body.error.fields.suspectedEmail).toBe("Enter a valid email address.");
  });

  it("unsafe URL protocol is rejected", async () => {
    const res = await requiredFields(analyzeRequest())
      .field("suspiciousText", "Suspicious payment message")
      .field("suspiciousUrl", "javascript:alert(1)")
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_INCIDENT_DETAILS");
    expect(res.body.error.fields.suspiciousUrl).toBe("Enter a valid HTTP or HTTPS URL.");
  });

  it("negative amount is rejected", async () => {
    const res = await analyzeRequest()
      .field("situationType", "money_transferred")
      .field("preferredLanguage", "English")
      .field("incidentDescription", "I transferred money after receiving a suspicious call.")
      .field("amount", "-100")
      .expect(400);

    expect(res.body.error.code).toBe("INVALID_INCIDENT_DETAILS");
    expect(res.body.error.fields.amount).toBe("Enter a valid non-negative amount.");
  });

  it("unsupported file type is rejected", async () => {
    const res = await requiredFields(analyzeRequest())
      .attach("evidenceFiles", Buffer.from("plain text"), { filename: "note.txt", contentType: "text/plain" })
      .expect(400);

    expect(res.body.error).toEqual({
      code: "UNSUPPORTED_FILE_TYPE",
      message: "Only PNG, JPG and WebP screenshots are supported."
    });
  });

  it("MIME spoofing is rejected when claimed image content is not an image", async () => {
    const res = await requiredFields(analyzeRequest())
      .attach("evidenceFiles", Buffer.from("not really a png"), { filename: "screenshot.png", contentType: "image/png" })
      .expect(400);

    expect(res.body.error.code).toBe("UNSUPPORTED_FILE_TYPE");
  });

  it("file larger than 5 MB is rejected", async () => {
    const oversized = Buffer.concat([validPng, Buffer.alloc(5 * 1024 * 1024 + 1)]);
    const res = await requiredFields(analyzeRequest())
      .attach("evidenceFiles", oversized, { filename: "large.png", contentType: "image/png" })
      .expect(413);

    expect(res.body.error).toEqual({
      code: "FILE_TOO_LARGE",
      message: "Each screenshot must be 5 MB or smaller."
    });
  });

  it("more than 4 files are rejected", async () => {
    let req = requiredFields(analyzeRequest());

    for (let index = 0; index < 5; index += 1) {
      req = req.attach("evidenceFiles", validPng, { filename: "shot-" + index + ".png", contentType: "image/png" });
    }

    const res = await req.expect(400);

    expect(res.body.error).toEqual({
      code: "TOO_MANY_FILES",
      message: "You can upload a maximum of 4 screenshots."
    });
  });

  it("unexpected upload field is rejected", async () => {
    const res = await requiredFields(analyzeRequest())
      .attach("wrongField", validPng, { filename: "screenshot.png", contentType: "image/png" })
      .expect(400);

    expect(res.body.error).toEqual({
      code: "UNEXPECTED_FILE_FIELD",
      message: "Use the evidenceFiles field for screenshot uploads."
    });
  });

  it("successful response omits raw evidence and personal incident values", async () => {
    const res = await analyzeRequest()
      .field("situationType", "money_transferred")
      .field("preferredLanguage", "English")
      .field("suspiciousText", "SECRET suspicious message body")
      .field("incidentDescription", "PRIVATE incident description")
      .field("amount", "1,000")
      .field("transactionId", "TXN-SECRET-123")
      .field("upiId", "person@upi")
      .field("suspectedPhone", "+91 9999999999")
      .field("suspectedEmail", "fraud@example.com")
      .field("suspiciousUrl", "https://example.com/phish")
      .attach("evidenceFiles", validPng, { filename: "private-screenshot.png", contentType: "image/png" })
      .expect(200);

    const body = JSON.stringify(res.body);

    expect(res.body.moneyTransferred).toBe(true);
    expect(res.body.officialHelp.showBankContactAdvice).toBe(true);
    expect(body).not.toContain("SECRET suspicious message body");
    expect(body).not.toContain("PRIVATE incident description");
    expect(body).not.toContain("TXN-SECRET-123");
    expect(body).not.toContain("person@upi");
    expect(body).not.toContain("9999999999");
    expect(body).not.toContain("fraud@example.com");
    expect(body).not.toContain("private-screenshot.png");
    expect(body).not.toContain(validPng.toString("base64"));
    expect(body).not.toContain("buffer");
  });
});
