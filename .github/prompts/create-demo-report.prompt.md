---
mode: agent
description: Create a LinkedIn-safe final demo report from run evidence.
---

# /create-demo-report

Read the active `ai-demo/runs/<timestamp>/` evidence files.

Create `final-demo-report.md` with:

- story used
- test cases generated
- files changed
- commands run
- execution result
- failures/fixes
- screenshots/report locations if available
- known limitations
- human-review notes
- LinkedIn-ready summary

Use the phrase:

```text
AI-assisted Playwright automation accelerator built on top of an existing enterprise-style QA framework.
```

Do not claim:

```text
fully autonomous AI test engineer
```
