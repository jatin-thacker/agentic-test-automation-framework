# Lightweight BDD Demo Framework

This repository is a lightweight JavaScript automation framework using:

- Playwright
- Playwright MCP (`@playwright/mcp`) for agentic browser navigation
- Cucumber
- Page Object Model
- Locator classes
- Shared utilities
- Excel test data

## Test flow

`feature` -> `step definition` -> `page object` -> `locator + utils` -> `reports`

## Project structure

```text
features/
  *.feature
  step-definitions/
  support/

src/
  agentic/
  config/
  data/
  errors/
  locators/
  pages/
  reports/
  runners/
  utils/

user_story/
  *.story.md
```

## Setup

1. `npm install`
2. `copy .env.example .env` (Windows) or `cp .env.example .env`
3. `npx playwright install`
4. `npm test`

## Scripts

- `npm run clean`
- `npm run agent:from-story`
- `npm run agent:review`
- `npm run agent:apply`
- `npm run agent:command -- /help`
- `npm test`
- `npm run test:smoke`
- `npm run test:headed`
- `npm run report`

## Demo scenario included

- `features/login.feature`
- Step definitions read rows from `src/data/TestData.xlsx`
- Page actions are implemented in `src/pages/LoginPage.js`
- Selectors live in `src/locators/LoginLocators.js`

## Story inputs

- You can run the agentic pipeline with stories from:
  - `src/agentic/mock-data/`
  - `user_story/` (end-to-end sample stories)
- Example:
  - `npm run agent:from-story -- user_story/login-and-logout-flow.story.md`

## Agentic flow (optional layer)

1. User story is parsed.
2. Framework conventions are inspected.
3. Playwright MCP launches the app and creates a story-intent navigation trace (page metadata, interactive discovery, and action execution trace).
4. Artifacts are mapped into `features`, `steps`, `pages`, and `locators`.
5. Validation + GitHub CLI workflow draft + LinkedIn draft are generated.
6. Optional: inject an external `actionPlanner` dependency into `AppNavigatorAgent` for prompt/LLM-driven action planning.

## Playwright MCP only

- The project uses one MCP client path: `PlaywrightMCPClient`.
- There is no mock mode and no real-vs-mock switch.
- Configure MCP args in `.env` with `PLAYWRIGHT_MCP_ARGS`.
- Optional override: set `PLAYWRIGHT_MCP_COMMAND` only if your environment needs a custom command.
- Local MCP runtime logs are written under `.playwright-mcp/`.
