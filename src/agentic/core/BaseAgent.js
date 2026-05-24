import { DateUtils } from "../../utils/DateUtils.js";
import { LoggerUtils } from "../../utils/LoggerUtils.js";

export class BaseAgent {
  constructor(name, deps = {}) {
    this.name = name;
    this.logger = deps.logger || new LoggerUtils();
    this.deps = deps;
  }

  async run(input = {}, context = {}, options = {}) {
    const startedAt = DateUtils.nowIso();
    await this.logger.info(`[${this.name}] started`);
    try {
      const data = await this.execute(input, context, options);
      const finishedAt = DateUtils.nowIso();
      await this.logger.info(`[${this.name}] completed`);
      return {
        agent: this.name,
        status: "passed",
        startedAt,
        finishedAt,
        data
      };
    } catch (error) {
      const finishedAt = DateUtils.nowIso();
      await this.logger.error(`[${this.name}] failed`, { error: error.message });
      return {
        agent: this.name,
        status: "failed",
        startedAt,
        finishedAt,
        error: error.message,
        data: null
      };
    }
  }

  async execute() {
    throw new Error(`${this.name}.execute(input, context, options) must be implemented`);
  }
}

export default BaseAgent;
