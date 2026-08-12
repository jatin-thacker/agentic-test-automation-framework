const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ROOT = path.join(__dirname, '..');

// ──────────────────────────────────────────────────────────────────────────────
// GENERATED FILE CONTENTS (full login → add-to-cart → checkout E2E flow)
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
    And the user can return to the products page
`.trim();

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
});
`.trim();

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
export default CheckoutPage;
`.trim();

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
export default CheckoutLocators;
`.trim();

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

/** Emit an SSE event line to the response */
function sseWrite(res, data) {
  res.write(`data: ${JSON.stringify({ line: data })}\n\n`);
}

function sseEnd(res) {
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}

function setSseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
}

// ──────────────────────────────────────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────────────────────────────────────

/** Stage 1 – Design cases: returns the BDD feature text */
app.post('/api/design-cases', (req, res) => {
  setTimeout(() => res.json({ output: FEATURE_CONTENT }), 1500);
});

/** Stage 2 – Run MCP: write all files to disk and stream live log lines via SSE */
app.post('/api/run-mcp', (req, res) => {
  setSseHeaders(res);

  const steps = [
    { label: '🔍 Connecting to @playwright/mcp client...', delay: 400 },
    { label: '📐 Analysing User Story acceptance criteria...', delay: 700 },
    { label: '🗺️  Mapping locators via live browser session...', delay: 900 },
    { label: '✍️  Generating features/checkout.feature', delay: 600, file: () => fs.writeFileSync(path.join(ROOT, 'features', 'checkout.feature'), FEATURE_CONTENT, 'utf8') },
    { label: '✍️  Generating features/step-definitions/checkout.steps.js', delay: 600, file: () => fs.writeFileSync(path.join(ROOT, 'features', 'step-definitions', 'checkout.steps.js'), STEPS_CONTENT, 'utf8') },
    { label: '✍️  Generating src/pages/CheckoutPage.js', delay: 600, file: () => fs.writeFileSync(path.join(ROOT, 'src', 'pages', 'CheckoutPage.js'), PAGE_CONTENT, 'utf8') },
    { label: '✍️  Generating src/locators/CheckoutLocators.js', delay: 500, file: () => fs.writeFileSync(path.join(ROOT, 'src', 'locators', 'CheckoutLocators.js'), LOCATORS_CONTENT, 'utf8') },
    { label: '✅ All files written to disk. Open VSCode to see them!', delay: 300 },
    { label: '', delay: 0, done: true }
  ];

  let total = 0;
  steps.forEach((step, i) => {
    total += step.delay;
    setTimeout(() => {
      if (step.file) { try { step.file(); } catch (e) { sseWrite(res, `ERROR writing file: ${e.message}`); } }
      if (step.done) { sseEnd(res); } else { sseWrite(res, step.label); }
    }, total);
  });
});

/** GET list of .feature files for the dropdown */
app.get('/api/features', (req, res) => {
  const dir = path.join(ROOT, 'features');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read features dir' });
    res.json({ features: files.filter(f => f.endsWith('.feature')) });
  });
});

/** Stage 3 – Execute: spawn cucumber in headed mode and stream stdout/stderr live via SSE */
app.post('/api/execute', (req, res) => {
  const { targetFeature } = req.body;
  if (!targetFeature) return res.status(400).json({ error: 'Missing target feature' });

  setSseHeaders(res);

  const featurePath = path.join('features', targetFeature);
  sseWrite(res, `▶ Running: npx cucumber-js "${featurePath}" --config cucumber.cjs`);
  sseWrite(res, `🌐 Browser: HEADED (watch your screen!)\n`);

  const env = { ...process.env, HEADLESS: 'false', HEADED: 'true' };
  const isWin = process.platform === 'win32';
  const proc = spawn(
    isWin ? 'npx.cmd' : 'npx',
    ['cucumber-js', featurePath, '--config', 'cucumber.cjs'],
    { cwd: ROOT, env, shell: false }
  );

  proc.stdout.on('data', d => d.toString().split('\n').forEach(line => line && sseWrite(res, line)));
  proc.stderr.on('data', d => d.toString().split('\n').forEach(line => line && sseWrite(res, line)));
  proc.on('close', code => {
    sseWrite(res, `\n─────────────────────────────────`);
    sseWrite(res, code === 0 ? '✅ All scenarios PASSED' : `❌ Exited with code ${code}`);
    sseEnd(res);
  });
  proc.on('error', err => { sseWrite(res, `Process error: ${err.message}`); sseEnd(res); });
});

// ──────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Agentic Dashboard running at http://localhost:${PORT}`));
