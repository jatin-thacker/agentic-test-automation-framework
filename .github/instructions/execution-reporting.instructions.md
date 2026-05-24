---
applyTo: "package.json,src/runners/**/*.js,src/utils/**/*.js,ai-demo/**/*.md"
---

# Execution And Reporting Rules

- Inspect `package.json` before selecting commands.
- Current useful commands are `npm test`, `npm run test:smoke`, `npm run test:headed`, `npm run report`, and `npm run clean`.
- If source code changes, run relevant tests.
- If tests run, run `npm run report` when practical.
- Capture command results in `ai-demo/runs/<timestamp>/` during actual demo generation.
- Classify failures as selector, wait, step binding, test data, framework misuse, or environment issues.
- Fix only high-confidence generated-code failures.
- Do not hide, delete, or fabricate failures.
