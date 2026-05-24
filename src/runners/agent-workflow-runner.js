import process from "node:process";
import path from "node:path";
import fs from "fs-extra";
import { spawnSync } from "node:child_process";
import * as readline from "node:readline/promises";
import AIWriter from "../ai/AIWriter.js";

function parseArgs(argv = []) {
  const options = {
    mode: "dry-run",
    review: true,
    apply: false,
    commit: false,
    yes: false,
    includeKnowledge: true,
    commitMessage: ""
  };
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
      case "--browser":
        options.browser = argv[++index] || "chrome";
        break;
      case "--max-interactive-elements":
        options.maxInteractiveElements = Number(argv[++index] || 60);
        break;
      case "--mock-plan":
        process.env.LLM_MOCK_PLAN_PATH = argv[++index] || "";
        break;
      case "--apply":
        options.apply = true;
        break;
      case "--commit":
        options.commit = true;
        break;
      case "--commit-message":
      case "-m":
        options.commitMessage = argv[++index] || "";
        break;
      case "--yes":
      case "-y":
        options.yes = true;
        break;
      case "--no-review":
        options.review = false;
        break;
      case "--no-knowledge":
        options.includeKnowledge = false;
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

  if (options.commit) {
    options.apply = true;
  }

  return options;
}

function printHelp() {
  console.log(`Agent workflow usage:
  npm run agent:workflow -- --prompt "Describe the flow"
  npm run agent:workflow -- --story path/to/story.md --apply
  npm run agent:workflow -- --script path/to/legacy-script.js --commit

Flow:
  1) Generate (dry-run)
  2) Review summary
  3) Optional apply
  4) Optional git commit

Flags:
  --apply                 Apply generated artifacts after review
  --commit                Commit applied changes (implies --apply)
  --commit-message, -m    Custom git commit message
  --yes, -y               Skip interactive approval prompts
  --no-review             Skip review summary output
  --no-knowledge          Exclude app-knowledge files from commit
  --mock-plan <path>      Use staged mock LLM plan JSON
`);
}

function printReviewResult(result) {
  const lines = [
    `Run ID: ${result.runId}`,
    `Run path: ${result.runRoot}`,
    `Validation: ${result.validation?.passed ? "passed" : "failed"}`
  ];

  const manifestArtifacts = result?.artifactSpec
    ? [
        `features/${result.artifactSpec.featureSpec?.fileName || result.artifactSpec.namingMap?.featureFileName || ""}`,
        `features/step-definitions/${result.artifactSpec.stepSpec?.fileName || result.artifactSpec.namingMap?.stepDefinitionFileName || ""}`,
        `src/pages/${result.artifactSpec.pageSpec?.fileName || result.artifactSpec.namingMap?.pageFileName || ""}`
      ].filter(Boolean)
    : [];

  if (manifestArtifacts.length > 0) {
    lines.push("Generated files:");
    for (const item of manifestArtifacts) {
      lines.push(`- ${item}`);
    }
  }

  const knowledgeDelta = result?.knowledgeUpdate?.delta;
  if (knowledgeDelta) {
    lines.push(
      `Knowledge delta: +${knowledgeDelta.addedSelectors?.length || 0} selectors, +${knowledgeDelta.addedPages?.length || 0} pages`
    );
  }

  console.log(lines.join("\n"));
}

async function askYesNo(question, defaultNo = true) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return false;
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  try {
    const answer = (await rl.question(question)).trim().toLowerCase();
    if (!answer) return !defaultNo;
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

function runGit(args, { cwd = process.cwd(), allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf-8"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !allowFailure) {
    const stderr = String(result.stderr || "").trim();
    const stdout = String(result.stdout || "").trim();
    throw new Error(`git ${args.join(" ")} failed.\n${stderr || stdout || "(no output)"}`);
  }

  return result;
}

function buildDefaultCommitMessage({ runId, storyTitle }) {
  const safeTitle = String(storyTitle || "generated-flow").trim();
  return `agent: apply ${runId} (${safeTitle})`;
}

async function commitAppliedChanges({
  runRoot,
  runId,
  storyTitle,
  includeKnowledge,
  commitMessage
}) {
  const manifestPath = path.join(runRoot, "manifest.json");
  const manifest = await fs.readJson(manifestPath);
  const targetPaths = (manifest.generatedArtifacts || [])
    .map((artifact) => artifact.targetPath)
    .filter(Boolean);

  const commitPaths = [...targetPaths];
  if (includeKnowledge) {
    commitPaths.push("src/ai/knowledge/AppKnowledge.md", "src/ai/knowledge/AppKnowledge.json");
  }

  const uniquePaths = [...new Set(commitPaths)];
  if (uniquePaths.length === 0) {
    return { committed: false, reason: "No target paths were found to stage." };
  }

  runGit(["add", "--", ...uniquePaths]);

  const stagedCheck = runGit(["diff", "--cached", "--name-only", "--", ...uniquePaths], {
    allowFailure: true
  });
  const stagedFiles = String(stagedCheck.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (stagedFiles.length === 0) {
    return { committed: false, reason: "No staged changes found for generated paths.", stagedFiles: [] };
  }

  const message = String(commitMessage || "").trim() || buildDefaultCommitMessage({ runId, storyTitle });
  runGit(["commit", "-m", message]);
  const head = runGit(["rev-parse", "--short", "HEAD"]);
  const commitHash = String(head.stdout || "").trim();

  return {
    committed: true,
    commitHash,
    commitMessage: message,
    stagedFiles
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const writer = new AIWriter();
  const result = await writer.run({
    ...options,
    mode: "dry-run"
  });

  if (options.review) {
    printReviewResult(result);
  }

  if (!result.validation?.passed) {
    console.log("Apply/commit blocked because validation failed.");
    return;
  }

  if (!options.apply) {
    return;
  }

  let applyApproved = options.yes;
  if (!applyApproved) {
    applyApproved = await askYesNo("Apply generated artifacts now? [y/N] ", true);
  }
  if (!applyApproved) {
    console.log("Apply canceled.");
    return;
  }

  const applyResult = await writer.applyRunPackage(result.runRoot);
  console.log(
    [
      `Applied run: ${result.runRoot}`,
      `Backup path: ${applyResult.backupRoot}`,
      `Applied snapshot: ${applyResult.appliedRoot}`
    ].join("\n")
  );

  if (!options.commit) {
    return;
  }

  let commitApproved = options.yes;
  if (!commitApproved) {
    commitApproved = await askYesNo("Commit applied changes now? [y/N] ", true);
  }
  if (!commitApproved) {
    console.log("Commit canceled.");
    return;
  }

  const commitResult = await commitAppliedChanges({
    runRoot: result.runRoot,
    runId: result.runId,
    storyTitle: result.source?.title,
    includeKnowledge: options.includeKnowledge,
    commitMessage: options.commitMessage
  });

  if (!commitResult.committed) {
    console.log(`Commit skipped: ${commitResult.reason}`);
    return;
  }

  console.log(
    [
      `Commit created: ${commitResult.commitHash}`,
      `Message: ${commitResult.commitMessage}`,
      "Committed files:",
      ...commitResult.stagedFiles.map((file) => `- ${file}`)
    ].join("\n")
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
