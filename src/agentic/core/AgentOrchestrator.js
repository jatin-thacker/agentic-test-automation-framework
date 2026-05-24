import path from "node:path";
import fs from "fs-extra";
import { DateUtils } from "../../utils/DateUtils.js";
import UserStoryAgent from "../agents/UserStoryAgent.js";
import FrameworkContextAgent from "../agents/FrameworkContextAgent.js";
import AppNavigatorAgent from "../agents/AppNavigatorAgent.js";
import ArtifactDesignAgent from "../agents/ArtifactDesignAgent.js";
import CodeMapperAgent from "../agents/CodeMapperAgent.js";
import ValidationAgent from "../agents/ValidationAgent.js";
import GitHubWorkflowAgent from "../agents/GitHubWorkflowAgent.js";
import LinkedInDraftAgent from "../agents/LinkedInDraftAgent.js";
import PlaywrightMCPClient from "../../scm/client/PlaywrightMCPClient.js";

export class AgentOrchestrator {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.scmClient = options.scmClient || new PlaywrightMCPClient({ rootDir: this.rootDir });
    this.agents = {
      userStory: new UserStoryAgent({ scmClient: this.scmClient }),
      frameworkContext: new FrameworkContextAgent({ scmClient: this.scmClient }),
      navigation: new AppNavigatorAgent({ scmClient: this.scmClient }),
      artifactDesign: new ArtifactDesignAgent({ scmClient: this.scmClient }),
      codeMapper: new CodeMapperAgent({ scmClient: this.scmClient }),
      validation: new ValidationAgent({ scmClient: this.scmClient }),
      githubWorkflow: new GitHubWorkflowAgent({ scmClient: this.scmClient }),
      linkedInDraft: new LinkedInDraftAgent({ scmClient: this.scmClient })
    };
  }

  async run(options = {}) {
    const mode = options.mode || "dry-run";
    const timestamp = DateUtils.timestampForPath();
    const runId = `agentic-run-${timestamp}`;
    const runRoot = path.resolve(this.rootDir, "src/agentic/runs/proposed", timestamp);
    const generatedRoot = path.join(runRoot, "generated-files");
    await fs.ensureDir(generatedRoot);

    const context = {};
    const agentResults = [];

    await this.#runAgent("userStory", { storyPath: options.storyPath, storyText: options.storyText }, context, options, agentResults);
    await this.#runAgent("frameworkContext", {}, context, options, agentResults);
    await this.#runAgent("navigation", {}, context, options, agentResults);
    await this.#runAgent("artifactDesign", {}, context, options, agentResults);
    await this.#runAgent("codeMapper", {}, context, options, agentResults);
    await this.#runAgent("validation", {}, context, options, agentResults);
    await this.#runAgent("githubWorkflow", {}, context, options, agentResults);
    await this.#runAgent("linkedInDraft", {}, context, options, agentResults);

    const generatedArtifacts = context.codeMapper.artifacts || [];
    const generatedArtifactEntries = [];

    for (const artifact of generatedArtifacts) {
      const stagedPath = path.join(generatedRoot, artifact.targetPath);
      await fs.ensureDir(path.dirname(stagedPath));
      await fs.writeFile(stagedPath, artifact.content, "utf-8");
      generatedArtifactEntries.push({
        type: artifact.type,
        targetPath: artifact.targetPath,
        stagedPath: path.relative(runRoot, stagedPath)
      });
    }

    await fs.writeJson(path.join(runRoot, "story.json"), context.userStory, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "framework-context.json"), context.frameworkContext, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "navigation-trace.json"), context.navigation, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "artifact-spec.json"), context.artifactDesign, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "validation-result.json"), context.validation, { spaces: 2 });
    await fs.writeFile(path.join(runRoot, "github-workflow.md"), context.githubWorkflow.markdown, "utf-8");
    await fs.writeFile(path.join(runRoot, "linkedin-post-draft.md"), context.linkedInDraft.markdown, "utf-8");

    let applyResult = { applied: false, reason: "Dry-run mode." };
    if (mode === "apply") {
      if (context.validation.passed) {
        applyResult = await this.#applyGeneratedArtifacts(runRoot, generatedArtifactEntries, timestamp);
      } else {
        applyResult = {
          applied: false,
          reason: "Validation failed. Fix issues before apply.",
          issues: context.validation.issues || []
        };
      }
    }

    const manifest = {
      runId,
      timestamp,
      mode,
      scmMode: "playwright-mcp",
      storyTitle: context.userStory.title,
      agents: agentResults,
      generatedArtifacts: generatedArtifactEntries,
      validation: context.validation,
      applyResult
    };

    await fs.writeJson(path.join(runRoot, "manifest.json"), manifest, { spaces: 2 });
    return { runId, runRoot, manifest };
  }

  async #runAgent(agentKey, input, context, options, agentResults) {
    const agent = this.agents[agentKey];
    const result = await agent.run(input, context, { ...options, scmMode: "playwright-mcp" });
    agentResults.push({
      name: result.agent,
      status: result.status,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      error: result.error || null
    });
    if (result.status !== "passed") {
      throw new Error(`${result.agent} failed: ${result.error || "Unknown error"}`);
    }
    context[agentKey] = result.data;
  }

  async #applyGeneratedArtifacts(runRoot, generatedArtifacts, timestamp) {
    const backupRoot = path.resolve(this.rootDir, "src/agentic/runs/backups", timestamp);
    const appliedRoot = path.resolve(this.rootDir, "src/agentic/runs/applied", timestamp);
    await fs.ensureDir(backupRoot);
    const changedEntries = [];
    const appliedEntries = [];

    try {
      for (const artifact of generatedArtifacts) {
        const stagedAbsPath = path.join(runRoot, artifact.stagedPath);
        const targetAbsPath = path.resolve(this.rootDir, artifact.targetPath);
        const existed = await fs.pathExists(targetAbsPath);
        const backupPath = path.join(backupRoot, artifact.targetPath);
        if (existed) {
          await fs.ensureDir(path.dirname(backupPath));
          await fs.copy(targetAbsPath, backupPath, { overwrite: true });
        }
        await fs.ensureDir(path.dirname(targetAbsPath));
        await fs.copy(stagedAbsPath, targetAbsPath, { overwrite: true });
        changedEntries.push({ targetAbsPath, existed, backupPath });
        appliedEntries.push(artifact.targetPath);
      }
    } catch (error) {
      for (const entry of changedEntries.reverse()) {
        if (entry.existed) {
          await fs.copy(entry.backupPath, entry.targetAbsPath, { overwrite: true });
        } else {
          await fs.remove(entry.targetAbsPath);
        }
      }
      return { applied: false, reason: error.message, rolledBack: true };
    }

    await fs.copy(runRoot, appliedRoot, { overwrite: true });
    return {
      applied: true,
      backupRoot,
      appliedRoot,
      appliedEntries
    };
  }
}

export default AgentOrchestrator;
