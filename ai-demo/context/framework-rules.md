# Framework Rules

- JavaScript only.
- Cucumber first.
- Do not create Playwright `.spec.js` files by default.
- Feature files belong in `features/`.
- Step definitions belong in `features/step-definitions/`.
- Step definitions must stay thin.
- Step definitions call page object methods.
- Page objects own selectors and page-specific workflows.
- Reuse `src/pages/BasePage.js`.
- Reuse existing utilities for UI actions, waits, assertions, screenshots, logging, Excel data, files, and reports.
- Existing login smoke coverage must not break.
- Runtime report folders are not source.
- Do not create a new framework to satisfy a single generation task.
