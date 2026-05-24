import path from "node:path";
import fs from "fs-extra";
import actionLogStore from "./ActionLogStore.js";
import { ACTION_STATUS, ACTION_TYPES, FRAMEWORK_PATHS } from "./Constants.js";
import { DateUtils } from "./DateUtils.js";
import { StringUtils } from "./StringUtils.js";
import { LoggerUtils } from "./LoggerUtils.js";

export class ScreenshotUtils {
  /**
   * @param {object} [options]
   * @param {LoggerUtils} [options.logger]
   */
  constructor(options = {}) {
    this.logger = options.logger || new LoggerUtils();
    this.outputDir = path.resolve(process.cwd(), FRAMEWORK_PATHS.SCREENSHOTS_DIR);
  }

  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @param {object} [context]
   */
  async captureScreenshotWithLog(page, name, context = {}) {
    const safeName = StringUtils.sanitizeFileName(name || "screenshot");
    const fileName = `${DateUtils.timestampForPath()}-${safeName}.png`;
    const filePath = path.join(this.outputDir, fileName);
    await this.logger.info(`Capturing screenshot: ${name}`, context);
    actionLogStore.add({
      timestamp: DateUtils.nowIso(),
      actionType: ACTION_TYPES.SCREENSHOT,
      description: `Capture screenshot: ${name}`,
      status: ACTION_STATUS.STARTED,
      scenarioName: context.scenarioName,
      stepName: context.stepName
    });
    await fs.ensureDir(this.outputDir);
    await page.screenshot({ path: filePath, fullPage: true });
    actionLogStore.add({
      timestamp: DateUtils.nowIso(),
      actionType: ACTION_TYPES.SCREENSHOT,
      description: `Screenshot captured: ${name}`,
      status: ACTION_STATUS.PASSED,
      screenshotPath: filePath,
      scenarioName: context.scenarioName,
      stepName: context.stepName
    });
    return filePath;
  }
}

export default ScreenshotUtils;
