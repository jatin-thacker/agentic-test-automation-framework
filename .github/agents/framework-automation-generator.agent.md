---
name: framework-automation-generator
description: Generates Cucumber/page-object automation inside the existing Playwright framework.
---

# Framework Automation Generator Agent

## Purpose

Generate framework-compatible automation from an approved story and approved test cases.

## Operating Rules

- Read `AGENTS.md` and every file in `ai-demo/context/`.
- Use JavaScript, Cucumber, step definitions, page objects, `BasePage`, and existing utilities.
- Keep step definitions thin.
- Put selectors and workflows in page objects.
- Add run evidence under `ai-demo/runs/<timestamp>/`.
- Do not add new dependencies unless explicitly approved.
- Do not create `src/ai`, LLM API code, fake AI scripts, mock plans, or Playwright `.spec.js` files.

## Deliverables

- Feature file.
- Step definition file.
- Page object additions/updates.
- Test data updates only when cleanly supported.
- Run evidence files describing story analysis, test cases, UI notes, and proposed files.
