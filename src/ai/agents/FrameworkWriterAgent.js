import { AppConfig } from "../../config/AppConfig.js";
import {
  asArray,
  buildArtifactsFromFrameworkSpec,
  ensureNamingMap,
  normalizeFrameworkSpec,
  normalizeGeneratedArtifacts,
  normalizeWhitespace
} from "./agent-utils.js";

export class FrameworkWriterAgent {
  constructor(options = {}) {
    this.plannerClient = options.plannerClient;
    this.stageName = options.stageName || "frameworkWriterAgent";
  }

  buildPrompt({
    source = {},
    frameworkContext = {},
    knowledge = {},
    testCaseSpec = {},
    explorationResult = {},
    navigationTrace = {},
    namingMap = {}
  } = {}) {
    const systemPrompt = [
      "You are FrameworkWriterAgent.",
      "Write runnable framework artifacts directly.",
      "Return strict JSON only.",
      "Output must include BDD feature, step definitions, page object, and locatorDefinitions inside page class.",
      "Prefer semantic naming and repo conventions."
    ].join(" ");

    const userPrompt = JSON.stringify(
      {
        stage: this.stageName,
        app: {
          name: AppConfig.appName,
          baseUrl: AppConfig.baseUrl
        },
        source,
        namingMap,
        testCaseSpec,
        explorationResult: {
          summary: explorationResult.summary || "",
          actions: explorationResult.actions || [],
          followUpActions: explorationResult.followUpActions || [],
          selectorHints: explorationResult.selectorHints || [],
          pageSignals: explorationResult.pageSignals || {}
        },
        navigationTrace,
        frameworkContext,
        appKnowledge: {
          markdown: knowledge.markdown || "",
          snapshot: knowledge.snapshot || {}
        },
        outputSchema: {
          summary: "One sentence summary",
          namingMap: {
            slug: "semantic-flow-slug",
            featureName: "Semantic feature name",
            scenarioName: "Semantic scenario name",
            featureFileName: "semantic-flow.feature",
            stepDefinitionFileName: "semantic-flow.steps.js",
            pageClassName: "SemanticFlowPage",
            pageFileName: "SemanticFlowPage.js",
            locatorClassName: "SemanticFlowLocators",
            locatorRegistryFileName: "SemanticFlowLocators.js"
          },
          frameworkSpec: {
            featureSpec: {
              featureName: "Feature",
              description: "Feature description",
              tags: ["@generated", "@ai-first"],
              scenarios: [
                {
                  name: "Scenario name",
                  tags: ["@smoke"],
                  steps: [
                    { keyword: "Given", text: "..." },
                    { keyword: "When", text: "..." },
                    { keyword: "Then", text: "..." }
                  ]
                }
              ]
            },
            stepSpec: {
              pageClassName: "SemanticFlowPage",
              fileName: "semantic-flow.steps.js",
              stepDefinitions: []
            },
            pageSpec: {
              className: "SemanticFlowPage",
              fileName: "SemanticFlowPage.js",
              locatorEntries: [],
              methods: []
            },
            locatorSpec: {
              className: "SemanticFlowLocators",
              fileName: "SemanticFlowLocators.js",
              emitFile: false,
              entries: []
            }
          },
          generatedArtifacts: [
            {
              type: "feature | step-definition | page | locator",
              targetPath: "features/semantic-flow.feature",
              content: "file content"
            }
          ],
          assumptions: ["..."],
          notes: ["..."]
        }
      },
      null,
      2
    );

    return { systemPrompt, userPrompt };
  }

  runDeterministicFallback(context = {}, plan = {}) {
    const source = context.source || {};
    const baseNamingMap = ensureNamingMap(
      { ...(context.namingMap || {}), ...(plan.namingMap || {}) },
      source.title || "Generated flow"
    );
    const frameworkSpec = normalizeFrameworkSpec(
      plan.frameworkSpec || {},
      source,
      baseNamingMap,
      {
        actions: context.explorationResult?.actions || [],
        selectorHints: context.explorationResult?.selectorHints || [],
        navigationTrace: context.navigationTrace || {}
      }
    );
    const generatedArtifacts = buildArtifactsFromFrameworkSpec(frameworkSpec, baseNamingMap);
    return {
      namingMap: baseNamingMap,
      frameworkSpec,
      generatedArtifacts
    };
  }

  async run(context = {}) {
    const source = context.source || {};
    const prompt = this.buildPrompt(context);
    const plannerResult = await this.plannerClient.generatePlan({
      stage: this.stageName,
      ...prompt
    });

    const plan = plannerResult.plan || {};
    const namingMap = ensureNamingMap(
      { ...(context.namingMap || {}), ...(plan.namingMap || {}) },
      source.title || "Generated flow"
    );

    const frameworkSpec = normalizeFrameworkSpec(
      plan.frameworkSpec || plan.frameworkArtifacts || {},
      source,
      namingMap,
      {
        actions: context.explorationResult?.actions || [],
        selectorHints: context.explorationResult?.selectorHints || [],
        navigationTrace: context.navigationTrace || {}
      }
    );

    let generatedArtifacts = normalizeGeneratedArtifacts(plan.generatedArtifacts || plan.files || []);
    if (generatedArtifacts.length === 0) {
      generatedArtifacts = buildArtifactsFromFrameworkSpec(frameworkSpec, namingMap);
    }

    return {
      stage: this.stageName,
      provider: plannerResult.provider,
      model: plannerResult.model,
      rawText: plannerResult.rawText,
      plan,
      summary: normalizeWhitespace(plan.summary || ""),
      namingMap,
      frameworkSpec,
      generatedArtifacts,
      assumptions: asArray(plan.assumptions),
      notes: asArray(plan.notes)
    };
  }
}

export default FrameworkWriterAgent;
