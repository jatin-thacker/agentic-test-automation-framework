---
applyTo: "**/*"
---

# Framework Conventions

- This is a JavaScript Playwright + Cucumber framework.
- Feature files belong in `features/`.
- Step definitions belong in `features/step-definitions/`.
- Support hooks/world files belong in `features/support/`.
- Page objects belong in `src/pages/`.
- Utilities belong in `src/utils/`.
- Test data belongs in `src/data/`.
- Runners belong in `src/runners/`.
- Custom framework errors belong in `src/errors/`.

For automation changes, prefer this shape:

1. Business-readable Cucumber feature.
2. Thin step definition file.
3. Page object methods that own selectors and workflows.
4. Existing utility reuse through `BasePage`.
5. Test/report command output captured in `ai-demo/runs/<timestamp>/` when performing a demo generation run.
