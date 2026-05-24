# Architecture

## Overview

This framework uses an AI-only, agent-first generation path:

1. `EnglishPromptAgent` reads a user story, prompt, or legacy script and writes detailed BDD test cases.
2. `MCPExplorerAgent` opens the live app through Playwright MCP and captures UI evidence.
3. `FrameworkWriterAgent` uses the LLM to write runnable framework artifacts directly.

The live project stays reviewable because generation is written to `src/ai/runs/proposed/<runId>/` first.

## Core Modules

| Path | Purpose |
|---|---|
| `src/ai/AgentRuntime.js` | Main orchestration pipeline for the three-agent direct-authoring flow. |
| `src/ai/AIWriter.js` | Compatibility wrapper that re-exports `AgentRuntime`. |
| `src/ai/agents/EnglishPromptAgent.js` | LLM-backed BDD test case writer from plain-English user input. |
| `src/ai/agents/MCPExplorerAgent.js` | LLM-backed MCP exploration planner. |
| `src/ai/agents/FrameworkWriterAgent.js` | LLM-backed framework code writer (feature/steps/page). |
| `src/ai/knowledge/AppKnowledgeStore.js` | Persistent knowledge manager for selectors/pages/run memory. |
| `src/agentic/planners/LLMPlannerClient.js` | OpenAI-compatible JSON-only planner client with stage-aware mock support. |
| `src/scm/client/PlaywrightMCPClient.js` | MCP browser client that maps high-level actions to Playwright MCP tools and fallback run-code execution. |
| `src/agentic/validators/FrameworkArtifactValidator.js` | Validates the generated feature, step, page, and locator artifacts. |
| `src/pages/BasePage.js` | Base page with `locatorDefinitions` array lookup support. |
| `src/pages/LoginPage.js` | Baseline login smoke page object that stays in the live framework. |

## Generation Flow

### 1. EnglishPromptAgent

- Reads the source story/prompt/script and the framework context.
- Returns structured BDD output:
  - feature name
  - scenario names
  - step text
  - naming hints
  - acceptance criteria / assumptions

### 2. MCPExplorerAgent

- Uses the test cases to decide what to inspect in the browser.
- Opens the app through Playwright MCP.
- Collects browser evidence such as:
  - interactive elements
  - page metadata
  - network traces
  - selector hints
- Can run follow-up verification actions before code is written.

### 3. FrameworkWriterAgent

- Uses the browser evidence plus the test cases to author the final code.
- Writes the final file content directly from LLM output.
- Keeps page-owned `locatorDefinitions` arrays as the default locator home.
- Emits a separate locator registry only when selector reuse is clearly useful.

## Run Package Layout

Each proposed run writes the following trace files:

- `source.json`
- `framework-context.json`
- `english-prompt-agent.json`
- `mcp-explorer-agent.json`
- `framework-writer-agent.json`
- `plan.json`
- `navigation-trace.json`
- `naming-map.json`
- `artifact-spec.json`
- `validation-result.json`
- `knowledge-before.md`
- `knowledge-after.md`
- `knowledge-delta.json`
- `manifest.json`
- `generated-files/`

The `plan.json` file contains all three stage outputs plus the combined run context.

## Knowledge Ecosystem

The runtime keeps persistent application memory in:

- `src/ai/knowledge/AppKnowledge.md`
- `src/ai/knowledge/AppKnowledge.json`

Each run reads this knowledge first and writes updates after exploration and code generation, so future runs can reuse known selectors and page/page-state signals.

## Public Commands

- `npm run agent:generate`
- `npm run agent:review`
- `npm run agent:apply`

Compatibility aliases remain available:

- `npm run ai:generate`
- `npm run ai:review`
- `npm run ai:apply`

## Framework Rules

- Page objects own their selectors through `locatorDefinitions` arrays.
- Generated features stay in `features/`.
- Generated step definitions stay in `features/step-definitions/`.
- Generated page objects stay in `src/pages/`.
- A separate locator registry is optional, not mandatory.
- The positive login smoke scenario remains the only live baseline scenario.

## Offline Validation

- Set `LLM_MOCK_PLAN_PATH=src/ai/mock-data/sample-ai-plan.json` to run the three-agent flow without a live model.
- The mock file is stage-aware and returns separate outputs for all three agents.
