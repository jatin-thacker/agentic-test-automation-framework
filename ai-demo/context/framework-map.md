# Framework Map

This document maps the current framework source structure for future AI-assisted work. It describes what exists today and should not be treated as a request to create new runtime modules.

## Source Folders

| Path | Purpose |
|---|---|
| `features/` | Cucumber feature files. The current baseline is `features/login.feature`. |
| `features/step-definitions/` | Cucumber JavaScript step bindings. Step definitions should remain thin and delegate behavior to page objects. |
| `features/support/` | Cucumber support code, including Playwright browser lifecycle, custom world setup, screenshots, and action-log flushing. |
| `src/config/` | Environment, test, app, and report configuration. |
| `src/data/` | Test data assets, currently including `TestData.xlsx` for login data. |
| `src/errors/` | Custom framework error classes used by utilities to wrap assertion, wait, UI, report, and Excel-data failures. |
| `src/pages/` | Page Object Model classes. `BasePage.js` wires common utilities, and `LoginPage.js` owns the baseline login flow. |
| `src/runners/` | Test and report command orchestration. |
| `src/utils/` | Reusable helpers for UI actions, waits, assertions, screenshots, logging, Excel, files, strings, dates, and HTML reports. |
| `user_story/` | Business story documents that can be used as future AI-assisted generation input. |

## Current Baseline Scenario

The current executable baseline is the SauceDemo login smoke scenario:

- Feature: `features/login.feature`
- Steps: `features/step-definitions/login.steps.js`
- Page object: `src/pages/LoginPage.js`
- Test data: `src/data/TestData.xlsx`

The baseline opens SauceDemo, logs in with the `StandardUser` Excel row, and verifies that the inventory page is visible.

## Runtime Output

Runtime artifacts are generated under `src/reports/`, `playwright-report/`, and `test-results/`. These folders are not source architecture and should not be used as design input except when analyzing execution results.
