# Architecture

## Overview

This is a Playwright + Cucumber test automation framework with page objects, reusable utilities, Excel-backed test data, framework-specific errors, test/report runners, and generated execution reports.

The current executable baseline is the SauceDemo login smoke test. Runtime output and dependencies, including `src/reports/`, `playwright-report/`, `test-results/`, and `node_modules/`, are excluded from the source architecture.

## Source Structure

| Path | Purpose |
|---|---|
| `features/` | Cucumber feature files, step definitions, and support hooks. |
| `src/config/` | Environment, application, test, and report configuration. |
| `src/data/` | Test data assets such as `TestData.xlsx`. |
| `src/errors/` | Custom framework error types. |
| `src/pages/` | Page object model classes. |
| `src/runners/` | Test and report command orchestration. |
| `src/utils/` | Shared framework utilities. |
| `src/index.js` | Public module exports. |
| `user_story/` | User-story documents for future test coverage planning. |
| `ai-demo/` | Documentation and templates for future AI-assisted runs; not executable runtime code. |

## Test Layer

| Path | Purpose |
|---|---|
| `features/login.feature` | Defines the baseline login smoke scenario. |
| `features/step-definitions/login.steps.js` | Maps Gherkin steps to page-object calls and data lookup. |
| `features/support/world.js` | Creates shared scenario context, including browser/page helpers. |
| `features/support/hooks.js` | Manages scenario setup/teardown, screenshots, and action-log flushing. |

## Page Layer

| Path | Purpose |
|---|---|
| `src/pages/BasePage.js` | Wires logger, screenshots, waits, UI actions, and assertions into page objects. |
| `src/pages/LoginPage.js` | Owns SauceDemo login selectors, login actions, and inventory-page assertion. |

Page objects are the home for selectors and page-specific workflows. Step definitions should call page methods instead of directly operating on Playwright locators.

## Runner Layer

| Path | Purpose |
|---|---|
| `src/runners/RunManager.js` | Runs Cucumber through local binaries or `npx`, with tag and headed-mode support. |
| `src/runners/test-runner.js` | CLI entrypoint for headed test execution. |
| `src/runners/ReportManager.js` | Reads latest action logs and writes execution-summary JSON plus HTML report output. |
| `src/runners/report-runner.js` | CLI entrypoint for report generation. |

Public commands:

- `npm test`
- `npm run test:smoke`
- `npm run test:headed`
- `npm run report`
- `npm run clean`

## Utility Layer

| Path | Purpose |
|---|---|
| `src/utils/ActionLogStore.js` | Stores action log events in memory and flushes them to JSON. |
| `src/utils/AssertionUtils.js` | Wraps Playwright assertions with logging and failure screenshots. |
| `src/utils/Constants.js` | Defines action statuses, action types, and framework output paths. |
| `src/utils/DataMaskingUtils.js` | Masks sensitive values before log output. |
| `src/utils/DateUtils.js` | Provides ISO timestamps and path-safe timestamp strings. |
| `src/utils/ExcelHelper.js` | Reads named rows from Excel test data. |
| `src/utils/FileUtils.js` | Provides JSON/file read and write helpers. |
| `src/utils/HtmlReportHelper.js` | Generates HTML report files. |
| `src/utils/LoggerUtils.js` | Writes structured framework logs. |
| `src/utils/ScreenshotUtils.js` | Captures screenshots and records screenshot actions. |
| `src/utils/StringUtils.js` | Sanitizes strings and file names. |
| `src/utils/UIUtils.js` | Provides logged navigation and browser interaction helpers. |
| `src/utils/WaitUtils.js` | Provides logged explicit wait helpers. |

## Error Layer

| Path | Purpose |
|---|---|
| `src/errors/FrameworkError.js` | Base custom error with metadata. |
| `src/errors/AssertionFrameworkError.js` | Assertion failure wrapper. |
| `src/errors/ExcelDataError.js` | Excel/test-data failure wrapper. |
| `src/errors/ReportGenerationError.js` | Report generation failure wrapper. |
| `src/errors/UIActionError.js` | UI interaction failure wrapper. |
| `src/errors/WaitError.js` | Wait failure wrapper. |

## Configuration And Data

| Path | Purpose |
|---|---|
| `src/config/AppConfig.js` | Loads app configuration. |
| `src/config/AppConfig.json` | Stores application name and base URL. |
| `src/config/EnvironmentConfig.js` | Reads environment variables. |
| `src/config/ReportConfig.js` | Stores report configuration. |
| `src/config/TestConfig.js` | Stores browser/headless/timeout/retry settings. |
| `src/data/TestData.xlsx` | Excel data used by the login scenario. |

## AI-Readiness Layer

| Path | Purpose |
|---|---|
| `AGENTS.md` | Repo-level instructions for Codex and other coding agents. |
| `ai-demo/context/framework-map.md` | Current framework map and baseline scenario notes. |
| `ai-demo/context/framework-rules.md` | Hard rules for generated automation. |
| `ai-demo/context/generation-contract.md` | Allowed and forbidden future generated outputs. |
| `ai-demo/context/execution-contract.md` | Verification flow for future AI-assisted runs. |
| `ai-demo/context/reporting-contract.md` | Required content for future run reports. |
| `ai-demo/context/demo-positioning.md` | Demo-safe positioning language. |
| `ai-demo/inputs/` | Input templates for stories, prompts, and URLs. |
| `ai-demo/run-template/` | Placeholder evidence files for future generation runs. |

This layer is intentionally non-executable. It does not add AI npm scripts, LLM clients, mock plans, or runtime generation code.

## Runtime Flow

1. A command such as `npm run test:smoke` starts Cucumber.
2. Cucumber support code creates the Playwright browser context and scenario world.
3. `login.steps.js` reads test data and delegates behavior to `LoginPage`.
4. `LoginPage` calls shared utilities from `BasePage`.
5. Utilities log actions, wait for elements, perform UI operations, assert outcomes, and capture screenshots on failure.
6. Hooks flush action logs under `src/reports/action-logs/`.
7. `npm run report` reads the latest action log and writes `src/reports/execution-summary/summary.json` and `src/reports/html-report/summary.html`.

## Excluded From Source Architecture

- `node_modules/`
- `src/reports/`
- `playwright-report/`
- `test-results/`
- temporary screenshots, traces, logs, summaries, and other generated runtime artifacts

These paths can be regenerated and should not be treated as framework source.
