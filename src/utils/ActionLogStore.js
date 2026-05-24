import path from "node:path";
import fs from "fs-extra";
import { FRAMEWORK_PATHS } from "./Constants.js";
import { DateUtils } from "./DateUtils.js";

/**
 * @typedef {object} ActionLog
 * @property {string} timestamp
 * @property {string} [scenarioName]
 * @property {string} [stepName]
 * @property {string} actionType
 * @property {string} description
 * @property {string} [elementName]
 * @property {"STARTED"|"PASSED"|"FAILED"} status
 * @property {string} [screenshotPath]
 * @property {string} [errorMessage]
 */

export class ActionLogStore {
  constructor() {
    this.logs = [];
    this.outputDir = path.resolve(process.cwd(), FRAMEWORK_PATHS.ACTION_LOGS_DIR);
  }

  /**
   * @param {ActionLog} log
   */
  add(log) {
    this.logs.push(log);
  }

  all() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }

  async flush(fileName = `action-log-${DateUtils.timestampForPath()}.json`) {
    await fs.ensureDir(this.outputDir);
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeJson(filePath, this.logs, { spaces: 2 });
    return filePath;
  }
}

const actionLogStore = new ActionLogStore();
export default actionLogStore;
