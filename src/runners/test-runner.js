import RunManager from "./RunManager.js";

const headed = process.argv.includes("--headed");
const manager = new RunManager();
const result = manager.runCucumber({ headed });
process.exitCode = result.status || 0;
