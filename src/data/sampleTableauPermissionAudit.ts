import type { TableauPermissionAuditExport } from "../types.js";

export const sampleTableauPermissionAuditPayload: TableauPermissionAuditExport = {
  snapshots: [
    {
      id: "snap-exec-analytics",
      name: "Executive analytics site access review",
      scope: "SITE",
      scopePath: "/tableau/sites/executive-analytics",
      site: "Executive Analytics",
      baselineStatus: "CURRENT",
      owner: "BI Platform",
      reviewCoveragePct: 78,
      staleAssets: 3,
      externalUsers: 14,
      collectedAt: "2026-05-30T13:00:00Z"
    },
    {
      id: "snap-finance-publishing",
      name: "Finance publishing permissions snapshot",
      scope: "PROJECT",
      scopePath: "/tableau/sites/finance/projects/month-close",
      site: "Finance Publishing",
      baselineStatus: "STALE",
      owner: "Reporting Operations",
      reviewCoveragePct: 66,
      staleAssets: 5,
      externalUsers: 4,
      collectedAt: "2026-05-27T08:30:00Z"
    }
  ],
  drifts: [
    {
      id: "drift-permission-sprawl",
      snapshotId: "snap-exec-analytics",
      scope: "PROJECT",
      scopePath: "/tableau/sites/executive-analytics/projects/board-distribution",
      family: "Permissions",
      status: "OPEN",
      resourceName: "board-distribution",
      expectedState: "Project permissions stay least-privilege and inherit from reviewed groups.",
      observedState: "Workbook permissions are manually overridden and still allow broad download and web-edit access.",
      affectedAssets: 7,
      changeWindowHours: 18,
      owner: "BI Platform",
      breaksGuardrail: true,
      affectsTrust: true
    },
    {
      id: "drift-group-sync",
      snapshotId: "snap-exec-analytics",
      scope: "GROUP",
      scopePath: "/tableau/sites/executive-analytics/groups/executive-readers",
      family: "GroupSync",
      status: "OPEN",
      resourceName: "executive-readers",
      expectedState: "Directory-backed groups stay synced before workbook entitlements are certified.",
      observedState: "The directory sync has lagged and inactive users still retain Tableau access.",
      affectedAssets: 9,
      changeWindowHours: 12,
      owner: "Identity Operations",
      breaksGuardrail: true,
      affectsTrust: true
    },
    {
      id: "drift-certification",
      snapshotId: "snap-finance-publishing",
      scope: "DATASOURCE",
      scopePath: "/tableau/sites/finance/datasources/month-close-certified",
      family: "Certification",
      status: "ACKNOWLEDGED",
      resourceName: "month-close-certified",
      expectedState: "Certified data sources stay tied to the reviewed owner and approved refresh lineage.",
      observedState: "Certification is still present even though the owner handoff and review evidence are out of date.",
      affectedAssets: 4,
      changeWindowHours: 29,
      owner: "Reporting Operations",
      affectsTrust: true
    },
    {
      id: "drift-external-sharing",
      snapshotId: "snap-exec-analytics",
      scope: "WORKBOOK",
      scopePath: "/tableau/sites/executive-analytics/workbooks/partner-revenue-summary",
      family: "ExternalSharing",
      status: "OPEN",
      resourceName: "partner-revenue-summary",
      expectedState: "External sharing stays tied to an approved partner packet with expiry and owner evidence.",
      observedState: "A workbook share link is still active after the partner review window expired.",
      affectedAssets: 3,
      changeWindowHours: 14,
      owner: "RevOps Reporting",
      breaksGuardrail: true,
      affectsExternalAccess: true
    },
    {
      id: "drift-telemetry-gap",
      snapshotId: "snap-finance-publishing",
      scope: "SITE",
      scopePath: "/tableau/sites/finance/audit/site-activity",
      family: "Telemetry",
      status: "OPEN",
      resourceName: "site-activity-audit",
      expectedState: "Permission changes, admin grants, and content access logs stay complete for review.",
      observedState: "Site activity export is missing for the last two review cycles, weakening audit proof.",
      affectedAssets: 11,
      changeWindowHours: 36,
      owner: "Platform Operations",
      breaksGuardrail: true,
      affectsTrust: true
    },
    {
      id: "drift-ownership-gap",
      snapshotId: "snap-finance-publishing",
      scope: "WORKBOOK",
      scopePath: "/tableau/sites/finance/workbooks/month-close-board-pack",
      family: "Ownership",
      status: "ACKNOWLEDGED",
      resourceName: "month-close-board-pack",
      expectedState: "Workbook ownership, certification, and distribution contacts stay mapped before publish.",
      observedState: "The handoff packet still depends on manual owner confirmation for one finance publishing path.",
      affectedAssets: 2,
      changeWindowHours: 31,
      owner: "Reporting Operations",
      affectsTrust: true
    }
  ]
};

export const permissionLanePackets = [
  {
    id: "permission-governance",
    lane: "Permission governance lane",
    owner: "BI Platform",
    focus: "Least-privilege project permissions and workbook overrides",
    status: "red",
    note: "Critical Tableau projects still depend on manual overrides that widen access beyond reviewed groups.",
    nextAction: "Collapse manual grants back into reviewed group policy before the next audit cycle."
  },
  {
    id: "group-sync-health",
    lane: "Group sync lane",
    owner: "Identity Operations",
    focus: "Directory-backed groups, site roles, and entitlement freshness",
    status: "red",
    note: "Group sync lag is leaving stale accounts active on sensitive Tableau content.",
    nextAction: "Restore group freshness and remove inactive access from executive-reader paths."
  },
  {
    id: "certification-confidence",
    lane: "Certification confidence lane",
    owner: "Reporting Operations",
    focus: "Certified sources, owner evidence, and review freshness",
    status: "yellow",
    note: "Certification posture is recoverable, but owner proof and review continuity are stale on finance content.",
    nextAction: "Revalidate certified assets against current owners and approved review packets."
  },
  {
    id: "sharing-audit",
    lane: "Sharing and audit lane",
    owner: "Platform Operations",
    focus: "External shares, activity exports, and audit continuity",
    status: "yellow",
    note: "External links and telemetry proof are still partially manual.",
    nextAction: "Close expired sharing paths and restore audit export continuity."
  }
] as const;

export const certificationPackets = [
  {
    packetId: "TAB-14",
    lane: "Executive workbook access review",
    owner: "BI Platform",
    status: "red",
    completenessScore: 57,
    decisionNote: "Manual project grants and group sync lag mean this review packet is not ready for sign-off.",
    blocker: "Collapse overridden permissions and verify current group membership before publish.",
    launchWindowHours: 10
  },
  {
    packetId: "TAB-19",
    lane: "Partner share expiry cleanup",
    owner: "RevOps Reporting",
    status: "red",
    completenessScore: 63,
    decisionNote: "External workbook sharing can still outrun the approved partner-review window.",
    blocker: "Expired partner access must be revoked before the next distribution cycle.",
    launchWindowHours: 12
  },
  {
    packetId: "TAB-24",
    lane: "Finance certification revalidation",
    owner: "Reporting Operations",
    status: "yellow",
    completenessScore: 74,
    decisionNote: "Certification can clear once owner evidence and data-source review are refreshed.",
    blocker: "Certified-source owner handoff and review evidence are still pending.",
    launchWindowHours: 18
  },
  {
    packetId: "TAB-31",
    lane: "Audit export restoration",
    owner: "Platform Operations",
    status: "yellow",
    completenessScore: 70,
    decisionNote: "Audit continuity is recoverable in one cleanup cycle if the site-activity export is restored now.",
    blocker: "Site activity exports must replay before the next permission review checkpoint.",
    launchWindowHours: 24
  }
] as const;
