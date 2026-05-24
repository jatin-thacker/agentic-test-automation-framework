import { AppConfig } from "../../config/AppConfig.js";
import {
  asArray,
  ensureNamingMap,
  normalizeActions,
  normalizeSelectorName,
  normalizeWhitespace
} from "./agent-utils.js";

export class MCPExplorerAgent {
  constructor(options = {}) {
    this.plannerClient = options.plannerClient;
    this.toolAliases = options.toolAliases || {};
    this.stageName = options.stageName || "mcpExplorerAgent";
  }

  buildPrompt({ source = {}, frameworkContext = {}, knowledge = {}, testCaseSpec = {} } = {}) {
    const systemPrompt = [
      "You are MCPExplorerAgent for Playwright MCP browser exploration.",
      "Plan practical browser steps to verify the target flow.",
      "Return strict JSON only.",
      "Prioritize stable selectors and meaningful page signals."
    ].join(" ");

    const userPrompt = JSON.stringify(
      {
        stage: this.stageName,
        app: {
          name: AppConfig.appName,
          baseUrl: AppConfig.baseUrl
        },
        source,
        testCaseSpec,
        frameworkContext,
        appKnowledge: {
          markdown: knowledge.markdown || "",
          snapshot: knowledge.snapshot || {}
        },
        outputSchema: {
          summary: "One sentence summary",
          namingMap: {
            slug: "semantic-flow-slug"
          },
          actions: [
            {
              type: "navigate | click | type | hover | selectOption | pressKey | wait | assertVisible | assertText | navigateBack | navigateForward | probeElement | getPageMetadata | collectInteractiveElements | captureNetwork | captureSnapshot",
              tool: "mapped tool name",
              description: "Human readable step",
              locatorName: "camelCaseLocator",
              selector: "[data-test='username']",
              elementName: "Username Input",
              input: {
                url: "https://example.com",
                selector: "[data-test='username']",
                value: "standard_user",
                text: "Expected text",
                key: "Enter",
                state: "visible",
                timeout: 10000
              }
            }
          ],
          followUpActions: [],
          selectorHints: [
            {
              name: "usernameInput",
              selector: "[data-test='username']",
              description: "Username input"
            }
          ],
          pageSignals: {
            title: "Page title",
            url: "Current URL",
            notes: ["Important page signal"]
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
    const selectorHints = asArray(plan.selectorHints)
      .filter((hint) => hint && hint.selector)
      .map((hint) => ({
        name:
          normalizeWhitespace(hint.name || normalizeSelectorName(hint.selector, hint.description || "element")) ||
          "element",
        selector: String(hint.selector),
        description: normalizeWhitespace(hint.description || hint.name || hint.selector || "Element")
      }));

    return {
      stage: this.stageName,
      provider: plannerResult.provider,
      model: plannerResult.model,
      rawText: plannerResult.rawText,
      plan,
      summary: normalizeWhitespace(plan.summary || ""),
      namingMap,
      actions: normalizeActions(
        plan.actions || plan.mcpPlan?.actions || [],
        source.title || "Generated flow",
        this.toolAliases
      ),
      followUpActions: normalizeActions(
        plan.followUpActions || plan.verificationActions || [],
        source.title || "Generated flow",
        this.toolAliases
      ),
      selectorHints,
      pageSignals: plan.pageSignals || {},
      assumptions: asArray(plan.assumptions),
      notes: asArray(plan.notes)
    };
  }
}

export default MCPExplorerAgent;
