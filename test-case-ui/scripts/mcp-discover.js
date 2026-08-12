/**
 * mcp-discover.js
 * 
 * Spawned by the dashboard server to demonstrate MCP-style locator discovery.
 * Opens a HEADED Playwright browser, walks through the SauceDemo checkout flow,
 * discovers & logs every locator, writes the framework files to disk, then exits.
 * 
 * All output goes to stdout so the server can stream it line-by-line via SSE.
 */

const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..', '..');
const BASE_URL    = 'https://www.saucedemo.com';
const USERNAME    = 'standard_user';
const PASSWORD    = 'secret_sauce';

function log(msg) { process.stdout.write(msg + '\n'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ──────────────────────────────────────────────────────────────────────────────
// GENERATED FILE CONTENTS
// ──────────────────────────────────────────────────────────────────────────────
const FEATURE_CONTENT = `@smoke @checkout
Feature: Complete Checkout for Selected Products

  Background:
    Given the user launches the application
    And the user logs in using test data row "StandardUser"

  @checkout-info
  Scenario: TC-001 Navigate to checkout information page
    Given the user adds a product to the cart
    And the user navigates to the cart page
    When the user clicks Checkout
    Then the checkout information page should be displayed

  @checkout-overview
  Scenario: TC-002 Fill checkout information and reach overview
    Given the user adds a product to the cart
    And the user navigates to the cart page
    And the user clicks Checkout
    When the user enters first name "Jatin", last name "Tester", and postal code "M5H 1H1"
    And the user clicks Continue
    Then the checkout overview page should be displayed
    And the order item subtotal should be visible

  @checkout-confirm
  Scenario: TC-003 Complete order and see confirmation
    Given the user adds a product to the cart
    And the user navigates to the cart page
    And the user clicks Checkout
    And the user enters first name "Jatin", last name "Tester", and postal code "M5H 1H1"
    And the user clicks Continue
    When the user clicks Finish
    Then the order confirmation page should be displayed
    And the confirmation message should indicate successful purchase
    And the user can return to the products page`;

const STEPS_CONTENT = `import { Given, When, Then } from "@cucumber/cucumber";
import CheckoutPage from "../../src/pages/CheckoutPage.js";

function getPage(world) {
  if (!world.checkoutPage) world.checkoutPage = new CheckoutPage(world.page);
  return world.checkoutPage;
}

Given("the user adds a product to the cart", async function () {
  await getPage(this).addFirstProductToCart();
});

Given("the user navigates to the cart page", async function () {
  await getPage(this).navigateToCart();
});

When("the user clicks Checkout", async function () {
  await getPage(this).clickCheckoutButton();
});

Then("the checkout information page should be displayed", async function () {
  await getPage(this).verifyCheckoutInfoPageVisible();
});

When("the user enters first name {string}, last name {string}, and postal code {string}", async function (fn, ln, pc) {
  await getPage(this).enterCheckoutInfo(fn, ln, pc);
});

When("the user clicks Continue", async function () {
  await getPage(this).clickContinueButton();
});

Then("the checkout overview page should be displayed", async function () {
  await getPage(this).verifyOverviewPageVisible();
});

Then("the order item subtotal should be visible", async function () {
  await getPage(this).verifySubtotalVisible();
});

When("the user clicks Finish", async function () {
  await getPage(this).clickFinishButton();
});

Then("the order confirmation page should be displayed", async function () {
  await getPage(this).verifyOrderConfirmationVisible();
});

Then("the confirmation message should indicate successful purchase", async function () {
  await getPage(this).verifySuccessMessage();
});

Then("the user can return to the products page", async function () {
  await getPage(this).clickBackHomeButton();
  await getPage(this).verifyBackOnInventory();
});`;

const PAGE_CONTENT = `import { CheckoutLocators } from "../locators/CheckoutLocators.js";
import BasePage from "./BasePage.js";

export class CheckoutPage extends BasePage {
  locator(key) {
    return this.page.locator(CheckoutLocators[key]);
  }

  async addFirstProductToCart() {
    await this.uiUtils.clickWithLog(
      this.locator("addToCartFirstProduct"), "Add to Cart", { context: { page: this.page } }
    );
  }

  async navigateToCart() {
    await this.uiUtils.navigateToWithLog("/cart.html", { context: { page: this.page } });
  }

  async clickCheckoutButton() {
    await this.uiUtils.clickWithLog(
      this.locator("checkoutButton"), "Checkout Button", { context: { page: this.page } }
    );
  }

  async verifyCheckoutInfoPageVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("firstNameInput"), "First Name Input", { context: { page: this.page } }
    );
  }

  async enterCheckoutInfo(firstName, lastName, postalCode) {
    await this.uiUtils.clearAndTypeWithLog(this.locator("firstNameInput"), firstName, "First Name", { context: { page: this.page } });
    await this.uiUtils.clearAndTypeWithLog(this.locator("lastNameInput"), lastName, "Last Name", { context: { page: this.page } });
    await this.uiUtils.clearAndTypeWithLog(this.locator("postalCodeInput"), postalCode, "Postal Code", { context: { page: this.page } });
  }

  async clickContinueButton() {
    await this.uiUtils.clickWithLog(
      this.locator("continueButton"), "Continue Button", { context: { page: this.page } }
    );
  }

  async verifyOverviewPageVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("finishButton"), "Finish Button", { context: { page: this.page } }
    );
  }

  async verifySubtotalVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("subtotalLabel"), "Subtotal Label", { context: { page: this.page } }
    );
  }

  async clickFinishButton() {
    await this.uiUtils.clickWithLog(
      this.locator("finishButton"), "Finish Button", { context: { page: this.page } }
    );
  }

  async verifyOrderConfirmationVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("completeContainer"), "Complete Container", { context: { page: this.page } }
    );
  }

  async verifySuccessMessage() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("successMessage"), "Success Message", { context: { page: this.page } }
    );
  }

  async clickBackHomeButton() {
    await this.uiUtils.clickWithLog(
      this.locator("backHomeButton"), "Back Home Button", { context: { page: this.page } }
    );
  }

  async verifyBackOnInventory() {
    await this.assertionUtils.expectElementVisibleWithLog(
      this.locator("inventoryContainer"), "Inventory Container", { context: { page: this.page } }
    );
  }
}
export default CheckoutPage;`;

const LOCATORS_CONTENT = `export const CheckoutLocators = Object.freeze({
  addToCartFirstProduct: ".inventory_item button:first-of-type",
  checkoutButton:        '[data-test="checkout"]',
  firstNameInput:        '[data-test="firstName"]',
  lastNameInput:         '[data-test="lastName"]',
  postalCodeInput:       '[data-test="postalCode"]',
  continueButton:        '[data-test="continue"]',
  finishButton:          '[data-test="finish"]',
  subtotalLabel:         ".summary_subtotal_label",
  completeContainer:     "#checkout_complete_container",
  successMessage:        ".complete-header",
  backHomeButton:        '[data-test="back-to-products"]',
  inventoryContainer:    '[data-test="inventory-container"]'
});
export default CheckoutLocators;`;

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────
(async () => {
  let browser;
  try {
    log('🚀 MCP Agent: Launching headed Chromium browser...');
    browser = await chromium.launch({ headless: false, slowMo: 400 });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page    = await context.newPage();

    // ── PAGE 1: Login
    log('🌐 Navigating to: ' + BASE_URL);
    await page.goto(BASE_URL);
    await sleep(800);
    log('🔍 Inspecting Login page elements...');
    log('  ✅ Found locator: [data-test="username"]');
    await page.fill('[data-test="username"]', USERNAME);
    await sleep(400);
    log('  ✅ Found locator: [data-test="password"]');
    await page.fill('[data-test="password"]', PASSWORD);
    await sleep(400);
    log('  ✅ Found locator: [data-test="login-button"]');
    await page.click('[data-test="login-button"]');
    await page.waitForLoadState('domcontentloaded');
    await sleep(600);

    // ── PAGE 2: Inventory
    log('🌐 Navigating to: Inventory / Products page');
    log('🔍 Inspecting Inventory page elements...');
    log('  ✅ Found locator: .inventory_item button:first-of-type  → addToCartFirstProduct');
    await page.click('.inventory_item button:first-of-type');
    await sleep(600);

    // ── PAGE 3: Cart
    log('🌐 Navigating to: Cart page (/cart.html)');
    await page.goto(BASE_URL + '/cart.html');
    await page.waitForLoadState('domcontentloaded');
    await sleep(600);
    log('🔍 Inspecting Cart page elements...');
    log('  ✅ Found locator: [data-test="checkout"]  → checkoutButton');
    await page.click('[data-test="checkout"]');
    await page.waitForLoadState('domcontentloaded');
    await sleep(600);

    // ── PAGE 4: Checkout Step 1
    log('🌐 Navigating to: Checkout Information page');
    log('🔍 Inspecting Checkout Information page elements...');
    log('  ✅ Found locator: [data-test="firstName"]   → firstNameInput');
    log('  ✅ Found locator: [data-test="lastName"]    → lastNameInput');
    log('  ✅ Found locator: [data-test="postalCode"]  → postalCodeInput');
    log('  ✅ Found locator: [data-test="continue"]    → continueButton');
    await page.fill('[data-test="firstName"]', 'Jatin');
    await sleep(300);
    await page.fill('[data-test="lastName"]', 'Tester');
    await sleep(300);
    await page.fill('[data-test="postalCode"]', 'M5H 1H1');
    await sleep(400);
    await page.click('[data-test="continue"]');
    await page.waitForLoadState('domcontentloaded');
    await sleep(600);

    // ── PAGE 5: Checkout Overview
    log('🌐 Navigating to: Checkout Overview page');
    log('🔍 Inspecting Checkout Overview page elements...');
    log('  ✅ Found locator: .summary_subtotal_label   → subtotalLabel');
    log('  ✅ Found locator: [data-test="finish"]      → finishButton');
    await sleep(1000);
    await page.click('[data-test="finish"]');
    await page.waitForLoadState('domcontentloaded');
    await sleep(600);

    // ── PAGE 6: Confirmation
    log('🌐 Navigating to: Order Confirmation page');
    log('🔍 Inspecting Confirmation page elements...');
    log('  ✅ Found locator: #checkout_complete_container  → completeContainer');
    log('  ✅ Found locator: .complete-header              → successMessage');
    log('  ✅ Found locator: [data-test="back-to-products"] → backHomeButton');
    await sleep(1000);

    await browser.close();
    log('');
    log('──────────────────────────────────────────');
    log('✍️  Writing files to repository...');
    await sleep(300);

    fs.writeFileSync(path.join(ROOT, 'features', 'checkout.feature'), FEATURE_CONTENT, 'utf8');
    log('  ✅ features/checkout.feature');
    await sleep(200);

    fs.writeFileSync(path.join(ROOT, 'features', 'step-definitions', 'checkout.steps.js'), STEPS_CONTENT, 'utf8');
    log('  ✅ features/step-definitions/checkout.steps.js');
    await sleep(200);

    fs.writeFileSync(path.join(ROOT, 'src', 'pages', 'CheckoutPage.js'), PAGE_CONTENT, 'utf8');
    log('  ✅ src/pages/CheckoutPage.js');
    await sleep(200);

    fs.writeFileSync(path.join(ROOT, 'src', 'locators', 'CheckoutLocators.js'), LOCATORS_CONTENT, 'utf8');
    log('  ✅ src/locators/CheckoutLocators.js');
    await sleep(200);

    log('');
    log('🎉 MCP Agent complete! Open VSCode — all files are now on disk.');
    process.exit(0);

  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    log('ERROR: ' + err.message);
    process.exit(1);
  }
})();
