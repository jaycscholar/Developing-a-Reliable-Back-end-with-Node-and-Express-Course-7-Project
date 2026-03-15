import { spawn } from "node:child_process";
import net from "node:net";

const BACKEND_URL = "http://localhost:3000";

function runCommand(command, args, label) {
  const normalizedCommand =
    process.platform === "win32" && ["npm", "npx"].includes(command)
      ? `${command}.cmd`
      : command;

  const child = spawn(normalizedCommand, args, {
    shell: false,
    stdio: "inherit",
  });

  child.on("error", (err) => {
    console.error(`[${label}] failed to start:`, err.message);
  });

  return child;
}

function isPortFree(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function findFreePort(startPort) {
  let port = startPort;

  while (port < startPort + 50) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(port);
    if (free) return port;
    port += 1;
  }

  throw new Error("Could not find an open frontend port in expected range");
}

async function waitForUrl(url, timeoutMs = 60000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // keep waiting until service is ready
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function killProcessTree(pid) {
  if (!pid) return Promise.resolve();

  if (process.platform === "win32") {
    return new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(pid), "/t", "/f"], {
        shell: true,
        stdio: "ignore",
      });
      killer.on("close", () => resolve());
      killer.on("error", () => resolve());
    });
  }

  return new Promise((resolve) => {
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      // ignore if process is already gone
    }
    resolve();
  });
}

async function main() {
  let backend;
  let frontend;
  let frontendUrl;

  try {
    console.log("Starting backend on port 3000...");
    backend = runCommand("node", ["../backend/server.js"], "backend");

    console.log("Waiting for backend readiness...");
    await waitForUrl(BACKEND_URL, 90000);

    const frontendPort = await findFreePort(5173);
    frontendUrl = `http://localhost:${frontendPort}`;

    console.log(`Starting frontend on port ${frontendPort}...`);
    frontend = runCommand("npm", ["run", "dev", "--", "--host", "0.0.0.0", "--port", String(frontendPort), "--strictPort"], "frontend");

    console.log("Waiting for frontend readiness...");
    await waitForUrl(frontendUrl, 90000);

    console.log("Running Cypress headed tests...");
    const cypressExitCode = await new Promise((resolve) => {
      const cypress = runCommand("npx", ["cypress", "run", "--headed", "--browser", "electron", "--config", `baseUrl=${frontendUrl}`], "cypress");
      cypress.on("close", (code) => resolve(code ?? 1));
    });

    if (cypressExitCode !== 0) {
      process.exitCode = cypressExitCode;
    }
  } catch (err) {
    console.error("E2E pipeline failed:", err.message);
    process.exitCode = 1;
  } finally {
    console.log("Shutting down frontend and backend...");
    await Promise.all([
      killProcessTree(frontend?.pid),
      killProcessTree(backend?.pid),
    ]);
  }
}

main();
