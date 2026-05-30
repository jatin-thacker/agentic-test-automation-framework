Feature: Checkout Flow
  Validate complete checkout process from cart through order confirmation on SauceDemo

  Background:
    Given the user launches the application
    When the user logs in using test data row "StandardUser"
    And the user adds a product to the cart
    And the user navigates to the cart page

  # ==================== TC-004-001: Navigate to Checkout Info Page ====================
  @checkout @tc-004-001 @happy-path
  Scenario: Navigate to Checkout Info Page
    When the user clicks the Checkout button
    Then the user should be on the checkout information page

  # ==================== TC-004-002: Submit Valid Checkout Information ====================
  @checkout @tc-004-002 @happy-path
  Scenario: Submit Valid Checkout Information
    When the user clicks the Checkout button
    And the user enters checkout information using test data "standard"
    And the user clicks the Continue button
    Then the user should be on the checkout overview page

  # ==================== TC-004-003: Reject Empty Required Fields ====================
  @checkout @tc-004-003 @validation
  Scenario: Reject Empty Required Fields
    When the user clicks the Checkout button
    And the user clicks the Continue button without entering any information
    Then an error message should be displayed for missing first name

  # ==================== TC-004-004: Verify Checkout Overview Display ====================
  @checkout @tc-004-004 @happy-path
  Scenario: Verify Checkout Overview Display
    When the user clicks the Checkout button
    And the user enters checkout information using test data "standard"
    And the user clicks the Continue button
    Then the checkout overview page should display the order summary
    And the checkout overview page should display the price breakdown

  # ==================== TC-004-005: Complete Checkout & Display Confirmation ====================
  @checkout @tc-004-005 @happy-path
  Scenario: Complete Checkout & Display Confirmation
    When the user clicks the Checkout button
    And the user enters checkout information using test data "standard"
    And the user clicks the Continue button
    And the user clicks the Finish button
    Then the order confirmation page should be displayed
    And the order confirmation message should say "Thank you for your order!"

  # ==================== TC-004-006: Navigate Back Home from Confirmation ====================
  @checkout @tc-004-006 @happy-path
  Scenario: Navigate Back Home from Confirmation
    When the user clicks the Checkout button
    And the user enters checkout information using test data "standard"
    And the user clicks the Continue button
    And the user clicks the Finish button
    And the user clicks the Back Home button
    Then the user should be navigated to the inventory page

  # ==================== TC-004-007: Cancel at Information Step (returns to cart) ====================
  @checkout @tc-004-007 @cancellation
  Scenario: Cancel at Information Step (returns to cart)
    When the user clicks the Checkout button
    And the user clicks the Cancel button on the checkout information page
    Then the user should be navigated to the cart page

  # ==================== TC-004-008: Cancel at Overview Step (returns to cart) ====================
  @checkout @tc-004-008 @cancellation
  Scenario: Cancel at Overview Step (returns to cart)
    When the user clicks the Checkout button
    And the user enters checkout information using test data "standard"
    And the user clicks the Continue button
    And the user clicks the Cancel button on the checkout overview page
    Then the user should be navigated to the inventory page
