import path from "node:path";
import fs from "fs-extra";
import { DateUtils } from "./DateUtils.js";
import { FRAMEWORK_PATHS } from "./Constants.js";

export class LoggerUtils {
  /**
   * @param {object} [options]
   * @param {string} [options.logDir]
   */
  constructor(options = {}) {
    this.logDir = options.logDir || path.resolve(process.cwd(), FRAMEWORK_PATHS.ACTION_LOGS_DIR);
  }

  async info(message, metadata = {}) {
    await this.#log("INFO", message, metadata);
  }

  async warn(message, metadata = {}) {
    await this.#log("WARN", message, metadata);
  }

  async error(message, metadata = {}) {
    await this.#log("ERROR", message, metadata);
  }

  async debug(message, metadata = {}) {
    await this.#log("DEBUG", message, metadata);
  }

  async #log(level, message, metadata) {
    const record = {
      timestamp: DateUtils.nowIso(),
      level,
      message,
      metadata
    };
    const line = `[${record.timestamp}] [${level}] ${message}`;
    if (level === "ERROR") {
      console.error(line);
    } else if (level === "WARN") {
      console.warn(line);
    } else {
      console.log(line);
    }
    await fs.ensureDir(this.logDir);
    const filePath = path.join(this.logDir, "framework.log");
    await fs.appendFile(filePath, `${JSON.stringify(record)}\n`, "utf-8");
  }
}

export default LoggerUtils;
