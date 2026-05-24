import { spawnSync } from "node:child_process";

export class RunManager {
  runCucumber(options = {}) {
    const tags = options.tags ? ["--tags", options.tags] : [];
    const cucumberArgs = ["--config", "cucumber.cjs", ...tags];
    const env = { ...process.env };
    if (options.headed) {
      env.HEADED = "true";
      env.HEADLESS = "false";
    }

    const candidates =
      process.platform === "win32"
        ? [
            { command: "cucumber-js.cmd", args: cucumberArgs },
            { command: "npx.cmd", args: ["cucumber-js", ...cucumberArgs] }
          ]
        : [
            { command: "cucumber-js", args: cucumberArgs },
            { command: "npx", args: ["cucumber-js", ...cucumberArgs] }
          ];

    let result = null;
    for (const candidate of candidates) {
      result = spawnSync(candidate.command, candidate.args, {
        stdio: "inherit",
        env,
        cwd: process.cwd(),
        shell: process.platform === "win32"
      });
      if (!result.error) break;
    }

    if (result?.error) {
      console.error("Unable to start cucumber command:", result.error.message);
    }

    return {
      status: result?.status ?? 1,
      signal: result?.signal ?? null
    };
  }
}

export default RunManager;
