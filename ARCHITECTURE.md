# Architecture

## Overview

This is a JavaScript Playwright + Cucumber test automation framework with Cucumber features, thin step definitions, locator modules, page objects, reusable utilities, Excel-backed test data, custom errors, runners, and generated reports.

The current executable baseline is the SauceDemo login smoke test. Runtime output and dependencies, including `src/reports/`, `playwright-report/`, `test-results/`, `.playwright-mcp/`, and `node_modules/`, are excluded from the source architecture.

## Source Structure

| Path | Purpose |
|---|---|
| `features/` | Cucumber feature files. |
| `features/step-definitions/` | Thin Cucumber step bindings. |
| `features/support/` | Cucumber world and hooks. |
| `src/config/` | Environment, application, test, and report configuration. |
| `src/data/` | Test data assets such as `TestData.xlsx`. |
| `src/errors/` | Custom framework error types. |
| `src/locators/` | Selector ownership layer. This folder is mandatory and should not be empty. |
| `src/pages/` | Page object model classes and page workflows. |
| `src/runners/` | Test and report command orchestration. |
| `src/utils/` | Shared framework utilities. |
| `src/index.js` | Public module exports. |
| `user_story/` | Selected MVP story input for the first demo. |
| `.github/` | Reusable agent, prompt, and instruction layer. |
| `ai-demo/` | Evidence-only folder for actual AI-assisted demo runs. |

## Ownership Model

```text
feature file
  -> step definition
    -> page object method
      -> locator file selector
        -> BasePage / UI utils / assertion utils / wait utils
```

- Locator modules own selectors.
- Page objects import locator modules and implement page-specific workflows.
- Step definitions call page object methods and should avoid direct locator usage.
- Selectors should not be duplicated inside page objects.

## Current Baseline

| Path | Purpose |
|---|---|
| `features/login.feature` | SauceDemo login smoke scenario. |
| `features/step-definitions/login.steps.js` | Cucumber bindings for launch, login, and inventory verification. |
| `src/locators/LoginLocators.js` | Login and inventory visibility selectors. |
| `src/pages/LoginPage.js` | Login page workflows using `LoginLocators`. |
| `src/data/TestData.xlsx` | Login test data used by the `StandardUser` row. |

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
| `src/utils/ActionLogStore.js` | Stores action log events and flushes them to JSON. |
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

## Agent Workflow Layer

`.github/` is the single reusable agent/prompt/instruction layer:

- `.github/copilot-instructions.md`
- `.github/instructions/`
- `.github/prompts/`
- `.github/agents/`

`ai-demo/` is not an instruction source. It stores only run evidence under `ai-demo/runs/<timestamp>/`.

## Excluded From Source Architecture

- `node_modules/`
- `src/reports/`
- `playwright-report/`
- `test-results/`
- `.playwright-mcp/`
- zip exports and other temporary runtime artifacts
