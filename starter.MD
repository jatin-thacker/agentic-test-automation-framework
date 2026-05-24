# Starter Guide

This guide gets you from a fresh clone to the current JavaScript Playwright + Cucumber framework workflow.

## 1. Install Dependencies

```bash
npm install
```

## 2. Install Playwright Browsers

```bash
npx playwright install
```

## 3. Configure Environment

Copy the example environment file:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Update these files as needed:

- `.env`
- `src/config/AppConfig.json`

## 4. Run Baseline Tests

Run the full Cucumber suite:

```bash
npm test
```

Run smoke tests only:

```bash
npm run test:smoke
```

Run headed mode:

```bash
npm run test:headed
```

## 5. Generate Report

After a test run, generate the framework report:

```bash
npm run report
```

## 6. Clean Runtime Artifacts

```bash
npm run clean
```

## 7. Agent Workflow Files

Reusable agent instructions, prompts, and agent personas live in:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/instructions/`
- `.github/prompts/`
- `.github/agents/`

Run evidence from actual AI-assisted demos belongs under:

- `ai-demo/runs/<timestamp>/`

There are currently no AI npm commands, no LLM API clients, no mock LLM plans, and no `src/ai` runtime. The intended LLM/MCP interaction is expressed through the reusable prompt and agent instruction layer, not via runtime repository code.
