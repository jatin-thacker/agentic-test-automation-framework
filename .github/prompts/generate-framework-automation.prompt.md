---
mode: agent
description: Generate framework-compatible Cucumber automation for a selected story.
---

# /generate-framework-automation

Read `AGENTS.md` and `.github` instructions first.

Generate automation using:

- Cucumber feature files
- thin step definitions
- locator modules
- page objects
- `BasePage`
- existing utilities

Rules:

- Locators own selectors.
- Page objects own workflows.
- Step definitions call page objects.
- JavaScript only.
- Do not create Playwright spec files.
- Do not create `src/ai`.
- Do not add LLM API code.
- Do not add fake npm scripts.

Write run evidence under `ai-demo/runs/<timestamp>/`.
