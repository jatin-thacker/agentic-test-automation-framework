import { Before, After, setDefaultTimeout, setWorldConstructor } from "@cucumber/cucumber";
import actionLogStore from "../../src/utils/ActionLogStore.js";
import { TestConfig } from "../../src/config/TestConfig.js";
import { DateUtils } from "../../src/utils/DateUtils.js";
import CustomWorld from "./world.js";

setWorldConstructor(CustomWorld);
setDefaultTimeout(TestConfig.defaultTimeoutMs * 3);

Before(async function beforeScenario({ pickle }) {
  this.currentScenarioName = pickle.name;
  await this.initialize();
});

After(async function afterScenario({ result }) {
  if (result?.status !== "PASSED" && this.page && this.screenshotUtils) {
    await this.screenshotUtils.captureScreenshotWithLog(
      this.page,
      `${this.currentScenarioName || "scenario"}-failed`,
      { scenarioName: this.currentScenarioName }
    );
  }
  await actionLogStore.flush(`action-log-${DateUtils.timestampForPath()}.json`);
  await this.dispose();
});
