import { World } from "@cucumber/cucumber";
import { chromium, firefox, webkit } from "playwright";
import { TestConfig } from "../../src/config/TestConfig.js";
import { LoggerUtils } from "../../src/utils/LoggerUtils.js";
import { ScreenshotUtils } from "../../src/utils/ScreenshotUtils.js";
import { WaitUtils } from "../../src/utils/WaitUtils.js";
import { UIUtils } from "../../src/utils/UIUtils.js";
import { AssertionUtils } from "../../src/utils/AssertionUtils.js";
import { ExcelHelper } from "../../src/utils/ExcelHelper.js";

const browserMap = { chromium, firefox, webkit };

export class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.parameters = options.parameters;
    this.logger = new LoggerUtils();
    this.screenshotUtils = new ScreenshotUtils({ logger: this.logger });
    this.waitUtils = new WaitUtils({ logger: this.logger, screenshotUtils: this.screenshotUtils });
    this.excelHelper = new ExcelHelper({ logger: this.logger });
    this.browser = null;
    this.context = null;
    this.page = null;
    this.uiUtils = null;
    this.assertionUtils = null;
  }

  async initialize() {
    const launch = browserMap[TestConfig.browser] || chromium;
    this.browser = await launch.launch({ headless: !TestConfig.headed });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
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

  async dispose() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

export default CustomWorld;
