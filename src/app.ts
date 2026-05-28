// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  auditGaps,
  certificationPosture,
  payload,
  permissionLane,
  summary,
  verification
} from "./services/tableauPermissionAuditLabService.js";
import {
  renderAuditGaps,
  renderCertificationPosture,
  renderDocs,
  renderOverview,
  renderPermissionLane,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5524);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/permission-lane", (_req, res) => res.type("html").send(renderPermissionLane()));
app.get("/audit-gaps", (_req, res) => res.type("html").send(renderAuditGaps()));
app.get("/certification-posture", (_req, res) => res.type("html").send(renderCertificationPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/permission-lane", (_req, res) => res.json(permissionLane()));
app.get("/api/audit-gaps", (_req, res) => res.json(auditGaps()));
app.get("/api/certification-posture", (_req, res) => res.json(certificationPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`Tableau Permission Audit Lab listening on http://${host}:${port}`);
  });
}

export default app;
