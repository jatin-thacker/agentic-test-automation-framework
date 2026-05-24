# Repository Instructions

## Framework Identity

- This is a JavaScript Playwright + Cucumber automation framework.
- The framework uses Page Object Model, Excel-backed test data, action logging, screenshots, custom errors, and HTML/JSON reports.
- Do not create a new automation framework.

## Source Conventions

- Feature files live under `features/`.
- Step definitions live under `features/step-definitions/`.
- Support hooks and world setup live under `features/support/`.
- Page objects live under `src/pages/`.
- Utilities live under `src/utils/`.
- Test data lives under `src/data/`.
- Runners live under `src/runners/`.

## Generation Rules

- Do not create Playwright `.spec.js` files unless explicitly requested.
- Prefer Cucumber feature files, thin step definitions, and page objects.
- Step definitions must call page object methods.
- Page objects must own selectors and page-specific workflows.
- Reuse `BasePage.js` and existing utilities for UI actions, waits, assertions, screenshots, logging, Excel data, and reports.
- Do not bypass framework utilities.

## AI-Specific Rules

- Do not add LLM API plumbing.
- Do not add fake AI npm scripts.
- Do not create mock LLM plans.
- Do not create `src/ai` runtime code unless explicitly requested later.
- Use `ai-demo/` only for AI-readiness documentation, templates, and run evidence.

## Verification Rules

- Inspect `package.json` before choosing commands.
- Run existing tests after source-code changes.
- Generate a report if test execution happened.
- Summarize files changed, commands run, pass/fail status, and limitations.
