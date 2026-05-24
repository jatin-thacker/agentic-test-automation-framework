import { AppConfig } from "../config/AppConfig.js";
import LoginLocators from "../locators/LoginLocators.js";
import BasePage from "./BasePage.js";

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  locator(key) {
    const selector = LoginLocators[key];
    if (!selector) {
      throw new Error(`Login locator '${key}' is not defined`);
    }
    return this.page.locator(selector);
  }

  async launchApplication() {
    await this.uiUtils.navigateToWithLog(AppConfig.baseUrl, {
      context: { page: this.page }
    });
  }

  async loginWithCredentials(username, password) {
    await this.uiUtils.clearAndTypeWithLog(this.locator("usernameInput"), username, "Username Input", {
      context: { page: this.page }
    });
    await this.uiUtils.clearAndTypeWithLog(this.locator("passwordInput"), password, "Password Input", {
      context: { page: this.page }
    });
    await this.uiUtils.clickWithLog(this.locator("loginButton"), "Login Button", {
      context: { page: this.page }
    });
  }

  async assertInventoryPageVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("inventoryContainer"),
      "Inventory Container",
      { context: { page: this.page } }
    );
  }
}

export default LoginPage;
