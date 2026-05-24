# Reporting Contract

Future AI-assisted run reports should be human-reviewable and practical.

## Required Report Content

- Story or prompt used.
- Test cases generated.
- UI exploration notes.
- Files proposed or changed.
- Commands run.
- Execution result.
- Failures found.
- Fixes applied.
- Screenshots/report locations when available.
- Known limitations.
- Human-review summary.

## Report Location

Actual generation runs should create evidence under:

```text
ai-demo/runs/<timestamp>/
```

The run evidence should be documentation only. It must not become an executable AI runtime.
