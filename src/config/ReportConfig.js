import path from "node:path";
import EnvironmentConfig from "./EnvironmentConfig.js";

const root = EnvironmentConfig.get("REPORT_OUTPUT_DIR", "src/reports");

export const ReportConfig = Object.freeze({
  rootDir: path.resolve(process.cwd(), root),
  screenshotsDir: path.resolve(process.cwd(), `${root}/screenshots`),
  cucumberJsonDir: path.resolve(process.cwd(), `${root}/cucumber-json`),
  htmlReportDir: path.resolve(process.cwd(), `${root}/html-report`),
  actionLogDir: path.resolve(process.cwd(), `${root}/action-logs`),
  executionSummaryDir: path.resolve(process.cwd(), `${root}/execution-summary`)
});

export default ReportConfig;
