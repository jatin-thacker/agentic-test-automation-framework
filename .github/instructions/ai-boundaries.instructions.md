---
applyTo: "**/*"
---

# AI Boundary Rules

- Do not create `src/ai`.
- Do not create LLM API clients.
- Do not create mock LLM plans.
- Do not create fake AI npm scripts.
- Do not create a new framework.
- Do not generate business automation unless explicitly asked.
- Do not use `ai-demo/` as an instruction source.
- `ai-demo/` is only for run evidence.
- Use `.github/` and `AGENTS.md` for reusable agent instructions.
- Do not fabricate execution results, screenshots, reports, or defects.
- Do not bypass authentication, security, or protected systems.
- Do not expose credentials, API keys, secrets, or environment-specific data.
- When requirements or evidence are missing, identify assumptions and ask for clarification.
- Mark assumptions clearly and avoid passing them as facts.
