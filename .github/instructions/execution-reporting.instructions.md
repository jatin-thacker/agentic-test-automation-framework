---
applyTo: "package.json,src/runners/**/*.js,src/utils/**/*.js,ai-demo/**/*.md"
---

# Execution and Reporting Rules

- Inspect `package.json` before recommending or running commands.
- Use existing npm scripts such as:
  - `npm test`
  - `npm run test:smoke`
  - `npm run test:headed`
  - `npm run report`
  - `npm run clean`
- Do not invent new runner commands or scripts.
- Record execution evidence under `ai-demo/runs/<timestamp>/`.
- Do not claim execution happened unless command output, logs, or artifacts are provided.
- Do not fabricate pass/fail status, coverage, defect counts, or screenshots.
- Classify failures as:
  - selector issue
  - wait/timing issue
  - step binding issue
  - test data issue
  - framework misuse
  - environment issue
  - application defect
- Fix only high-confidence generated-code failures.
- Preserve original test intent and avoid masking real defects.
- Report evidence locations and remaining risk explicitly.
