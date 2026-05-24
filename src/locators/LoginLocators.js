import BaseLocators from "./BaseLocators.js";

export class LoginLocators {
  static entries = [
    { name: "usernameInput", selector: "[data-test='username']", description: "Username Input" },
    { name: "passwordInput", selector: "[data-test='password']", description: "Password Input" },
    { name: "loginButton", selector: "[data-test='login-button']", description: "Login Button" },
    { name: "inventoryContainer", selector: "[data-test='inventory-container']", description: "Inventory Container" },
    { name: "loginError", selector: "[data-test='error']", description: "Login Error" }
  ];

  static selector(name) {
    const entry = this.entries.find((item) => item.name === name);
    return entry?.selector || null;
  }

  static by(page, name) {
    return BaseLocators.byName(page, this.entries, name);
  }

  // Backward compatibility with older page objects.
  static usernameInput(page) {
    return this.by(page, "usernameInput");
  }

  static passwordInput(page) {
    return this.by(page, "passwordInput");
  }

  static loginButton(page) {
    return this.by(page, "loginButton");
  }

  static inventoryContainer(page) {
    return this.by(page, "inventoryContainer");
  }

  static loginError(page) {
    return this.by(page, "loginError");
  }
}

export default LoginLocators;
