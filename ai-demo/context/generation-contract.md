# Generation Contract

Future AI-assisted generation may produce framework-compatible assets only.

## Allowed Future Outputs

- Cucumber feature files.
- Cucumber step definitions.
- Page objects.
- Test data updates when practical and safe.
- Reuse of existing utilities.
- Report summaries.
- Run-package evidence under `ai-demo/runs/<timestamp>/`.

## Forbidden Unless Explicitly Requested

- New framework architecture.
- New test runner architecture.
- LLM API clients.
- Mock LLM plans.
- TypeScript migration.
- New dependency-heavy tooling.
- Direct raw Playwright scripts that bypass Cucumber, page objects, and framework utilities.
- Fake npm commands that are not implemented in `package.json`.

## Expected Generation Shape

A future generated automation change should usually include:

1. One business-readable `.feature` file.
2. Thin step definitions that delegate to page objects.
3. One or more page-object updates or additions.
4. Test data updates only when the current data pattern supports them cleanly.
5. A run evidence folder summarizing story analysis, proposed files, execution, failures, fixes, and final review notes.
