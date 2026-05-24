# AI Support Modules

This folder now keeps only shared AI support modules:

- `planners/LLMPlannerClient.js`
- `validators/FrameworkArtifactValidator.js`

The active orchestration entrypoint is `src/ai/AgentRuntime.js` (re-exported through `src/ai/AIWriter.js` for compatibility).

Prompt-first agents and the app knowledge ecosystem live under:

- `src/ai/agents/`
- `src/ai/knowledge/`
