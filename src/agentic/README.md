# Agentic Layer

This folder contains the optional agentic pipeline that sits on top of the runtime framework.

## Pipeline

1. `UserStoryAgent`
2. `FrameworkContextAgent`
3. `AppNavigatorAgent` (Playwright MCP-powered navigation)
4. `ArtifactDesignAgent`
5. `CodeMapperAgent`
6. `ValidationAgent`
7. `GitHubWorkflowAgent`
8. `LinkedInDraftAgent`

## Run outputs

- Proposed runs: `src/agentic/runs/proposed/<timestamp>`
- Applied snapshots: `src/agentic/runs/applied/<timestamp>`
- Backups: `src/agentic/runs/backups/<timestamp>`

## Commands

- `npm run agent:from-story [storyPath]`
- `npm run agent:review`
- `npm run agent:apply`
- `npm run agent:command -- /help`

Common story paths:

- `src/agentic/mock-data/sample-user-story.txt`
- `user_story/login-and-logout-flow.story.md`
- `user_story/incorrect-password-login.story.md`
- `user_story/post-login-inventory.story.md`

## Command registry

- Registry file: `src/agentic/commands/command-registry.json`
- Dispatcher: `src/agentic/commands/CommandDispatcher.js`
- This enables plugin-agnostic slash-like commands without depending on host-specific UI menus.

## Runtime integration

- MCP client implementation: `src/scm/client/PlaywrightMCPClient.js`
- Tool contract: `src/scm/contracts/SCMTools.js`
- Browser automation backend: `@playwright/mcp`
- Local Playwright MCP runtime logs: `.playwright-mcp/`
- `AppNavigatorAgent` supports an optional external `actionPlanner.plan(...)` hook for prompt/LLM-driven action planning when provided by orchestrator dependencies.
