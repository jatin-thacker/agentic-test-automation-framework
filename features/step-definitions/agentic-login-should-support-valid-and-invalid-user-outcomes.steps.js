import { Given, When, Then } from "@cucumber/cucumber";
import AgenticLoginShouldSupportValidAndInvalidUserOutcomesPage from "../../src/pages/AgenticLoginShouldSupportValidAndInvalidUserOutcomesPage.js";

function getPageObject(world) {
  if (!world.generatedPage) {
    world.generatedPage = new AgenticLoginShouldSupportValidAndInvalidUserOutcomesPage(world.page);
  }
  return world.generatedPage;
}

Given("the user launches the generated application", async function () {
  const pageObject = getPageObject(this);
  await pageObject.launchApplication();
});

When("the user executes generated flow using test data row {string}", async function (rowName) {
  const pageObject = getPageObject(this);
  const row = await this.excelHelper.readRow("src/data/TestData.xlsx", "LoginData", rowName);
  await pageObject.runFlow(row);
});

Then("the user should see the expected generated outcome", async function () {
  const pageObject = getPageObject(this);
  await pageObject.assertExpectedStateVisible();
});
