# Agent Pack: AI-First Automation (Sample)

This file is an entrypoint for a 4-agent pack that matches your framework architecture.

## Agents in this pack
- `orchestrator.agent.md`
- `english-prompt.agent.md`
- `mcp-explorer.agent.md`
- `framework-writer.agent.md`

## Suggested run sequence
1. Run `english-prompt.agent.md` to convert story -> detailed BDD cases.
2. Run `mcp-explorer.agent.md` to plan MCP browser exploration and collect evidence.
3. Run `framework-writer.agent.md` to generate runnable framework code.
4. Use `orchestrator.agent.md` when you want one single meta-prompt for all 3 stages.

## CLI usage examples
```powershell
npm run agent:generate -- --prompt "As a shopper I can login and see inventory"
npm run agent:review
npm run agent:apply
```

## Notes
- Keep output JSON-only per stage.
- Use semantic naming for feature, page, and locator keys.
- Keep locators inside page `locatorDefinitions` by default.
