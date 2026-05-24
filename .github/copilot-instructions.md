# Copilot Instructions

This is a JavaScript Playwright + Cucumber automation framework.

Do not create a new framework.

Do not create `src/ai` runtime code.

Do not add LLM API clients, mock plans, or fake AI npm scripts.

Use the existing framework conventions:

- Cucumber feature files under `features/`
- Step definitions under `features/step-definitions/`
- Support hooks/world under `features/support/`
- Page objects under `src/pages/`
- Locator modules under `src/locators/`
- Utilities under `src/utils/`
- Data under `src/data/`
- Runners under `src/runners/`

Ownership rules:

- Locator modules own selectors.
- Page objects own workflows.
- Step definitions call page object methods.
- Utilities own common actions, waits, assertions, screenshots, logging, and reporting.

Generated automation must be JavaScript only.

Do not create Playwright `.spec.js` files unless explicitly requested.

Do not treat generated reports or runtime output as source.
