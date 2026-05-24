# Agent-Driven AI Authoring

This repository is an AI-only, agent-first Playwright + Cucumber framework.

The generation flow is:

1. `EnglishPromptAgent` turns a user story, prompt, or legacy script into detailed BDD test cases.
2. `MCPExplorerAgent` opens the app through Playwright MCP, explores the live UI, and enriches selector/page evidence.
3. `FrameworkWriterAgent` uses the LLM to write runnable framework artifacts directly (feature, steps, page, optional locator registry).

Everything is written to a reviewable run package first, then applied only after validation passes.

## What stays in the live framework

- `features/login.feature` keeps the positive smoke login scenario.
- `features/step-definitions/login.steps.js` drives that smoke flow.
- `src/pages/LoginPage.js` owns the baseline login page behavior.
- Locator definitions live inside page classes as JSON-style `locatorDefinitions` arrays.

## Main commands

Generate from a prompt, story file, or script:

```bash
npm run agent:generate -- --prompt "As a shopper, I want to log in so I can reach the inventory page."
npm run agent:generate -- --story path/to/user-story.md
npm run agent:generate -- --script path/to/legacy-playwright-script.js
```

The `ai:` commands are kept as aliases:

```bash
npm run ai:generate -- --prompt "As a shopper, I want to log in so I can reach the inventory page."
npm run ai:review
npm run ai:apply
```

Review the latest proposed run:

```bash
npm run agent:review
```

Apply the latest valid proposed run:

```bash
npm run agent:apply
```

Run the normal framework tests:

```bash
npm test
npm run test:smoke
npm run test:headed
npm run report
```

## Environment

Update `src/config/AppConfig.json` for app name and base URL.

Useful `.env` values:

- `PLAYWRIGHT_MCP_ARGS`
- `PLAYWRIGHT_MCP_COMMAND`
- `LLM_API_BASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL`
- `LLM_MOCK_PLAN_PATH`

Use `LLM_MOCK_PLAN_PATH` when you want to validate the generation flow without calling a live model.

Offline demo example for PowerShell:

```powershell
$env:LLM_MOCK_PLAN_PATH='src/ai/mock-data/sample-ai-plan.json'
npm run agent:generate -- --prompt "Create a login smoke test for SauceDemo."
```

## Where AI output goes

AI runs are saved under:

- `src/ai/runs/proposed/<runId>/`
- `src/ai/runs/applied/<runId>/`
- `src/ai/runs/backups/<runId>/`

Each proposed run includes:

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

## App knowledge ecosystem

Persistent application knowledge is stored in:

- `src/ai/knowledge/AppKnowledge.md`
- `src/ai/knowledge/AppKnowledge.json`

On every `agent:generate` run, the runtime reads this knowledge first and updates it after exploration/code generation so future runs reuse known selectors and page signals.

## Project layout

```text
features/
  login.feature
  step-definitions/
  support/

src/
  ai/
  config/
  pages/
  runners/
  scm/
  utils/

src/ai/runs/
  proposed/
  applied/
  backups/
```

## Notes

- `agent:generate`, `agent:review`, and `agent:apply` are the primary public commands.
- `ai:generate`, `ai:review`, and `ai:apply` remain as compatibility aliases.
- The browser exploration step uses Playwright MCP directly from the runtime.
- Generated code is reviewed first, then applied only when validation passes.
