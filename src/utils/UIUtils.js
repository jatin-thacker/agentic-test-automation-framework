import actionLogStore from "./ActionLogStore.js";
import { ACTION_STATUS, ACTION_TYPES } from "./Constants.js";
import { DataMaskingUtils } from "./DataMaskingUtils.js";
import { DateUtils } from "./DateUtils.js";
import { LoggerUtils } from "./LoggerUtils.js";
import { UIActionError } from "../errors/UIActionError.js";

export class UIUtils {
  /**
   * @param {object} [options]
   * @param {import('@playwright/test').Page} [options.page]
   * @param {LoggerUtils} [options.logger]
   * @param {import('./WaitUtils.js').WaitUtils} [options.waitUtils]
   * @param {import('./ScreenshotUtils.js').ScreenshotUtils} [options.screenshotUtils]
   */
  constructor(options = {}) {
    this.page = options.page;
    this.logger = options.logger || new LoggerUtils();
    this.waitUtils = options.waitUtils;
    this.screenshotUtils = options.screenshotUtils;
    this.retryCount = Number(process.env.ACTION_RETRY_COUNT || 2);
    this.defaultTimeout = Number(process.env.DEFAULT_TIMEOUT_MS || 10000);
  }

  async navigateToWithLog(url, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.NAVIGATION,
      description: `Navigate to URL: ${url}`,
      elementName: "Browser",
      context: options.context,
      action: async () => this.#getPage(options).goto(url, { waitUntil: "domcontentloaded" })
    });
  }

  async clickWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.CLICK,
      description: `Click on ${elementName}`,
      elementName,
      context: options.context,
      action: async () => {
        await this.#waitVisible(locator, elementName, options);
        await locator.click({ timeout: options.timeout ?? this.defaultTimeout });
      }
    });
  }

  async typeWithLog(locator, value, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.TYPE,
      description: `Type in ${elementName}: ${DataMaskingUtils.maybeMask(elementName, value)}`,
      elementName,
      context: options.context,
      action: async () => {
        await this.#waitVisible(locator, elementName, options);
        await locator.type(String(value), { timeout: options.timeout ?? this.defaultTimeout });
      }
    });
  }

  async fillWithLog(locator, value, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.FILL,
      description: `Fill ${elementName}: ${DataMaskingUtils.maybeMask(elementName, value)}`,
      elementName,
      context: options.context,
      action: async () => {
        await this.#waitVisible(locator, elementName, options);
        await locator.fill(String(value), { timeout: options.timeout ?? this.defaultTimeout });
      }
    });
  }

  async clearAndTypeWithLog(locator, value, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.TYPE,
      description: `Clear and type in ${elementName}: ${DataMaskingUtils.maybeMask(elementName, value)}`,
      elementName,
      context: options.context,
      action: async () => {
        await this.#waitVisible(locator, elementName, options);
        await locator.fill("");
        await locator.type(String(value));
      }
    });
  }

  async clearAndFillWithLog(locator, value, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.FILL,
      description: `Clear and fill ${elementName}: ${DataMaskingUtils.maybeMask(elementName, value)}`,
      elementName,
      context: options.context,
      action: async () => {
        await this.#waitVisible(locator, elementName, options);
        await locator.fill("");
        await locator.fill(String(value));
      }
    });
  }

  async selectByTextWithLog(locator, text, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.SELECT,
      description: `Select by text '${text}' on ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.selectOption({ label: String(text) })
    });
  }

  async selectByValueWithLog(locator, value, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.SELECT,
      description: `Select by value '${value}' on ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.selectOption({ value: String(value) })
    });
  }

  async checkWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.CHECK,
      description: `Check ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.check()
    });
  }

  async uncheckWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.CHECK,
      description: `Uncheck ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.uncheck()
    });
  }

  async hoverWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.CLICK,
      description: `Hover on ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.hover()
    });
  }

  async doubleClickWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.CLICK,
      description: `Double click on ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.dblclick()
    });
  }

  async rightClickWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.CLICK,
      description: `Right click on ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.click({ button: "right" })
    });
  }

  async pressKeyWithLog(key, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.TYPE,
      description: `Press key ${key}`,
      elementName: "Keyboard",
      context: options.context,
      action: async () => this.#getPage(options).keyboard.press(key)
    });
  }

  async scrollIntoViewWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Scroll into view: ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.scrollIntoViewIfNeeded()
    });
  }

  async getTextWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Get text of ${elementName}`,
      elementName,
      context: options.context,
      action: async () => (await locator.textContent()) || ""
    });
  }

  async getAllTextWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Get all text values for ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.allTextContents()
    });
  }

  async getInputValueWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Get input value of ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.inputValue()
    });
  }

  async getAttributeWithLog(locator, attributeName, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Get attribute '${attributeName}' from ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.getAttribute(attributeName)
    });
  }

  async isElementAvailableWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Check element availability: ${elementName}`,
      elementName,
      context: options.context,
      action: async () => (await locator.count()) > 0
    });
  }

  async isElementVisibleWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Check element visibility: ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.isVisible()
    });
  }

  async isElementEnabledWithLog(locator, elementName, options = {}) {
    return this.#runAction({
      actionType: ACTION_TYPES.WAIT,
      description: `Check element enabled state: ${elementName}`,
      elementName,
      context: options.context,
      action: async () => locator.isEnabled()
    });
  }

  async waitAndClickWithLog(locator, elementName, options = {}) {
    await this.#waitVisible(locator, elementName, options);
    return this.clickWithLog(locator, elementName, options);
  }

  async safeClickWithLog(locator, elementName, options = {}) {
    try {
      return await this.clickWithLog(locator, elementName, options);
    } catch {
      await locator.scrollIntoViewIfNeeded();
      return this.clickWithLog(locator, elementName, options);
    }
  }

  async retryClickWithLog(locator, elementName, options = {}) {
    let lastError;
    const retryCount = options.retryCount ?? this.retryCount;
    for (let i = 0; i <= retryCount; i += 1) {
      try {
        return await this.clickWithLog(locator, elementName, options);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  async takeScreenshotWithLog(name, options = {}) {
    const page = this.#getPage(options);
    if (!this.screenshotUtils) {
      throw new UIActionError("ScreenshotUtils is not configured", { name });
    }
    return this.screenshotUtils.captureScreenshotWithLog(page, name, options.context || {});
  }

  async #waitVisible(locator, elementName, options) {
    if (!this.waitUtils) return;
    await this.waitUtils.waitForElementVisibleWithLog(locator, elementName, {
      timeout: options.timeout,
      context: { ...(options.context || {}), page: this.#getPage(options) }
    });
  }

  #getPage(options) {
    return options.page || this.page;
  }

  async #runAction({ actionType, description, elementName, context = {}, action }) {
    const page = context.page || this.page;
    await this.logger.info(description, context);
    actionLogStore.add({
      timestamp: DateUtils.nowIso(),
      actionType,
      description,
      elementName,
      status: ACTION_STATUS.STARTED,
      scenarioName: context.scenarioName,
      stepName: context.stepName,
      agentName: context.agentName
    });
    try {
      const result = await action();
      actionLogStore.add({
        timestamp: DateUtils.nowIso(),
        actionType,
        description: `${description} succeeded`,
        elementName,
        status: ACTION_STATUS.PASSED,
        scenarioName: context.scenarioName,
        stepName: context.stepName,
        agentName: context.agentName
      });
      return result;
    } catch (error) {
      let screenshotPath;
      if (this.screenshotUtils && page) {
        screenshotPath = await this.screenshotUtils.captureScreenshotWithLog(
          page,
          `failure-${elementName || "action"}`,
          context
        );
      }
      await this.logger.error(`${description} failed`, { error: error.message, context });
      actionLogStore.add({
        timestamp: DateUtils.nowIso(),
        actionType,
        description: `${description} failed`,
        elementName,
        status: ACTION_STATUS.FAILED,
        screenshotPath,
        errorMessage: error.message,
        scenarioName: context.scenarioName,
        stepName: context.stepName,
        agentName: context.agentName
      });
      throw new UIActionError(description, {
        cause: error.message,
        elementName,
        actionType
      });
    }
  }
}

export default UIUtils;
