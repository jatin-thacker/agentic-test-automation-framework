module.exports = {
  default: [
    "--import features/support/**/*.js",
    "--import features/step-definitions/**/*.js",
    "--format progress",
    "--format json:src/reports/cucumber-json/cucumber-report.json",
    "features/**/*.feature"
  ].join(" ")
};
