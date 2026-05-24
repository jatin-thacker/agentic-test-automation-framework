import AIWriter from "../ai/AIWriter.js";

function parseArgs(argv = []) {
  const options = { mode: "dry-run" };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--prompt":
        options.prompt = argv[++index] || "";
        break;
      case "--story":
      case "--source":
        options.sourcePath = argv[++index] || "";
        break;
      case "--script":
        options.sourcePath = argv[++index] || "";
        options.sourceKind = "script";
        break;
      case "--title":
        options.title = argv[++index] || "";
        break;
      case "--mode":
        options.mode = argv[++index] || "dry-run";
        break;
      case "--apply":
        options.mode = "apply";
        break;
      case "--browser":
        options.browser = argv[++index] || "chrome";
        break;
      case "--max-interactive-elements":
        options.maxInteractiveElements = Number(argv[++index] || 40);
        break;
      case "--mock-plan":
        process.env.LLM_MOCK_PLAN_PATH = argv[++index] || "";
        break;
      default:
        if (token.startsWith("-")) {
          console.warn(`Ignoring unknown option: ${token}`);
        } else {
          positional.push(token);
        }
    }
  }

  if (!options.prompt && !options.sourcePath && positional.length > 0) {
    const joined = positional.join(" ");
    const looksLikePath = /[\\/]/.test(joined) || /\.(md|story|txt|js|ts|mjs|cjs|tsx)$/i.test(joined);
    if (positional.length === 1 && looksLikePath) {
      options.sourcePath = joined;
    } else {
      options.prompt = joined;
    }
  }

  return options;
}

function printHelp() {
  console.log(`Agent generate usage:
  npm run agent:generate -- --prompt "Describe the flow"
  npm run agent:generate -- --story path/to/story.md
  npm run agent:generate -- --script path/to/legacy-script.js
  npm run agent:generate -- --apply --story path/to/story.md

Notes:
  - \`agent:generate\` and \`ai:generate\` run the same pipeline.
  - Pipeline: EnglishPromptAgent -> MCPExplorerAgent -> FrameworkWriterAgent.
  - App knowledge is read from and updated to src/ai/knowledge/AppKnowledge.md each run.
  - If you omit --prompt/--story/--script, the first positional argument is treated as either a file path or prompt text.
  - Set LLM_API_KEY and LLM_MODEL for live planning, or LLM_MOCK_PLAN_PATH for offline validation.`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const writer = new AIWriter();
  const result = await writer.run(options);
  const lines = [
    `Run ID: ${result.runId}`,
    `Run path: ${result.runRoot}`,
    `Validation: ${result.validation.passed ? "passed" : "failed"}`
  ];
  if (result.applyResult?.applied) {
    lines.push(`Applied snapshot: ${result.applyResult.appliedRoot}`);
  }
  console.log(lines.join("\n"));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
