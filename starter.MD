# Starter Guide

This guide gets you from a fresh clone to the current Playwright + Cucumber framework workflow.

## 1. Install Dependencies

```bash
npm install
```

## 2. Install Playwright Browsers

```bash
npx playwright install
```

## 3. Configure Environment

Copy the example environment file:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Update these files as needed:

- `.env`
- `src/config/AppConfig.json`

Current environment settings include browser, headless mode, timeout, retry count, and report output directory.

## 4. Run Baseline Tests

Run the full Cucumber suite:

```bash
npm test
```

Run smoke tests only:

```bash
npm run test:smoke
```

Run headed mode:

```bash
npm run test:headed
```

## 5. Generate Report

After a test run, generate the framework report:

```bash
npm run report
```

Report output is written under `src/reports/`.

## 6. Clean Runtime Artifacts

Clean generated reports and test artifacts:

```bash
npm run clean
```

This removes generated runtime output such as `src/reports/`, `playwright-report/`, and `test-results/`.

## 7. AI-Readiness Files

This repo is prepared for future AI-assisted automation work through documentation and templates only:

- `AGENTS.md` contains repo rules for Codex and other coding agents.
- `ai-demo/context/` explains the framework map, rules, generation contract, execution contract, reporting contract, and demo positioning.
- `ai-demo/inputs/` provides story, prompt, and URL input templates.
- `ai-demo/run-template/` provides placeholder run evidence files for future AI-assisted generation runs.

## 8. Current AI Capability Boundary

There are currently no AI npm commands, no LLM API clients, no mock LLM plans, and no `src/ai` runtime in this framework.

Future AI-assisted work should use the existing framework files directly: Cucumber features, thin step definitions, page objects, utilities, runners, reports, and the `ai-demo/` documentation/templates.
