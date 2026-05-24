export const ACTION_STATUS = Object.freeze({
  STARTED: "STARTED",
  PASSED: "PASSED",
  FAILED: "FAILED"
});

export const ACTION_TYPES = Object.freeze({
  CLICK: "CLICK",
  TYPE: "TYPE",
  FILL: "FILL",
  SELECT: "SELECT",
  CHECK: "CHECK",
  WAIT: "WAIT",
  ASSERTION: "ASSERTION",
  SCREENSHOT: "SCREENSHOT",
  EXCEL: "EXCEL",
  NAVIGATION: "NAVIGATION",
  REPORT: "REPORT",
  ERROR: "ERROR"
});

export const FRAMEWORK_PATHS = Object.freeze({
  REPORTS_DIR: "src/reports",
  ACTION_LOGS_DIR: "src/reports/action-logs",
  SCREENSHOTS_DIR: "src/reports/screenshots",
  HTML_REPORT_DIR: "src/reports/html-report"
});

export default {
  ACTION_STATUS,
  ACTION_TYPES,
  FRAMEWORK_PATHS
};
