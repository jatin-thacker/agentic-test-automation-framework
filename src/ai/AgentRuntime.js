import path from "node:path";
import fs from "fs-extra";
import { AppConfig } from "../config/AppConfig.js";
import { DateUtils } from "../utils/DateUtils.js";
import { FileUtils } from "../utils/FileUtils.js";
import PlaywrightMCPClient from "../scm/client/PlaywrightMCPClient.js";
import SCMTools from "../scm/contracts/SCMTools.js";
import LLMPlannerClient from "../agentic/planners/LLMPlannerClient.js";
import FrameworkArtifactValidator from "../agentic/validators/FrameworkArtifactValidator.js";
import EnglishPromptAgent from "./agents/EnglishPromptAgent.js";
import MCPExplorerAgent from "./agents/MCPExplorerAgent.js";
import FrameworkWriterAgent from "./agents/FrameworkWriterAgent.js";
import AppKnowledgeStore from "./knowledge/AppKnowledgeStore.js";
import {
  defaultNavigateAction,
  deriveTitle,
  ensureNamingMap,
  extractAcceptanceCriteria,
  normalizeActions,
  TOOL_ALIASES
} from "./agents/agent-utils.js";

const DEFAULT_RUNS_ROOT = path.resolve(process.cwd(), "src/ai/runs");

function ensureInsideRoot(rootDir, candidatePath) {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedCandidate = path.resolve(candidatePath);
  const rootWithSep = resolvedRoot.endsWith(path.sep) ? resolvedRoot : `${resolvedRoot}${path.sep}`;
  if (resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(rootWithSep)) {
    return resolvedCandidate;
  }
  throw new Error(`Refusing to write outside project root: ${resolvedCandidate}`);
}

function normalizeMode(mode = "dry-run") {
  return String(mode || "dry-run").toLowerCase() === "apply" ? "apply" : "dry-run";
}

export class AgentRuntime {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.runsRoot = options.runsRoot || DEFAULT_RUNS_ROOT;

    this.scmClient = options.scmClient || new PlaywrightMCPClient({ rootDir: this.rootDir });
    this.plannerClient = options.plannerClient || new LLMPlannerClient(options.plannerOptions || {});
    this.validator = options.validator || new FrameworkArtifactValidator();
    this.knowledgeStore = options.knowledgeStore || new AppKnowledgeStore({ rootDir: this.rootDir });

    this.englishPromptAgent =
      options.englishPromptAgent ||
      new EnglishPromptAgent({
        plannerClient: this.plannerClient
      });
    this.mcpExplorerAgent =
      options.mcpExplorerAgent ||
      new MCPExplorerAgent({
        plannerClient: this.plannerClient,
        toolAliases: TOOL_ALIASES
      });
    this.frameworkWriterAgent =
      options.frameworkWriterAgent ||
      new FrameworkWriterAgent({
        plannerClient: this.plannerClient
      });
  }

  async run(options = {}) {
    if (!this.plannerClient.isConfigured()) {
      throw new Error(
        "AI-only mode requires an LLM model. Configure LLM_API_KEY + LLM_MODEL or LLM_MOCK_PLAN_PATH."
      );
    }

    const mode = normalizeMode(options.mode);
    const source = await this.#loadSource(options);
    const frameworkContext = await this.#collectFrameworkContext();
    const knowledgeBefore = await this.knowledgeStore.load();

    const englishPromptResult = await this.englishPromptAgent.run({
      source,
      frameworkContext,
      knowledge: knowledgeBefore
    });

    const explorerResult = await this.mcpExplorerAgent.run({
      source,
      frameworkContext,
      knowledge: knowledgeBefore,
      testCaseSpec: englishPromptResult.testCaseSpec
    });

    const navigationTrace = await this.#executeExploration(
      explorerResult.actions,
      explorerResult.followUpActions,
      source,
      options
    );

    const mergedNamingMap = ensureNamingMap(
      {
        ...(englishPromptResult.namingMap || {}),
        ...(explorerResult.namingMap || {})
      },
      source.title
    );

    const writerResult = await this.frameworkWriterAgent.run({
      source,
      frameworkContext,
      knowledge: knowledgeBefore,
      testCaseSpec: englishPromptResult.testCaseSpec,
      explorationResult: explorerResult,
      navigationTrace,
      namingMap: mergedNamingMap
    });

    const namingMap = ensureNamingMap(
      {
        ...mergedNamingMap,
        ...(writerResult.namingMap || {})
      },
      source.title
    );

    const frameworkSpec = writerResult.frameworkSpec;
    const generatedArtifacts = writerResult.generatedArtifacts || [];
    const artifactSpec = {
      namingMap,
      testCaseSpec: englishPromptResult.testCaseSpec,
      frameworkSpec,
      featureSpec: frameworkSpec.featureSpec,
      stepSpec: frameworkSpec.stepSpec,
      pageSpec: frameworkSpec.pageSpec,
      locatorSpec: frameworkSpec.locatorSpec
    };

    const validation = this.validator.validate({
      artifactSpec,
      generatedArtifacts
    });

    const runId = DateUtils.timestampForPath();
    const runRoot = await this.#writeRunPackage({
      runId,
      source,
      frameworkContext,
      stageResults: {
        englishPromptAgent: englishPromptResult,
        mcpExplorerAgent: explorerResult,
        frameworkWriterAgent: writerResult
      },
      artifactSpec,
      navigationTrace,
      generatedArtifacts,
      validation,
      mode
    });

    const knowledgeUpdate = await this.knowledgeStore.update({
      runId,
      source,
      stageResults: {
        englishPromptAgent: englishPromptResult,
        mcpExplorerAgent: explorerResult,
        frameworkWriterAgent: writerResult
      },
      artifactSpec,
      generatedArtifacts,
      navigationTrace,
      validation
    });

    await this.#writeKnowledgeArtifacts(runRoot, knowledgeUpdate);
    const manifestPath = path.join(runRoot, "manifest.json");
    const manifest = await fs.readJson(manifestPath);
    manifest.knowledge = {
      markdownPath: "src/ai/knowledge/AppKnowledge.md",
      snapshotPath: "src/ai/knowledge/AppKnowledge.json",
      deltaPath: "knowledge-delta.json",
      addedSelectors: knowledgeUpdate.delta.addedSelectors.length,
      addedPages: knowledgeUpdate.delta.addedPages.length
    };
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });

    let applyResult = { applied: false, reason: "Dry-run mode." };
    if (mode === "apply") {
      if (!validation.passed) {
        applyResult = {
          applied: false,
          reason: "Validation failed. Fix issues before apply.",
          issues: validation.issues || []
        };
      } else {
        applyResult = await this.applyRunPackage(runRoot, manifest);
      }
      const updatedManifest = await fs.readJson(manifestPath);
      updatedManifest.applyResult = applyResult;
      await fs.writeJson(manifestPath, updatedManifest, { spaces: 2 });
    }

    return {
      runId,
      runRoot,
      source,
      artifactSpec,
      stageResults: {
        englishPromptAgent: englishPromptResult,
        mcpExplorerAgent: explorerResult,
        frameworkWriterAgent: writerResult
      },
      navigationTrace,
      validation,
      knowledgeUpdate,
      applyResult
    };
  }

  async applyRunPackage(runRoot, manifest = null) {
    const resolvedManifest =
      manifest ||
      (await fs.readJson(path.join(runRoot, "manifest.json")));

    const validation =
      resolvedManifest.validation ||
      (await fs.readJson(path.join(runRoot, "validation-result.json")));
    if (!validation?.passed) {
      throw new Error("Cannot apply the latest run because validation did not pass.");
    }

    const runId = resolvedManifest.runId || path.basename(runRoot);
    const backupRoot = path.resolve(this.rootDir, "src/ai/runs/backups", runId);
    const appliedRoot = path.resolve(this.rootDir, "src/ai/runs/applied", runId);
    await fs.ensureDir(backupRoot);
    await fs.ensureDir(path.dirname(appliedRoot));

    const changedEntries = [];
    try {
      for (const artifact of resolvedManifest.generatedArtifacts || []) {
        const stagedAbsPath = path.join(runRoot, artifact.stagedPath);
        const targetAbsPath = ensureInsideRoot(this.rootDir, path.resolve(this.rootDir, artifact.targetPath));
        const existed = await fs.pathExists(targetAbsPath);
        const backupPath = path.join(backupRoot, artifact.targetPath);

        if (existed) {
          await fs.ensureDir(path.dirname(backupPath));
          await fs.copy(targetAbsPath, backupPath, { overwrite: true });
        }

        await fs.ensureDir(path.dirname(targetAbsPath));
        await fs.copy(stagedAbsPath, targetAbsPath, { overwrite: true });
        changedEntries.push({ targetAbsPath, existed, backupPath });
      }
    } catch (error) {
      for (const entry of changedEntries.reverse()) {
        if (entry.existed) {
          await fs.copy(entry.backupPath, entry.targetAbsPath, { overwrite: true });
        } else {
          await fs.remove(entry.targetAbsPath);
        }
      }
      throw error;
    }

    await fs.copy(runRoot, appliedRoot, { overwrite: true });
    const applyResult = {
      applied: true,
      backupRoot,
      appliedRoot,
      appliedEntries: (resolvedManifest.generatedArtifacts || []).map((artifact) => artifact.targetPath)
    };

    resolvedManifest.applyResult = applyResult;
    await fs.writeJson(path.join(runRoot, "manifest.json"), resolvedManifest, { spaces: 2 });
    await fs.writeJson(path.join(appliedRoot, "manifest.json"), resolvedManifest, { spaces: 2 });
    return applyResult;
  }

  async #writeKnowledgeArtifacts(runRoot, knowledgeUpdate = {}) {
    await fs.writeFile(path.join(runRoot, "knowledge-before.md"), knowledgeUpdate.beforeMarkdown || "", "utf-8");
    await fs.writeFile(path.join(runRoot, "knowledge-after.md"), knowledgeUpdate.afterMarkdown || "", "utf-8");
    await fs.writeJson(path.join(runRoot, "knowledge-delta.json"), knowledgeUpdate.delta || {}, { spaces: 2 });
  }

  async #loadSource(options = {}) {
    const promptText = String(options.prompt || options.storyText || options.inputText || "").trim();
    const sourcePath =
      options.sourcePath ||
      options.storyPath ||
      options.scriptPath ||
      options.filePath ||
      null;
    const resolvedSourcePath = sourcePath ? path.resolve(this.rootDir, sourcePath) : null;
    const fileText = resolvedSourcePath ? await fs.readFile(resolvedSourcePath, "utf-8") : "";
    const content = promptText || fileText;

    if (!String(content || "").trim()) {
      throw new Error("AI generation requires a prompt, story file, or script file.");
    }

    const kind =
      options.sourceKind ||
      (resolvedSourcePath && /\.story\.md$/i.test(resolvedSourcePath)
        ? "story"
        : resolvedSourcePath && /\.(js|mjs|cjs|ts|tsx)$/i.test(resolvedSourcePath)
          ? "script"
          : "prompt");

    return {
      title: String(options.title || deriveTitle({ content, title: options.title })),
      content,
      path: resolvedSourcePath,
      kind,
      generatedAt: DateUtils.nowIso(),
      acceptanceCriteria: extractAcceptanceCriteria(content)
    };
  }

  async #collectFrameworkContext() {
    return {
      app: {
        name: AppConfig.appName,
        baseUrl: AppConfig.baseUrl
      },
      conventions: {
        featureDir: "features",
        stepDefinitionsDir: "features/step-definitions",
        pageDir: "src/pages",
        locatorStrategy: "locatorDefinitions arrays inside page classes"
      },
      existingFiles: {
        features: await this.#listFiles(path.join(this.rootDir, "features"), ".feature"),
        stepDefinitions: await this.#listFiles(path.join(this.rootDir, "features", "step-definitions"), ".js"),
        pages: await this.#listFiles(path.join(this.rootDir, "src", "pages"), ".js"),
        locators: await this.#listFiles(path.join(this.rootDir, "src", "locators"), ".js")
      }
    };
  }

  async #listFiles(dirPath, extension) {
    if (!(await fs.pathExists(dirPath))) return [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name)
      .sort();
  }

  #buildActionPlan(rawActions = [], source = {}) {
    const plannedActions = normalizeActions(rawActions, source.title || "Generated flow");
    if (plannedActions.some((action) => action.tool === SCMTools.openUrl)) {
      return plannedActions;
    }
    return [defaultNavigateAction(AppConfig.baseUrl), ...plannedActions];
  }

  async #executeExploration(rawActions = [], rawFollowUpActions = [], source = {}, options = {}) {
    const plannedActions = this.#buildActionPlan(rawActions, source);
    const followUpActions = normalizeActions(rawFollowUpActions, source.title || "Generated flow");
    const trace = {
      executedAt: DateUtils.nowIso(),
      plannedActions,
      followUpActions,
      toolResults: [],
      pageSnapshots: [],
      interactiveElements: [],
      networkTrace: null,
      finalPage: null
    };

    const runAction = async (action) => {
      const result = await this.scmClient.invokeTool(action.tool, action.input || {});
      trace.toolResults.push({
        type: action.type,
        tool: action.tool,
        description: action.description,
        input: action.input || {},
        success: result.success,
        error: result.error || null,
        data: result.data || null
      });

      const snapshotTools = new Set([
        SCMTools.openUrl,
        SCMTools.click,
        SCMTools.navigateBack,
        SCMTools.navigateForward
      ]);
      if (result.success && snapshotTools.has(action.tool)) {
        const pageMetadata = await this.scmClient.invokeTool(SCMTools.getPageMetadata, {});
        if (pageMetadata.success) {
          trace.pageSnapshots.push({
            label: action.description || action.type,
            capturedAt: DateUtils.nowIso(),
            page: pageMetadata.data
          });
          trace.finalPage = pageMetadata.data;
        }
      }

      if (!result.success && action.required !== false) {
        throw new Error(result.error || `Playwright MCP tool failed: ${action.tool}`);
      }
    };

    try {
      await this.scmClient.invokeTool(SCMTools.launchBrowser, {
        browser: options.browser || "chrome"
      });

      for (const action of plannedActions) {
        await runAction(action);
      }
      for (const action of followUpActions) {
        await runAction(action);
      }

      const interactive = await this.scmClient.invokeTool(SCMTools.collectInteractiveElements, {
        maxElements: options.maxInteractiveElements || 60,
        includeHidden: false
      });
      if (interactive.success) {
        trace.interactiveElements = interactive.data?.elements || [];
      }

      const network = await this.scmClient.invokeTool(SCMTools.captureNetwork, {
        includeStatic: false
      });
      if (network.success) {
        trace.networkTrace = network.data || null;
      }

      const pageMetadata = await this.scmClient.invokeTool(SCMTools.getPageMetadata, {});
      if (pageMetadata.success) {
        trace.finalPage = pageMetadata.data;
      }

      await this.scmClient.invokeTool(SCMTools.captureSnapshot, {});
    } finally {
      await this.scmClient.invokeTool(SCMTools.closeBrowser, {}).catch(() => {});
    }

    return trace;
  }

  async #writeRunPackage({
    runId,
    source,
    frameworkContext,
    stageResults,
    artifactSpec,
    navigationTrace,
    generatedArtifacts,
    validation,
    mode
  }) {
    const runRoot = path.resolve(this.runsRoot, "proposed", runId);
    const generatedRoot = path.join(runRoot, "generated-files");
    await fs.ensureDir(generatedRoot);

    const stagedArtifacts = [];
    for (const artifact of generatedArtifacts) {
      const stagedAbsPath = path.join(generatedRoot, artifact.targetPath);
      await fs.ensureDir(path.dirname(stagedAbsPath));
      await fs.writeFile(stagedAbsPath, artifact.content, "utf-8");
      stagedArtifacts.push({
        type: artifact.type,
        targetPath: artifact.targetPath,
        stagedPath: path.relative(runRoot, stagedAbsPath)
      });
    }

    await fs.writeJson(path.join(runRoot, "source.json"), source, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "framework-context.json"), frameworkContext, { spaces: 2 });
    await fs.writeJson(
      path.join(runRoot, "english-prompt-agent.json"),
      stageResults.englishPromptAgent?.plan || {},
      { spaces: 2 }
    );
    await fs.writeJson(
      path.join(runRoot, "mcp-explorer-agent.json"),
      stageResults.mcpExplorerAgent?.plan || {},
      { spaces: 2 }
    );
    await fs.writeJson(
      path.join(runRoot, "framework-writer-agent.json"),
      stageResults.frameworkWriterAgent?.plan || {},
      { spaces: 2 }
    );
    await fs.writeJson(path.join(runRoot, "naming-map.json"), artifactSpec.namingMap || {}, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "navigation-trace.json"), navigationTrace || {}, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "artifact-spec.json"), artifactSpec || {}, { spaces: 2 });
    await fs.writeJson(path.join(runRoot, "validation-result.json"), validation || {}, { spaces: 2 });
    await fs.writeJson(
      path.join(runRoot, "plan.json"),
      {
        authoringMode: "direct-llm-authoring",
        source,
        frameworkContext,
        stages: {
          englishPromptAgent: {
            provider: stageResults.englishPromptAgent?.provider || null,
            model: stageResults.englishPromptAgent?.model || null,
            generatedAt: DateUtils.nowIso(),
            plan: stageResults.englishPromptAgent?.plan || {}
          },
          mcpExplorerAgent: {
            provider: stageResults.mcpExplorerAgent?.provider || null,
            model: stageResults.mcpExplorerAgent?.model || null,
            generatedAt: DateUtils.nowIso(),
            plan: stageResults.mcpExplorerAgent?.plan || {}
          },
          frameworkWriterAgent: {
            provider: stageResults.frameworkWriterAgent?.provider || null,
            model: stageResults.frameworkWriterAgent?.model || null,
            generatedAt: DateUtils.nowIso(),
            plan: stageResults.frameworkWriterAgent?.plan || {}
          }
        },
        navigationTrace,
        artifactSpec,
        validation
      },
      { spaces: 2 }
    );

    const manifest = {
      runId,
      mode,
      planningMode: "direct-llm-authoring",
      storyTitle: source.title,
      source,
      stages: {
        englishPromptAgent: {
          provider: stageResults.englishPromptAgent?.provider || null,
          model: stageResults.englishPromptAgent?.model || null
        },
        mcpExplorerAgent: {
          provider: stageResults.mcpExplorerAgent?.provider || null,
          model: stageResults.mcpExplorerAgent?.model || null
        },
        frameworkWriterAgent: {
          provider: stageResults.frameworkWriterAgent?.provider || null,
          model: stageResults.frameworkWriterAgent?.model || null
        }
      },
      generatedArtifacts: stagedArtifacts,
      validation,
      applyResult: {
        applied: false,
        reason: mode === "apply" ? "Application will be attempted after package write." : "Dry-run mode."
      }
    };
    await fs.writeJson(path.join(runRoot, "manifest.json"), manifest, { spaces: 2 });
    return runRoot;
  }
}

export async function reviewLatestRun(rootDir = process.cwd()) {
  const proposedRoot = path.resolve(rootDir, "src/ai/runs/proposed");
  const latestRun = await FileUtils.latestSubDirectory(proposedRoot);
  if (!latestRun) return null;

  const manifest = await FileUtils.readJson(path.join(latestRun, "manifest.json"), null);
  const validation = await FileUtils.readJson(path.join(latestRun, "validation-result.json"), null);
  const knowledgeDelta = await FileUtils.readJson(path.join(latestRun, "knowledge-delta.json"), null);

  return {
    latestRun,
    manifest,
    validation,
    knowledgeDelta,
    generatedArtifacts: manifest?.generatedArtifacts || []
  };
}

export async function applyLatestRun(rootDir = process.cwd()) {
  const summary = await reviewLatestRun(rootDir);
  if (!summary) {
    throw new Error("No proposed AI runs were found.");
  }
  if (!summary.validation?.passed) {
    throw new Error("The latest proposed run did not pass validation.");
  }

  const runtime = new AgentRuntime({ rootDir });
  const applyResult = await runtime.applyRunPackage(summary.latestRun, summary.manifest);
  return {
    ...summary,
    applyResult
  };
}

export default AgentRuntime;
