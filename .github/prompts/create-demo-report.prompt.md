---
mode: agent
description: Create the final AI-assisted demo report after design, generation, execution, and fixes.
---

# /create-demo-report

Use this prompt after an AI-assisted generation run has execution evidence.

## Instructions

1. Read `AGENTS.md`.
2. Read `ai-demo/context/reporting-contract.md` and `demo-positioning.md`.
3. Read the active `ai-demo/runs/<timestamp>/` evidence files.
4. Create or update `ai-demo/runs/<timestamp>/final-demo-report.md`.
5. Use practical language and do not exaggerate.
6. Use the framing: AI-assisted Playwright automation accelerator built on top of an existing enterprise-style QA framework.
7. Do not claim fully autonomous AI test engineer.

## Required Report Sections

- Story or prompt used.
- Test cases generated.
- UI exploration notes.
- Files proposed or changed.
- Commands run.
- Execution result.
- Failures found.
- Fixes applied.
- Screenshots/report locations when available.
- Known limitations.
- Human-review summary.
- LinkedIn-ready summary.
