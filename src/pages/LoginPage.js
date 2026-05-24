import { AppConfig } from "../config/AppConfig.js";
import BasePage from "./BasePage.js";

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.locatorDefinitions = [
      { name: "usernameInput", selector: "[data-test='username']", description: "Username Input" },
      { name: "passwordInput", selector: "[data-test='password']", description: "Password Input" },
      { name: "loginButton", selector: "[data-test='login-button']", description: "Login Button" },
      { name: "inventoryContainer", selector: "[data-test='inventory-container']", description: "Inventory Container" }
    ];
  }

  locator(key) {
    return this.locatorByKey(this.locatorDefinitions, key);
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
