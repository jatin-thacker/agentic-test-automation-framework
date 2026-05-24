# Execution Contract

Future AI-assisted runs should verify work through the existing project commands.

## Execution Steps

1. Inspect `package.json`.
2. Identify relevant npm scripts.
3. Run existing baseline tests before or after source changes.
4. Run newly tagged tests if applicable.
5. Run the report command if available.
6. Capture command outputs in the run package.
7. If failures occur, classify them as:
   - selector issue
   - wait issue
   - step binding issue
   - test data issue
   - framework misuse
   - environment issue
8. Fix only high-confidence generated-code failures.
9. Do not hide failures.

## Current Commands

- `npm test`
- `npm run test:smoke`
- `npm run test:headed`
- `npm run report`
- `npm run clean`
