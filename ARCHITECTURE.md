# Architecture

## Overview

This is a Playwright + Cucumber test automation framework with page objects, reusable utilities, Excel-backed test data, and report generation.

The current baseline focuses on a SauceDemo login smoke test. The previous generation layer has been removed so the framework can be restarted from a clean foundation.

## Core Modules

| Path | Purpose |
|---|---|
| `features/login.feature` | Baseline login smoke scenario. |
| `features/step-definitions/login.steps.js` | Cucumber step bindings for login. |
| `features/support/world.js` | Cucumber world setup for browser/page/test helpers. |
| `features/support/hooks.js` | Browser lifecycle and scenario hooks. |
| `src/pages/BasePage.js` | Shared page object helpers. |
| `src/pages/LoginPage.js` | Login page object and selectors. |
| `src/runners/test-runner.js` | CLI runner for headed/headless test execution. |
| `src/runners/RunManager.js` | Test execution orchestration. |
| `src/runners/ReportManager.js` | Report summary generation. |
| `src/runners/report-runner.js` | Report CLI entrypoint. |
| `src/utils/` | Logging, waits, assertions, screenshots, Excel data, and file helpers. |
| `src/config/` | Runtime and application configuration. |

## Test Flow

1. Cucumber loads feature files from `features/`.
2. Support hooks create and close the Playwright browser context.
3. Step definitions call page objects.
4. Page objects use shared utilities for actions, waits, assertions, and screenshots.
5. Reports and action logs are written under `src/reports/`.

## Public Commands

- `npm test`
- `npm run test:smoke`
- `npm run test:headed`
- `npm run report`
- `npm run clean`

## Framework Rules

- Page objects own their selectors and page-specific behavior.
- Step definitions should stay thin and delegate browser behavior to page objects.
- Shared interaction behavior belongs in `src/utils/`.
- Configuration belongs in `src/config/`.
- Test data belongs in `src/data/`.
