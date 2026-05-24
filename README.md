# Playwright Cucumber Test Automation Framework

This repository contains a baseline Playwright + Cucumber automation framework for SauceDemo. It is intentionally focused on the executable framework: feature files, step definitions, page objects, shared utilities, configuration, runners, custom errors, test data, and reports.

Generated output such as `src/reports/`, `playwright-report/`, `test-results/`, and dependency folders such as `node_modules/` are runtime artifacts and can be excluded from architecture reviews.

## Commands

```bash
npm test
npm run test:smoke
npm run test:headed
npm run report
npm run clean
```

## Environment

Copy `.env.example` to `.env` and adjust values as needed:

```env
NODE_ENV=local
DEFAULT_BROWSER=chromium
HEADLESS=true
DEFAULT_TIMEOUT_MS=10000
ACTION_RETRY_COUNT=2
REPORT_OUTPUT_DIR=src/reports
```

Update `src/config/AppConfig.json` for the application name and base URL.

## Project Layout

```text
features/
  login.feature
  step-definitions/
    login.steps.js
  support/
    hooks.js
    world.js

src/
  config/
  data/
  errors/
  pages/
  runners/
  utils/
  index.js

user_story/
  *.story.md

ai-demo/
  context/
  inputs/
  run-template/
```

## Main Areas

| Area | Purpose |
|---|---|
| `features/` | Cucumber feature files, step definitions, and scenario support hooks. |
| `src/pages/` | Page objects that own selectors and page-specific workflows. |
| `src/utils/` | Reusable framework services for actions, waits, assertions, screenshots, logging, data, strings, dates, files, and HTML reports. |
| `src/runners/` | CLI entrypoints and orchestration for tests and report generation. |
| `src/errors/` | Framework-specific error classes used by utilities and runners. |
| `src/config/` | Environment, test, app, and report configuration. |
| `src/data/` | Excel-backed test data. |
| `user_story/` | Business/user-story source material for future test design. |
| `ai-demo/` | AI-readiness documentation, input templates, and run evidence templates. This is not runtime source. |

## Key Files

| File | Purpose |
|---|---|
| `features/login.feature` | Baseline SauceDemo login smoke scenario. |
| `features/step-definitions/login.steps.js` | Cucumber bindings for launch, login, and inventory verification. |
| `features/support/world.js` | Shared Cucumber world with Playwright page/context and helpers. |
| `features/support/hooks.js` | Scenario lifecycle setup, teardown, logging, and screenshots. |
| `src/pages/BasePage.js` | Base page object that wires common utilities. |
| `src/pages/LoginPage.js` | SauceDemo login selectors and login actions. |
| `src/runners/RunManager.js` | Runs Cucumber with optional tags/headed mode. |
| `src/runners/test-runner.js` | CLI wrapper for headed test execution. |
| `src/runners/ReportManager.js` | Builds execution summaries from action logs. |
| `src/runners/report-runner.js` | CLI wrapper for report generation. |

## Utilities

| Utility | Purpose |
|---|---|
| `ActionLogStore.js` | In-memory action log store with JSON flush support. |
| `AssertionUtils.js` | Playwright assertions with logging and screenshots on failure. |
| `Constants.js` | Shared action statuses, action types, and framework paths. |
| `DataMaskingUtils.js` | Masks sensitive values before logging. |
| `DateUtils.js` | Timestamp helpers for logs and file names. |
| `ExcelHelper.js` | Reads test data from Excel workbooks. |
| `FileUtils.js` | JSON and file-system helpers. |
| `HtmlReportHelper.js` | Writes HTML report output. |
| `LoggerUtils.js` | Structured console/file logging. |
| `ScreenshotUtils.js` | Screenshot capture with action log entries. |
| `StringUtils.js` | String normalization and safe file-name helpers. |
| `UIUtils.js` | Logged browser interactions such as navigation, typing, clicking, selecting, and waits. |
| `WaitUtils.js` | Explicit wait helpers with action logging. |

## Errors

| Error | Used For |
|---|---|
| `FrameworkError.js` | Base framework error with metadata support. |
| `AssertionFrameworkError.js` | Assertion failures wrapped with framework context. |
| `ExcelDataError.js` | Excel data lookup/read failures. |
| `ReportGenerationError.js` | Report creation failures. |
| `UIActionError.js` | Browser interaction failures. |
| `WaitError.js` | Explicit wait failures. |

## Runtime Output

The framework writes runtime output under `src/reports/`, including action logs, screenshots, Cucumber JSON, HTML reports, and execution summaries. These folders are generated artifacts and can be cleaned with:

```bash
npm run clean
```

## AI-Readiness

This repository is prepared for future AI-assisted generation through documentation and templates only:

- `AGENTS.md` defines permanent coding-agent rules.
- `ai-demo/context/` explains framework structure, generation rules, execution rules, reporting expectations, and demo positioning.
- `ai-demo/inputs/` provides templates for future story, prompt, and URL inputs.
- `ai-demo/run-template/` provides placeholders for future run evidence.

Current capability is still the normal Playwright + Cucumber framework commands listed above. There are no AI npm commands, LLM API clients, mock LLM plans, or `src/ai` runtime modules in this MVP.

## Framework Rules

- Page objects own their selectors and page-specific behavior.
- Step definitions should stay thin and delegate browser behavior to page objects.
- Shared interaction behavior belongs in `src/utils/`.
- Framework-specific failures should use `src/errors/`.
- Configuration belongs in `src/config/`.
- Test data belongs in `src/data/`.
- Runtime output belongs under `src/reports/` and should not drive source architecture.
