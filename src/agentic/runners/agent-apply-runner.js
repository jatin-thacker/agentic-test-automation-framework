import path from "node:path";
import fs from "fs-extra";
import { pathToFileURL } from "node:url";
import { DateUtils } from "../../utils/DateUtils.js";
import { FileUtils } from "../../utils/FileUtils.js";

export async function applyLatestRun() {
  const rootDir = process.cwd();
  const proposedRoot = path.resolve(rootDir, "src/agentic/runs/proposed");
  const latestRun = await FileUtils.latestSubDirectory(proposedRoot);
  if (!latestRun) {
    throw new Error("No proposed run found. Execute npm run agent:from-story first.");
  }

  const manifestPath = path.join(latestRun, "manifest.json");
  const manifest = await fs.readJson(manifestPath);
  if (!manifest.validation?.passed) {
    throw new Error("Latest proposed run has validation issues. Fix before apply.");
  }

  const timestamp = DateUtils.timestampForPath();
  const backupRoot = path.resolve(rootDir, "src/agentic/runs/backups", timestamp);
  const appliedRoot = path.resolve(rootDir, "src/agentic/runs/applied", timestamp);
  await fs.ensureDir(backupRoot);

  const changedEntries = [];
  try {
    for (const artifact of manifest.generatedArtifacts || []) {
      const stagedPath = path.join(latestRun, artifact.stagedPath);
      const targetPath = path.resolve(rootDir, artifact.targetPath);
      const existed = await fs.pathExists(targetPath);
      const backupPath = path.join(backupRoot, artifact.targetPath);
      if (existed) {
        await fs.ensureDir(path.dirname(backupPath));
        await fs.copy(targetPath, backupPath, { overwrite: true });
      }
      await fs.ensureDir(path.dirname(targetPath));
      await fs.copy(stagedPath, targetPath, { overwrite: true });
      changedEntries.push({ targetPath, existed, backupPath });
    }
  } catch (error) {
    for (const entry of changedEntries.reverse()) {
      if (entry.existed) {
        await fs.copy(entry.backupPath, entry.targetPath, { overwrite: true });
      } else {
        await fs.remove(entry.targetPath);
      }
    }
    throw new Error(`Apply failed and rollback completed: ${error.message}`);
  }

  await fs.copy(latestRun, appliedRoot, { overwrite: true });
  const updatedManifest = {
    ...manifest,
    mode: "apply",
    applyResult: {
      applied: true,
      backupRoot,
      appliedRoot,
      appliedAt: new Date().toISOString()
    }
  };
  await fs.writeJson(path.join(latestRun, "manifest.json"), updatedManifest, { spaces: 2 });

  return { latestRun, backupRoot, appliedRoot };
}

async function main() {
  const result = await applyLatestRun();
  console.log(`Applied latest proposed run: ${result.latestRun}`);
  console.log(`Backup: ${result.backupRoot}`);
  console.log(`Applied snapshot: ${result.appliedRoot}`);
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error) => {
    console.error("agent:apply failed:", error.message);
    process.exitCode = 1;
  });
}
