---
applyTo: "**/*"
---

# AI Boundary Rules

- Do not add LLM API plumbing.
- Do not add fake AI npm scripts.
- Do not create mock LLM plans.
- Do not create `src/ai` runtime code unless explicitly requested in a future task.
- Do not add `LLM_API_KEY`, `LLM_MODEL`, or `LLM_MOCK_PLAN_PATH` as required configuration.
- Use `.github/`, `AGENTS.md`, and `ai-demo/` for agent instructions, prompts, templates, and run evidence only.
- The AI-assisted workflow is a human-supervised coding workflow, not an in-app runtime generation engine.
