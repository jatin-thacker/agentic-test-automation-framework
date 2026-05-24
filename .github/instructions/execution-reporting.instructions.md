---
applyTo: "package.json,src/runners/**/*.js,src/utils/**/*.js,ai-demo/**/*.md"
---

# Execution And Reporting Rules

- Inspect `package.json`.
- Use existing npm scripts.
- Suggested commands may include:
  - `npm test`
  - `npm run test:smoke`
  - `npm run test:headed`
  - `npm run report`
  - `npm run clean`
- Classify failures as:
  - selector issue
  - wait issue
  - step binding issue
  - test data issue
  - framework misuse
  - environment issue
- Fix only high-confidence generated-code failures.
- Do not fabricate passing results.
- Write evidence under `ai-demo/runs/<timestamp>/`.
