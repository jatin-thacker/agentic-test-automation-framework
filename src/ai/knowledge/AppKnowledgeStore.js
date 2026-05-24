import path from "node:path";
import fs from "fs-extra";
import { AppConfig } from "../../config/AppConfig.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { asArray, normalizeSelectorName, normalizeWhitespace, uniqueBy } from "../agents/agent-utils.js";

function buildDefaultSnapshot() {
  return {
    version: 1,
    app: {
      name: AppConfig.appName,
      baseUrl: AppConfig.baseUrl
    },
    updatedAt: DateUtils.nowIso(),
    selectors: [],
    pages: [],
    runs: []
  };
}

function normalizeKnowledgeName(rawName = "", selector = "") {
  const trimmed = normalizeWhitespace(rawName);
  if (!trimmed) return normalizeSelectorName(selector, "element");
  if (/^[a-zA-Z_$][\w$]*$/.test(trimmed)) return trimmed;
  return normalizeSelectorName(selector || trimmed, "element");
}

function resolveSelectorEntries({ stageResults = {}, navigationTrace = {}, artifactSpec = {} } = {}) {
  const fromExplorerHints = asArray(stageResults.mcpExplorerAgent?.selectorHints || []).map((hint) => ({
    name: normalizeKnowledgeName(hint.name, hint.selector || ""),
    selector: String(hint.selector || ""),
    description: normalizeWhitespace(hint.description || hint.name || hint.selector || "Element"),
    source: "mcpExplorerAgent.selectorHints"
  }));

  const fromPageSpec = asArray(
    artifactSpec?.frameworkSpec?.pageSpec?.locatorEntries ||
      artifactSpec?.pageSpec?.locatorEntries ||
      []
  ).map((entry) => ({
    name: normalizeKnowledgeName(entry.name, entry.selector || ""),
    selector: String(entry.selector || ""),
    description: normalizeWhitespace(entry.description || entry.name || entry.selector || "Element"),
    source: "frameworkWriterAgent.pageSpec"
  }));

  const fromInteractiveElements = asArray(navigationTrace.interactiveElements || [])
    .map((item) => {
      const selector = item?.selector || (item?.dataTest ? `[data-test='${item.dataTest}']` : "");
      return {
        name: normalizeKnowledgeName(item?.name || item?.dataTest || item?.text, selector),
        selector: String(selector || ""),
        description: normalizeWhitespace(item?.description || item?.text || item?.role || "Interactive element"),
        source: "navigationTrace.interactiveElements"
      };
    })
    .filter((entry) => entry.selector);

  return uniqueBy(
    [...fromExplorerHints, ...fromPageSpec, ...fromInteractiveElements].filter((entry) => entry.selector),
    (entry) => `${entry.name}:${entry.selector}`
  );
}

function resolvePages(navigationTrace = {}) {
  const snapshots = asArray(navigationTrace.pageSnapshots || []).map((snapshot) => ({
    title: normalizeWhitespace(snapshot?.page?.title || ""),
    url: normalizeWhitespace(snapshot?.page?.url || ""),
    source: normalizeWhitespace(snapshot?.label || "snapshot")
  }));

  const finalPage = navigationTrace.finalPage
    ? [
        {
          title: normalizeWhitespace(navigationTrace.finalPage.title || ""),
          url: normalizeWhitespace(navigationTrace.finalPage.url || ""),
          source: "finalPage"
        }
      ]
    : [];

  return uniqueBy(
    [...snapshots, ...finalPage].filter((page) => page.url || page.title),
    (page) => `${page.url}:${page.title}`
  );
}

function mergeSnapshot(previous = {}, payload = {}) {
  const next = {
    ...buildDefaultSnapshot(),
    ...previous
  };

  next.app = {
    name: AppConfig.appName,
    baseUrl: AppConfig.baseUrl
  };
  next.updatedAt = DateUtils.nowIso();

  const incomingSelectors = resolveSelectorEntries(payload);
  const mergedSelectors = uniqueBy(
    [...asArray(next.selectors), ...incomingSelectors],
    (entry) => `${entry.name}:${entry.selector}`
  );
  next.selectors = mergedSelectors.sort((a, b) => a.name.localeCompare(b.name));

  const incomingPages = resolvePages(payload.navigationTrace || {});
  const mergedPages = uniqueBy(
    [...asArray(next.pages), ...incomingPages],
    (entry) => `${entry.url}:${entry.title}`
  );
  next.pages = mergedPages.sort((a, b) => (a.url || a.title).localeCompare(b.url || b.title));

  const runSummary = {
    runId: payload.runId || "",
    storyTitle: normalizeWhitespace(payload.source?.title || "Untitled story"),
    sourceKind: normalizeWhitespace(payload.source?.kind || "prompt"),
    validationPassed: Boolean(payload.validation?.passed),
    generatedAt: DateUtils.nowIso(),
    generatedFiles: asArray(payload.generatedArtifacts || []).map((artifact) => artifact.targetPath)
  };
  next.runs = [runSummary, ...asArray(next.runs)]
    .filter((run, index, list) => run.runId && list.findIndex((item) => item.runId === run.runId) === index)
    .slice(0, 40);

  return next;
}

function computeDelta(previous = {}, next = {}) {
  const previousSelectors = new Set(asArray(previous.selectors).map((entry) => `${entry.name}:${entry.selector}`));
  const previousPages = new Set(asArray(previous.pages).map((entry) => `${entry.url}:${entry.title}`));

  const addedSelectors = asArray(next.selectors).filter(
    (entry) => !previousSelectors.has(`${entry.name}:${entry.selector}`)
  );
  const addedPages = asArray(next.pages).filter((entry) => !previousPages.has(`${entry.url}:${entry.title}`));

  return {
    addedSelectors,
    addedPages,
    selectorCountBefore: asArray(previous.selectors).length,
    selectorCountAfter: asArray(next.selectors).length,
    pageCountBefore: asArray(previous.pages).length,
    pageCountAfter: asArray(next.pages).length
  };
}

function renderMarkdown(snapshot = {}) {
  const lines = [
    "# Application Knowledge",
    "",
    `Last Updated: ${snapshot.updatedAt || DateUtils.nowIso()}`,
    "",
    "## Application",
    `- Name: ${snapshot.app?.name || AppConfig.appName}`,
    `- Base URL: ${snapshot.app?.baseUrl || AppConfig.baseUrl}`,
    "",
    "## Known Selectors",
    ""
  ];

  if (asArray(snapshot.selectors).length === 0) {
    lines.push("- No selectors captured yet.");
  } else {
    lines.push("| Name | Selector | Description | Source |");
    lines.push("| --- | --- | --- | --- |");
    asArray(snapshot.selectors).forEach((entry) => {
      lines.push(
        `| ${entry.name} | ${entry.selector} | ${entry.description || ""} | ${entry.source || "unknown"} |`
      );
    });
  }

  lines.push("");
  lines.push("## Known Pages");
  lines.push("");
  if (asArray(snapshot.pages).length === 0) {
    lines.push("- No page snapshots captured yet.");
  } else {
    lines.push("| URL | Title | Source |");
    lines.push("| --- | --- | --- |");
    asArray(snapshot.pages).forEach((page) => {
      lines.push(`| ${page.url || ""} | ${page.title || ""} | ${page.source || ""} |`);
    });
  }

  lines.push("");
  lines.push("## Recent Runs");
  lines.push("");
  if (asArray(snapshot.runs).length === 0) {
    lines.push("- No generation runs recorded yet.");
  } else {
    asArray(snapshot.runs).forEach((run) => {
      lines.push(
        `- ${run.generatedAt} | ${run.runId} | ${run.storyTitle} | ${run.validationPassed ? "passed" : "failed"}`
      );
    });
  }

  lines.push("");
  return `${lines.join("\n").trimEnd()}\n`;
}

export class AppKnowledgeStore {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.knowledgeDir = path.resolve(this.rootDir, "src/ai/knowledge");
    this.markdownPath = path.resolve(this.knowledgeDir, "AppKnowledge.md");
    this.snapshotPath = path.resolve(this.knowledgeDir, "AppKnowledge.json");
  }

  async #ensureFiles() {
    await fs.ensureDir(this.knowledgeDir);

    if (!(await fs.pathExists(this.snapshotPath))) {
      const snapshot = buildDefaultSnapshot();
      await fs.writeJson(this.snapshotPath, snapshot, { spaces: 2 });
    }

    if (!(await fs.pathExists(this.markdownPath))) {
      const snapshot = await fs.readJson(this.snapshotPath);
      await fs.writeFile(this.markdownPath, renderMarkdown(snapshot), "utf-8");
    }
  }

  async load() {
    await this.#ensureFiles();
    const snapshot = await fs.readJson(this.snapshotPath);
    const markdown = await fs.readFile(this.markdownPath, "utf-8");
    return {
      snapshot,
      markdown
    };
  }

  async update(payload = {}) {
    await this.#ensureFiles();
    const beforeSnapshot = await fs.readJson(this.snapshotPath);
    const beforeMarkdown = await fs.readFile(this.markdownPath, "utf-8");

    const afterSnapshot = mergeSnapshot(beforeSnapshot, payload);
    const afterMarkdown = renderMarkdown(afterSnapshot);
    const delta = computeDelta(beforeSnapshot, afterSnapshot);

    await fs.writeJson(this.snapshotPath, afterSnapshot, { spaces: 2 });
    await fs.writeFile(this.markdownPath, afterMarkdown, "utf-8");

    return {
      beforeSnapshot,
      afterSnapshot,
      beforeMarkdown,
      afterMarkdown,
      delta
    };
  }
}

export default AppKnowledgeStore;
