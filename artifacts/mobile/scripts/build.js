const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");

function getDeploymentDomain() {
  const raw =
    process.env.REPLIT_INTERNAL_APP_DOMAIN ||
    process.env.REPLIT_DEV_DOMAIN ||
    process.env.EXPO_PUBLIC_DOMAIN ||
    "";
  return raw.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function cleanDist() {
  const distDir = path.join(projectRoot, "dist");
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
    console.log("Cleaned old dist/");
  }
}

const domain = getDeploymentDomain();
console.log("Building CoreHer Fitness web app...");
if (domain) {
  console.log(`Domain: ${domain}`);
}

cleanDist();

const env = {
  ...process.env,
  NODE_ENV: "production",
  ...(domain
    ? {
        EXPO_PUBLIC_DOMAIN: domain,
        REACT_NATIVE_PACKAGER_HOSTNAME: domain,
      }
    : {}),
};

const proc = spawn(
  "pnpm",
  ["exec", "expo", "export", "--platform", "web", "--output-dir", "dist"],
  {
    stdio: "inherit",
    cwd: projectRoot,
    env,
  }
);

proc.on("exit", (code) => {
  if (code !== 0) {
    console.error(`Build failed with exit code ${code}`);
    process.exit(code || 1);
  }
  console.log("Build complete! Output in dist/");
  process.exit(0);
});

proc.on("error", (err) => {
  console.error("Failed to start build:", err.message);
  process.exit(1);
});
