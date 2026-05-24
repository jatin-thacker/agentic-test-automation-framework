import { Given, When, Then } from "@cucumber/cucumber";
import LoginPage from "../../src/pages/LoginPage.js";

function getPageObject(world) {
  if (!world.loginPage) {
    world.loginPage = new LoginPage(world.page);
  }
  return world.loginPage;
}

Given("the user launches the application", async function userLaunchesApplication() {
  const loginPage = getPageObject(this);
  await loginPage.launchApplication();
});

When("the user logs in using test data row {string}", async function userLogsInWithRow(rowName) {
  const loginPage = getPageObject(this);
  const row = await this.excelHelper.readRow("src/data/TestData.xlsx", "LoginData", rowName);
  await loginPage.loginWithCredentials(row.username, row.password);
});

Then("the user should be navigated to the inventory page", async function verifyInventoryPage() {
  const loginPage = getPageObject(this);
  await loginPage.assertInventoryPageVisible();
});
