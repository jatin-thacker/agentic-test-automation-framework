import { AppConfig } from "../../config/AppConfig.js";
import {
  asArray,
  ensureNamingMap,
  normalizeTestCaseSpec,
  normalizeWhitespace
} from "./agent-utils.js";

export class EnglishPromptAgent {
  constructor(options = {}) {
    this.plannerClient = options.plannerClient;
    this.stageName = options.stageName || "testCaseAgent";
  }

  buildPrompt({ source = {}, frameworkContext = {}, knowledge = {} } = {}) {
    const systemPrompt = [
      "You are EnglishPromptAgent for an AI-first test automation framework.",
      "Write detailed, business-readable BDD test cases from the given story/prompt.",
      "Return strict JSON only.",
      "Use semantic naming for feature/scenario/page hints.",
      "Do not return markdown."
    ].join(" ");

    const userPrompt = JSON.stringify(
      {
        stage: this.stageName,
        app: {
          name: AppConfig.appName,
          baseUrl: AppConfig.baseUrl
        },
        source,
        frameworkContext,
        appKnowledge: {
          markdown: knowledge.markdown || "",
          snapshot: knowledge.snapshot || {}
        },
        outputSchema: {
          summary: "One sentence summary",
          namingMap: {
            slug: "semantic-flow-slug",
            featureName: "Readable feature name",
            scenarioName: "Readable scenario name",
            featureFileName: "semantic-flow.feature",
            stepDefinitionFileName: "semantic-flow.steps.js",
            pageClassName: "SemanticFlowPage",
            pageFileName: "SemanticFlowPage.js",
            locatorClassName: "SemanticFlowLocators",
            locatorRegistryFileName: "SemanticFlowLocators.js"
          },
          testCaseSpec: {
            featureName: "Feature",
            description: "Business value",
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
            ],
            acceptanceCriteria: ["..."],
            explorationFocus: ["..."],
            testDataNotes: ["..."]
          },
          assumptions: ["..."],
          notes: ["..."]
        }
      },
      null,
      2
    );

    return { systemPrompt, userPrompt };
  }

  async run(context = {}) {
    const source = context.source || {};
    const prompt = this.buildPrompt(context);
    const plannerResult = await this.plannerClient.generatePlan({
      stage: this.stageName,
      ...prompt
    });

    const plan = plannerResult.plan || {};
    const namingMap = ensureNamingMap(plan.namingMap || {}, source.title || "Generated flow");
    const testCaseSpec = normalizeTestCaseSpec(
      plan.testCaseSpec || plan.bddSpec || plan,
      source,
      namingMap
    );

    return {
      stage: this.stageName,
      provider: plannerResult.provider,
      model: plannerResult.model,
      rawText: plannerResult.rawText,
      plan,
      summary: normalizeWhitespace(plan.summary || ""),
      namingMap,
      testCaseSpec,
      assumptions: asArray(plan.assumptions),
      notes: asArray(plan.notes)
    };
  }
}

export default EnglishPromptAgent;
