import path from "node:path";
import fs from "fs-extra";
import BaseAgent from "../core/BaseAgent.js";

export class FrameworkContextAgent extends BaseAgent {
  constructor(deps = {}) {
    super("FrameworkContextAgent", deps);
  }

  async execute() {
    const root = process.cwd();
    const conventions = {
      featureDir: "features",
      stepDefinitionsDir: "features/step-definitions",
      supportDir: "features/support",
      pageDir: "src/pages",
      locatorDir: "src/locators",
      utilsDir: "src/utils",
      dataDir: "src/data",
      reportDir: "src/reports"
    };

    const context = {
      conventions,
      existing: {
        features: await this.#listFiles(path.join(root, conventions.featureDir), ".feature"),
        stepDefinitions: await this.#listFiles(path.join(root, conventions.stepDefinitionsDir), ".js"),
        pages: await this.#listFiles(path.join(root, conventions.pageDir), ".js"),
        locators: await this.#listFiles(path.join(root, conventions.locatorDir), ".js")
      },
      namingRules: {
        pageClassSuffix: "Page",
        locatorClassSuffix: "Locators",
        stepFileSuffix: ".steps.js"
      }
    };

    return context;
  }

  async #listFiles(dirPath, extension) {
    if (!(await fs.pathExists(dirPath))) return [];
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    return files
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name)
      .sort();
  }
}

export default FrameworkContextAgent;
