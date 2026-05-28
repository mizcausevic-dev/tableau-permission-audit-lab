import { describe, expect, test } from "vitest";

import { auditGaps, certificationPosture, permissionLane, summary, verification } from "./tableauPermissionAuditLabService.js";

describe("tableauPermissionAuditLabService", () => {
  test("summary keeps the Tableau recommendation visible", () => {
    expect(summary().snapshots).toBe(2);
    expect(summary().recommendation).toContain("Tighten Tableau permissions");
  });

  test("permission lane keeps four operator lanes", () => {
    expect(permissionLane()).toHaveLength(4);
    expect(permissionLane()[0]?.lane).toContain("Permission");
  });

  test("audit gaps include permission and sharing findings", () => {
    expect(auditGaps().some((finding) => finding.code === "permission-sprawl-risk")).toBe(true);
    expect(auditGaps().some((finding) => finding.code === "external-sharing-risk")).toBe(true);
  });

  test("certification posture exposes four packets", () => {
    expect(certificationPosture()).toHaveLength(4);
  });

  test("verification keeps synthetic-data language explicit", () => {
    expect(verification().some((line) => line.includes("synthetic sample data"))).toBe(true);
  });
});
