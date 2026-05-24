---
mode: agent
description: Run existing automation, analyze failures, and apply safe fixes when evidence supports it.
---

# /run-and-fix-tests

## User input
Provide:
- automation command executed
- command output and error logs
- related screenshots, traces, or report artifacts
- relevant automation files or diffs

## Required context
- Inspect `package.json` first
- Review `AGENTS.md` and `.github/instructions/*.instructions.md`
- Use existing npm scripts: `npm test`, `npm run test:smoke`, `npm run test:headed`, `npm run report`, `npm run clean`

## Task instructions
- Review execution evidence before diagnosing failures
- Classify failures by root cause category
- Recommend minimal safe fixes
- Apply only high-confidence code changes when enough context exists
- Preserve original assertion and test intent
- Propose a retest command

## Output format
- Failure summary
- Evidence reviewed
- Probable root cause
- Failure classification
- Recommended fix
- File changes if applied
- Retest command
- Remaining risk and open questions

## Validation checklist
- Does not claim passing results without evidence
- Distinguishes automation vs application issues
- Avoids speculative fixes when logs are insufficient
- Does not delete assertions to force pass
- References actual logs or artifacts

## Do not fabricate
- execution results
- logs
- screenshots
- pass/fail status
- fixes without evidence
