import path from "node:path";
import fs from "fs-extra";
import { FRAMEWORK_PATHS } from "./Constants.js";
import { LoggerUtils } from "./LoggerUtils.js";
import { ReportGenerationError } from "../errors/ReportGenerationError.js";

export class HtmlReportHelper {
  constructor(options = {}) {
    this.logger = options.logger || new LoggerUtils();
    this.outputDir = path.resolve(process.cwd(), FRAMEWORK_PATHS.HTML_REPORT_DIR);
  }

  async generate(summary, fileName = "summary.html") {
    try {
      await fs.ensureDir(this.outputDir);
      const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Execution Summary</title></head>
<body>
  <h1>Execution Summary</h1>
  <pre>${this.#escapeHtml(JSON.stringify(summary, null, 2))}</pre>
</body>
</html>`;
      const out = path.join(this.outputDir, fileName);
      await fs.writeFile(out, html, "utf-8");
      await this.logger.info(`HTML report generated: ${out}`);
      return out;
    } catch (error) {
      throw new ReportGenerationError("Failed to generate HTML report", { cause: error.message });
    }
  }

  #escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}

export default HtmlReportHelper;
