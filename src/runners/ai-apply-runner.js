import process from "node:process";
import { applyLatestRun } from "../ai/AIWriter.js";

async function main() {
  const result = await applyLatestRun(process.cwd());
  console.log([
    `Run ID: ${result.manifest?.runId || result.latestRun}`,
    `Applied run: ${result.latestRun}`,
    `Backup path: ${result.applyResult.backupRoot}`,
    `Applied snapshot: ${result.applyResult.appliedRoot}`
  ].join("\n"));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
