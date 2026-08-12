const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulated Output for US-004 Test Cases
const MOCK_TEST_CASES = `
Feature: Complete Checkout for Selected Products

  Scenario: Verify navigation to checkout information page
    Given the user has products in the cart
    When the user clicks Checkout
    Then the checkout information page should be displayed

  Scenario: Verify navigation to checkout overview page
    Given the user is on checkout information page
    When the user enters first name "Jatin", last name "Tester", and postal code "M5H 1H1"
    And clicks Continue
    Then the checkout overview page should be displayed

  Scenario: Verify order confirmation
    Given the user reviews the checkout overview
    When the user clicks Finish
    Then the order confirmation page should be displayed
    And the confirmation message should indicate successful purchase
`.trim();

app.post('/api/design-cases', (req, res) => {
  // Simulate AI Processing Delay
  setTimeout(() => {
    res.json({ output: MOCK_TEST_CASES });
  }, 1500);
});

app.post('/api/run-mcp', (req, res) => {
  // Write the actual files to disk so they appear in VSCode!
  const rootPath = path.join(__dirname, '..');
  
  // 1. Write the Feature File
  const featurePath = path.join(rootPath, 'features', 'checkout.feature');
  fs.writeFileSync(featurePath, MOCK_TEST_CASES, 'utf8');

  // 2. Write Step Definitions
  const stepsPath = path.join(rootPath, 'features', 'step-definitions', 'checkout.steps.js');
  const stepsCode = `
import { Given, When, Then } from "@cucumber/cucumber";
import CheckoutPage from "../../src/pages/CheckoutPage.js";

function getPage(world) {
  if (!world.checkoutPage) world.checkoutPage = new CheckoutPage(world.page);
  return world.checkoutPage;
}

Given("the user has products in the cart", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.navigateToCart();
});

When("the user clicks Checkout", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.clickCheckoutButton();
});

Then("the checkout information page should be displayed", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.verifyCheckoutInfoPageVisible();
});

Given("the user is on checkout information page", async function () {
  // Assuming setup is done by previous step or background
});

When("the user enters first name {string}, last name {string}, and postal code {string}", async function (fn, ln, pc) {
  const checkoutPage = getPage(this);
  await checkoutPage.enterCheckoutInfo(fn, ln, pc);
});

When("clicks Continue", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.clickContinueButton();
});

Then("the checkout overview page should be displayed", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.verifyOverviewPageVisible();
});

Given("the user reviews the checkout overview", async function () {
  // Handled by previous steps
});

When("the user clicks Finish", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.clickFinishButton();
});

Then("the order confirmation page should be displayed", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.verifyOrderConfirmationVisible();
});

Then("the confirmation message should indicate successful purchase", async function () {
  const checkoutPage = getPage(this);
  await checkoutPage.verifySuccessMessage();
});
`.trim();
  fs.writeFileSync(stepsPath, stepsCode, 'utf8');

  // 3. Write Page Object
  const pagePath = path.join(rootPath, 'src', 'pages', 'CheckoutPage.js');
  const pageCode = `
import { CheckoutLocators } from "../locators/CheckoutLocators.js";
import { BasePage } from "./BasePage.js";

export class CheckoutPage extends BasePage {
  locator(key) {
    return this.page.locator(CheckoutLocators[key]);
  }

  async navigateToCart() {
    await this.uiUtils.navigateToWithLog('/cart.html', { context: { page: this.page }});
  }

  async clickCheckoutButton() {
    await this.uiUtils.clickWithLog(this.locator('checkoutButton'), "Checkout Button", { context: { page: this.page }});
  }

  async verifyCheckoutInfoPageVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(this.locator('firstNameInput'), "First Name Input", { context: { page: this.page }});
  }

  async enterCheckoutInfo(fn, ln, pc) {
    await this.uiUtils.clearAndTypeWithLog(this.locator('firstNameInput'), fn, "First Name", { context: { page: this.page }});
    await this.uiUtils.clearAndTypeWithLog(this.locator('lastNameInput'), ln, "Last Name", { context: { page: this.page }});
    await this.uiUtils.clearAndTypeWithLog(this.locator('postalCodeInput'), pc, "Postal Code", { context: { page: this.page }});
  }

  async clickContinueButton() {
    await this.uiUtils.clickWithLog(this.locator('continueButton'), "Continue Button", { context: { page: this.page }});
  }

  async verifyOverviewPageVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(this.locator('finishButton'), "Finish Button", { context: { page: this.page }});
  }

  async clickFinishButton() {
    await this.uiUtils.clickWithLog(this.locator('finishButton'), "Finish Button", { context: { page: this.page }});
  }

  async verifyOrderConfirmationVisible() {
    await this.assertionUtils.expectElementVisibleWithLog(this.locator('completeContainer'), "Complete Container", { context: { page: this.page }});
  }

  async verifySuccessMessage() {
    await this.assertionUtils.expectElementVisibleWithLog(this.locator('successMessage'), "Success Message", { context: { page: this.page }});
  }
}
export default CheckoutPage;
`.trim();
  fs.writeFileSync(pagePath, pageCode, 'utf8');

  // 4. Write Locators
  const locatorsPath = path.join(rootPath, 'src', 'locators', 'CheckoutLocators.js');
  const locatorsCode = `
export const CheckoutLocators = Object.freeze({
  checkoutButton: '[data-test="checkout"]',
  firstNameInput: '[data-test="firstName"]',
  lastNameInput: '[data-test="lastName"]',
  postalCodeInput: '[data-test="postalCode"]',
  continueButton: '[data-test="continue"]',
  finishButton: '[data-test="finish"]',
  completeContainer: '#checkout_complete_container',
  successMessage: '.complete-header'
});
export default CheckoutLocators;
`.trim();
  fs.writeFileSync(locatorsPath, locatorsCode, 'utf8');

  const outputLog = `
✅ Files successfully written to repository! 
You can now open VSCode to view the physical changes.

Created: features/checkout.feature
Created: features/step-definitions/checkout.steps.js
Created: src/pages/CheckoutPage.js
Created: src/locators/CheckoutLocators.js
`.trim();

  setTimeout(() => {
    res.json({ output: outputLog });
  }, 2000);
});

// New Endpoint: Get all feature files for the dropdown
app.get('/api/features', (req, res) => {
  const featuresDir = path.join(__dirname, '..', 'features');
  fs.readdir(featuresDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Could not read features directory" });
    }
    const featureFiles = files.filter(f => f.endsWith('.feature'));
    res.json({ features: featureFiles });
  });
});

app.post('/api/execute', (req, res) => {
  const { targetFeature } = req.body;
  if (!targetFeature) {
    return res.status(400).json({ error: "Missing target feature file" });
  }

  const featurePath = path.join('features', targetFeature);
  // Execute headed, pointing specifically to the requested feature file.
  // Using npx cucumber-js directly to avoid cross-platform spawn issues with npm run scripts.
  const command = `npx cucumber-js "${featurePath}" --config cucumber.cjs`;
  
  const env = { ...process.env, HEADLESS: 'false', HEADED: 'true' };

  exec(command, { cwd: path.join(__dirname, '..'), env }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ output: stderr || stdout || error.message });
    }
    res.json({ output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Agentic Dashboard running at http://localhost:${PORT}`);
});
