export class LocatorRenderer {
  render(locatorSpec = {}) {
    const className = locatorSpec.className || "GeneratedLocators";
    const lines = [];
    lines.push(`export class ${className} {`);
    for (const locator of locatorSpec.entries || []) {
      lines.push(`  static ${locator.name}(page) {`);
      lines.push(`    return page.locator(${JSON.stringify(locator.selector)});`);
      lines.push("  }");
      lines.push("");
    }
    lines.push("}");
    lines.push("");
    lines.push(`export default ${className};`);
    lines.push("");
    return lines.join("\n");
  }
}

export default LocatorRenderer;
