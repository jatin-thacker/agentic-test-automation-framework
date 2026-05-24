import AgentOrchestrator from "../core/AgentOrchestrator.js";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function main() {
  const storyPath = process.argv[2] || "src/agentic/mock-data/sample-user-story.txt";
  const orchestrator = new AgentOrchestrator();
  const result = await orchestrator.run({
    mode: "dry-run",
    storyPath
  });
  console.log(`Agentic dry-run completed: ${result.runId}`);
  console.log(`Proposed output: ${result.runRoot}`);
  console.log(
    `Validation: ${result.manifest.validation.passed ? "passed" : "failed"}`
  );
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error) => {
    console.error("agent:from-story failed:", error);
    process.exitCode = 1;
  });
}
