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
- Prefer stable selectors such as `data-test`, role, label, text, and semantic attributes.
- Avoid brittle XPath/CSS selectors unless necessary and justified.
- Do not hardcode selectors in step definitions.
- Avoid hardcoded selectors in page objects unless there is a documented exception.
- Do not add dependencies unless necessary and justified.
- Do not edit runtime output folders as source.
- Keep generated automation aligned to business intent and approved test cases.
- Document assumptions and gaps when input is incomplete.
- Generate only the files needed to support the requested automation scope.
