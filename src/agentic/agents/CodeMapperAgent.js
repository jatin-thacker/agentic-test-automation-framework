import path from "node:path";
import BaseAgent from "../core/BaseAgent.js";
import FeatureFileRenderer from "../renderers/FeatureFileRenderer.js";
import StepDefinitionRenderer from "../renderers/StepDefinitionRenderer.js";
import PageObjectRenderer from "../renderers/PageObjectRenderer.js";

export class CodeMapperAgent extends BaseAgent {
  constructor(deps = {}) {
    super("CodeMapperAgent", deps);
    this.featureRenderer = new FeatureFileRenderer();
    this.stepRenderer = new StepDefinitionRenderer();
    this.pageRenderer = new PageObjectRenderer();
  }

  async execute(_input = {}, context = {}) {
    const artifactSpec = context.artifactDesign || {};
    const slug = artifactSpec.slug || "agentic-generated";
    const featureFile = `${slug}.feature`;
    const stepFile = `${slug}.steps.js`;
    const pageFile = `${artifactSpec.pageSpec?.className || "AgenticGeneratedPage"}.js`;

    const artifacts = [
      {
        type: "feature",
        targetPath: path.join("features", featureFile),
        content: this.featureRenderer.render(artifactSpec.featureSpec)
      },
      {
        type: "step-definition",
        targetPath: path.join("features", "step-definitions", stepFile),
        content: this.stepRenderer.render(artifactSpec.stepSpec)
      },
      {
        type: "page",
        targetPath: path.join("src", "pages", pageFile),
        content: this.pageRenderer.render(artifactSpec.pageSpec)
      }
    ];

    return {
      artifacts
    };
  }
}

export default CodeMapperAgent;
