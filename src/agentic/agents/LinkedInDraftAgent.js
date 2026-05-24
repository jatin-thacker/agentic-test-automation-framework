import BaseAgent from "../core/BaseAgent.js";

export class LinkedInDraftAgent extends BaseAgent {
  constructor(deps = {}) {
    super("LinkedInDraftAgent", deps);
  }

  async execute(_input = {}, context = {}) {
    const story = context.userStory || context.story || {};
    const validation = context.validation || {};
    const artifacts = context.codeMapper?.artifacts || [];
    const github = context.githubWorkflow || {};

    const artifactTypes = artifacts.map((a) => a.type).join(", ");
    const statusLine = validation.passed
      ? "Validation passed and artifacts are ready for review."
      : `Validation flagged issues: ${(validation.issues || []).join("; ")}`;

    const markdown = [
      "# LinkedIn Post Draft",
      "",
      `We just built a practical step toward agentic QA automation.`,
      "",
      "Instead of writing scripts first, our flow now:",
      "- reads a user story",
      "- understands framework conventions",
      "- runs an AI navigation trace via Playwright MCP tools",
      "- maps results into maintainable framework code (features, steps, pages, locators)",
      "",
      `Story focus: **${story.title || "Generated Story"}**`,
      `Generated artifacts: **${artifactTypes || "none"}**`,
      statusLine,
      "",
      "Next: GitHub CLI-driven PR flow + UI review before apply.",
      github.ghAvailable ? `Using GitHub CLI: ${github.ghVersion}` : "GitHub CLI not detected locally.",
      "",
      "#testautomation #playwright #cucumber #ai #qualityengineering #github"
    ].join("\n");

    return { markdown };
  }
}

export default LinkedInDraftAgent;
