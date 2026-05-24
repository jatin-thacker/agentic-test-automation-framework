---
mode: agent
description: Design structured Cucumber-ready test cases from business stories and acceptance criteria.
---

# /design-test-cases

## User input
Provide:
- user story or business requirement
- acceptance criteria
- personas and roles
- known data constraints
- UI observations or exploratory notes

## Required context
- Review `AGENTS.md` and `.github/instructions/*.instructions.md`
- Target repository uses Playwright + Cucumber
- Test design only, no automation code

## Task instructions
- Map the story to acceptance criteria
- Identify positive, negative, boundary, and regression cases
- Select a fit-for-purpose MVP automation scenario
- Separate assumptions from confirmed requirements
- Highlight missing requirements or open questions

## Output format
- Story summary
- Acceptance criteria mapping
- Test scenario table
- Preconditions
- Test data
- Steps
- Expected results
- Priority
- Automation suitability
- Risk notes
- Open questions

## Validation checklist
- Each major case maps to acceptance criteria
- Assumptions are explicitly stated
- Automation suitability is assessed
- No automation files are generated
- No speculative business behavior is presented as fact

## Do not fabricate
- requirements
- execution results
- automation output
- business rules
