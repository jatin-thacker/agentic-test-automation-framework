# US-004: Complete Checkout for Selected Products
## Comprehensive Test Case Design

**Application:** SauceDemo (https://www.saucedemo.com)  
**User Story:** US-004  
**Design Date:** May 24, 2026  
**Prepared By:** Test Case Designer Agent

---

## 1. Story Summary & Acceptance Criteria Mapping

### User Story Summary
As a shopper with products in my cart, I want to complete checkout by entering my information, so that I can place an order successfully.

### Business Value
Checkout is the core end-to-end purchase journey and should work reliably from cart review to order confirmation.

### Acceptance Criteria Mapping

| AC # | Requirement | Status | Test Case Coverage |
|------|-------------|--------|-------------------|
| AC1 | Display checkout information page when user clicks Checkout from cart | **CONFIRMED** | TC-004-001 |
| AC2 | Validate and accept user information (first name, last name, postal code); navigate to overview on Continue | **CONFIRMED** | TC-004-002, TC-004-003 |
| AC3 | Display checkout overview with selected products, subtotal, tax, and total | **CONFIRMED** | TC-004-004 |
| AC4 | Navigate to order confirmation page when user clicks Finish | **CONFIRMED** | TC-004-005 |
| AC5 | Display success confirmation message and allow return to home/products page | **CONFIRMED** | TC-004-005, TC-004-006 |

---

## 2. Test Case Table

| TC ID | Test Case Title | Priority | Scope | Automation Suitability | Preconditions |
|-------|-----------------|----------|-------|----------------------|---------------|
| TC-004-001 | Navigate to Checkout Information Page | **High** | Functional | **High** | User logged in, 2+ products in cart, on cart page |
| TC-004-002 | Submit Valid Checkout Information | **High** | Functional | **High** | User on checkout-step-one page |
| TC-004-003 | Reject Empty Required Fields | **High** | Validation | **High** | User on checkout-step-one page |
| TC-004-004 | Verify Checkout Overview Display | **High** | Functional | **High** | Valid checkout info submitted, on checkout-step-two |
| TC-004-005 | Complete Checkout and Display Confirmation | **High** | Functional | **High** | User on checkout-step-two page |
| TC-004-006 | Navigate Back Home from Confirmation | **Medium** | Navigation | **High** | User on checkout-complete page |
| TC-004-007 | Cancel Checkout at Information Step | **Medium** | Workflow | **High** | User on checkout-step-one page |
| TC-004-008 | Cancel Checkout at Overview Step | **Medium** | Workflow | **High** | User on checkout-step-two page |
| TC-004-009 | Validate Price Calculations | **Medium** | Validation | **High** | On checkout-step-two page with 2+ items |
| TC-004-010 | Complete Checkout with Single Product | **Medium** | Boundary | **High** | User logged in, 1 product in cart |
| TC-004-011 | Postal Code Field Boundary Testing | **Low** | Boundary | **Medium** | User on checkout-step-one page |
| TC-004-012 | Complete Checkout with Special Characters in Name | **Low** | Boundary | **Medium** | User on checkout-step-one page |

---

## 3. Preconditions (All Test Cases)

### Prerequisites
1. **User Authentication**
   - Username: `standard_user`
   - Password: `secret_sauce`
   - User must be successfully logged in to inventory page

2. **Cart State**
   - At least one product must be added to cart
   - Cart page is accessible at `/cart.html`
   - Remove button is functional per item

3. **Application State**
   - SauceDemo application is live and accessible
   - No server errors or maintenance mode
   - Network connectivity established

4. **Test Environment**
   - Browser: Chromium/Chrome (latest stable)
   - Viewport: Desktop standard (1280x720 or larger)
   - No browser extensions interfering with page rendering

---

## 4. Test Data Requirements

### Master Test Data Table

| Field | Value | Usage | Validation |
|-------|-------|-------|-----------|
| **First Name** | Jatin | Required, text input, max ~20 chars | Non-empty, alpha + common punctuation |
| **Last Name** | Tester | Required, text input, max ~20 chars | Non-empty, alpha + common punctuation |
| **Postal Code** | M5H 1H1 | Required, text input, Canadian postal code format | Accepts alphanumeric + space |
| **Product 1** | Sauce Labs Backpack | Product in inventory | Price: $29.99 |
| **Product 2** | Bolt T-Shirt** | Product in inventory | Price: $15.99 |
| **Expected Subtotal** | $45.98 | Product 1 + Product 2 | (29.99 + 15.99) |
| **Expected Tax** | $3.68 | Tax calculation on subtotal | Subtotal × ~8% (region-based) |
| **Expected Total** | $49.66 | Subtotal + Tax | 45.98 + 3.68 |

### Boundary Test Data

| Test Case | Field | Value | Rationale |
|-----------|-------|-------|-----------|
| TC-004-011 | Postal Code | `00000` | Numeric only, common edge case |
| TC-004-011 | Postal Code | `ABC123` | Alphanumeric, non-Canadian |
| TC-004-011 | Postal Code | ` ` | Whitespace only, should reject |
| TC-004-012 | First Name | `Jean-Marie` | Hyphenated name |
| TC-004-012 | First Name | `Maria José` | Accented character |
| TC-004-012 | Last Name | `O'Brien` | Apostrophe in name |

### Negative Test Data

| Test Case | Field | Value | Expected Behavior |
|-----------|-------|-------|------------------|
| TC-004-003 | First Name | `(empty)` | Field required error or Continue disabled |
| TC-004-003 | Last Name | `(empty)` | Field required error or Continue disabled |
| TC-004-003 | Postal Code | `(empty)` | Field required error or Continue disabled |

---

## 5. Detailed Test Case Flows

### TC-004-001: Navigate to Checkout Information Page

**Priority:** High  
**Scope:** Functional  
**Automation Suitability:** High

#### Preconditions
- User is logged in as `standard_user`
- Backpack and Bolt T-Shirt are in cart
- User is on cart page (`/cart.html`)

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify cart page displays with items | Cart page shows "Your Cart" title, item list visible |
| 2 | Verify Checkout button is visible | Checkout button displayed below item list |
| 3 | Click Checkout button | Page navigates to `/checkout-step-one.html` |
| 4 | Wait for page load (max 3 seconds) | Page is fully rendered |
| 5 | Verify checkout info page title | Page title is "Checkout: Your Information" |
| 6 | Verify form fields are displayed | First Name, Last Name, Zip Code input fields visible |
| 7 | Verify form fields are enabled | All input fields accept focus and text input |
| 8 | Verify Cancel button is visible | Cancel button displayed, clickable |
| 9 | Verify Continue button is visible | Continue button displayed, clickable |

#### Expected Results
- User successfully navigates to checkout information page
- All form fields are rendered and enabled
- Cancel and Continue buttons are functional

#### Notes
- Form fields should accept keyboard input
- Tab navigation should work through all form fields

---

### TC-004-002: Submit Valid Checkout Information

**Priority:** High  
**Scope:** Functional  
**Automation Suitability:** High

#### Preconditions
- User is on checkout info page (`/checkout-step-one.html`)
- Form fields are empty and enabled

#### Test Data
- First Name: `Jatin`
- Last Name: `Tester`
- Postal Code: `M5H 1H1`

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Click First Name input field | Field receives focus (visual indicator) |
| 2 | Type "Jatin" into First Name field | Text "Jatin" is entered and visible |
| 3 | Click Last Name input field | Field receives focus |
| 4 | Type "Tester" into Last Name field | Text "Tester" is entered and visible |
| 5 | Click Postal Code input field | Field receives focus |
| 6 | Type "M5H 1H1" into Postal Code field | Text "M5H 1H1" is entered and visible |
| 7 | Verify all fields contain expected values | All three fields display correct text |
| 8 | Click Continue button | Form submits |
| 9 | Wait for page load (max 3 seconds) | Page transitions to checkout overview |
| 10 | Verify new page URL | URL is `/checkout-step-two.html` |
| 11 | Verify checkout overview page title | Page title is "Checkout: Overview" |
| 12 | Verify products are displayed | Cart items (Backpack, T-Shirt) visible on overview page |

#### Expected Results
- All form fields accept and retain input
- Form successfully submits on Continue click
- User navigates to checkout overview page
- Entered data is persisted in session (reflected on next step if needed)

#### Notes
- Postal code format may or may not be strictly validated; app accepts the input
- Continue button should be enabled when all fields are filled
- No form validation errors should appear

---

### TC-004-003: Reject Empty Required Fields

**Priority:** High  
**Scope:** Validation  
**Automation Suitability:** High

#### Preconditions
- User is on checkout info page (`/checkout-step-one.html`)

#### Test Scenarios

##### Scenario A: All fields empty
| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify First Name field is empty | Field is blank |
| 2 | Verify Last Name field is empty | Field is blank |
| 3 | Verify Postal Code field is empty | Field is blank |
| 4 | Click Continue button | Button click is registered |
| 5 | Observe Continue button behavior | **EITHER** Button is disabled (visual feedback) **OR** Form does not submit and error message appears |

##### Scenario B: First Name only
| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Enter "Jatin" in First Name | Field contains "Jatin" |
| 2 | Leave Last Name empty | Field remains blank |
| 3 | Leave Postal Code empty | Field remains blank |
| 4 | Click Continue button | Continue button does not submit form |
| 5 | Observe error feedback | Error message or validation state indicates required fields |

##### Scenario C: Last Name + Postal Code (missing First Name)
| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Leave First Name empty | Field is blank |
| 2 | Enter "Tester" in Last Name | Field contains "Tester" |
| 3 | Enter "M5H 1H1" in Postal Code | Field contains postal code |
| 4 | Click Continue button | Form does not submit |
| 5 | Observe error feedback | Validation error or disabled state |

#### Expected Results (All Scenarios)
- Form does not advance to checkout overview when any required field is empty
- User receives clear feedback (disabled button or error message)
- User remains on checkout info page to correct the form

#### Notes
- **ASSUMPTION:** Application requires all three fields to be non-empty.
- Validation mechanism (client-side error message vs. disabled button) not yet confirmed.
- This is a critical validation check for data integrity.

---

### TC-004-004: Verify Checkout Overview Display

**Priority:** High  
**Scope:** Functional  
**Automation Suitability:** High

#### Preconditions
- User has successfully submitted valid checkout info
- User is on checkout overview page (`/checkout-step-two.html`)

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify page title | Page title is "Checkout: Overview" |
| 2 | Verify page URL | URL is `/checkout-step-two.html` |
| 3 | Verify cart items are displayed | Backpack and Bolt T-Shirt visible in item list |
| 4 | Verify item quantities | Each item shows correct quantity (1 each for standard flow) |
| 5 | Verify item prices | Backpack: $29.99, T-Shirt: $15.99 displayed |
| 6 | Verify payment info label | "Payment Information:" label visible |
| 7 | Verify payment info value | Payment method shows "SauceCard #31337" |
| 8 | Verify shipping info label | "Shipping Information:" label visible |
| 9 | Verify shipping info value | Shipping method shows "Free Pony Express Delivery!" |
| 10 | Verify subtotal label and value | "Item total:" displays $45.98 |
| 11 | Verify tax label and value | Tax amount displays $3.68 |
| 12 | Verify total label and value | Total amount displays $49.66 |
| 13 | Verify Cancel button is visible | Cancel button is clickable |
| 14 | Verify Finish button is visible | Finish button is clickable |

#### Expected Results
- All cart items are displayed with correct details
- Payment and shipping information are pre-filled and correct
- Price summary (subtotal, tax, total) is accurate and visible
- Both Cancel and Finish buttons are functional

#### Notes
- Price calculations must be exact: (29.99 + 15.99) + (45.98 × 0.08) ≈ 49.66
- Tax rate appears to be ~8% but may vary by region
- SauceCard #31337 and Pony Express are hardcoded fixtures of the app

---

### TC-004-005: Complete Checkout and Display Confirmation

**Priority:** High  
**Scope:** Functional  
**Automation Suitability:** High

#### Preconditions
- User is on checkout overview page (`/checkout-step-two.html`)
- Checkout info has been submitted
- Products are displayed on overview

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify Finish button is visible and enabled | Button is displayed and clickable |
| 2 | Click Finish button | Button click is registered |
| 3 | Wait for page load (max 3 seconds) | Page transition begins |
| 4 | Verify new page URL | URL is `/checkout-complete.html` |
| 5 | Verify page title | Page title is "Checkout: Complete!" |
| 6 | Verify success heading | Heading displays "Thank you for your order!" |
| 7 | Verify confirmation message | Message displays "Your order has been dispatched, and will arrive just as fast as the pony can get there!" |
| 8 | Verify order completion graphic | Pony Express image or icon is visible |
| 9 | Verify Back Home button is visible | "Back Home" button displayed and enabled |
| 10 | Verify cart is cleared | Subsequent check: cart page shows empty cart or item count reset |

#### Expected Results
- User successfully completes checkout
- Order confirmation page displays with success message
- Back Home button is functional
- Order is recorded (cart clears upon return to inventory)

#### Notes
- Confirmation message is user-facing proof of successful order placement
- Back Home button should navigate to inventory page (`/inventory.html`)
- This represents the successful end-to-end checkout journey

---

### TC-004-006: Navigate Back Home from Confirmation

**Priority:** Medium  
**Scope:** Navigation  
**Automation Suitability:** High

#### Preconditions
- User is on checkout complete page (`/checkout-complete.html`)

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify page is fully loaded | Page title "Checkout: Complete!" displayed |
| 2 | Verify Back Home button is visible | Button is displayed and enabled |
| 3 | Click Back Home button | Button click is registered |
| 4 | Wait for page load (max 3 seconds) | Page transitions |
| 5 | Verify new page URL | URL is `/inventory.html` |
| 6 | Verify inventory page is loaded | Products are displayed (Backpack, T-Shirt, etc.) |
| 7 | Verify cart count | Cart button shows 0 items or empty badge |
| 8 | Verify order is not repeated on refresh | Navigate back to checkout-complete; page should not be accessible or cart remains cleared |

#### Expected Results
- User successfully returns to inventory page from confirmation
- Cart is cleared after order completion
- User can add new products to initiate a new checkout flow

#### Notes
- Cart clearing confirms order was successfully persisted
- This validates the complete order lifecycle

---

### TC-004-007: Cancel Checkout at Information Step

**Priority:** Medium  
**Scope:** Workflow  
**Automation Suitability:** High

#### Preconditions
- User is on checkout info page (`/checkout-step-one.html`)

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify Cancel button is visible | Cancel button displayed on checkout info page |
| 2 | Enter "Jatin" in First Name | Field contains "Jatin" |
| 3 | Click Cancel button | Button click is registered |
| 4 | Wait for page load (max 3 seconds) | Page transitions |
| 5 | Verify new page URL | URL is `/cart.html` (or previous page) |
| 6 | Verify cart page is loaded | Cart title "Your Cart" displayed |
| 7 | Verify cart items are intact | Backpack and T-Shirt still in cart |
| 8 | Verify checkout was not completed | No order confirmation appeared |

#### Expected Results
- Cancel button successfully abandons checkout
- User returns to cart page
- Cart contents are preserved
- No partial order is created

#### Notes
- Validates user can exit checkout flow without loss of cart
- Important for multi-step form UX

---

### TC-004-008: Cancel Checkout at Overview Step

**Priority:** Medium  
**Scope:** Workflow  
**Automation Suitability:** High

#### Preconditions
- User is on checkout overview page (`/checkout-step-two.html`)

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify Cancel button is visible | Cancel button displayed on checkout overview page |
| 2 | Click Cancel button | Button click is registered |
| 3 | Wait for page load (max 3 seconds) | Page transitions |
| 4 | Verify new page URL | URL is `/cart.html` (or previous page) |
| 5 | Verify cart page is loaded | Cart title "Your Cart" displayed |
| 6 | Verify cart items are intact | Backpack and T-Shirt still in cart |
| 7 | Verify checkout was not completed | No order confirmation page appeared |

#### Expected Results
- Cancel button at overview successfully abandons checkout
- User returns to cart page
- Cart contents are preserved
- No order is created

#### Notes
- Validates abort capability at final review step
- Ensures cart data integrity throughout checkout

---

### TC-004-009: Validate Price Calculations

**Priority:** Medium  
**Scope:** Validation  
**Automation Suitability:** High

#### Preconditions
- User is on checkout overview page with 2 products (Backpack $29.99 + T-Shirt $15.99)

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Identify item prices on page | Backpack: $29.99, T-Shirt: $15.99 |
| 2 | Calculate expected subtotal | 29.99 + 15.99 = 45.98 |
| 3 | Verify displayed subtotal | Page shows "Item total: $45.98" |
| 4 | Calculate expected tax | 45.98 × 0.08 = 3.6784 ≈ $3.68 |
| 5 | Verify displayed tax | Page shows tax of $3.68 |
| 6 | Calculate expected total | 45.98 + 3.68 = 49.66 |
| 7 | Verify displayed total | Page shows "Total: $49.66" |
| 8 | Verify all prices use correct currency symbol | All amounts display "$" prefix |

#### Expected Results
- Subtotal matches sum of item prices
- Tax is calculated correctly (appears to be 8% of subtotal)
- Total is accurate (subtotal + tax)
- All values use consistent currency formatting

#### Notes
- Tax calculation confirms financial accuracy
- Critical for ecommerce compliance
- Tax rate assumption: ~8% (may be region-specific; confirm with business)

---

### TC-004-010: Complete Checkout with Single Product

**Priority:** Medium  
**Scope:** Boundary  
**Automation Suitability:** High

#### Preconditions
- User is logged in as `standard_user`
- **Only one product (Backpack, $29.99) is in the cart**
- User is on cart page

#### Test Steps

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Verify cart displays one item | Backpack visible with quantity 1 |
| 2 | Click Checkout button | Navigate to checkout-step-one |
| 3 | Enter "Jatin" in First Name | Field contains "Jatin" |
| 4 | Enter "Tester" in Last Name | Field contains "Tester" |
| 5 | Enter "M5H 1H1" in Postal Code | Field contains postal code |
| 6 | Click Continue button | Navigate to checkout-step-two |
| 7 | Verify overview shows single item | Backpack displayed with price $29.99 |
| 8 | Verify price calculation (single item) | Subtotal: $29.99 |
| 9 | Calculate and verify tax | Tax ≈ $2.40 (29.99 × 0.08) |
| 10 | Verify total | Total ≈ $32.39 |
| 11 | Click Finish button | Complete checkout |
| 12 | Verify confirmation page appears | "Thank you for your order!" displayed |

#### Expected Results
- Checkout flow works with single item
- Price calculations are correct for 1 product
- Order is successfully completed

#### Notes
- Validates minimum cart threshold (1 item is minimum)
- Ensures price logic works with single item

---

### TC-004-011: Postal Code Field Boundary Testing

**Priority:** Low  
**Scope:** Boundary  
**Automation Suitability:** Medium

#### Preconditions
- User is on checkout info page

#### Test Scenarios

| Scenario | Postal Code Input | Expected Behavior | Notes |
|----------|-------------------|------------------|-------|
| A | `00000` | Accepted or rejected | Numeric only, no letters |
| B | `ABC123` | Accepted | Alphanumeric, non-Canadian format |
| C | ` ` (space) | Rejected or requires field | Whitespace only |
| D | `M5H 1H1 ` (trailing space) | Accepted or trimmed | Canadian postal code with trailing space |
| E | (empty) | Rejected (required) | Already covered in TC-004-003 |
| F | `123456` (6 digits) | Accepted or rejected | Numeric boundary |
| G | `A1A1A1` (no space) | Accepted | Compressed Canadian format |

#### Test Steps (Example: Scenario A)

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Click Postal Code field | Field receives focus |
| 2 | Type "00000" | Field displays "00000" |
| 3 | Enter "Jatin" in First Name | Supports multi-field interaction |
| 4 | Enter "Tester" in Last Name | Supports multi-field interaction |
| 5 | Click Continue button | Observe if form accepts the numeric postal code |
| 6 | If accepted: verify navigation to step two | Postal code validation is permissive |
| 7 | If rejected: observe error message | Postal code validation enforces format |

#### Expected Results
- **ASSUMPTION:** Postal code field accepts alphanumeric and space characters but does not enforce Canadian format strictly.
- Numeric-only input likely accepted.
- Whitespace-only input likely rejected.

#### Notes
- Postal code validation rules not explicitly stated in acceptance criteria.
- **CLARIFICATION NEEDED:** Does the app enforce postal code format, or does it accept any string?

---

### TC-004-012: Complete Checkout with Special Characters in Name

**Priority:** Low  
**Scope:** Boundary  
**Automation Suitability:** Medium

#### Preconditions
- User is on checkout info page

#### Test Scenarios

| Scenario | First Name | Last Name | Expected Behavior |
|----------|-----------|-----------|------------------|
| A | `Jean-Marie` | `Tester` | Hyphenated first name accepted |
| B | `Jatin` | `O'Brien` | Apostrophe in last name accepted |
| C | `José` | `Tester` | Accented character in first name |
| D | `Jatin` | `Müller` | Umlaut in last name |
| E | `Maria José` | `Garcia-López` | Multiple special characters |

#### Test Steps (Example: Scenario A - Hyphenated Name)

| Step # | Action | Expected Result |
|--------|--------|-----------------|
| 1 | Click First Name field | Field receives focus |
| 2 | Type "Jean-Marie" | Field displays "Jean-Marie" |
| 3 | Click Last Name field | Field receives focus |
| 4 | Type "Tester" | Field displays "Tester" |
| 5 | Enter "M5H 1H1" in Postal Code | Field accepts postal code |
| 6 | Click Continue button | Form submits and navigates to step two |
| 7 | Verify name persists (if needed on overview) | Special characters are retained |

#### Expected Results
- **ASSUMPTION:** Name fields accept hyphens, apostrophes, and accented characters.
- Names are stored as-is without sanitization.
- Special characters do not break the form or subsequent processing.

#### Notes
- This validates international name support.
- **CLARIFICATION NEEDED:** Are there any restrictions on name characters (e.g., length, symbols)?
- This is a boundary test for user inclusivity and data integrity.

---

## 6. Test Data Summary

### Standard Test Data Set (Recommended for Automation)

```json
{
  "user": {
    "username": "standard_user",
    "password": "secret_sauce"
  },
  "checkoutInfo": {
    "firstName": "Jatin",
    "lastName": "Tester",
    "postalCode": "M5H 1H1"
  },
  "cartProducts": [
    {
      "name": "Sauce Labs Backpack",
      "price": 29.99,
      "quantity": 1
    },
    {
      "name": "Bolt T-Shirt",
      "price": 15.99,
      "quantity": 1
    }
  ],
  "expectedPriceSummary": {
    "subtotal": 45.98,
    "tax": 3.68,
    "total": 49.66
  },
  "paymentInfo": "SauceCard #31337",
  "shippingInfo": "Free Pony Express Delivery!"
}
```

### Test Data Sets for Edge Cases

#### Single Product Checkout
```json
{
  "cartProducts": [
    {
      "name": "Sauce Labs Backpack",
      "price": 29.99,
      "quantity": 1
    }
  ],
  "expectedPriceSummary": {
    "subtotal": 29.99,
    "tax": 2.40,
    "total": 32.39
  }
}
```

#### Special Characters in Names
```json
{
  "checkoutInfo": {
    "firstName": "Jean-Marie",
    "lastName": "O'Brien",
    "postalCode": "M5H 1H1"
  }
}
```

---

## 7. Risk & Assumption Notes

### Critical Assumptions

| # | Assumption | Impact | Confirmation Status |
|---|-----------|--------|-------------------|
| A1 | Application enforces all three form fields as required (no partial submission) | **HIGH** | **ASSUMED** - Not explicitly tested; validate with app |
| A2 | Tax rate is fixed at ~8% or calculated consistently | **HIGH** | **ASSUMED** - Observed pattern; may vary by region |
| A3 | Postal code field does not enforce format validation (accepts alphanumeric + space) | **MEDIUM** | **ASSUMED** - Needs confirmation with business |
| A4 | Cart clears immediately after order completion | **MEDIUM** | **ASSUMED** - Standard ecommerce behavior; verify backend |
| A5 | SauceCard #31337 is a hardcoded fixture and will not change | **LOW** | **CONFIRMED** - Consistent across test runs |
| A6 | User cannot proceed through checkout without products in cart | **HIGH** | **ASSUMED** - Logical guard; validate path |
| A7 | Checkout information is session-scoped (not persisted across sessions) | **MEDIUM** | **ASSUMED** - Standard practice; confirm storage strategy |

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **R1: Network Latency** | Medium | Page loads delay, timeout | Add configurable wait timeouts (3-5 sec); handle flaky transitions |
| **R2: Tax Calculation Variance** | Low | Price assertions fail if tax rate changes | Store expected price as data; allow ±0.01 tolerance for rounding |
| **R3: Form Validation Not Enforced** | Low | Invalid postal codes accepted, creating bad data | Add secondary validation in test assertions or business rules check |
| **R4: Cart Persistence Bug** | Low | Cart not clearing after order, test isolation fails | Verify cart state before each test; add cleanup step if needed |
| **R5: Postal Code Format Ambiguity** | Medium | Test fails if format validation is added | Confirm postal code acceptance rules with product team |
| **R6: International User Names** | Low | Special characters cause errors or data loss | Test with multiple character sets; validate character encoding |
| **R7: Accessibility Issues** | Low | Form labels missing aria-labels, input fields not accessible | Verify ARIA labels on all form fields; validate keyboard navigation |

### Assumptions Requiring Clarification

| # | Question | Owner | Priority |
|---|----------|-------|----------|
| Q1 | Does the postal code field enforce any specific format (e.g., Canadian postal code only)? | Product/QA | **HIGH** |
| Q2 | What is the exact tax calculation formula and rate? Is it region-specific? | Finance/Product | **HIGH** |
| Q3 | Are there any length limitations on First Name and Last Name fields? | Dev/Product | **MEDIUM** |
| Q4 | Can special characters (hyphens, apostrophes, accents) be used in name fields? | Dev/Product | **MEDIUM** |
| Q5 | Is checkout information validated server-side or only client-side? | Dev/Security | **MEDIUM** |
| Q6 | How long is a checkout session valid? Can users return after timeout? | Dev/Product | **LOW** |
| Q7 | Is there a maximum number of items per order? | Product/Business | **LOW** |

---

## 8. Edge Cases & Negative Scenarios

### Additional Test Cases (Not in Main Table)

#### EC-001: Rapid Form Submission (Double-Click)
- **Scenario:** User clicks Continue button twice rapidly
- **Expected:** Form submits once; no duplicate order created
- **Priority:** Low
- **Automation Suitability:** Medium (timing-dependent)

#### EC-002: Browser Back Button During Checkout
- **Scenario:** User clicks browser back button on checkout-step-two
- **Expected:** User returns to checkout-step-one with data retained OR clears form
- **Priority:** Low
- **Automation Suitability:** High

#### EC-003: Tab/Enter Navigation Through Form Fields
- **Scenario:** User navigates form using Tab and submits with Enter key
- **Expected:** Form submits successfully without mouse click
- **Priority:** Low
- **Automation Suitability:** High

#### EC-004: Copy-Paste Large Text into Name Fields
- **Scenario:** User copies 500+ character string and pastes into First Name
- **Expected:** Field accepts reasonable length; excessive input is truncated or rejected
- **Priority:** Low
- **Automation Suitability:** Medium

#### EC-005: Session Timeout During Checkout
- **Scenario:** User is idle on checkout-step-one for extended period (e.g., 30 min)
- **Expected:** Session expires; user is redirected to login or receives timeout message
- **Priority:** Low
- **Automation Suitability:** Low (requires session management setup)

#### EC-006: Multiple Browsers/Tabs
- **Scenario:** User adds products in Tab A, logs out in Tab B, returns to Tab A checkout
- **Expected:** Checkout may fail or session is invalidated; user is prompted to re-login
- **Priority:** Low
- **Automation Suitability:** Medium

#### EC-007: Concurrent Orders by Same User
- **Scenario:** User submits checkout in one window, immediately submits again in another
- **Expected:** Only one order is created; second attempt fails or is queued
- **Priority:** Low
- **Automation Suitability:** Low (concurrent testing complexity)

---

## 9. Open Questions for Product/Business Clarification

### Must-Have Answers Before Full Automation

1. **Postal Code Validation Rule**
   - Does the app enforce Canadian postal code format (e.g., A1A 1A1)?
   - Does it accept any alphanumeric input?
   - Are there length constraints?
   - **Impact:** TC-004-011 test data and assertions

2. **Tax Calculation Details**
   - Is the tax rate fixed at 8%, or does it vary by location/user?
   - Is tax calculated before or after discounts (if any)?
   - What is the rounding rule (round-down, round-up, banker's rounding)?
   - **Impact:** TC-004-004 and TC-004-009 assertions

3. **Name Field Constraints**
   - Are there maximum length limits for First Name and Last Name?
   - Which special characters are allowed (hyphens, apostrophes, accents, emojis)?
   - Should names be trimmed of leading/trailing whitespace?
   - **Impact:** TC-004-012 and name input validation

4. **Form Validation Strategy**
   - Is validation performed client-side, server-side, or both?
   - What error messages or visual feedback should appear for invalid input?
   - How does the app handle partially-filled forms?
   - **Impact:** TC-004-003 and all validation assertions

5. **Cart Clearing Behavior**
   - Is the cart cleared immediately after order completion, or after confirmation page display?
   - Is there a backend API call to finalize the order?
   - **Impact:** TC-004-005 and TC-004-006 verification steps

6. **Session & Data Persistence**
   - Are checkout details (name, postal code) stored or purely session-based?
   - Can users retrieve past orders?
   - How long is a checkout session valid?
   - **Impact:** Cleanup and isolation strategy for test automation

7. **Payment & Shipping Info**
   - Is the hardcoded SauceCard #31337 always used, or does it vary per user/order?
   - Is the "Free Pony Express Delivery!" message always shown?
   - Are there alternative payment/shipping options?
   - **Impact:** Assertion logic for TC-004-004

---

## 10. Automation Readiness Summary

### Automation-Ready Test Cases
The following test cases are **immediately ready for automation** with high confidence:

- **TC-004-001:** Navigate to Checkout Information Page ✓
- **TC-004-002:** Submit Valid Checkout Information ✓
- **TC-004-004:** Verify Checkout Overview Display ✓
- **TC-004-005:** Complete Checkout and Display Confirmation ✓
- **TC-004-006:** Navigate Back Home from Confirmation ✓
- **TC-004-007:** Cancel Checkout at Information Step ✓
- **TC-004-008:** Cancel Checkout at Overview Step ✓
- **TC-004-009:** Validate Price Calculations ✓

### Conditional Automation Cases
The following require clarification before full implementation:

- **TC-004-003:** Reject Empty Required Fields (need validation mechanism details)
- **TC-004-010:** Complete Checkout with Single Product (need to confirm single-item checkout is supported)
- **TC-004-011:** Postal Code Field Boundary Testing (need postal code rules)
- **TC-004-012:** Special Characters in Name (need character set validation rules)

---

## 11. Recommendations for Automation Framework

### Suggested Page Object Methods

```javascript
// LoginPage.js (already exists; reuse)
await loginPage.login('standard_user', 'secret_sauce');

// CartPage.js (create or update)
await cartPage.clickCheckout();
await cartPage.verifyItemsInCart(['Sauce Labs Backpack', 'Bolt T-Shirt']);
await cartPage.verifyCheckoutButtonVisible();

// CheckoutInfoPage.js (new)
await checkoutInfoPage.fillCheckoutForm('Jatin', 'Tester', 'M5H 1H1');
await checkoutInfoPage.clickContinue();
await checkoutInfoPage.clickCancel();
await checkoutInfoPage.verifyFormFieldsVisible();
await checkoutInfoPage.verifyFormFieldsRequired(); // validation check

// CheckoutOverviewPage.js (new)
await checkoutOverviewPage.verifyItemsInOverview(['Sauce Labs Backpack', 'Bolt T-Shirt']);
await checkoutOverviewPage.verifyPriceCalculations(subtotal, tax, total);
await checkoutOverviewPage.verifyPaymentInfo('SauceCard #31337');
await checkoutOverviewPage.verifyShippingInfo('Free Pony Express Delivery!');
await checkoutOverviewPage.clickFinish();
await checkoutOverviewPage.clickCancel();

// CheckoutCompletePage.js (new)
await checkoutCompletePage.verifyConfirmationMessage();
await checkoutCompletePage.verifyOrderCompletionDisplay();
await checkoutCompletePage.clickBackHome();
```

### Suggested Step Definition Structure

```javascript
// checkout.steps.js
Given('user is on cart page with products', async function() {
  // Navigate to cart, verify items
});

When('user clicks Checkout', async function() {
  await cartPage.clickCheckout();
});

When('user enters checkout information {string} {string} {string}', async function(firstName, lastName, postalCode) {
  await checkoutInfoPage.fillCheckoutForm(firstName, lastName, postalCode);
});

When('user clicks Continue', async function() {
  await checkoutInfoPage.clickContinue();
});

Then('checkout overview page should be displayed', async function() {
  await checkoutOverviewPage.verifyPageLoaded();
});

Then('price calculations should be correct', async function() {
  // Assert subtotal, tax, total
});
```

### Suggested Test Data Structure

```javascript
// src/data/checkoutTestData.js
module.exports = {
  validCheckoutInfo: {
    firstName: 'Jatin',
    lastName: 'Tester',
    postalCode: 'M5H 1H1'
  },
  products: {
    backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
    tshirt: { name: 'Bolt T-Shirt', price: 15.99 }
  },
  expectedPrices: {
    subtotal: 45.98,
    tax: 3.68,
    total: 49.66
  }
};
```

---

## Summary

This test case design for **US-004: Complete Checkout for Selected Products** provides:

✓ **8 primary functional test cases** covering end-to-end checkout flow  
✓ **4 secondary test cases** for edge cases, boundary conditions, and negative scenarios  
✓ **Detailed step-by-step flows** with expected results  
✓ **Clear preconditions, test data, and assertions**  
✓ **Risk assessment and assumption documentation**  
✓ **7 open questions** requiring product team clarification  
✓ **Automation-ready recommendations** for framework implementation  

### Next Steps

1. **Validate assumptions** with product/business team (Q1-Q7)
2. **Create locator modules** for checkout pages (CheckoutInfoLocators, CheckoutOverviewLocators, CheckoutCompleteLocators)
3. **Implement page objects** for checkout workflow
4. **Develop step definitions** aligned with acceptance criteria
5. **Execute test automation** for TC-004-001 through TC-004-009
6. **Implement edge cases** after primary flow validation
7. **Generate execution report** with results and coverage metrics

---

**Document Version:** 1.0  
**Last Updated:** May 24, 2026  
**Status:** Ready for Implementation  
