import { UIUtils } from "../utils/UIUtils.js";
import { WaitUtils } from "../utils/WaitUtils.js";
import { AssertionUtils } from "../utils/AssertionUtils.js";
import { ScreenshotUtils } from "../utils/ScreenshotUtils.js";
import { LoggerUtils } from "../utils/LoggerUtils.js";

export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.logger = new LoggerUtils();
    this.screenshotUtils = new ScreenshotUtils({ logger: this.logger });
    this.waitUtils = new WaitUtils({ logger: this.logger, screenshotUtils: this.screenshotUtils });
    this.uiUtils = new UIUtils({
      page: this.page,
      logger: this.logger,
      waitUtils: this.waitUtils,
      screenshotUtils: this.screenshotUtils
    });
    this.assertionUtils = new AssertionUtils({
      logger: this.logger,
      screenshotUtils: this.screenshotUtils
    });
  }

  async navigateTo(url, context = {}) {
    await this.uiUtils.navigateToWithLog(url, { context: { ...context, page: this.page } });
  }

  /**
   * Resolve locator by key from a locator definition array:
   * [{ name: "usernameInput", selector: "[data-test='username']" }, ...]
   * @param {Array<{name: string, selector: string}>} locatorDefinitions
   * @param {string} key
   * @returns {import('@playwright/test').Locator}
   */
  locatorByKey(locatorDefinitions = [], key = "") {
    const entry = (locatorDefinitions || []).find((item) => item?.name === key);
    if (!entry?.selector) {
      throw new Error(`Locator '${key}' is not defined in page locatorDefinitions`);
    }
    return this.page.locator(entry.selector);
  }
}

export default BasePage;
