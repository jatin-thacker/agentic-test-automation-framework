export class FeatureFileRenderer {
  render(featureSpec = {}) {
    const lines = [];
    const tags = Array.isArray(featureSpec.tags) ? featureSpec.tags.join(" ") : "@generated @agentic";
    lines.push(`Feature: ${featureSpec.featureName || "Generated Feature"}`);
    lines.push(`  ${featureSpec.description || "Generated from user story."}`);
    lines.push("");
    lines.push(`  ${tags}`);
    lines.push(`  Scenario: ${featureSpec.scenarioName || "Generated scenario"}`);
    for (const step of featureSpec.steps || []) {
      lines.push(`    ${step.keyword} ${step.text}`);
    }
    return `${lines.join("\n")}\n`;
  }
}

export default FeatureFileRenderer;
