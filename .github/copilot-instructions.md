# Copilot Instructions

This repository is a JavaScript Playwright + Cucumber automation framework.

Do not create a new framework.
Do not create `src/ai` runtime code.
Do not add LLM API clients, mock plans, or fake AI npm scripts.
Do not create Playwright `.spec.js` files unless explicitly requested.
Do not treat generated reports or runtime output as source.

Use the shared framework conventions and agent guidance in:
- `.github/instructions/framework-conventions.instructions.md`
- `.github/instructions/generation-rules.instructions.md`
- `.github/instructions/execution-reporting.instructions.md`
- `.github/instructions/ai-boundaries.instructions.md`

Framework structure:
- `features/`
- `features/step-definitions/`
- `features/support/`
- `src/pages/`
- `src/locators/`
- `src/utils/`
- `src/data/`
- `src/runners/`

Ownership:
- Locator modules own selectors.
- Page objects own workflows.
- Step definitions call page objects.
- Utilities own common actions, waits, assertions, screenshots, logging, and reporting.

Generated automation must be JavaScript only.
