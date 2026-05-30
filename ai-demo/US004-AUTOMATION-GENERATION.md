# US004 Checkout Flow - Framework Automation Implementation
**Status: READY FOR EXECUTION**  
**Generated:** 2026-05-24  
**Test Cases:** 8 approved functional scenarios (TC-004-001 through TC-004-008)

---

## ✅ Artifacts Generated

### 1. **src/locators/CheckoutLocators.js**
Locator definitions for all checkout pages. Follows the established pattern from LoginLocators.

**Key Elements Defined:**
- Cart page: `checkoutButton`, `cartContainer`, `continueShoppingButton`
- Checkout Step One: `firstNameInput`, `lastNameInput`, `postalCodeInput`, `stepOneCancelButton`, `stepOneContinueButton`
- Checkout Step Two: `cartItemsList`, `summarySubtotal`, `summaryTax`, `summaryTotal`, `stepTwoCancelButton`, `stepTwoFinishButton`
- Checkout Complete: `completionHeading`, `completionMessage`, `backHomeButton`
- Validation: `errorMessage`, `errorContainer`

**Lines of Code:** 67  
**Validation Status:** ✅ All selectors MCP-verified on 2026-05-24

---

### 2. **src/pages/CheckoutPage.js**
Page object implementing all checkout workflows. Extends BasePage to reuse framework utilities.

**Key Methods:**
| Method | Purpose | Usage |
|--------|---------|-------|
| `proceedToCheckout()` | Navigate cart → step-one | TC-004-001 |
| `enterCheckoutInfo(firstName, lastName, postalCode)` | Fill form fields | TC-004-002, TC-004-004 |
| `submitCheckoutInfo()` | Click Continue button | TC-004-002 |
| `verifyCheckoutOverviewPage()` | Assert overview page loaded | TC-004-004 |
| `verifyOrderTotal(expectedTotal)` | Validate order total | TC-004-004, TC-004-005 |
| `finishCheckout()` | Click Finish button | TC-004-005 |
| `verifyOrderConfirmation()` | Assert confirmation displayed | TC-004-005 |
| `clickBackHome()` | Return to inventory | TC-004-006 |
| `cancelCheckoutFromStepOne()` | Cancel from info page | TC-004-007 |
| `cancelCheckoutFromStepTwo()` | Cancel from overview page | TC-004-008 |
| `getErrorMessage()` | Retrieve validation error | TC-004-003 |

**Lines of Code:** 245  
**Framework Integration:** ✅ Uses UIUtils, WaitUtils, AssertionUtils, ScreenshotUtils

---

### 3. **features/checkout.feature**
Gherkin feature file with 8 approved test case scenarios.

**Scenarios:**
- TC-004-001: Navigate to Checkout Info Page
- TC-004-002: Submit Valid Checkout Information
- TC-004-003: Reject Empty Required Fields
- TC-004-004: Verify Checkout Overview Display
- TC-004-005: Complete Checkout & Display Confirmation
- TC-004-006: Navigate Back Home from Confirmation
- TC-004-007: Cancel at Information Step
- TC-004-008: Cancel at Overview Step

**Tags:** @checkout, @tc-004-XXX, @happy-path, @validation, @cancellation  
**Lines of Code:** 77

---

### 4. **features/step-definitions/checkout.steps.js**
Thin, business-readable step definitions calling CheckoutPage methods.

**Step Implementations:** 25+
- Background steps: launch application (via login), navigate to cart, add product
- Checkout info page steps: click checkout, enter info, click continue, verify page
- Validation steps: click continue empty, verify error message
- Overview page steps: verify summary, verify price breakdown, verify totals
- Completion steps: click finish, verify confirmation, click back home
- Cancellation steps: cancel from step-one, cancel from step-two

**Lines of Code:** 185  
**Framework Compliance:** ✅ Thin steps, page object calls, test data integration

---

### 5. **src/data/CheckoutTestData.js**
Test data module with standard, edge, and invalid cases.

**Data Categories:**
| Category | Data Set | Description |
|----------|----------|-------------|
| **standard** | Jatin Tester, M5H 1H1 | Happy path (Canadian postal code) |
| **edge.withSpecialChars** | Jean-Marc O'Brien, A1B-2C3 | Names with hyphens/apostrophes |
| **edge.longNames** | Christopher Williamson, 12345 | Longer names with numeric postal code |
| **edge.singleCharNames** | J, D, 00000 | Minimum valid single-char names |
| **invalid.emptyFirstName** | "", Smith, 12345 | Validation test |
| **invalid.emptyLastName** | John, "", 12345 | Validation test |
| **invalid.emptyPostalCode** | John, Smith, "" | Validation test |
| **invalid.allFieldsEmpty** | "", "", "" | Validation test |

**Helper Function:** `getCheckoutTestData(category, key)`  
**Lines of Code:** 65

---

## ✅ Framework Conventions Compliance

| Convention | Status | Evidence |
|-----------|--------|----------|
| Locators own selectors | ✅ | CheckoutLocators.js defines all page selectors |
| Page objects own workflows | ✅ | CheckoutPage.js has 12+ workflow methods |
| Step definitions call page objects | ✅ | All steps use CheckoutPage methods |
| No hardcoded selectors in steps/pages | ✅ | All selectors via CheckoutLocators.locator(key) |
| Reuse BasePage utilities | ✅ | UIUtils, WaitUtils, AssertionUtils, ScreenshotUtils |
| Stable selectors only | ✅ | aria-label, text, data-test, role-based |
| Feature files under features/ | ✅ | features/checkout.feature |
| Step definitions under features/step-definitions/ | ✅ | features/step-definitions/checkout.steps.js |
| Locators under src/locators/ | ✅ | src/locators/CheckoutLocators.js |
| Pages under src/pages/ | ✅ | src/pages/CheckoutPage.js |
| Data under src/data/ | ✅ | src/data/CheckoutTestData.js |

---

## ✅ MCP Validation Summary

**Selectors Validated via Playwright MCP (2026-05-24):**

### Cart Page
- ✅ Checkout button: `button:has-text("Checkout")`
- ✅ Cart container: `[data-test="cart-contents"]`

### Checkout Step One
- ✅ First Name input: `[aria-label="First Name"]`
- ✅ Last Name input: `[aria-label="Last Name"]`
- ✅ Postal Code input: `[aria-label="Zip/Postal Code"]`
- ✅ Continue button: `button:has-text("Continue")`
- ✅ Cancel button: `button:has-text("Cancel")`

### Checkout Step Two
- ✅ Items list: `[data-test="cart-contents"]`
- ✅ Subtotal: `[data-test="subtotal-label"]`
- ✅ Tax: `[data-test="tax-label"]`
- ✅ Total: `[data-test="total-label"]`
- ✅ Finish button: `button:has-text("Finish")`
- ✅ Cancel button: `button:has-text("Cancel")`

### Checkout Complete
- ✅ Heading: `.complete-header` (text: "Thank you for your order!")
- ✅ Message: `.complete-text`
- ✅ Back Home button: `button:has-text("Back Home")`

---

## ✅ Critical Assumptions

1. **Form Validation:** All three checkout fields (firstName, lastName, postalCode) are required
   - Empty submission is prevented by client-side validation
   - Error message appears if field is missing

2. **Page URLs:** Checkout flow uses predictable URL structure
   - `/cart.html` → `/checkout-step-one.html` → `/checkout-step-two.html` → `/checkout-complete.html`

3. **Button Behavior:** All navigation buttons have distinctive text
   - Allows reliable selection via `button:has-text("Label")`

4. **Cart Persistence:** Cart state persists across checkout steps
   - Items visible on both overview and confirmation pages

5. **Session Isolation:** Each test has isolated session
   - Checkout data not persisted across tests

---

## ✅ Ready-to-Run Checklist

- [x] All 5 artifact files created
- [x] Locator selectors MCP-validated
- [x] Page object methods implemented
- [x] Feature file with 8 test cases
- [x] Step definitions for all scenarios
- [x] Test data module with standard + edge cases
- [x] Framework conventions followed
- [x] BasePage utilities reused
- [x] No duplicate code
- [x] Comments for MCP validation status
- [x] Thin, business-readable steps

---

## 🚀 Next Steps

### Execute Tests
```bash
npm run test -- --tags @checkout
```

### Run Specific Test Case
```bash
npm run test -- --tags @tc-004-002
```

### Generate Report
Tests will automatically generate:
- Action logs: `src/reports/action-logs/`
- Cucumber JSON: `src/reports/cucumber-json/`
- Screenshots: `src/reports/screenshots/`
- HTML report: Via ReportManager

---

## 📋 Test Execution Evidence Required

After running tests, collect:
1. **Pass/Fail Status** for each of 8 test cases
2. **Screenshots** from each scenario execution
3. **Action Logs** showing all UI interactions
4. **HTML Report** with test summary
5. **Any Validation Errors** or Assumption Violations

---

## 📝 Notes

- **Login Prerequisite:** All scenarios assume user is logged in via Background steps
- **Product Addition:** First product (Sauce Labs Backpack) added to cart via `add-to-cart-sauce-labs-backpack` selector
- **Test Data:** Checkout test data is independent from Login test data (uses .js module instead of Excel)
- **Error Handling:** Graceful handling of validation errors and unexpected URLs
- **Logging:** All UI actions logged via UIUtils for reporting and debugging

---

**Framework Version:** JavaScript Playwright + Cucumber  
**Generated by:** Framework Automation Generator Agent  
**Date:** 2026-05-24
