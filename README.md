# Playwright Cucumber Test Automation Framework

This repository contains a JavaScript Playwright + Cucumber automation framework for SauceDemo.

The first MVP baseline is intentionally focused:

- Cucumber feature files
- thin step definitions
- locator modules
- page objects
- reusable utilities
- Excel-backed test data
- runners and reports
- GitHub Copilot-compatible agent instructions

There are no AI npm scripts, no `src/ai` runtime, no LLM API clients, and no mock LLM plans.

## Commands

```bash
npm test
npm run test:smoke
npm run test:headed
npm run report
npm run clean
npm run mcp
npm run inspect
```

## Playwright MCP / Selector Validation

This repository is designed for an LLM-assisted workflow where the agent uses Playwright MCP as the browser interaction and exploration layer.

- Treat `npm run mcp` as the primary LLM/MCP locator creation and validation workflow.
- Prefer using the shared Playwright MCP browser session provided by the editor/agent integration instead of opening a separate generic browser page.
- Use MCP to inspect live page structure, generate locator candidates, and confirm selectors before updating locator modules.
- If your installed Playwright version supports a dedicated `mcp` command in the future, that is also acceptable.

```bash
npm run mcp
```

If the shared Playwright MCP browser session is unavailable, use the Playwright codegen fallback:

```bash
npx playwright codegen --target=javascript https://www.saucedemo.com/
```

Use the generated selectors to update `src/locators/*.js` and keep step definitions free of selectors.

Local MCP output is excluded from source control with `.gitignore`:

```gitignore
.playwright-mcp/
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
.github/
  copilot-instructions.md
  instructions/
  prompts/
  agents/

ai-demo/
  README.md
  runs/

features/
  login.feature
  step-definitions/
  support/

src/
  config/
  data/
  errors/
  locators/
  pages/
  runners/
  utils/
  index.js

user_story/
  us004-complete-checkout-for-selected-products.story.md
```

## Ownership Rules

- Locator modules own selectors.
- Page objects import locator modules and own workflows.
- Step definitions call page object methods.
- Utilities own reusable actions, waits, assertions, screenshots, logging, files, and reporting.

## Baseline Flow

The current live baseline is:

- `features/login.feature`
- `features/step-definitions/login.steps.js`
- `src/locators/LoginLocators.js`
- `src/pages/LoginPage.js`

## Agent Workflow

`.github/` is the single reusable agent/prompt/instruction layer.

`ai-demo/` is only for run evidence from actual AI-assisted demo runs.

The first MVP demo should be run through agent prompts, not fake npm commands.

## Runtime Output

Generated runtime output is not source:

- `src/reports/`
- `playwright-report/`
- `test-results/`
- `.playwright-mcp/`

Clean runtime output with:

```bash
npm run clean
```
