import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();
const pngHeader = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");

describe("FraudFirst API", () => {
  it("GET /api/health returns successfully", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.aiConfigured).toBe("boolean");
  });

  it("POST /api/analyze rejects a missing situation type", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .field("incidentDescription", "A meaningful description with enough detail for validation.")
      .field("privacyConfirmed", "true")
      .expect(400);
    expect(res.body.error.code).toBe("INVALID_INPUT");
  });

  it("POST /api/analyze rejects unsupported file types", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .field("situationType", "suspicious_received")
      .field("incidentDescription", "A meaningful description with enough detail for validation.")
      .field("privacyConfirmed", "true")
      .attach("evidenceFiles", Buffer.from("not an image"), { filename: "note.txt", contentType: "text/plain" })
      .expect(400);
    expect(res.body.error.code).toBe("UNSUPPORTED_FILE_TYPE");
  });

  it("POST /api/analyze rejects oversized evidence", async () => {
    const big = Buffer.concat([pngHeader, Buffer.alloc(5 * 1024 * 1024 + 1)]);
    const res = await request(app)
      .post("/api/analyze")
      .field("situationType", "suspicious_received")
      .field("incidentDescription", "A meaningful description with enough detail for validation.")
      .field("privacyConfirmed", "true")
      .attach("evidenceFiles", big, { filename: "large.png", contentType: "image/png" })
      .expect(413);
    expect(res.body.error.code).toBe("LIMIT_FILE_SIZE");
  });

  it("POST /api/analyze rejects requests with no meaningful evidence", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .field("situationType", "suspicious_received")
      .field("privacyConfirmed", "true")
      .expect(400);
    expect(res.body.error.code).toBe("INVALID_INPUT");
  });

  it("POST /api/analyze returns 503 when AI configuration is missing", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .field("situationType", "suspicious_received")
      .field("suspiciousText", "Your bank account will be blocked. Click this link immediately.")
      .field("incidentDescription", "I received a suspicious bank message asking me to click a link.")
      .field("privacyConfirmed", "true")
      .attach("evidenceFiles", pngHeader, { filename: "shot.png", contentType: "image/png" })
      .expect(503);
    expect(res.body.error.code).toBe("AI_NOT_CONFIGURED");
  });
});
