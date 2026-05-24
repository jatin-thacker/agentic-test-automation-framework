import path from "node:path";
import fs from "fs-extra";
import AgentOrchestrator from "../core/AgentOrchestrator.js";
import CommandRegistry from "./CommandRegistry.js";
import { FileUtils } from "../../utils/FileUtils.js";
import { applyLatestRun } from "../runners/agent-apply-runner.js";
import { reviewLatestRun } from "../runners/agent-review-runner.js";

function formatCommands(commands = []) {
  const lines = ["Available commands:"];
  for (const command of commands) {
    lines.push(`- ${command.usage || command.name}: ${command.description}`);
  }
  return lines.join("\n");
}

export class CommandDispatcher {
  constructor(options = {}) {
    this.registry = options.registry || new CommandRegistry(options);
  }

  async dispatch(commandToken, args = []) {
    const command = await this.registry.resolve(commandToken);
    if (!command) {
      const commands = await this.registry.list();
      const supported = commands.map((c) => c.name).join(", ");
      throw new Error(`Unknown command '${commandToken}'. Supported commands: ${supported}`);
    }

    switch (command.handler) {
      case "help":
        return {
          status: "ok",
          message: formatCommands(await this.registry.list())
        };
      case "fromStory":
        return this.#runFromStory(args);
      case "reviewLatest":
        return this.#reviewLatest();
      case "applyLatest":
        return this.#applyLatest();
      case "showGitHubFlow":
        return this.#showLatestArtifactPath("github-workflow.md");
      case "showLinkedInDraft":
        return this.#showLatestArtifactPath("linkedin-post-draft.md");
      default:
        throw new Error(`No dispatcher handler implemented for '${command.handler}'.`);
    }
  }

  async #runFromStory(args = []) {
    const storyPath = args[0] || "src/agentic/mock-data/sample-user-story.txt";
    const orchestrator = new AgentOrchestrator();
    const result = await orchestrator.run({ mode: "dry-run", storyPath });
    return {
      status: "ok",
      message: [
        `Run ID: ${result.runId}`,
        `Proposed: ${result.runRoot}`,
        `Validation: ${result.manifest.validation?.passed ? "passed" : "failed"}`
      ].join("\n")
    };
  }

  async #reviewLatest() {
    const summary = await reviewLatestRun();
    if (!summary) {
      return {
        status: "ok",
        message: "No proposed runs found. Execute /from-story first."
      };
    }
    const lines = [
      `Run ID: ${summary.manifest.runId}`,
      `Run Path: ${summary.latestRun}`,
      `Validation: ${summary.manifest.validation?.passed ? "passed" : "failed"}`
    ];
    if ((summary.manifest.generatedArtifacts || []).length > 0) {
      lines.push("Generated files:");
      for (const artifact of summary.manifest.generatedArtifacts) {
        lines.push(`- ${artifact.targetPath}`);
      }
    }
    return { status: "ok", message: lines.join("\n") };
  }

  async #applyLatest() {
    const result = await applyLatestRun();
    return {
      status: "ok",
      message: [
        `Applied run: ${result.latestRun}`,
        `Backup: ${result.backupRoot}`,
        `Applied snapshot: ${result.appliedRoot}`
      ].join("\n")
    };
  }

  async #showLatestArtifactPath(fileName) {
    const proposedRoot = path.resolve(process.cwd(), "src/agentic/runs/proposed");
    const latestRun = await FileUtils.latestSubDirectory(proposedRoot);
    if (!latestRun) {
      return {
        status: "ok",
        message: "No proposed runs found. Execute /from-story first."
      };
    }
    const artifactPath = path.join(latestRun, fileName);
    const exists = await fs.pathExists(artifactPath);
    if (!exists) {
      return {
        status: "ok",
        message: `Latest run found, but '${fileName}' is missing: ${latestRun}`
      };
    }
    return {
      status: "ok",
      message: artifactPath
    };
  }
}

export default CommandDispatcher;
