import { auditGaps, certificationPosture, summary } from "../src/services/tableauPermissionAuditLabService.js";

console.log("tableau-permission-audit-lab demo");
console.dir(summary(), { depth: null });
console.dir(
  certificationPosture().map((packet) => ({
    lane: packet.lane,
    owner: packet.owner,
    status: packet.status
  })),
  { depth: null }
);
console.dir(auditGaps().slice(0, 3), { depth: null });
