import path from "node:path";
import fs from "fs-extra";
import { pathToFileURL } from "node:url";
import { FileUtils } from "../../utils/FileUtils.js";

export async function reviewLatestRun() {
  const proposedRoot = path.resolve(process.cwd(), "src/agentic/runs/proposed");
  const latestRun = await FileUtils.latestSubDirectory(proposedRoot);
  if (!latestRun) {
    return null;
  }

  const manifestPath = path.join(latestRun, "manifest.json");
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`Manifest not found in latest run: ${latestRun}`);
  }

  const manifest = await fs.readJson(manifestPath);
  return { latestRun, manifest };
}

async function main() {
  const summary = await reviewLatestRun();
  if (!summary) {
    console.log("No proposed agentic run found. Execute: npm run agent:from-story");
    return;
  }
  const { latestRun, manifest } = summary;

  console.log(`Run ID: ${manifest.runId}`);
  console.log(`Run Path: ${latestRun}`);
  console.log(`MCP Client: ${manifest.scmMode}`);
  console.log(`Story: ${manifest.storyTitle}`);
  console.log(`Validation: ${manifest.validation?.passed ? "passed" : "failed"}`);
  if (!manifest.validation?.passed) {
    console.log("Issues:");
    for (const issue of manifest.validation?.issues || []) {
      console.log(`- ${issue}`);
    }
  }
  console.log("Generated files:");
  for (const artifact of manifest.generatedArtifacts || []) {
    console.log(`- ${artifact.targetPath}`);
  }
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error) => {
    console.error("agent:review failed:", error);
    process.exitCode = 1;
  });
}
