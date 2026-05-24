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
}

export default BasePage;
