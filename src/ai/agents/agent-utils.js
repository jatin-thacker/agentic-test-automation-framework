import { AppConfig } from "../../config/AppConfig.js";
import { StringUtils } from "../../utils/StringUtils.js";
import SCMTools from "../../scm/contracts/SCMTools.js";

export const TOOL_ALIASES = Object.freeze({
  navigate: SCMTools.openUrl,
  openurl: SCMTools.openUrl,
  click: SCMTools.click,
  type: SCMTools.type,
  fill: SCMTools.type,
  hover: SCMTools.hover,
  selectoption: SCMTools.selectOption,
  select: SCMTools.selectOption,
  presskey: SCMTools.pressKey,
  keypress: SCMTools.pressKey,
  wait: SCMTools.waitFor,
  waitfor: SCMTools.waitFor,
  assertvisible: SCMTools.waitFor,
  asserttext: SCMTools.assertText,
  probeelement: SCMTools.probeElement,
  getpagemetadata: SCMTools.getPageMetadata,
  collectinteractiveelements: SCMTools.collectInteractiveElements,
  capturenetwork: SCMTools.captureNetwork,
  navigateback: SCMTools.navigateBack,
  navigateforward: SCMTools.navigateForward,
  capturesnapshot: SCMTools.captureSnapshot
});

const STEP_KEYWORDS = new Set(["Given", "When", "Then", "And", "But"]);

export function asArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined);
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

export function uniqueBy(items = [], keyFn = (item) => item) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function normalizeWhitespace(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function normalizeSelectorName(selector = "", fallback = "element") {
  const cleaned = String(selector || "")
    .replace(/^[#.\[]+/, "")
    .replace(/[\]\[\(\)'"`=:]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const candidate = cleaned || fallback;
  const pascal = StringUtils.toPascalCase(candidate);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "element";
}

export function deriveTitle(source = {}) {
  const explicit = normalizeWhitespace(source.title || source.storyTitle || source.promptTitle || "");
  if (explicit) return explicit;

  const raw = String(source.content || source.storyText || source.prompt || source.text || "");
  const headingMatch = raw.match(/^#\s+(.+)$/m);
  if (headingMatch?.[1]) return normalizeWhitespace(headingMatch[1]);

  const firstLine = raw
    .split(/\r?\n/)
    .map((line) => normalizeWhitespace(line))
    .find(Boolean);
  return firstLine || "Generated user story";
}

export function extractAcceptanceCriteria(rawText = "") {
  const lines = String(rawText || "").split(/\r?\n/);
  const criteria = [];
  let inSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^acceptance criteria\s*:/i.test(trimmed)) {
      inSection = true;
      continue;
    }
    if (!inSection) continue;
    if (/^[-*\d.]+\s+/.test(trimmed)) {
      criteria.push(trimmed.replace(/^[-*\d.]+\s+/, ""));
      continue;
    }
    if (/^(given|when|then|and)\s+/i.test(trimmed)) {
      criteria.push(trimmed);
    }
  }

  if (criteria.length > 0) return criteria;
  return lines.map((line) => line.trim()).filter((line) => /^(given|when|then|and)\s+/i.test(line));
}

export function ensureJsFileName(name = "", fallbackBase = "GeneratedFile") {
  const cleaned = String(name || "").trim();
  if (!cleaned) {
    const fallback = String(fallbackBase || "GeneratedFile");
    return fallback.endsWith(".js") ? fallback : `${fallback}.js`;
  }
  return cleaned.endsWith(".js") ? cleaned : `${cleaned}.js`;
}

export function ensureFeatureFileName(name = "", fallbackBase = "generated-flow") {
  const cleaned = String(name || "").trim();
  if (!cleaned) {
    const fallback = String(fallbackBase || "generated-flow");
    return fallback.endsWith(".feature") ? fallback : `${fallback}.feature`;
  }
  return cleaned.endsWith(".feature") ? cleaned : `${cleaned}.feature`;
}

export function ensureNamingMap(rawNamingMap = {}, sourceTitle = "Generated flow") {
  const title = normalizeWhitespace(sourceTitle || "Generated flow");
  const pascal = StringUtils.toPascalCase(title || "GeneratedFlow") || "GeneratedFlow";
  const defaultSlug = StringUtils.sanitizeFileName(title || "generated-flow") || "generated-flow";
  const slug = StringUtils.sanitizeFileName(rawNamingMap.slug || rawNamingMap.storySlug || defaultSlug) || defaultSlug;
  const defaults = {
    slug,
    featureName: title,
    scenarioName: title,
    featureFileName: `${slug}.feature`,
    stepDefinitionFileName: `${slug}.steps.js`,
    pageClassName: `${pascal}Page`,
    pageFileName: `${pascal}Page.js`,
    locatorClassName: `${pascal}Locators`,
    locatorRegistryFileName: `${pascal}Locators.js`
  };
  const namingMap = { ...defaults, ...(rawNamingMap || {}) };

  namingMap.slug = StringUtils.sanitizeFileName(namingMap.slug || defaults.slug) || defaults.slug;
  namingMap.featureName = normalizeWhitespace(namingMap.featureName || defaults.featureName);
  namingMap.scenarioName = normalizeWhitespace(namingMap.scenarioName || defaults.scenarioName);
  namingMap.featureFileName = ensureFeatureFileName(namingMap.featureFileName, namingMap.slug);
  namingMap.stepDefinitionFileName = ensureJsFileName(namingMap.stepDefinitionFileName, `${namingMap.slug}.steps`);
  namingMap.pageClassName = normalizeWhitespace(namingMap.pageClassName || defaults.pageClassName);
  namingMap.pageFileName = ensureJsFileName(namingMap.pageFileName, namingMap.pageClassName);
  namingMap.locatorClassName = normalizeWhitespace(namingMap.locatorClassName || defaults.locatorClassName);
  namingMap.locatorRegistryFileName = ensureJsFileName(
    namingMap.locatorRegistryFileName,
    namingMap.locatorClassName
  );
  return namingMap;
}

export function normalizeScenarioStep(step = {}) {
  if (typeof step === "string") {
    const trimmed = normalizeWhitespace(step);
    if (!trimmed) return { keyword: "Then", text: "the expected outcome should be visible" };
    const match = trimmed.match(/^(given|when|then|and|but)\s+(.*)$/i);
    if (match) {
      return {
        keyword: match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase(),
        text: normalizeWhitespace(match[2])
      };
    }
    return { keyword: "Then", text: trimmed };
  }

  const keyword = normalizeWhitespace(step.keyword || "Then");
  return {
    keyword: STEP_KEYWORDS.has(keyword) ? keyword : "Then",
    text: normalizeWhitespace(step.text || step.step || "") || "the expected outcome should be visible"
  };
}

export function normalizeAction(rawAction = {}, sourceTitle = "", toolAliases = TOOL_ALIASES) {
  if (!rawAction || typeof rawAction !== "object") return null;
  const actionType = normalizeWhitespace(rawAction.type || rawAction.action || rawAction.kind || rawAction.operation || "");
  if (!actionType) return null;

  const rawTool = normalizeWhitespace(rawAction.tool || "");
  const tool =
    toolAliases[actionType] ||
    toolAliases[actionType.toLowerCase()] ||
    toolAliases[rawTool] ||
    toolAliases[rawTool.toLowerCase()] ||
    rawTool ||
    null;
  if (!tool) return null;

  const input = { ...(rawAction.input || {}) };
  const selector =
    rawAction.selector !== undefined
      ? String(rawAction.selector)
      : input.selector !== undefined
        ? String(input.selector)
        : null;
  const locatorName =
    rawAction.locatorName ||
    input.locatorName ||
    (selector ? normalizeSelectorName(selector, rawAction.elementName || actionType) : null);
  const elementName = rawAction.elementName || input.elementName || locatorName || actionType;

  if (selector && input.selector === undefined) input.selector = selector;
  if (rawAction.url !== undefined && input.url === undefined) input.url = rawAction.url;
  if (rawAction.value !== undefined && input.value === undefined) input.value = rawAction.value;
  if (rawAction.label !== undefined && input.label === undefined) input.label = rawAction.label;
  if (rawAction.text !== undefined && input.text === undefined) input.text = rawAction.text;
  if (rawAction.key !== undefined && input.key === undefined) input.key = rawAction.key;
  if (rawAction.state !== undefined && input.state === undefined) input.state = rawAction.state;
  if (rawAction.timeout !== undefined && input.timeout === undefined) input.timeout = rawAction.timeout;
  if (rawAction.time !== undefined && input.time === undefined) input.time = rawAction.time;

  return {
    type: actionType,
    tool,
    description:
      normalizeWhitespace(rawAction.description || "") ||
      `${actionType} ${locatorName || selector || normalizeWhitespace(sourceTitle || "element")}`,
    locatorName,
    selector,
    elementName,
    required: rawAction.required !== false,
    valueParam: rawAction.valueParam ?? null,
    textParam: rawAction.textParam ?? null,
    labelParam: rawAction.labelParam ?? null,
    keyParam: rawAction.keyParam ?? null,
    valueKey: rawAction.valueKey ?? null,
    urlExpression: rawAction.urlExpression ?? null,
    valueExpression: rawAction.valueExpression ?? null,
    textExpression: rawAction.textExpression ?? null,
    keyExpression: rawAction.keyExpression ?? null,
    input,
    confidence: typeof rawAction.confidence === "number" ? rawAction.confidence : null,
    value: rawAction.value ?? input.value ?? null,
    text: rawAction.text ?? input.text ?? null,
    label: rawAction.label ?? input.label ?? null,
    key: rawAction.key ?? input.key ?? null,
    state: rawAction.state ?? input.state ?? null,
    time: rawAction.time ?? input.time ?? null,
    timeout: rawAction.timeout ?? input.timeout ?? null
  };
}

export function normalizeActions(rawActions = [], sourceTitle = "", toolAliases = TOOL_ALIASES) {
  return uniqueBy(
    asArray(rawActions)
      .map((action) => normalizeAction(action, sourceTitle, toolAliases))
      .filter(Boolean),
    (action) => `${action.type}:${action.selector || action.input?.url || action.description}`
  );
}

function buildDefaultFeatureSpec(source = {}, namingMap = {}) {
  const criteria =
    Array.isArray(source.acceptanceCriteria) && source.acceptanceCriteria.length > 0
      ? source.acceptanceCriteria
      : extractAcceptanceCriteria(source.content || "");
  const steps =
    criteria.length > 0
      ? criteria.map((criterion, index) => {
          if (/^(given|when|then|and|but)\s+/i.test(criterion)) return normalizeScenarioStep(criterion);
          if (index === 0) return { keyword: "Given", text: criterion };
          if (index === criteria.length - 1) return { keyword: "Then", text: criterion };
          return { keyword: "When", text: criterion };
        })
      : [
          { keyword: "Given", text: "the user launches the application" },
          { keyword: "When", text: "the user completes the main happy-path flow" },
          { keyword: "Then", text: "the expected outcome should be visible" }
        ];
  return {
    featureName: namingMap.featureName || source.title || "Generated user story",
    description: `Generated from ${source.title || "user story"}.`,
    tags: ["@generated", "@ai-first"],
    scenarios: [
      {
        name: namingMap.scenarioName || source.title || "Generated scenario",
        tags: ["@ai-first"],
        steps
      }
    ]
  };
}

export function normalizeFeatureSpec(rawFeatureSpec = {}, source = {}, namingMap = {}) {
  const defaults = buildDefaultFeatureSpec(source, namingMap);
  const rawScenarios =
    Array.isArray(rawFeatureSpec.scenarios) && rawFeatureSpec.scenarios.length > 0
      ? rawFeatureSpec.scenarios
      : defaults.scenarios;
  return {
    featureName: normalizeWhitespace(rawFeatureSpec.featureName || defaults.featureName),
    description: normalizeWhitespace(rawFeatureSpec.description || defaults.description),
    tags: Array.isArray(rawFeatureSpec.tags) && rawFeatureSpec.tags.length > 0 ? rawFeatureSpec.tags : defaults.tags,
    scenarios: rawScenarios.map((scenario, index) => ({
      name:
        normalizeWhitespace(scenario.name || scenario.scenarioName || "") ||
        (index === 0 ? namingMap.scenarioName : `Scenario ${index + 1}`),
      tags: Array.isArray(scenario.tags) ? scenario.tags : [],
      steps: asArray(scenario.steps).map((step) => normalizeScenarioStep(step))
    })),
    fileName: ensureFeatureFileName(rawFeatureSpec.fileName, namingMap.slug)
  };
}

function buildDefaultStepDefinitions() {
  return [
    {
      keyword: "Given",
      pattern: "the user launches the application",
      pageMethod: "launchApplication"
    },
    {
      keyword: "When",
      pattern: "the user executes the generated flow using test data row {string}",
      params: ["rowName"],
      dataSource: {
        type: "excelRow",
        path: "src/data/TestData.xlsx",
        sheetName: "GeneratedData",
        rowNameParam: "rowName",
        rowVariable: "row"
      },
      pageMethod: "runFlow",
      argsExpressions: ["row"]
    },
    {
      keyword: "Then",
      pattern: "the user should see the expected generated outcome",
      pageMethod: "assertExpectedStateVisible"
    }
  ];
}

export function normalizeStepSpec(rawStepSpec = {}, source = {}, namingMap = {}) {
  const defaultStepDefinitions = buildDefaultStepDefinitions(source, namingMap);
  const rawDefinitions =
    Array.isArray(rawStepSpec.stepDefinitions) && rawStepSpec.stepDefinitions.length > 0
      ? rawStepSpec.stepDefinitions
      : defaultStepDefinitions;
  return {
    pageClassName: normalizeWhitespace(rawStepSpec.pageClassName || namingMap.pageClassName),
    fileName: ensureJsFileName(rawStepSpec.fileName, namingMap.stepDefinitionFileName),
    excelPath: rawStepSpec.excelPath || "src/data/TestData.xlsx",
    sheetName: rawStepSpec.sheetName || "GeneratedData",
    stepDefinitions: rawDefinitions.map((definition) => ({
      keyword: STEP_KEYWORDS.has(definition.keyword) ? definition.keyword : "Then",
      pattern: normalizeWhitespace(definition.pattern || definition.text || definition.step || "") || "the user performs the generated step",
      params: Array.isArray(definition.params) ? definition.params : [],
      pageMethod: definition.pageMethod || null,
      argsExpressions: Array.isArray(definition.argsExpressions)
        ? definition.argsExpressions
        : Array.isArray(definition.args)
          ? definition.args
          : [],
      bodyLines: Array.isArray(definition.bodyLines) ? definition.bodyLines : [],
      dataSource:
        definition.dataSource && typeof definition.dataSource === "object"
          ? { ...definition.dataSource }
          : null
    }))
  };
}

export function normalizeLocatorEntries(locatorEntries = [], traceElements = [], actions = []) {
  const fromTrace = asArray(traceElements).map((entry) => ({
    name: normalizeWhitespace(entry?.name || entry?.dataTest || entry?.text || entry?.role || ""),
    selector: entry?.selector || (entry?.dataTest ? `[data-test='${entry.dataTest}']` : null),
    description: normalizeWhitespace(entry?.description || entry?.text || entry?.role || entry?.dataTest || "")
  }));
  const fromActions = asArray(actions)
    .filter((action) => action?.selector)
    .map((action) => ({
      name: action.locatorName || normalizeSelectorName(action.selector, action.elementName || "element"),
      selector: action.selector,
      description: normalizeWhitespace(action.elementName || action.description || action.locatorName || "")
    }));
  const normalized = [...asArray(locatorEntries), ...fromTrace, ...fromActions]
    .filter((entry) => entry && entry.selector)
    .map((entry) => ({
      name: normalizeWhitespace(entry.name || normalizeSelectorName(entry.selector, "element")) || "element",
      selector: String(entry.selector),
      description: normalizeWhitespace(entry.description || entry.name || entry.selector || "Element")
    }));
  const unique = uniqueBy(normalized, (entry) => `${entry.name}:${entry.selector}`);
  if (unique.length > 0) return unique;
  return [{ name: "mainContent", selector: "main", description: "Main content region" }];
}

function defaultPageMethods(locatorEntries = []) {
  const first = locatorEntries[0] || { name: "mainContent", selector: "main", description: "Main content region" };
  return [
    {
      name: "launchApplication",
      params: [],
      actions: [{ type: "navigate", urlExpression: "AppConfig.baseUrl" }]
    },
    {
      name: "runFlow",
      params: ["data = {}"],
      dataParam: "data",
      actions: []
    },
    {
      name: "assertExpectedStateVisible",
      params: [],
      actions: [{ type: "assertVisible", locatorName: first.name, selector: first.selector, elementName: first.description }]
    }
  ];
}

export function normalizePageSpec(rawPageSpec = {}, source = {}, namingMap = {}, locatorEntries = []) {
  const normalizedLocators = normalizeLocatorEntries(
    rawPageSpec.locatorEntries || rawPageSpec.locators || rawPageSpec.locatorDefinitions || locatorEntries,
    [],
    []
  );
  const methods = uniqueBy(
    asArray(rawPageSpec.methods)
      .map((method) => ({
        name: normalizeWhitespace(method.name || method.methodName || ""),
        params: Array.isArray(method.params) ? method.params : [],
        dataParam: method.dataParam || null,
        actions: normalizeActions(method.actions || [], source.title || "Generated flow"),
        bodyLines: Array.isArray(method.bodyLines) ? method.bodyLines : []
      }))
      .filter((method) => method.name),
    (method) => method.name
  );
  return {
    className: normalizeWhitespace(rawPageSpec.className || namingMap.pageClassName),
    fileName: ensureJsFileName(rawPageSpec.fileName, namingMap.pageFileName),
    locatorClassName: normalizeWhitespace(rawPageSpec.locatorClassName || namingMap.locatorClassName),
    locatorEntries: normalizedLocators,
    methods: methods.length > 0 ? methods : defaultPageMethods(normalizedLocators)
  };
}

export function normalizeLocatorSpec(rawLocatorSpec = {}, namingMap = {}, locatorEntries = []) {
  return {
    className: normalizeWhitespace(rawLocatorSpec.className || namingMap.locatorClassName),
    fileName: ensureJsFileName(rawLocatorSpec.fileName, namingMap.locatorRegistryFileName),
    emitFile: rawLocatorSpec.emitFile === true,
    entries: normalizeLocatorEntries(rawLocatorSpec.entries || locatorEntries, [], [])
  };
}

export function normalizeTestCaseSpec(rawTestCaseSpec = {}, source = {}, namingMap = {}) {
  const defaults = buildDefaultFeatureSpec(source, namingMap);
  const scenarios =
    Array.isArray(rawTestCaseSpec.scenarios) && rawTestCaseSpec.scenarios.length > 0
      ? rawTestCaseSpec.scenarios
      : defaults.scenarios;
  return {
    featureName: normalizeWhitespace(rawTestCaseSpec.featureName || defaults.featureName),
    description: normalizeWhitespace(rawTestCaseSpec.description || defaults.description),
    tags: Array.isArray(rawTestCaseSpec.tags) && rawTestCaseSpec.tags.length > 0 ? rawTestCaseSpec.tags : defaults.tags,
    scenarios: scenarios.map((scenario, index) => ({
      name:
        normalizeWhitespace(scenario.name || scenario.scenarioName || "") ||
        (index === 0 ? namingMap.scenarioName : `Scenario ${index + 1}`),
      tags: Array.isArray(scenario.tags) ? scenario.tags : [],
      steps: asArray(scenario.steps).map((step) => normalizeScenarioStep(step))
    })),
    acceptanceCriteria:
      Array.isArray(rawTestCaseSpec.acceptanceCriteria) && rawTestCaseSpec.acceptanceCriteria.length > 0
        ? rawTestCaseSpec.acceptanceCriteria.map((criterion) => normalizeWhitespace(criterion)).filter(Boolean)
        : extractAcceptanceCriteria(source.content || ""),
    explorationFocus:
      Array.isArray(rawTestCaseSpec.explorationFocus) && rawTestCaseSpec.explorationFocus.length > 0
        ? rawTestCaseSpec.explorationFocus.map((item) => normalizeWhitespace(item)).filter(Boolean)
        : ["Primary form fields", "Navigation controls", "Post-action success markers"],
    testDataNotes:
      Array.isArray(rawTestCaseSpec.testDataNotes) && rawTestCaseSpec.testDataNotes.length > 0
        ? rawTestCaseSpec.testDataNotes.map((item) => normalizeWhitespace(item)).filter(Boolean)
        : ["Map dynamic values to framework data providers where possible."]
  };
}

export function normalizeFrameworkSpec(rawFrameworkSpec = {}, source = {}, namingMap = {}, context = {}) {
  const featureSpec = normalizeFeatureSpec(rawFrameworkSpec.featureSpec || rawFrameworkSpec.feature || {}, source, namingMap);
  const stepSpec = normalizeStepSpec(rawFrameworkSpec.stepSpec || rawFrameworkSpec.steps || {}, source, namingMap);
  const locatorEntries = normalizeLocatorEntries(
    rawFrameworkSpec.pageSpec?.locatorEntries ||
      rawFrameworkSpec.pageSpec?.locators ||
      rawFrameworkSpec.locatorSpec?.entries ||
      context.selectorHints ||
      [],
    context.navigationTrace?.interactiveElements || [],
    context.actions || []
  );
  const pageSpec = normalizePageSpec(rawFrameworkSpec.pageSpec || rawFrameworkSpec.page || {}, source, namingMap, locatorEntries);
  const locatorSpec = normalizeLocatorSpec(rawFrameworkSpec.locatorSpec || rawFrameworkSpec.locator || {}, namingMap, pageSpec.locatorEntries);
  if (!stepSpec.pageClassName) {
    stepSpec.pageClassName = pageSpec.className;
  }
  return { featureSpec, stepSpec, pageSpec, locatorSpec };
}

function inferArtifactType(targetPath = "") {
  const normalized = String(targetPath || "").replace(/\\/g, "/");
  if (normalized.endsWith(".feature")) return "feature";
  if (/\/step-definitions\//i.test(normalized) || normalized.endsWith(".steps.js")) return "step-definition";
  if (/\/pages\//i.test(normalized)) return "page";
  if (/\/locators\//i.test(normalized)) return "locator";
  return "unknown";
}

export function normalizeGeneratedArtifacts(rawArtifacts = []) {
  const entries = Array.isArray(rawArtifacts)
    ? rawArtifacts
    : rawArtifacts && typeof rawArtifacts === "object"
      ? Object.entries(rawArtifacts).map(([targetPath, content]) => ({ targetPath, content }))
      : [];
  return uniqueBy(
    entries
      .filter((artifact) => artifact && artifact.targetPath && typeof artifact.content === "string")
      .map((artifact) => {
        const normalizedPath = String(artifact.targetPath).replace(/\\/g, "/");
        const targetPath =
          normalizedPath.startsWith("features/") || normalizedPath.startsWith("src/")
            ? normalizedPath
            : normalizedPath.endsWith(".feature")
              ? `features/${normalizedPath}`
              : `src/pages/${normalizedPath}`;
        return {
          type: artifact.type || inferArtifactType(targetPath),
          targetPath,
          content: artifact.content.endsWith("\n") ? artifact.content : `${artifact.content}\n`
        };
      }),
    (artifact) => artifact.targetPath
  );
}

export function defaultNavigateAction(baseUrl = AppConfig.baseUrl) {
  return {
    type: "navigate",
    tool: SCMTools.openUrl,
    description: `Open ${AppConfig.appName}`,
    locatorName: null,
    selector: null,
    elementName: "Browser",
    required: true,
    input: { url: baseUrl }
  };
}

export function renderFeatureFromSpec(featureSpec = {}) {
  const lines = [];
  const tags = asArray(featureSpec.tags).length > 0 ? asArray(featureSpec.tags).join(" ") : "@generated @ai-first";
  lines.push(tags);
  lines.push(`Feature: ${featureSpec.featureName || "Generated Feature"}`);
  lines.push(`  ${featureSpec.description || "Generated from a user story."}`);
  lines.push("");
  const scenarios = asArray(featureSpec.scenarios);
  scenarios.forEach((scenario, index) => {
    const scenarioTags = asArray(scenario.tags).join(" ");
    if (scenarioTags) lines.push(`  ${scenarioTags}`);
    lines.push(`  Scenario: ${scenario.name || `Scenario ${index + 1}`}`);
    asArray(scenario.steps).forEach((step) => {
      lines.push(`    ${step.keyword || "Then"} ${step.text || ""}`.trimEnd());
    });
    if (index < scenarios.length - 1) lines.push("");
  });
  return `${lines.join("\n").trimEnd()}\n`;
}

export function renderStepDefinitionsFromSpec(stepSpec = {}) {
  const className = stepSpec.pageClassName || "GeneratedPage";
  const lines = [
    'import { Given, When, Then, And } from "@cucumber/cucumber";',
    `import ${className} from "../../src/pages/${className}.js";`,
    "",
    "function getPageObject(world) {",
    "  if (!world.generatedPage) {",
    `    world.generatedPage = new ${className}(world.page);`,
    "  }",
    "  return world.generatedPage;",
    "}",
    ""
  ];

  asArray(stepSpec.stepDefinitions).forEach((definition) => {
    const keyword = STEP_KEYWORDS.has(definition.keyword) ? definition.keyword : "Then";
    const pattern = String(definition.pattern || "the user performs the generated step").replace(/"/g, '\\"');
    const params = Array.isArray(definition.params) ? definition.params.join(", ") : "";
    lines.push(`${keyword}("${pattern}", async function(${params}) {`);
    lines.push("  const pageObject = getPageObject(this);");

    if (definition.dataSource?.type === "excelRow" && definition.pageMethod) {
      const rowVariable = definition.dataSource.rowVariable || "row";
      const rowNameParam =
        definition.dataSource.rowNameParam ||
        (Array.isArray(definition.params) && definition.params.length > 0 ? definition.params[0] : "rowName");
      const dataPath = definition.dataSource.path || "src/data/TestData.xlsx";
      const sheetName = definition.dataSource.sheetName || "GeneratedData";
      lines.push(
        `  const ${rowVariable} = await this.excelHelper.readRow(${JSON.stringify(dataPath)}, ${JSON.stringify(sheetName)}, ${rowNameParam});`
      );
      const args =
        Array.isArray(definition.argsExpressions) && definition.argsExpressions.length > 0
          ? definition.argsExpressions.join(", ")
          : rowVariable;
      lines.push(`  await pageObject.${definition.pageMethod}(${args});`);
    } else if (definition.pageMethod) {
      const args =
        Array.isArray(definition.argsExpressions) && definition.argsExpressions.length > 0
          ? definition.argsExpressions.join(", ")
          : "";
      lines.push(`  await pageObject.${definition.pageMethod}(${args});`);
    } else {
      lines.push("  await pageObject.runFlow({});");
    }

    lines.push("});");
    lines.push("");
  });

  return `${lines.join("\n").trimEnd()}\n`;
}

function locatorExpression(action = {}) {
  if (action.locatorName) return `this.locator(${JSON.stringify(action.locatorName)})`;
  if (action.selector) return `this.page.locator(${JSON.stringify(action.selector)})`;
  return null;
}

function actionValueExpression(action = {}, dataParam = "data") {
  if (action.valueExpression) return action.valueExpression;
  if (action.valueParam) return action.valueParam;
  if (action.valueKey) return `String(${dataParam}.${action.valueKey} || "")`;
  return JSON.stringify(String(action.value || ""));
}

function actionTextExpression(action = {}) {
  if (action.textExpression) return action.textExpression;
  if (action.textParam) return action.textParam;
  return JSON.stringify(String(action.text || action.expectedText || ""));
}

function renderActionLines(action = {}, defaultDataParam = "data") {
  const locator = locatorExpression(action);
  const name = action.elementName || action.locatorName || action.selector || "Element";
  switch (action.type) {
    case "navigate":
      return [`await this.uiUtils.navigateToWithLog(${action.urlExpression || "AppConfig.baseUrl"}, { context: { page: this.page } });`];
    case "click":
      return locator ? [`await this.uiUtils.clickWithLog(${locator}, ${JSON.stringify(name)}, { context: { page: this.page } });`] : [];
    case "type":
    case "fill":
      return locator ? [`await this.uiUtils.clearAndTypeWithLog(${locator}, ${actionValueExpression(action, defaultDataParam)}, ${JSON.stringify(name)}, { context: { page: this.page } });`] : [];
    case "hover":
      return locator ? [`await this.uiUtils.hoverWithLog(${locator}, ${JSON.stringify(name)}, { context: { page: this.page } });`] : [];
    case "selectOption":
      if (!locator) return [];
      if (action.label || action.labelParam) {
        const value = action.labelParam || JSON.stringify(action.label || "");
        return [`await this.uiUtils.selectByTextWithLog(${locator}, ${value}, ${JSON.stringify(name)}, { context: { page: this.page } });`];
      }
      return [`await this.uiUtils.selectByValueWithLog(${locator}, ${actionValueExpression(action, defaultDataParam)}, ${JSON.stringify(name)}, { context: { page: this.page } });`];
    case "pressKey":
      return [`await this.uiUtils.pressKeyWithLog(${action.keyParam || JSON.stringify(action.key || "Enter")}, { context: { page: this.page } });`];
    case "wait":
      if (Number(action.time || action.timeout || 0) > 0) {
        return [`await this.page.waitForTimeout(${Math.round(Number(action.time || action.timeout || 0))});`];
      }
      return ["await this.page.waitForLoadState(\"domcontentloaded\");"];
    case "assertVisible":
      return locator ? [`await this.assertionUtils.expectElementVisibleWithLog(${locator}, ${JSON.stringify(name)}, { context: { page: this.page } });`] : [];
    case "assertText":
      return locator ? [`await this.assertionUtils.expectTextContainsWithLog(${locator}, ${actionTextExpression(action)}, ${JSON.stringify(name)}, { context: { page: this.page } });`] : [];
    case "navigateBack":
      return ['await this.page.goBack({ waitUntil: "domcontentloaded" });'];
    case "navigateForward":
      return ['await this.page.goForward({ waitUntil: "domcontentloaded" });'];
    default:
      return [];
  }
}

export function renderPageFromSpec(pageSpec = {}) {
  const className = pageSpec.className || "GeneratedPage";
  const lines = [
    'import { AppConfig } from "../config/AppConfig.js";',
    'import BasePage from "./BasePage.js";',
    "",
    `export class ${className} extends BasePage {`,
    "  constructor(page) {",
    "    super(page);",
    "    this.locatorDefinitions = ["
  ];

  asArray(pageSpec.locatorEntries).forEach((entry) => {
    lines.push(
      `      { name: ${JSON.stringify(entry.name)}, selector: ${JSON.stringify(entry.selector)}, description: ${JSON.stringify(entry.description || entry.name)} },`
    );
  });
  lines.push("    ];");
  lines.push("  }");
  lines.push("");
  lines.push("  locator(key) {");
  lines.push("    return this.locatorByKey(this.locatorDefinitions, key);");
  lines.push("  }");
  lines.push("");

  const methods = asArray(pageSpec.methods);
  methods.forEach((method) => {
    const params = Array.isArray(method.params) ? method.params.join(", ") : "";
    lines.push(`  async ${method.name}(${params}) {`);
    if (Array.isArray(method.bodyLines) && method.bodyLines.length > 0) {
      method.bodyLines.forEach((line) => lines.push(`    ${line}`));
    } else {
      let actionLines = [];
      asArray(method.actions).forEach((action) => {
        actionLines = actionLines.concat(renderActionLines(action, method.dataParam || "data"));
      });
      if (actionLines.length === 0) actionLines = ["// No actions defined."];
      actionLines.forEach((line) => lines.push(`    ${line}`));
    }
    lines.push("  }");
    lines.push("");
  });

  lines.push("}");
  lines.push("");
  lines.push(`export default ${className};`);
  return `${lines.join("\n").trimEnd()}\n`;
}

export function renderLocatorRegistryFromSpec(locatorSpec = {}) {
  const className = locatorSpec.className || "GeneratedLocators";
  const lines = [`export class ${className} {`, "  static entries = ["];
  asArray(locatorSpec.entries).forEach((entry) => {
    lines.push(
      `    { name: ${JSON.stringify(entry.name)}, selector: ${JSON.stringify(entry.selector)}, description: ${JSON.stringify(entry.description || entry.name)} },`
    );
  });
  lines.push("  ];");
  lines.push("");
  lines.push("  static find(name) {");
  lines.push("    return this.entries.find((entry) => entry.name === name) || null;");
  lines.push("  }");
  lines.push("}");
  lines.push("");
  lines.push(`export default ${className};`);
  return `${lines.join("\n").trimEnd()}\n`;
}

export function buildArtifactsFromFrameworkSpec(frameworkSpec = {}, namingMap = {}) {
  const artifacts = [
    {
      type: "feature",
      targetPath: `features/${frameworkSpec.featureSpec.fileName || namingMap.featureFileName}`,
      content: renderFeatureFromSpec(frameworkSpec.featureSpec)
    },
    {
      type: "step-definition",
      targetPath: `features/step-definitions/${frameworkSpec.stepSpec.fileName || namingMap.stepDefinitionFileName}`,
      content: renderStepDefinitionsFromSpec(frameworkSpec.stepSpec)
    },
    {
      type: "page",
      targetPath: `src/pages/${frameworkSpec.pageSpec.fileName || namingMap.pageFileName}`,
      content: renderPageFromSpec(frameworkSpec.pageSpec)
    }
  ];
  if (frameworkSpec.locatorSpec?.emitFile) {
    artifacts.push({
      type: "locator",
      targetPath: `src/locators/${frameworkSpec.locatorSpec.fileName || namingMap.locatorRegistryFileName}`,
      content: renderLocatorRegistryFromSpec(frameworkSpec.locatorSpec)
    });
  }
  return artifacts;
}
