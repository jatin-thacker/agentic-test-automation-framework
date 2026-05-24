---
mode: agent
description: Generate framework-compatible Cucumber automation for a selected story.
---

# /generate-framework-automation

Use this prompt only when the user explicitly asks to generate automation for a selected story.

## Instructions

1. Read `AGENTS.md`.
2. Read all files in `ai-demo/context/`.
3. Inspect existing feature, step definition, page object, utility, data, and runner patterns.
4. Read the selected story from `user_story/`.
5. Create a run evidence folder under `ai-demo/runs/<timestamp>/`.
6. Draft `story-analysis.md`, `generated-test-cases.md`, `ui-exploration-notes.md`, and `proposed-files.md`.
7. Generate only framework-compatible assets:
   - Cucumber feature files
   - thin step definitions
   - page objects
   - safe test data updates if needed
8. Reuse `BasePage.js` and existing utilities for actions, waits, assertions, screenshots, logging, Excel data, and reports.
9. Do not create `.spec.js` files, `src/ai`, LLM API clients, mock LLM plans, fake AI npm scripts, or new framework architecture.

## Output

- Files created/updated.
- Commands that should be run next.
- Any assumptions or human-review points.
