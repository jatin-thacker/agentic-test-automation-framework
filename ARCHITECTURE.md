# Architecture

## Scope of this document

This file describes the full project layout and purpose of each folder/subfolder/file, excluding:

- `node_modules/` (third-party packages)
- transient timestamp instances expanded one-by-one (for generated run/report folders).  
  For those, the **folder schema and file patterns** are documented in detail.

---

## Root-level files and folders

| Path | Purpose |
|---|---|
| `.playwright-mcp/` | Local Playwright MCP runtime artifacts (for example console logs emitted by MCP browser sessions). |
| `features/` | BDD feature files, support hooks/world, and step definitions used by Cucumber runtime. |
| `src/` | Framework source code (runtime layer, agentic layer, Playwright MCP integration, reports, helpers). |
| `user_story/` | Story input samples (`*.story.md`) that can be passed to agentic story-driven runs. |
| `.env.example` | Environment variable template for local setup. |
| `README.md` | High-level project overview and common scripts. |
| `ARCHITECTURE.md` | Detailed architecture and project map (this document). |
| `cucumber.cjs` | Cucumber configuration (imports support + steps, output report path, feature glob). |
| `playwright.config.js` | Playwright configuration used for test runtime defaults. |
| `package.json` | Scripts, dependencies, project metadata. |
| `package-lock.json` | Locked dependency tree for reproducible installs. |

---

## `features/` (BDD runtime layer)

| Path | Purpose |
|---|---|
| `features/.gitkeep` | Keeps the folder in source control when empty. |
| `features/login.feature` | Baseline hand-authored login scenarios (`@smoke`, `@regression`). |
| `features/agentic-login-should-support-valid-and-invalid-user-outcomes.feature` | Generated feature produced by agentic pipeline and applied to runtime. |
| `features/support/` | Cucumber support bootstrap files. |
| `features/support/hooks.js` | `Before/After` hooks (scenario initialization, teardown, failure screenshot, action-log flush). |
| `features/support/world.js` | Custom Cucumber World: browser/page lifecycle + utility initialization. |
| `features/step-definitions/` | Step definition implementations. |
| `features/step-definitions/.gitkeep` | Keeps folder in source control when empty. |
| `features/step-definitions/login.steps.js` | Hand-authored steps for baseline login feature. |
| `features/step-definitions/agentic-login-should-support-valid-and-invalid-user-outcomes.steps.js` | Generated steps mapped to framework page objects/utilities. |

---

## `src/` top-level files

| Path | Purpose |
|---|---|
| `src/index.js` | Public exports for runtime + agentic + command dispatch + Playwright MCP client. |

---

## `src/config/`

| Path | Purpose |
|---|---|
| `src/config/AppConfig.js` | App-level configuration (`baseUrl`, app name) from environment. |
| `src/config/EnvironmentConfig.js` | Environment variable loader + typed getters (string/boolean/number). |
| `src/config/ReportConfig.js` | Canonical report directory path configuration. |
| `src/config/TestConfig.js` | Runtime test config (`browser`, `headed/headless`, timeout, retry count). |

---

## `src/data/`

| Path | Purpose |
|---|---|
| `src/data/.gitkeep` | Keeps data folder in source control. |
| `src/data/TestData.xlsx` | Primary Excel-based test data source (used by `ExcelHelper`). |

---

## `src/errors/`

| Path | Purpose |
|---|---|
| `src/errors/FrameworkError.js` | Base custom framework error type. |
| `src/errors/AgentGenerationError.js` | Agent-related generation failure wrapper (retained for compatibility). |
| `src/errors/AssertionFrameworkError.js` | Assertion wrapper for standardized logging/error semantics. |
| `src/errors/ExcelDataError.js` | Excel read/write-specific error wrapper. |
| `src/errors/McpToolError.js` | MCP tool invocation error wrapper used by agentic navigation compatibility layers. |
| `src/errors/ReportGenerationError.js` | Report generation failure wrapper. |
| `src/errors/UIActionError.js` | UI utility action failure wrapper (click/fill/type/etc.). |
| `src/errors/WaitError.js` | Wait utility failure wrapper. |

---

## `src/locators/`

| Path | Purpose |
|---|---|
| `src/locators/BaseLocators.js` | Minimal locator helper base (`by(page, selector)`). |
| `src/locators/LoginLocators.js` | Static selectors for baseline login flow. |
| `src/locators/AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators.js` | Generated selectors for agentic scenario. |

---

## `src/pages/`

| Path | Purpose |
|---|---|
| `src/pages/BasePage.js` | Base page abstraction initializing shared utilities on top of Playwright `page`. |
| `src/pages/LoginPage.js` | Baseline login behavior/actions/assertions using framework utilities. |
| `src/pages/AgenticLoginShouldSupportValidAndInvalidUserOutcomesPage.js` | Generated page behavior for agentic scenario. |

---

## `src/reports/` (runtime outputs)

| Path | Purpose |
|---|---|
| `src/reports/action-logs/` | JSON action logs and `framework.log` produced during execution. |
| `src/reports/action-logs/action-log-<timestamp>.json` | Per-scenario/flush action telemetry output. |
| `src/reports/action-logs/framework.log` | Append-only structured runtime logger output. |
| `src/reports/cucumber-json/` | Cucumber JSON test report output folder. |
| `src/reports/cucumber-json/cucumber-report.json` | Latest Cucumber JSON report. |
| `src/reports/html-report/` | Generated HTML summary report output folder. |
| `src/reports/html-report/summary.html` | HTML execution summary generated by `HtmlReportHelper`. |
| `src/reports/execution-summary/` | Machine-readable summary folder. |
| `src/reports/execution-summary/summary.json` | Latest report summary JSON from `ReportManager`. |
| `src/reports/traces/` | Reserved folder for trace artifacts (if enabled/added). |
| `src/reports/videos/` | Reserved folder for video artifacts (if enabled/added). |

---

## `src/runners/`

| Path | Purpose |
|---|---|
| `src/runners/test-runner.js` | CLI wrapper for headed test execution entrypoint. |
| `src/runners/RunManager.js` | Cross-platform Cucumber process launcher used by test runner. |
| `src/runners/report-runner.js` | CLI entrypoint to generate execution summary report. |
| `src/runners/ReportManager.js` | Builds summary JSON + HTML report from action logs. |

---

## `src/utils/`

| Path | Purpose |
|---|---|
| `src/utils/ActionLogStore.js` | In-memory action log collector + JSON flush to disk. |
| `src/utils/AssertionUtils.js` | Assertion wrappers with logging + error normalization. |
| `src/utils/Constants.js` | Shared constants (`ACTION_TYPES`, status values, report paths). |
| `src/utils/DataMaskingUtils.js` | Masks sensitive runtime values in logs. |
| `src/utils/DateUtils.js` | Timestamp helpers (ISO now, file-safe timestamp). |
| `src/utils/ExcelHelper.js` | Excel read/write helper (test data access). |
| `src/utils/FileUtils.js` | Generic file utilities (read/write/list/latest-dir). |
| `src/utils/HtmlReportHelper.js` | HTML summary renderer. |
| `src/utils/LoggerUtils.js` | Structured logger writing console + `framework.log`. |
| `src/utils/ScreenshotUtils.js` | Screenshot capture wrapper + logging hooks. |
| `src/utils/StringUtils.js` | Filename sanitization and string casing helpers. |
| `src/utils/UIUtils.js` | Action wrappers (navigate/click/type/select/etc.) with telemetry. |
| `src/utils/WaitUtils.js` | Wait wrappers with telemetry and standardized errors. |

---

## `src/scm/` (Playwright MCP abstraction layer)

| Path | Purpose |
|---|---|
| `src/scm/client/SCMClient.js` | Base SCM client contract (`invokeTool`). |
| `src/scm/client/PlaywrightMCPClient.js` | Single MCP client implementation that launches `@playwright/mcp` and maps framework actions to MCP tool calls with direct-tool preference and run-code fallback. |
| `src/scm/contracts/SCMTools.js` | High-level action contract keys used by navigation agents (navigation, interaction, probing, metadata, network trace, lifecycle) and mapped by `PlaywrightMCPClient`. |

---

## `src/agentic/` (optional generation layer)

### Core docs and data

| Path | Purpose |
|---|---|
| `src/agentic/README.md` | Focused docs for the agentic layer and commands. |
| `src/agentic/mock-data/sample-user-story.txt` | Sample user story input for dry-run generation. |

### Agents

| Path | Purpose |
|---|---|
| `src/agentic/agents/UserStoryAgent.js` | Reads/parses user story input, extracts acceptance criteria, and derives step hints for downstream planning. |
| `src/agentic/agents/FrameworkContextAgent.js` | Inspects framework conventions and existing runtime structure. |
| `src/agentic/agents/AppNavigatorAgent.js` | Produces a story-intent navigation trace via Playwright MCP-backed tool mappings (auth handling, page metadata snapshots, interactive discovery, exploration actions) and supports optional external planner injection for prompt/LLM-driven action planning. |
| `src/agentic/agents/ArtifactDesignAgent.js` | Converts story + trace into framework artifact specifications. |
| `src/agentic/agents/CodeMapperAgent.js` | Renders feature/steps/pages/locators from specs. |
| `src/agentic/agents/ValidationAgent.js` | Validates generated specs/artifacts before apply. |
| `src/agentic/agents/GitHubWorkflowAgent.js` | Produces GitHub CLI/UI publication workflow notes. |
| `src/agentic/agents/LinkedInDraftAgent.js` | Produces draft LinkedIn launch post content. |

### Command registry and dispatcher

| Path | Purpose |
|---|---|
| `src/agentic/commands/command-registry.json` | Declarative command catalog (`/help`, `/from-story`, etc.). |
| `src/agentic/commands/CommandRegistry.js` | Loads/validates/resolves command definitions. |
| `src/agentic/commands/CommandDispatcher.js` | Routes slash-like commands to handlers/orchestrator logic. |

### Orchestration core

| Path | Purpose |
|---|---|
| `src/agentic/core/BaseAgent.js` | Shared run lifecycle wrapper for agents. |
| `src/agentic/core/AgentOrchestrator.js` | End-to-end pipeline orchestrator (dry-run/apply + manifest writing). |

### Renderers

| Path | Purpose |
|---|---|
| `src/agentic/renderers/FeatureFileRenderer.js` | Renders `.feature` content from feature spec. |
| `src/agentic/renderers/StepDefinitionRenderer.js` | Renders step definition JS from step spec. |
| `src/agentic/renderers/PageObjectRenderer.js` | Renders page object class from page spec. |
| `src/agentic/renderers/LocatorRenderer.js` | Renders locator class from locator spec. |

### Validation

| Path | Purpose |
|---|---|
| `src/agentic/validators/FrameworkArtifactValidator.js` | Lightweight validator for generated artifact integrity and duplicates. |

### Agentic runner entrypoints

| Path | Purpose |
|---|---|
| `src/agentic/runners/agent-from-story-runner.js` | CLI entrypoint for dry-run pipeline execution. |
| `src/agentic/runners/agent-review-runner.js` | CLI entrypoint to inspect latest proposed run summary. |
| `src/agentic/runners/agent-apply-runner.js` | CLI entrypoint to apply latest valid proposed run. |
| `src/agentic/runners/agent-command-runner.js` | CLI entrypoint for registry-driven slash-like commands. |

### Agentic run outputs (folder schema)

| Path pattern | Purpose |
|---|---|
| `src/agentic/runs/proposed/.gitkeep` | Keeps proposed folder in source control. |
| `src/agentic/runs/proposed/<timestamp>/` | One dry-run result package per execution. |
| `src/agentic/runs/proposed/<timestamp>/artifact-spec.json` | Generated artifact specification for that run. |
| `src/agentic/runs/proposed/<timestamp>/framework-context.json` | Framework snapshot captured by context agent. |
| `src/agentic/runs/proposed/<timestamp>/navigation-trace.json` | Playwright MCP navigation trace for the run. |
| `src/agentic/runs/proposed/<timestamp>/story.json` | Parsed user story payload. |
| `src/agentic/runs/proposed/<timestamp>/validation-result.json` | Validation pass/fail and issues. |
| `src/agentic/runs/proposed/<timestamp>/manifest.json` | Run manifest including agent statuses and generated artifacts. |
| `src/agentic/runs/proposed/<timestamp>/github-workflow.md` | GitHub publication workflow draft for the run. |
| `src/agentic/runs/proposed/<timestamp>/linkedin-post-draft.md` | LinkedIn launch draft for the run. |
| `src/agentic/runs/proposed/<timestamp>/generated-files/...` | Staged generated code before apply. |
| `src/agentic/runs/applied/.gitkeep` | Keeps applied folder in source control. |
| `src/agentic/runs/applied/<timestamp>/` | Snapshot of proposed run that was applied. |
| `src/agentic/runs/backups/.gitkeep` | Keeps backups folder in source control. |
| `src/agentic/runs/backups/<timestamp>/` | Previous target file backups used for rollback/recovery. |

---

## Runtime flow summary

1. Baseline BDD flow:
   feature -> step definition -> page object -> locator/utils -> report.

2. Optional agentic flow:
   story parser -> framework context -> Playwright MCP app trace -> artifact design -> code mapping -> validation -> review -> apply.

3. Command registry flow:
   `/command` token -> registry resolve -> dispatcher handler -> pipeline/review/apply/info output.
