import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditGaps,
  certificationPosture,
  payload,
  permissionLane,
  summary,
  verification
} from "../src/services/tableauPermissionAuditLabService.js";
import {
  renderAuditGaps,
  renderCertificationPosture,
  renderDocs,
  renderOverview,
  renderPermissionLane,
  renderSample,
  renderVerification
} from "../src/services/render.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "site");

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, "api", "dashboard"), { recursive: true });
fs.copyFileSync(path.join(root, "CNAME"), path.join(outputDir, "CNAME"));

const pages: Record<string, string> = {
  "index.html": renderOverview(),
  [path.join("permission-lane", "index.html")]: renderPermissionLane(),
  [path.join("audit-gaps", "index.html")]: renderAuditGaps(),
  [path.join("certification-posture", "index.html")]: renderCertificationPosture(),
  [path.join("verification", "index.html")]: renderVerification(),
  [path.join("docs", "index.html")]: renderDocs(),
  [path.join("sample", "index.html")]: renderSample()
};

for (const [relativePath, html] of Object.entries(pages)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, "utf8");
}

const apiPayloads: Record<string, unknown> = {
  [path.join("api", "dashboard", "summary.json")]: summary(),
  [path.join("api", "permission-lane.json")]: permissionLane(),
  [path.join("api", "audit-gaps.json")]: auditGaps(),
  [path.join("api", "certification-posture.json")]: certificationPosture(),
  [path.join("api", "verification.json")]: verification(),
  [path.join("api", "sample.json")]: payload()
};

for (const [relativePath, data] of Object.entries(apiPayloads)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}
