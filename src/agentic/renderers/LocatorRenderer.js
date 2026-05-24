export class LocatorRenderer {
  render(locatorSpec = {}) {
    const className = locatorSpec.className || "GeneratedLocators";
    const entries = Array.isArray(locatorSpec.entries) && locatorSpec.entries.length > 0
      ? locatorSpec.entries
      : [{ name: "mainContent", selector: "main", description: "Main content region" }];

    const lines = [];
    lines.push(`export class ${className} {`);
    lines.push("  static entries = [");
    for (const locator of entries) {
      lines.push(
        `    { name: ${JSON.stringify(locator.name)}, selector: ${JSON.stringify(locator.selector)}, description: ${JSON.stringify(locator.description || locator.name)} },`
      );
    }
    lines.push("  ];");
    lines.push("");
    lines.push("  static selector(name) {");
    lines.push("    const entry = this.entries.find((item) => item.name === name);");
    lines.push("    return entry?.selector || null;");
    lines.push("  }");
    lines.push("");
    lines.push("  static by(page, name) {");
    lines.push("    const selector = this.selector(name);");
    lines.push("    if (!selector) {");
    lines.push("      throw new Error(`Locator '${name}' is not defined`);");
    lines.push("    }");
    lines.push("    return page.locator(selector);");
    lines.push("  }");
    lines.push("}");
    lines.push("");
    lines.push(`export default ${className};`);
    lines.push("");
    return lines.join("\n");
  }
}

export default LocatorRenderer;
