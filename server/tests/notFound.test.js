import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("API error handling", () => {
  it("unknown API routes return HTTP 404", async () => {
    const res = await request(app).get("/api/does-not-exist").expect(404);

    expect(res.body).toEqual({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "The requested API endpoint was not found."
      }
    });
  });

  it("unknown API routes return JSON instead of HTML", async () => {
    const res = await request(app).get("/api/missing-route").expect("Content-Type", /json/).expect(404);

    expect(res.text.trim().startsWith("<")).toBe(false);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("invalid JSON returns a safe error response", async () => {
    const res = await request(app)
      .post("/api/health")
      .set("Content-Type", "application/json")
      .send("{bad json")
      .expect(400);

    expect(res.body).toEqual({
      error: {
        code: "INVALID_JSON",
        message: "The request body contains invalid JSON."
      }
    });
  });

  it("oversized JSON requests return a safe error response", async () => {
    const oversizedPayload = {
      value: "x".repeat(1024 * 1024 + 1)
    };

    const res = await request(app).post("/api/health").send(oversizedPayload).expect(413);

    expect(res.body).toEqual({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "The request body is too large."
      }
    });
  });
});
