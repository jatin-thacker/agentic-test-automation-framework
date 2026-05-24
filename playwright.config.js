import { defineConfig } from "@playwright/test";

const headed = String(process.env.HEADED || "false").toLowerCase() === "true";

export default defineConfig({
  testDir: "./features",
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: process.env.BASE_URL || "https://www.saucedemo.com/",
    headless: !headed,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure"
  },
  reporter: [["list"]],
  mcpServers: {
    playwright: {
      command: "npx",
      args: ["@playwright/mcp@latest"]
    }
  }
});
