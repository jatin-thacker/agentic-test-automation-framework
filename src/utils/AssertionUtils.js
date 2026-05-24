import { expect } from "@playwright/test";
import actionLogStore from "./ActionLogStore.js";
import { ACTION_STATUS, ACTION_TYPES } from "./Constants.js";
import { DateUtils } from "./DateUtils.js";
import { LoggerUtils } from "./LoggerUtils.js";
import { AssertionFrameworkError } from "../errors/AssertionFrameworkError.js";

export class AssertionUtils {
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

  async expectElementVisibleWithLog(locator, elementName, options = {}) {
    const timeout = options.timeout ?? this.defaultTimeout;
    return this.#assert(
      async () => expect(locator).toBeVisible({ timeout }),
      `Expect visible: ${elementName}`,
      elementName,
      options.context || {}
    );
  }

  async expectTextContainsWithLog(locator, expectedText, elementName, options = {}) {
    const timeout = options.timeout ?? this.defaultTimeout;
    return this.#assert(
      async () => expect(locator).toContainText(expectedText, { timeout }),
      `Expect text contains '${expectedText}' on ${elementName}`,
      elementName,
      options.context || {}
    );
  }

  async expectUrlContainsWithLog(page, partialUrl, options = {}) {
    const timeout = options.timeout ?? this.defaultTimeout;
    return this.#assert(
      async () => expect(page).toHaveURL(new RegExp(partialUrl), { timeout }),
      `Expect URL contains '${partialUrl}'`,
      "Browser URL",
      options.context || {}
    );
  }

  async #assert(action, description, elementName, context) {
    await this.logger.info(description, context);
    actionLogStore.add({
      timestamp: DateUtils.nowIso(),
      actionType: ACTION_TYPES.ASSERTION,
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
        actionType: ACTION_TYPES.ASSERTION,
        description: `${description} succeeded`,
        elementName,
        status: ACTION_STATUS.PASSED,
        scenarioName: context.scenarioName,
        stepName: context.stepName,
        agentName: context.agentName
      });
      return result;
    } catch (error) {
      actionLogStore.add({
        timestamp: DateUtils.nowIso(),
        actionType: ACTION_TYPES.ASSERTION,
        description: `${description} failed`,
        elementName,
        status: ACTION_STATUS.FAILED,
        errorMessage: error.message,
        scenarioName: context.scenarioName,
        stepName: context.stepName,
        agentName: context.agentName
      });
      if (this.screenshotUtils && context.page) {
        await this.screenshotUtils.captureScreenshotWithLog(context.page, `assertion-failure-${elementName}`, context);
      }
      throw new AssertionFrameworkError(`Assertion failed for ${elementName}`, {
        cause: error.message,
        description
      });
    }
  }
}

export default AssertionUtils;
