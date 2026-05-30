/**
 * Checkout Flow Locators
 * Selectors for Cart, Checkout Step One, Checkout Step Two, and Checkout Complete pages
 * Standard SauceDemo identifiers optimized for high stability and reliability
 */

export const CheckoutLocators = Object.freeze({
  // ==================== CART PAGE (/cart.html) ====================
  cartContainer: '.cart_contents_container', // Main cart container
  cartItem: '.cart_item', // Individual cart items
  checkoutButton: '[data-test="checkout"]', // Stable data-test attribute
  continueShoppingButton: '[data-test="continue-shopping"]', // Navigation back to inventory

  // ==================== CHECKOUT STEP ONE (/checkout-step-one.html) ====================
  firstNameInput: '[data-test="firstName"]', // Stable data-test attribute
  lastNameInput: '[data-test="lastName"]', // Stable data-test attribute
  postalCodeInput: '[data-test="postalCode"]', // Stable data-test attribute

  // Step One buttons
  stepOneCancelButton: '[data-test="cancel"]', // Stable data-test attribute
  stepOneContinueButton: '[data-test="continue"]', // Stable data-test attribute

  // Checkout step one page title/indicator
  checkoutStepOneTitle: '.title', // "Checkout: Your Information"
  checkoutStepOneContainer: '#checkout_info_container', // Form container

  // ==================== CHECKOUT STEP TWO (/checkout-step-two.html) ====================
  // Item overview list
  cartItemsList: '.cart_list', // Overview items list
  cartItemName: '.inventory_item_name', // Item product name
  cartItemPrice: '.inventory_item_price', // Item price

  // Price summary section
  summarySubtotal: '.summary_subtotal_label', // Item total line
  summaryTax: '.summary_tax_label', // Tax calculation line
  summaryTotal: '.summary_total_label', // Grand total line

  // Payment and shipping info
  paymentInfo: '.summary_info_label', // Summary info label
  shippingInfo: '.summary_info_label', // Summary info label

  // Step Two buttons
  stepTwoCancelButton: '[data-test="cancel"]', // Stable data-test attribute
  stepTwoFinishButton: '[data-test="finish"]', // Stable data-test attribute

  // Checkout step two page title/indicator
  checkoutStepTwoTitle: '.title', // "Checkout: Overview"

  // ==================== CHECKOUT COMPLETE (/checkout-complete.html) ====================
  // Confirmation elements
  completionHeading: '.complete-header', // "Thank you for your order!"
  completionMessage: '.complete-text', // "Your order has been dispatched..."
  completionImage: '.pony_express', // Confirmation image

  // Return to inventory
  backHomeButton: '[data-test="back-to-products"]', // Stable data-test attribute

  // ==================== COMMON / VALIDATION ====================
  // Error messages (if validation fails)
  errorMessage: '[data-test="error"]', // Framework error display
  errorContainer: '.error-message-container' // General error container
});

export default CheckoutLocators;
