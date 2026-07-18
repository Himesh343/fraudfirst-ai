import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("API health and root endpoints", () => {
  it("GET /api returns HTTP 200 with simple API status", async () => {
    const res = await request(app).get("/api").expect(200);

    expect(res.body).toEqual({
      name: "FraudFirst API",
      status: "running",
      message: "AI cyber-fraud emergency assistance backend"
    });
  });

  it("GET /api/health returns HTTP 200 with safe status fields", async () => {
    const res = await request(app).get("/api/health").expect(200);

    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("FraudFirst API");
    expect(typeof res.body.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(res.body.timestamp))).toBe(false);
    expect(res.body.aiConfigured).toBe(false);
    expect(res.body.OPENAI_API_KEY).toBeUndefined();
    expect(res.body.OPENAI_MODEL).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("test-key");
    expect(JSON.stringify(res.body)).not.toContain("test-multimodal-model");
  });
});
