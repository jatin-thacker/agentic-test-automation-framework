---
mode: agent
description: Generate repository-compliant automation artifacts for approved test cases.
---

# /generate-framework-automation

## User input
Provide:
- approved test cases or scenario list
- user story and acceptance criteria
- existing repository structure
- available selectors or UI element details
- relevant page workflows

## Required context
- Review `AGENTS.md` and `.github/instructions/*.instructions.md`
- Repository uses JavaScript, Playwright, Cucumber
- Existing runner scripts are in `package.json`

## Task instructions
- Generate or update automation artifacts that match the approved scope
- Create feature files, step definitions, locator modules, and page objects only as needed
- Use page objects for workflows and locator modules for selectors
- Reuse `BasePage` and existing utilities
- Prefer robust selector strategies, not brittle XPath/CSS unless justified
- Validate selectors with Playwright MCP or browser inspector when real-time access is available
- Use `npm run mcp` or `npx playwright codegen` to inspect live pages and confirm selectors before committing
- Document inferred or unvalidated locators clearly and request confirmation
- Include assumptions and confirmation points

## Output format
- Files to create/update with path and complete contents
- Design rationale
- Assumptions
- Required manual confirmations
- Suggested test command to run

## Validation checklist
- Uses repository conventions and existing patterns
- Step definitions are thin and business-readable
- No selectors in step definitions
- No `src/ai`, LLM API code, fake scripts, or `.spec.js`
- Does not generate unsupported flows
- Assumptions are clearly documented

## Do not fabricate
- selectors
- application behavior
- execution evidence
- test results
