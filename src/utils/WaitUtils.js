import actionLogStore from "./ActionLogStore.js";
import { ACTION_STATUS, ACTION_TYPES } from "./Constants.js";
import { DateUtils } from "./DateUtils.js";
import { LoggerUtils } from "./LoggerUtils.js";
import { WaitError } from "../errors/WaitError.js";

export class WaitUtils {
  /**
   * @param {object} [options]
   * @param {LoggerUtils} [options.logger]
   * @param {import('./ScreenshotUtils.js').ScreenshotUtils} [options.screenshotUtils]
   */
  constructor(options = {}) {
    this.logger = options.logger || new LoggerUtils();
    this.screenshotUtils = options.screenshotUtils;
    this.defaultTimeout = Number(process.env.DEFAULT_TIMEOUT_MS || 10000);
  }

  async waitForElementVisibleWithLog(locator, elementName, options = {}) {
    const timeout = options.timeout ?? this.defaultTimeout;
    const context = options.context || {};
    return this.#wait(
      async () => locator.waitFor({ state: "visible", timeout }),
      `Wait for visible: ${elementName}`,
      elementName,
      context
    );
  }

  async waitForElementAttachedWithLog(locator, elementName, options = {}) {
    const timeout = options.timeout ?? this.defaultTimeout;
    const context = options.context || {};
    return this.#wait(
      async () => locator.waitFor({ state: "attached", timeout }),
      `Wait for attached: ${elementName}`,
      elementName,
      context
    );
  }

  async waitForUrlContainsWithLog(page, partialUrl, options = {}) {
    const timeout = options.timeout ?? this.defaultTimeout;
    const context = options.context || {};
    return this.#wait(
      async () => page.waitForURL((url) => url.toString().includes(partialUrl), { timeout }),
      `Wait for URL contains: ${partialUrl}`,
      "Browser URL",
      context
    );
  }

  async #wait(action, description, elementName, context) {
    await this.logger.info(description, context);
    actionLogStore.add({
      timestamp: DateUtils.nowIso(),
      actionType: ACTION_TYPES.WAIT,
      description,
      elementName,
      status: ACTION_STATUS.STARTED,
      scenarioName: context.scenarioName,
      stepName: context.stepName
    });
    try {
      const result = await action();
      actionLogStore.add({
        timestamp: DateUtils.nowIso(),
        actionType: ACTION_TYPES.WAIT,
        description: `${description} succeeded`,
        elementName,
        status: ACTION_STATUS.PASSED,
        scenarioName: context.scenarioName,
        stepName: context.stepName
      });
      return result;
    } catch (error) {
      actionLogStore.add({
        timestamp: DateUtils.nowIso(),
        actionType: ACTION_TYPES.WAIT,
        description: `${description} failed`,
        elementName,
        status: ACTION_STATUS.FAILED,
        errorMessage: error.message,
        scenarioName: context.scenarioName,
        stepName: context.stepName
      });
      if (this.screenshotUtils && context.page) {
        await this.screenshotUtils.captureScreenshotWithLog(context.page, `wait-failure-${elementName}`, context);
      }
      throw new WaitError(`Wait failed for ${elementName}`, { cause: error.message, description });
    }
  }
}

export default WaitUtils;
