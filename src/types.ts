// SPDX-License-Identifier: AGPL-3.0-or-later

export type ScopeKind = "TENANT" | "SITE" | "PROJECT" | "WORKBOOK" | "DATASOURCE" | "GROUP";
export type BaselineStatus = "CURRENT" | "STALE";
export type DriftStatus = "OPEN" | "ACKNOWLEDGED" | "ROUTED";
export type AnomalyFamily =
  | "Permissions"
  | "GroupSync"
  | "Certification"
  | "ExternalSharing"
  | "Ownership"
  | "Telemetry";

export interface AccessSnapshot {
  id: string;
  name: string;
  scope: ScopeKind;
  scopePath: string;
  site: string;
  baselineStatus: BaselineStatus;
  owner: string;
  reviewCoveragePct: number;
  staleAssets: number;
  externalUsers: number;
  collectedAt: string;
}

export interface PermissionDrift {
  id: string;
  snapshotId: string;
  scope: ScopeKind;
  scopePath: string;
  family: AnomalyFamily;
  status: DriftStatus;
  resourceName: string;
  expectedState: string;
  observedState: string;
  affectedAssets: number;
  changeWindowHours: number;
  owner: string;
  breaksGuardrail?: boolean;
  affectsTrust?: boolean;
  affectsExternalAccess?: boolean;
  note?: string;
}

export interface TableauPermissionAuditExport {
  snapshots?: AccessSnapshot[];
  drifts?: PermissionDrift[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-current-snapshot"
  | "stale-snapshot"
  | "permission-sprawl-risk"
  | "group-sync-gap"
  | "certification-drift"
  | "external-sharing-risk"
  | "ownership-handoff-gap"
  | "telemetry-gap"
  | "stale-remediation-window";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  subject: string;
  subjectName?: string;
  scope?: ScopeKind;
  family?: AnomalyFamily;
  resourceName?: string;
}

export interface DriftReport {
  generatedAt: string;
  snapshots: number;
  currentSnapshots: number;
  drifts: number;
  highRiskAssets: number;
  externalExposureRisks: number;
  remediationEscalations: number;
  findingsList: Finding[];
  ok: boolean;
}

export interface DriftOptions {
  now?: string;
  staleRemediationAfterHours?: number;
}
