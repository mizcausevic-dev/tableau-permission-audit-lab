import app from "../src/app.js";

const routes = [
  "/",
  "/permission-lane",
  "/audit-gaps",
  "/certification-posture",
  "/verification",
  "/docs",
  "/api/dashboard/summary",
  "/api/permission-lane",
  "/api/audit-gaps",
  "/api/certification-posture",
  "/api/verification",
  "/api/sample"
];

const server = app.listen(0, "127.0.0.1", async () => {
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Unable to determine server address");
  }

  const base = `http://127.0.0.1:${address.port}`;

  try {
    for (const route of routes) {
      const response = await fetch(`${base}${route}`);
      if (!response.ok) {
        throw new Error(`Smoke check failed for ${route}: ${response.status}`);
      }
    }

    console.log("smoke check passed");
  } finally {
    server.close();
  }
});
