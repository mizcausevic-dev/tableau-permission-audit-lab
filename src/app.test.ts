import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "./app.js";

describe("app", () => {
  test("overview responds with html", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Tableau Permission Audit Lab");
  });

  test("docs route exposes the Tableau CLI shape", async () => {
    const docs = await request(app).get("/docs");
    expect(docs.status).toBe(200);
    expect(docs.text).toContain("Offline Tableau permission analysis");
  });
});
