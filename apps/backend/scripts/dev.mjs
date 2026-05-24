import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(currentDir, "..");
const workspaceRoot = path.resolve(appRoot, "../..");
const configHome = path.join(workspaceRoot, ".wrangler-config");

mkdirSync(configHome, { recursive: true });

const command = process.execPath;
const wranglerBin = path.join(
  appRoot,
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);

const child = spawn(command, [wranglerBin, "dev", "src/index.ts"], {
  cwd: appRoot,
  env: {
    ...process.env,
    XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME ?? configHome,
    WRANGLER_SEND_METRICS: process.env.WRANGLER_SEND_METRICS ?? "false",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
