import { AppConfig } from "../config/AppConfig.js";
import BasePage from "./BasePage.js";
import AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators from "../locators/AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators.js";

export class AgenticLoginShouldSupportValidAndInvalidUserOutcomesPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async launchApplication() {
    await this.uiUtils.navigateToWithLog(AppConfig.baseUrl, {
      context: { page: this.page }
    });
  }

  async runFlow(data = {}) {
    await this.uiUtils.clearAndTypeWithLog(AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators.usernameInput(this.page), String(data.username || ""), "Username Input", { context: { page: this.page } });
    await this.uiUtils.clearAndTypeWithLog(AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators.passwordInput(this.page), String(data.password || ""), "Password Input", { context: { page: this.page } });
    await this.uiUtils.clickWithLog(AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators.loginButton(this.page), "Login Button", { context: { page: this.page } });
  }

  async assertExpectedStateVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators.inventoryContainer(this.page),
      "Inventory Container",
      { context: { page: this.page } }
    );
  }
}

export default AgenticLoginShouldSupportValidAndInvalidUserOutcomesPage;
