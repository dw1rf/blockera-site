const { spawnSync } = require("node:child_process");

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "pipe",
  shell: true,
  env: process.env
});

if (result.stdout) {
  process.stdout.write(result.stdout.toString());
}
if (result.stderr) {
  process.stderr.write(result.stderr.toString());
}

if (result.status !== 0) {
  const stderrText = result.stderr ? result.stderr.toString() : "";
  const message = stderrText || (result.error ? String(result.error) : "");
  if (message.includes("EPERM")) {
    console.warn("\n??  Prisma generate skipped из-за блокировки файла (EPERM). Продолжаем...");
    process.exit(0);
  }
  process.exit(result.status ?? 1);
}
