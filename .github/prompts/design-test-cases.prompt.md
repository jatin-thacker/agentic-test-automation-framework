---
mode: agent
description: Design Cucumber-ready test cases from a selected user story without creating automation code.
---

# /design-test-cases

Use this prompt when a user selects or names a story and wants business-readable test cases only.

## Instructions

1. Read `AGENTS.md`.
2. Read `ai-demo/context/framework-map.md`, `framework-rules.md`, and `generation-contract.md`.
3. Read the selected story from `user_story/` or the text provided by the user.
4. Produce test cases that fit this JavaScript Playwright + Cucumber framework.
5. Separate positive, negative, edge, and out-of-scope scenarios.
6. Identify required test data and assumptions.
7. Do not create feature files, step definitions, page objects, checkout automation, `src/ai`, LLM clients, or npm scripts.

## Output

- Story summary.
- Acceptance criteria interpretation.
- Proposed Cucumber scenarios.
- Required data.
- Automation notes for future generation.
- Risks and open questions.
