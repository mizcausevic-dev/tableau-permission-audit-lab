import { describe, expect, test } from "vitest";

import {
  renderAuditGaps,
  renderCertificationPosture,
  renderDocs,
  renderOverview,
  renderPermissionLane,
  renderSample,
  renderVerification
} from "./render.js";

describe("render surfaces", () => {
  test("overview carries the Tableau governance framing", () => {
    const html = renderOverview();
    expect(html).toContain("Tableau Permission Audit Lab");
    expect(html).toContain("Tableau permissions, certifications, and access drift");
    expect(html).toContain("Operator Snapshot");
  });

  test("docs route exposes the CLI and API shape", () => {
    const html = renderDocs();
    expect(html).toContain("tableau-permission-audit-lab");
    expect(html).toContain("/api/audit-gaps");
  });

  test("permission lane route renders the lane table", () => {
    const html = renderPermissionLane();
    expect(html).toContain("Permission Lane");
    expect(html).toContain("Permission governance lane");
    expect(html).toContain("Group sync lane");
  });

  test("audit gaps route includes ranked finding rows", () => {
    const html = renderAuditGaps();
    expect(html).toContain("Audit Gaps");
    expect(html).toContain("permission-sprawl-risk");
    expect(html).toContain("external-sharing-risk");
  });

  test("certification posture route exposes packet status", () => {
    const html = renderCertificationPosture();
    expect(html).toContain("Certification Posture");
    expect(html).toContain("Executive workbook access review");
    expect(html).toContain("TAB-14");
  });

  test("verification route keeps the synthetic-data constraint visible", () => {
    const html = renderVerification();
    expect(html).toContain("Verification");
    expect(html).toContain("synthetic sample data");
    expect(html).toContain("operator-safe claims only");
  });

  test("sample route emits the JSON payload", () => {
    const json = renderSample();
    expect(json).toContain("\"summary\"");
    expect(json).toContain("\"permissionLane\"");
    expect(json).toContain("\"sample\"");
  });
});
