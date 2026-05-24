import { AppConfig } from "../config/AppConfig.js";
import BasePage from "./BasePage.js";
import LoginLocators from "../locators/LoginLocators.js";

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async launchApplication() {
    await this.uiUtils.navigateToWithLog(AppConfig.baseUrl, {
      context: { page: this.page }
    });
  }

  async loginWithCredentials(username, password) {
    await this.uiUtils.clearAndTypeWithLog(
      LoginLocators.usernameInput(this.page),
      username,
      "Username Input",
      { context: { page: this.page } }
    );
    await this.uiUtils.clearAndTypeWithLog(
      LoginLocators.passwordInput(this.page),
      password,
      "Password Input",
      { context: { page: this.page } }
    );
    await this.uiUtils.clickWithLog(LoginLocators.loginButton(this.page), "Login Button", {
      context: { page: this.page }
    });
  }

  async assertInventoryPageVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      LoginLocators.inventoryContainer(this.page),
      "Inventory Container",
      { context: { page: this.page } }
    );
  }

  async assertLoginErrorVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      LoginLocators.loginError(this.page),
      "Login Error",
      { context: { page: this.page } }
    );
  }
}

export default LoginPage;
