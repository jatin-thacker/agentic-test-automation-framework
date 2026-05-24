# Repository Instructions

## Framework Identity

- This is a JavaScript Playwright + Cucumber automation framework.
- The framework uses Page Object Model, locator modules, Excel-backed test data, action logging, screenshots, custom errors, and HTML/JSON reports.
- Do not create a new automation framework.

## Source Conventions

- Feature files live under `features/`.
- Step definitions live under `features/step-definitions/`.
- Support hooks and world setup live under `features/support/`.
- Locator modules live under `src/locators/`.
- Page objects live under `src/pages/`.
- Utilities live under `src/utils/`.
- Test data lives under `src/data/`.
- Runners live under `src/runners/`.

## Ownership Rules

- Locator modules own selectors.
- Page objects import locator modules and own page workflows.
- Step definitions call page object methods.
- Utilities own common actions, waits, assertions, screenshots, logging, files, and reporting.
- Do not place selectors directly in step definitions.
- Avoid placing selectors directly in page objects unless there is a documented exception.

## Generation Rules

- Do not create Playwright `.spec.js` files unless explicitly requested.
- Prefer Cucumber feature files, thin step definitions, locator modules, and page objects.
- Generated automation must create or update locator files when new pages or UI elements are introduced.
- Reuse `BasePage.js` and existing utilities for UI actions, waits, assertions, screenshots, logging, Excel data, and reports.
- Do not bypass framework utilities.

## AI-Specific Rules

- Do not add LLM API plumbing.
- Do not add fake AI npm scripts.
- Do not create mock LLM plans.
- Do not create `src/ai` runtime code.
- `.github/` is the reusable agent/prompt/instruction layer.
- `ai-demo/` is only for generated run evidence.
- The LLM/MCP interaction model is expressed through prompts, agent instructions, and manual MCP sessions, not repo runtime code.

## Verification Rules

- Inspect `package.json` before choosing commands.
- Run existing tests after source-code changes.
- Generate a report only when test execution happened and report evidence is needed.
- Summarize files changed, commands run, pass/fail status, and limitations.
