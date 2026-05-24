# Copilot Repository Instructions

This repository is a JavaScript Playwright + Cucumber automation framework. Use the existing framework; do not create a new one.

## Always Follow

- JavaScript only.
- Cucumber first: feature files go in `features/`, step definitions go in `features/step-definitions/`.
- Do not create Playwright `.spec.js` files unless explicitly requested.
- Step definitions must stay thin and call page object methods.
- Page objects live in `src/pages/` and own selectors plus page-specific workflows.
- Reuse `src/pages/BasePage.js`.
- Reuse existing utilities for UI actions, waits, assertions, screenshots, logging, Excel data, files, and reports.
- Keep the existing login smoke test working.
- Treat `src/reports/`, `playwright-report/`, `test-results/`, and `node_modules/` as generated/runtime artifacts, not source.

## Do Not Add

- LLM API clients or keys.
- Mock LLM plans.
- Fake AI npm scripts.
- `src/ai` runtime code.
- New framework architecture.
- Unnecessary dependencies.

## Read Before AI-Assisted Work

- `AGENTS.md`
- `ai-demo/context/framework-map.md`
- `ai-demo/context/framework-rules.md`
- `ai-demo/context/generation-contract.md`
- `ai-demo/context/execution-contract.md`
- `ai-demo/context/reporting-contract.md`
- `ai-demo/context/demo-positioning.md`

Use `ai-demo/` only for AI-readiness docs, prompt inputs, templates, and future run evidence.
