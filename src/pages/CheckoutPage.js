import CheckoutLocators from "../locators/CheckoutLocators.js";
import BasePage from "./BasePage.js";

export class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
  }

  /**
   * Resolve a locator by key from CheckoutLocators
   * @param {string} key - Locator key from CheckoutLocators
   * @returns {import('@playwright/test').Locator}
   */
  locator(key) {
    const selector = CheckoutLocators[key];
    if (!selector) {
      throw new Error(`Checkout locator '${key}' is not defined`);
    }
    return this.page.locator(selector);
  }

  // ==================== CART TO CHECKOUT ====================
  /**
   * Navigate from cart to checkout info page
   * Clicks the "Checkout" button on the cart page
   */
  async proceedToCheckout() {
    await this.uiUtils.clickWithLog(
      this.locator("checkoutButton"),
      "Checkout Button",
      { context: { page: this.page } }
    );
    // Wait for checkout step one page to load
    await this.waitUtils.waitForUrlContainsWithLog(
      this.page,
      "checkout-step-one",
      { context: { page: this.page } }
    );
  }

  // ==================== CHECKOUT STEP ONE (INFO FORM) ====================
  /**
   * Fill and submit checkout information form
   * @param {string} firstName - First name value
   * @param {string} lastName - Last name value
   * @param {string} postalCode - Postal code/zip value
   */
  async enterCheckoutInfo(firstName, lastName, postalCode) {
    await this.uiUtils.clearAndTypeWithLog(
      this.locator("firstNameInput"),
      firstName,
      "First Name Input",
      { context: { page: this.page } }
    );
    await this.uiUtils.clearAndTypeWithLog(
      this.locator("lastNameInput"),
      lastName,
      "Last Name Input",
      { context: { page: this.page } }
    );
    await this.uiUtils.clearAndTypeWithLog(
      this.locator("postalCodeInput"),
      postalCode,
      "Postal Code Input",
      { context: { page: this.page } }
    );
  }

  /**
   * Submit checkout info form by clicking Continue button
   */
  async submitCheckoutInfo() {
    await this.uiUtils.clickWithLog(
      this.locator("stepOneContinueButton"),
      "Continue Button (Step One)",
      { context: { page: this.page } }
    );
    // Wait for checkout step two page to load
    await this.waitUtils.waitForUrlContainsWithLog(
      this.page,
      "checkout-step-two",
      { context: { page: this.page } }
    );
  }

  /**
   * Verify that a specific input field is empty (for validation testing)
   * @param {string} fieldKey - Locator key for the field
   * @returns {boolean}
   */
  async isFieldEmpty(fieldKey) {
    const field = this.locator(fieldKey);
    const value = await field.inputValue();
    return value === "";
  }

  /**
   * Get error message text if present
   * @returns {string|null} Error message or null if not present
   */
  async getErrorMessage() {
    try {
      const errorLocator = this.locator("errorMessage");
      const isVisible = await errorLocator.isVisible();
      if (isVisible) {
        return await errorLocator.textContent();
      }
    } catch (e) {
      // Error locator not found
    }
    return null;
  }

  /**
   * Cancel from checkout step one (returns to cart)
   */
  async cancelCheckoutFromStepOne() {
    await this.uiUtils.clickWithLog(
      this.locator("stepOneCancelButton"),
      "Cancel Button (Step One)",
      { context: { page: this.page } }
    );
    // Wait for cart page to load
    await this.waitUtils.waitForUrlContainsWithLog(
      this.page,
      "cart",
      { context: { page: this.page } }
    );
  }

  // ==================== CHECKOUT STEP TWO (OVERVIEW) ====================
  /**
   * Verify checkout overview page is displayed
   * Asserts the page title and key elements are visible
   */
  async verifyCheckoutOverviewPage() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("checkoutStepTwoTitle"),
      "Checkout Overview Title",
      { context: { page: this.page } }
    );
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("cartItemsList"),
      "Items List (Overview)",
      { context: { page: this.page } }
    );
  }

  /**
   * Get the displayed order total from the summary section
   * Parses the text from the total label
   * @returns {string} Total amount (e.g., "$49.66")
   */
  async getOrderTotal() {
    const totalElement = this.locator("summaryTotal");
    const totalText = await totalElement.textContent();
    // Extract price value (e.g., "Total: $49.66" -> "$49.66")
    const match = totalText.match(/\$[\d.]+/);
    return match ? match[0] : totalText;
  }

  /**
   * Verify order total matches expected amount
   * @param {string} expectedTotal - Expected total (e.g., "$49.66")
   */
  async verifyOrderTotal(expectedTotal) {
    const actualTotal = await this.getOrderTotal();
    await this.assertionUtils.expectTextContainsWithLog(
      this.locator("summaryTotal"),
      expectedTotal,
      `Order Total (Expected: ${expectedTotal})`,
      { context: { page: this.page } }
    );
  }

  /**
   * Cancel from checkout step two (returns to cart)
   */
  async cancelCheckoutFromStepTwo() {
    await this.uiUtils.clickWithLog(
      this.locator("stepTwoCancelButton"),
      "Cancel Button (Step Two)",
      { context: { page: this.page } }
    );
    // Wait for inventory page to load
    await this.waitUtils.waitForUrlContainsWithLog(
      this.page,
      "inventory",
      { context: { page: this.page } }
    );
  }

  /**
   * Complete the checkout by clicking Finish button
   */
  async finishCheckout() {
    await this.uiUtils.clickWithLog(
      this.locator("stepTwoFinishButton"),
      "Finish Button",
      { context: { page: this.page } }
    );
    // Wait for completion page to load
    await this.waitUtils.waitForUrlContainsWithLog(
      this.page,
      "checkout-complete",
      { context: { page: this.page } }
    );
  }

  // ==================== CHECKOUT COMPLETE (CONFIRMATION) ====================
  /**
   * Verify order confirmation message is displayed
   * Asserts both the heading and confirmation message are visible
   */
  async verifyOrderConfirmation() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("completionHeading"),
      "Confirmation Heading",
      { context: { page: this.page } }
    );
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("completionMessage"),
      "Confirmation Message",
      { context: { page: this.page } }
    );
  }

  /**
   * Get the confirmation heading text
   * @returns {string} Heading text (e.g., "Thank you for your order!")
   */
  async getConfirmationHeading() {
    const heading = this.locator("completionHeading");
    return await heading.textContent();
  }

  /**
   * Click "Back Home" button to return to inventory
   */
  async clickBackHome() {
    await this.uiUtils.clickWithLog(
      this.locator("backHomeButton"),
      "Back Home Button",
      { context: { page: this.page } }
    );
    // Wait for inventory page to load
    await this.waitUtils.waitForUrlContainsWithLog(
      this.page,
      "inventory",
      { context: { page: this.page } }
    );
  }

  /**
   * Cancel checkout (generic - accepts either step)
   * Determines current step and calls appropriate cancel method
   */
  async cancelCheckout() {
    const currentUrl = this.page.url();
    if (currentUrl.includes("checkout-step-one")) {
      await this.cancelCheckoutFromStepOne();
    } else if (currentUrl.includes("checkout-step-two")) {
      await this.cancelCheckoutFromStepTwo();
    } else {
      throw new Error(`Cannot cancel from current URL: ${currentUrl}`);
    }
  }
}

export default CheckoutPage;
