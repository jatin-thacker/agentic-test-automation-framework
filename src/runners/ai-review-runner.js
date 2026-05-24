import process from "node:process";
import { reviewLatestRun } from "../ai/AIWriter.js";

async function main() {
  const summary = await reviewLatestRun(process.cwd());
  if (!summary) {
    console.log("No proposed AI runs found.");
    return;
  }

  const manifest = summary.manifest || {};
  const lines = [
    `Run ID: ${manifest.runId || summary.latestRun}`,
    `Run path: ${summary.latestRun}`,
    `Validation: ${summary.validation?.passed ? "passed" : "failed"}`
  ];
  if (summary.knowledgeDelta) {
    lines.push(
      `Knowledge delta: +${summary.knowledgeDelta.addedSelectors?.length || 0} selectors, +${summary.knowledgeDelta.addedPages?.length || 0} pages`
    );
  }
  if (Array.isArray(summary.generatedArtifacts) && summary.generatedArtifacts.length > 0) {
    lines.push("Generated files:");
    for (const artifact of summary.generatedArtifacts) {
      lines.push(`- ${artifact.targetPath}`);
    }
  }
  console.log(lines.join("\n"));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
