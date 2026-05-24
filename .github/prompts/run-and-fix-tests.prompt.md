---
mode: agent
description: Run framework tests after generation, classify failures, and fix high-confidence generated-code issues.
---

# /run-and-fix-tests

Use this prompt after framework-compatible automation has been generated.

## Instructions

1. Read `AGENTS.md`.
2. Read `ai-demo/context/execution-contract.md` and `reporting-contract.md`.
3. Inspect `package.json`.
4. Run relevant existing commands, usually:
   - `npm test`
   - `npm run test:smoke` if smoke coverage matters
   - `npm run report` after test execution
5. If failures occur, classify them as selector, wait, step binding, test data, framework misuse, or environment issues.
6. Fix only high-confidence generated-code failures.
7. Rerun relevant commands after fixes.
8. Do not hide or fabricate failures.
9. Update `ai-demo/runs/<timestamp>/execution-result.md`, `failure-analysis.md`, and `fix-summary.md`.

## Output

- Commands run.
- Pass/fail status.
- Failures found.
- Fixes applied.
- Remaining limitations.
