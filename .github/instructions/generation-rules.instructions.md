---
applyTo: "features/**/*.feature,features/step-definitions/**/*.js,src/locators/**/*.js,src/pages/**/*.js,src/data/**/*"
---

# Automation Generation Rules

- Create or update locator files for new UI elements.
- Create or update page objects for workflows.
- Create or update feature and step definition files for scenarios.
- Keep step definitions thin.
- Reuse `BasePage`.
- Reuse existing utilities for UI actions, waits, assertions, screenshots, logging, Excel data, files, and reports.
- Prefer stable `data-test` selectors.
- Do not hardcode selectors in step definitions.
- Avoid hardcoding selectors in page objects unless there is a documented exception.
- Do not add dependencies unless necessary and justified.
- Do not edit runtime output folders as source.
