export class LoginLocators {
  static usernameInput(page) {
    return page.locator("[data-test='username']");
  }

  static passwordInput(page) {
    return page.locator("[data-test='password']");
  }

  static loginButton(page) {
    return page.locator("[data-test='login-button']");
  }

  static inventoryContainer(page) {
    return page.locator("[data-test='inventory-container']");
  }

  static loginError(page) {
    return page.locator("[data-test='error']");
  }
}

export default LoginLocators;
