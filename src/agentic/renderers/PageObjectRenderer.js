function locatorExpression(locatorClassName, action = {}) {
  if (action.locatorName) {
    return `${locatorClassName}.${action.locatorName}(this.page)`;
  }
  if (action.selector) {
    return `this.page.locator(${JSON.stringify(action.selector)})`;
  }
  return null;
}

function typeValueExpression(action = {}) {
  if (action.valueKey) {
    const fallback = typeof action.value === "undefined" || action.value === null ? "" : String(action.value);
    return `String(data.${action.valueKey} || ${JSON.stringify(fallback)})`;
  }
  return JSON.stringify(typeof action.value === "undefined" || action.value === null ? "" : String(action.value));
}

function keyExpression(action = {}) {
  if (action.key) return JSON.stringify(String(action.key));
  if (action.valueKey) return `String(data.${action.valueKey} || "Enter")`;
  return JSON.stringify("Enter");
}

export class PageObjectRenderer {
  render(pageSpec = {}) {
    const className = pageSpec.className || "GeneratedPage";
    const locatorClassName = pageSpec.locatorClassName || "GeneratedLocators";
    const assertion = pageSpec.assertion || {
      locatorName: "successState",
      elementName: "Expected Outcome"
    };

    const flowLines = [];
    for (const action of pageSpec.flowActions || []) {
      const elementName = action.elementName || action.type || "Element";
      const locatorExpr = locatorExpression(locatorClassName, action);

      if (action.type === "navigate" && action.url) {
        flowLines.push(
          `    await this.uiUtils.navigateToWithLog(${JSON.stringify(action.url)}, { context: { page: this.page } });`
        );
      } else if (action.type === "type" && locatorExpr) {
        flowLines.push(
          `    await this.uiUtils.clearAndTypeWithLog(${locatorExpr}, ${typeValueExpression(action)}, ${JSON.stringify(elementName)}, { context: { page: this.page } });`
        );
      } else if (action.type === "click" && locatorExpr) {
        flowLines.push(
          `    await this.uiUtils.clickWithLog(${locatorExpr}, ${JSON.stringify(elementName)}, { context: { page: this.page } });`
        );
      } else if (action.type === "hover" && locatorExpr) {
        flowLines.push(
          `    await this.uiUtils.hoverWithLog(${locatorExpr}, ${JSON.stringify(elementName)}, { context: { page: this.page } });`
        );
      } else if (action.type === "selectOption" && locatorExpr) {
        if (action.label) {
          flowLines.push(
            `    await this.uiUtils.selectByTextWithLog(${locatorExpr}, ${JSON.stringify(String(action.label))}, ${JSON.stringify(elementName)}, { context: { page: this.page } });`
          );
        } else {
          const selectValue = action.valueKey
            ? `String(data.${action.valueKey} || ${JSON.stringify(action.value || "")})`
            : JSON.stringify(String(action.value || ""));
          flowLines.push(
            `    await this.uiUtils.selectByValueWithLog(${locatorExpr}, ${selectValue}, ${JSON.stringify(elementName)}, { context: { page: this.page } });`
          );
        }
      } else if (action.type === "pressKey") {
        flowLines.push(
          `    await this.uiUtils.pressKeyWithLog(${keyExpression(action)}, { context: { page: this.page } });`
        );
      } else if (action.type === "wait") {
        const waitMs = Math.max(0, Number(action.waitTime || 0)) * 1000;
        if (waitMs > 0) {
          flowLines.push(`    await this.page.waitForTimeout(${Math.round(waitMs)});`);
        }
      } else if (action.type === "navigateBack") {
        flowLines.push('    await this.page.goBack({ waitUntil: "domcontentloaded" });');
      } else if (action.type === "navigateForward") {
        flowLines.push('    await this.page.goForward({ waitUntil: "domcontentloaded" });');
      }
    }
    if (flowLines.length === 0) {
      flowLines.push("    // No interactive flow actions were discovered for this story.");
    }

    const assertionLocatorExpr = assertion.locatorName
      ? `${locatorClassName}.${assertion.locatorName}(this.page)`
      : 'this.page.locator("main")';

    return `import { AppConfig } from "../config/AppConfig.js";
import BasePage from "./BasePage.js";
import ${locatorClassName} from "../locators/${locatorClassName}.js";

export class ${className} extends BasePage {
  constructor(page) {
    super(page);
  }

  async launchApplication() {
    await this.uiUtils.navigateToWithLog(AppConfig.baseUrl, {
      context: { page: this.page }
    });
  }

  async runFlow(data = {}) {
${flowLines.join("\n")}
  }

  async assertExpectedStateVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      ${assertionLocatorExpr},
      ${JSON.stringify(assertion.elementName || "Expected Outcome")},
      { context: { page: this.page } }
    );
  }
}

export default ${className};
`;
  }
}

export default PageObjectRenderer;
