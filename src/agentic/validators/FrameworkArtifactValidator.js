export class FrameworkArtifactValidator {
  validate(input = {}) {
    const issues = [];
    const { artifactSpec, generatedArtifacts } = input;

    if (!artifactSpec?.featureSpec?.featureName) {
      issues.push("featureSpec.featureName is required");
    }
    if (!artifactSpec?.stepSpec?.pageClassName) {
      issues.push("stepSpec.pageClassName is required");
    }
    if (!artifactSpec?.pageSpec?.className) {
      issues.push("pageSpec.className is required");
    }
    if (!artifactSpec?.locatorSpec?.className) {
      issues.push("locatorSpec.className is required");
    }

    const selectors = new Set();
    for (const loc of artifactSpec?.locatorSpec?.entries || []) {
      if (!loc.selector) issues.push(`locator '${loc.name || "unknown"}' is missing selector`);
      if (selectors.has(loc.selector)) {
        issues.push(`duplicate selector found: ${loc.selector}`);
      }
      selectors.add(loc.selector);
    }

    for (const artifact of generatedArtifacts || []) {
      if (!artifact.targetPath || !artifact.content) {
        issues.push("generated artifact must include targetPath and content");
      }
      if ((artifact.content || "").includes("TODO")) {
        issues.push(`generated artifact contains TODO placeholder: ${artifact.targetPath}`);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}

export default FrameworkArtifactValidator;
