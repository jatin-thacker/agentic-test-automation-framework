function inferArtifactType(targetPath = "") {
  const normalized = String(targetPath || "").replace(/\\/g, "/");
  if (/\/step-definitions\//i.test(normalized) || /\.steps\.js$/i.test(normalized)) return "step-definition";
  if (/\/pages\//i.test(normalized)) return "page";
  if (/\/locators\//i.test(normalized)) return "locator";
  if (/\.feature$/i.test(normalized)) return "feature";
  return "unknown";
}

function resolveArtifactMap(generatedArtifacts = []) {
  return generatedArtifacts.reduce((map, artifact) => {
    if (!artifact?.targetPath) return map;
    const type = artifact.type || inferArtifactType(artifact.targetPath);
    map[type] = artifact;
    return map;
  }, {});
}

function hasText(value = "") {
  return String(value || "").trim().length > 0;
}

function includesAny(content = "", patterns = []) {
  return patterns.some((pattern) => new RegExp(pattern, "i").test(content));
}

export class FrameworkArtifactValidator {
  validate(input = {}) {
    const issues = [];
    const { artifactSpec, generatedArtifacts } = input;
    const frameworkSpec = artifactSpec?.frameworkSpec || artifactSpec || {};
    const artifacts = Array.isArray(generatedArtifacts) ? generatedArtifacts : [];
    const artifactMap = resolveArtifactMap(artifacts);

    if (!artifactSpec) {
      issues.push("artifactSpec is required");
    }
    if (!Array.isArray(artifacts) || artifacts.length === 0) {
      issues.push("generatedArtifacts must contain at least one artifact");
    }

    const featureSpec = frameworkSpec?.featureSpec || artifactSpec?.featureSpec || {};
    const stepSpec = frameworkSpec?.stepSpec || artifactSpec?.stepSpec || {};
    const pageSpec = frameworkSpec?.pageSpec || artifactSpec?.pageSpec || {};
    const locatorSpec = frameworkSpec?.locatorSpec || artifactSpec?.locatorSpec || {};

    if (!hasText(featureSpec.featureName)) {
      issues.push("featureSpec.featureName is required");
    }
    if (!Array.isArray(featureSpec.scenarios) || featureSpec.scenarios.length === 0) {
      issues.push("featureSpec.scenarios must contain at least one scenario");
    }
    if (!hasText(stepSpec.pageClassName)) {
      issues.push("stepSpec.pageClassName is required");
    }
    if (!Array.isArray(stepSpec.stepDefinitions) || stepSpec.stepDefinitions.length === 0) {
      issues.push("stepSpec.stepDefinitions must contain at least one step definition");
    }
    if (!hasText(pageSpec.className)) {
      issues.push("pageSpec.className is required");
    }
    if (!Array.isArray(pageSpec.methods) || pageSpec.methods.length === 0) {
      issues.push("pageSpec.methods must contain at least one method");
    }
    if (locatorSpec?.emitFile !== false && !hasText(locatorSpec.className) && !artifactMap.locator) {
      issues.push("locatorSpec.className is required when a locator registry file is emitted");
    }

    const selectors = new Set();
    for (const loc of locatorSpec?.entries || []) {
      if (!hasText(loc?.selector)) issues.push(`locator '${loc?.name || "unknown"}' is missing selector`);
      if (selectors.has(loc.selector)) {
        issues.push(`duplicate selector found: ${loc.selector}`);
      }
      selectors.add(loc.selector);
    }

    const methodNames = new Set();
    for (const method of pageSpec?.methods || []) {
      if (!hasText(method?.name)) {
        issues.push("pageSpec.methods entries must include a name");
      }
      if (methodNames.has(method.name)) {
        issues.push(`duplicate page method found: ${method.name}`);
      }
      methodNames.add(method.name);
    }

    const stepPatterns = new Set();
    for (const step of stepSpec?.stepDefinitions || []) {
      if (!hasText(step?.pattern)) {
        issues.push("stepSpec.stepDefinitions entries must include a pattern");
      }
      if (stepPatterns.has(step.pattern)) {
        issues.push(`duplicate step definition pattern found: ${step.pattern}`);
      }
      stepPatterns.add(step.pattern);
    }

    const featureArtifact = artifactMap.feature;
    const stepArtifact = artifactMap["step-definition"];
    const pageArtifact = artifactMap.page;
    const locatorArtifact = artifactMap.locator;

    if (!featureArtifact) {
      issues.push("a feature artifact is required");
    } else {
      if (!hasText(featureArtifact.content)) {
        issues.push(`feature artifact is empty: ${featureArtifact.targetPath}`);
      }
      if (!includesAny(featureArtifact.content, ["(?:^|\\n)\\s*Feature\\s*:", "(?:^|\\n)\\s*Scenario\\s*:"])) {
        issues.push(`feature artifact does not look like a valid feature file: ${featureArtifact.targetPath}`);
      }
    }

    if (!stepArtifact) {
      issues.push("a step-definition artifact is required");
    } else {
      if (!hasText(stepArtifact.content)) {
        issues.push(`step-definition artifact is empty: ${stepArtifact.targetPath}`);
      }
      if (!includesAny(stepArtifact.content, ["@cucumber/cucumber", "Given\\s*\\(", "When\\s*\\(", "Then\\s*\\("])) {
        issues.push(`step-definition artifact does not look like a valid step file: ${stepArtifact.targetPath}`);
      }
      if (!includesAny(stepArtifact.content, ["from\\s+['\"][^'\"]*src/pages/", "from\\s+['\"][^'\"]*\\.\\.\\/\\.\\.\\/src/pages/"])) {
        issues.push(`step-definition artifact should import a page object: ${stepArtifact.targetPath}`);
      }
    }

    if (!pageArtifact) {
      issues.push("a page artifact is required");
    } else {
      if (!hasText(pageArtifact.content)) {
        issues.push(`page artifact is empty: ${pageArtifact.targetPath}`);
      }
      if (!includesAny(pageArtifact.content, ["class\\s+\\w+\\s+extends\\s+BasePage", "locatorDefinitions"])) {
        issues.push(`page artifact does not look like a page object: ${pageArtifact.targetPath}`);
      }
    }

    if (locatorArtifact) {
      if (!hasText(locatorArtifact.content)) {
        issues.push(`locator artifact is empty: ${locatorArtifact.targetPath}`);
      }
      if (!includesAny(locatorArtifact.content, ["export\\s+class", "static\\s+entries"])) {
        issues.push(`locator artifact does not look like a locator registry: ${locatorArtifact.targetPath}`);
      }
    }

    for (const artifact of artifacts) {
      if (!artifact.targetPath || artifact.content === undefined) {
        issues.push("generated artifact must include targetPath and content");
      }
      if (String(artifact.content || "").includes("TODO")) {
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
