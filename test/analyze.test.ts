import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { TableauPermissionAuditExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): TableauPermissionAuditExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as TableauPermissionAuditExport;

const NOW = "2026-05-30T00:00:00Z";

describe("analyze", () => {
  it("counts snapshots and drifts", () => {
    const report = analyze(fixture("tableau-permission-hotspots.json"), { now: NOW });
    expect(report.snapshots).toBe(2);
    expect(report.currentSnapshots).toBe(1);
    expect(report.drifts).toBe(6);
  });

  it("flags missing current snapshots as high", () => {
    const report = analyze({ snapshots: [], drifts: [] }, { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "no-current-snapshot")?.severity).toBe("high");
  });

  it("flags permission, group sync, certification, sharing, telemetry, and ownership gaps", () => {
    const report = analyze(fixture("tableau-permission-hotspots.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "permission-sprawl-risk")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "group-sync-gap")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "certification-drift")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "external-sharing-risk")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "telemetry-gap")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "ownership-handoff-gap")).toBeDefined();
  });

  it("flags stale remediation windows", () => {
    const report = analyze(fixture("tableau-permission-hotspots.json"), { now: NOW, staleRemediationAfterHours: 24 });
    expect(report.findingsList.find((finding) => finding.code === "stale-remediation-window")).toBeDefined();
  });

  it("flags stale snapshots and low-severity stale remediation paths", () => {
    const report = analyze(
      {
        snapshots: [
          {
            id: "snap-stale",
            name: "Legacy Tableau site",
            scope: "SITE",
            scopePath: "/tableau/sites/legacy",
            site: "Legacy",
            baselineStatus: "STALE",
            owner: "Reporting Operations",
            reviewCoveragePct: 81,
            staleAssets: 1,
            externalUsers: 0,
            collectedAt: "2026-05-26T10:00:00Z"
          }
        ],
        drifts: [
          {
            id: "drift-slow-owner-followup",
            snapshotId: "snap-stale",
            scope: "WORKBOOK",
            scopePath: "/tableau/sites/legacy/workbooks/followup",
            family: "Ownership",
            status: "ROUTED",
            resourceName: "followup",
            expectedState: "Ownership packet is fully mapped before publish.",
            observedState: "Manual owner reminder still pending.",
            affectedAssets: 1,
            changeWindowHours: 30,
            owner: "Reporting Operations"
          }
        ]
      },
      { now: NOW, staleRemediationAfterHours: 24 }
    );

    expect(report.findingsList.find((finding) => finding.code === "stale-snapshot")?.severity).toBe("medium");
    expect(report.findingsList.find((finding) => finding.code === "stale-remediation-window")?.severity).toBe("low");
  });

  it("does not create family findings when branch conditions are not met", () => {
    const report = analyze(
      {
        snapshots: [
          {
            id: "snap-current",
            name: "Stable Tableau site",
            scope: "SITE",
            scopePath: "/tableau/sites/stable",
            site: "Stable",
            baselineStatus: "CURRENT",
            owner: "BI Platform",
            reviewCoveragePct: 99,
            staleAssets: 0,
            externalUsers: 0,
            collectedAt: "2026-05-30T10:00:00Z"
          }
        ],
        drifts: [
          {
            id: "drift-permissions-muted",
            snapshotId: "snap-current",
            scope: "PROJECT",
            scopePath: "/tableau/sites/stable/projects/core",
            family: "Permissions",
            status: "ROUTED",
            resourceName: "core",
            expectedState: "Permissions remain stable.",
            observedState: "Reviewed and unchanged.",
            affectedAssets: 1,
            changeWindowHours: 2,
            owner: "BI Platform",
            breaksGuardrail: false
          },
          {
            id: "drift-telemetry-muted",
            snapshotId: "snap-current",
            scope: "SITE",
            scopePath: "/tableau/sites/stable/audit",
            family: "Telemetry",
            status: "ROUTED",
            resourceName: "audit-feed",
            expectedState: "Coverage remains healthy.",
            observedState: "Healthy feed.",
            affectedAssets: 1,
            changeWindowHours: 2,
            owner: "Platform Operations",
            breaksGuardrail: false
          }
        ]
      },
      { now: NOW }
    );

    expect(report.findingsList.find((finding) => finding.code === "permission-sprawl-risk")).toBeUndefined();
    expect(report.findingsList.find((finding) => finding.code === "telemetry-gap")).toBeUndefined();
  });

  it("ok=true on a clean fixture", () => {
    const report = analyze(fixture("tableau-permission-healthy.json"), { now: NOW });
    expect(report.ok).toBe(true);
    expect(report.findingsList.filter((finding) => finding.severity === "high")).toEqual([]);
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first", () => {
    const markdown = toMarkdown(analyze(fixture("tableau-permission-hotspots.json"), { now: NOW }));
    expect(markdown).toContain("❌");
    expect(markdown.indexOf("🔴")).toBeLessThan(markdown.indexOf("🟠"));
  });

  it("toSummary emits a one-liner", () => {
    const summary = toSummary(analyze(fixture("tableau-permission-hotspots.json"), { now: NOW }));
    expect(summary).toMatch(/snapshots/);
    expect(summary).toMatch(/drifts/);
  });

  it("toMarkdown emits the no-findings branch when the report is clean", () => {
    const markdown = toMarkdown(analyze(fixture("tableau-permission-healthy.json"), { now: NOW }));
    expect(markdown).toContain("No findings.");
  });
});
