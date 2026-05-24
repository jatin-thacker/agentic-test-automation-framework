import EnvironmentConfig from "./EnvironmentConfig.js";

export const TestConfig = Object.freeze({
  browser: EnvironmentConfig.get("DEFAULT_BROWSER", "chromium"),
  headed: !EnvironmentConfig.getBoolean("HEADLESS", true),
  defaultTimeoutMs: EnvironmentConfig.getNumber("DEFAULT_TIMEOUT_MS", 10000),
  retryCount: EnvironmentConfig.getNumber("ACTION_RETRY_COUNT", 2)
});

export default TestConfig;
