---
applyTo: "features/**/*.feature,features/step-definitions/**/*.js,src/pages/**/*.js,src/data/**/*"
---

# Automation Generation Rules

- Do not create a new framework.
- Do not create Playwright `.spec.js` files by default.
- Do not bypass Cucumber, page objects, or framework utilities.
- Step definitions should contain orchestration only and delegate browser behavior to page objects.
- Page objects should expose business methods such as `loginWithCredentials`, `addProductToCart`, or `verifyOrderComplete`.
- Prefer stable `data-test` selectors when available.
- Use Excel-backed test data only when it fits the existing `ExcelHelper` pattern cleanly.
- Keep generated changes small, reviewable, and scoped to the selected story.
- Do not edit runtime output folders as source.
