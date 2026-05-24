export class AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators {
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

}

export default AgenticLoginShouldSupportValidAndInvalidUserOutcomesLocators;
