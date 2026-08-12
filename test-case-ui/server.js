const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
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

// Simulated Output for US-004 MCP Script Generation
const MOCK_SCRIPTS = `
// 📄 features/step-definitions/checkout.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const CheckoutPage = require('../../src/pages/CheckoutPage.js');

Given("the user has products in the cart", async function () {
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.navigateToCart();
});

When("the user clicks Checkout", async function () {
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.clickCheckoutButton();
});

Then("the checkout information page should be displayed", async function () {
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.verifyCheckoutInfoPageVisible();
});

// 📄 src/pages/CheckoutPage.js
const CheckoutLocators = require('../locators/CheckoutLocators.js');
const BasePage = require('./BasePage.js');

class CheckoutPage extends BasePage {
  async clickCheckoutButton() {
    await this.uiUtils.clickWithLog(
      this.page.locator(CheckoutLocators.checkoutButton), 
      "Checkout Button",
      { context: { page: this.page } }
    );
  }
}
module.exports = CheckoutPage;
`.trim();

app.post('/api/design-cases', (req, res) => {
  // Simulate AI Processing Delay
  setTimeout(() => {
    res.json({ output: MOCK_TEST_CASES });
  }, 2000);
});

app.post('/api/run-mcp', (req, res) => {
  // Simulate MCP Generation Delay
  setTimeout(() => {
    res.json({ output: MOCK_SCRIPTS });
  }, 3500);
});

app.post('/api/execute', (req, res) => {
  const command = `npm run test:smoke`;
  
  exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ output: stderr || error.message });
    }
    res.json({ output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Agentic Dashboard running at http://localhost:${PORT}`);
});
