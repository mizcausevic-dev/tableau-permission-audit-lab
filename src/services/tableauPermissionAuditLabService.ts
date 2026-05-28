// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { certificationPackets, permissionLanePackets, sampleTableauPermissionAuditPayload } from "../data/sampleTableauPermissionAudit.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-30T00:00:00Z";
const report = analyze(sampleTableauPermissionAuditPayload, {
  now: NOW,
  staleRemediationAfterHours: 24
});

function severityRank(finding: Finding): number {
  return finding.severity === "high" ? 0 : finding.severity === "medium" ? 1 : finding.severity === "low" ? 2 : 3;
}

export function summary() {
  return {
    snapshots: report.snapshots,
    currentSnapshots: report.currentSnapshots,
    drifts: report.drifts,
    highRiskAssets: report.highRiskAssets,
    externalExposureRisks: report.externalExposureRisks,
    remediationEscalations: report.remediationEscalations,
    highFindings: report.findingsList.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Tighten Tableau permissions, restore directory group sync, revalidate certification ownership, and close stale external sharing before the next audit checkpoint."
  };
}

export function permissionLane() {
  return permissionLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findingsList.filter((finding) => {
      if (lane.id === "permission-governance") {
        return finding.code === "permission-sprawl-risk" || finding.code === "stale-snapshot";
      }
      if (lane.id === "group-sync-health") {
        return finding.code === "group-sync-gap";
      }
      if (lane.id === "certification-confidence") {
        return finding.code === "certification-drift" || finding.code === "ownership-handoff-gap";
      }
      if (lane.id === "sharing-audit") {
        return finding.code === "external-sharing-risk" || finding.code === "telemetry-gap" || finding.code === "stale-remediation-window";
      }
      return false;
    }).length
  }));
}

export function auditGaps() {
  return [...report.findingsList]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "permission-sprawl-risk"
          ? "BI Platform"
          : finding.code === "group-sync-gap"
            ? "Identity Operations"
            : finding.code === "certification-drift" || finding.code === "ownership-handoff-gap"
              ? "Reporting Operations"
              : finding.code === "telemetry-gap"
                ? "Platform Operations"
                : "RevOps Reporting"
    }));
}

export function certificationPosture() {
  return certificationPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline analyzer and CLI, not static copy alone.",
    "Permission snapshots, certification packets, and audit drifts are synthetic sample data only; no live Tableau credentials, workbook URLs, or user exports are published.",
    "The control plane keeps permission sprawl, group sync, certification trust, external sharing, and audit continuity visible for operators and reviewers.",
    "This surface demonstrates Tableau permission governance and audit operations, not a generic BI keyword page.",
    "It complements reporting, Azure, IAM, and data-governance proof with a concrete Tableau access-review lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    permissionLane: permissionLane(),
    auditGaps: auditGaps(),
    certificationPosture: certificationPosture(),
    verification: verification(),
    sample: sampleTableauPermissionAuditPayload
  };
}
