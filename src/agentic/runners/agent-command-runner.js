import CommandDispatcher from "../commands/CommandDispatcher.js";

function usage() {
  return [
    "Usage:",
    "  npm run agent:command -- /help",
    "  npm run agent:command -- /from-story src/agentic/mock-data/sample-user-story.txt",
    "  npm run agent:command -- /review",
    "  npm run agent:command -- /apply",
    "  npm run agent:command -- /github-flow",
    "  npm run agent:command -- /linkedin"
  ].join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(usage());
    return;
  }
  const commandToken = args[0];
  const commandArgs = args.slice(1);

  const dispatcher = new CommandDispatcher();
  const result = await dispatcher.dispatch(commandToken, commandArgs);
  console.log(result.message);
}

main().catch((error) => {
  console.error("agent:command failed:", error.message);
  process.exitCode = 1;
});
