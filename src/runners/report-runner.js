import ReportManager from "./ReportManager.js";

async function main() {
  const manager = new ReportManager();
  const report = await manager.generate();
  console.log(`Report generated: ${report.outPath}`);
}

main().catch((error) => {
  console.error("report runner failed:", error);
  process.exitCode = 1;
});
