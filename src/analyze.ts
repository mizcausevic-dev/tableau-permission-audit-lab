import type { AccessSnapshot, DriftOptions, DriftReport, Finding, TableauPermissionAuditExport } from "./types.js";

function isCurrent(snapshot: AccessSnapshot): boolean {
  return snapshot.baselineStatus === "CURRENT";
}

export function analyze(payload: TableauPermissionAuditExport, options: DriftOptions = {}): DriftReport {
  const now = options.now ?? new Date().toISOString();
  const staleRemediationAfterHours = options.staleRemediationAfterHours ?? 24;
  const snapshots = payload.snapshots ?? [];
  const drifts = payload.drifts ?? [];
  const findingsList: Finding[] = [];

  const currentSnapshots = snapshots.filter(isCurrent).length;
  if (currentSnapshots === 0) {
    findingsList.push({
      code: "no-current-snapshot",
      severity: "high",
      message: "No current Tableau permission snapshot is available for audit or certification decisions.",
      subject: "snapshot-currentness"
    });
  }

  for (const snapshot of snapshots) {
    if (snapshot.baselineStatus === "STALE") {
      findingsList.push({
        code: "stale-snapshot",
        severity: "medium",
        message: `Permission snapshot for "${snapshot.name}" is stale and should be regenerated before certifying access posture.`,
        subject: snapshot.id,
        subjectName: snapshot.scopePath,
        scope: snapshot.scope
      });
    }
  }

  for (const drift of drifts) {
    const observed = drift.observedState.toLowerCase();
    const expected = drift.expectedState.toLowerCase();

    if (drift.family === "Permissions" && (observed.includes("override") || observed.includes("access") || drift.breaksGuardrail)) {
      findingsList.push({
        code: "permission-sprawl-risk",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Permission sprawl is active on "${drift.resourceName}" and should be contained before the next Tableau review packet closes.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "GroupSync" && (observed.includes("sync") || observed.includes("inactive") || drift.breaksGuardrail)) {
      findingsList.push({
        code: "group-sync-gap",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Directory group sync is degraded on "${drift.resourceName}" and stale Tableau entitlements should be cleaned before the next audit review.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Certification" && (observed.includes("certification") || observed.includes("owner") || expected.includes("certified"))) {
      findingsList.push({
        code: "certification-drift",
        severity: drift.affectsTrust ? "high" : "medium",
        message: `Certification drift is active on "${drift.resourceName}" and the reviewed Tableau owner or lineage proof is no longer fully trustworthy.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "ExternalSharing" && (observed.includes("share") || observed.includes("partner") || drift.affectsExternalAccess)) {
      findingsList.push({
        code: "external-sharing-risk",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `External sharing risk is active on "${drift.resourceName}" and partner-facing Tableau access could still be wider than approved.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Telemetry" && (observed.includes("missing") || observed.includes("audit") || expected.includes("logs"))) {
      findingsList.push({
        code: "telemetry-gap",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Audit telemetry coverage is broken on "${drift.resourceName}", weakening Tableau permission evidence and review continuity.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Ownership" && (observed.includes("owner") || observed.includes("manual") || drift.affectsTrust)) {
      findingsList.push({
        code: "ownership-handoff-gap",
        severity: "medium",
        message: `Ownership handoff is still manual on "${drift.resourceName}", which weakens certification and permission confidence.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.changeWindowHours > staleRemediationAfterHours) {
      findingsList.push({
        code: "stale-remediation-window",
        severity: drift.changeWindowHours > staleRemediationAfterHours * 2 ? "medium" : "low",
        message: `Drift on "${drift.scopePath}" has remained unresolved for ${drift.changeWindowHours} hours.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }
  }

  const highRiskAssets = drifts.filter((drift) => drift.family === "Permissions" || drift.family === "GroupSync").length;
  const externalExposureRisks = drifts.filter((drift) => drift.family === "ExternalSharing" || drift.family === "Certification").length;
  const remediationEscalations = drifts.filter((drift) => drift.breaksGuardrail || drift.status !== "ROUTED").length;
  const ok = !findingsList.some((finding) => finding.severity === "high");

  return {
    generatedAt: now,
    snapshots: snapshots.length,
    currentSnapshots,
    drifts: drifts.length,
    highRiskAssets,
    externalExposureRisks,
    remediationEscalations,
    findingsList,
    ok
  };
}
