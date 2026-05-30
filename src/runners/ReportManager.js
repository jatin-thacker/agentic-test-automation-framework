import path from "node:path";
import fs from "fs-extra";
import { HtmlReportHelper } from "../utils/HtmlReportHelper.js";
import { DocxReportHelper } from "../utils/DocxReportHelper.js";
import actionLogStore from "../utils/ActionLogStore.js";
import { FileUtils } from "../utils/FileUtils.js";

export class ReportManager {
  constructor() {
    this.htmlReportHelper = new HtmlReportHelper();
    this.docxReportHelper = new DocxReportHelper();
  }

  async generate() {
    const logDir = path.resolve(process.cwd(), "src/reports/action-logs");
    const files = (await fs.pathExists(logDir))
      ? (await fs.readdir(logDir)).filter((f) => f.endsWith(".json")).sort()
      : [];
    const latestLogFile = files.length ? path.join(logDir, files[files.length - 1]) : null;
    const latestLogs = latestLogFile ? await FileUtils.readJson(latestLogFile, []) : actionLogStore.all();
    const summary = {
      generatedAt: new Date().toISOString(),
      totalLogs: latestLogs.length,
      failures: latestLogs.filter((l) => l.status === "FAILED").length
    };
    const htmlPath = await this.htmlReportHelper.generate(summary);
    const docxPath = await this.docxReportHelper.generate();
    const outPath = path.resolve(process.cwd(), "src/reports/execution-summary/summary.json");
    await fs.ensureDir(path.dirname(outPath));
    await fs.writeJson(
      outPath,
      {
        summary,
        htmlPath,
        docxPath,
        latestLogFile
      },
      { spaces: 2 }
    );
    return { htmlPath, docxPath, outPath };
  }
}

export default ReportManager;
