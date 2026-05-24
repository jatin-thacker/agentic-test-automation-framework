# SauceDemo User Stories for Test Automation

Base URL: https://www.saucedemo.com/  
Primary valid username: standard_user  
Password: secret_sauce  
Application name/header: Swag Labs  
Primary modules: Login, Inventory, Product Details, Cart, Checkout, Menu/Logout

---

## US-001: Login to SauceDemo with Valid and Invalid Credentials

### User Story
As a SauceDemo shopper,  
I want to log in with valid credentials,  
so that I can access the product inventory page.

### Business Value
Valid users should be able to access the shopping experience, while invalid or restricted users should be blocked with clear error messages.

### Preconditions
- User is on the SauceDemo login page.
- Application is available.
- Test data is available.

### Test Data
| Scenario | Username | Password | Expected Result |
|---|---|---|---|
| Valid login | standard_user | secret_sauce | User lands on Products/Inventory page |
| Locked user | locked_out_user | secret_sauce | Error message is displayed |
| Empty username | blank | secret_sauce | Username required error |
| Empty password | standard_user | blank | Password required error |
| Invalid credentials | wrong_user | wrong_password | Username/password mismatch error |

### Acceptance Criteria
1. Given the user is on the login page  
   When the user enters `standard_user` and `secret_sauce`  
   Then the user should be redirected to the inventory page.

2. Given the user is on the login page  
   When the user logs in with `locked_out_user` and `secret_sauce`  
   Then the user should remain on the login page  
   And an error message should be displayed.

3. Given the user is on the login page  
   When the user clicks Login without entering username  
   Then a username required error should be displayed.

4. Given the user is on the login page  
   When the user enters username but leaves password blank  
   Then a password required error should be displayed.

### Automation Notes
- Verify URL contains `/inventory.html` after successful login.
- Verify page title/header contains `Swag Labs` or Products page is visible.
- Validate error banner text for negative scenarios.
- Suggested reusable function: `login(username, password)`.

---

## US-002: View Product Inventory and Sort Products

### User Story
As a logged-in shopper,  
I want to view and sort available products,  
so that I can browse items by name or price.

### Business Value
The product catalog should display items clearly and allow users to organize products based on preference.

### Preconditions
- User is logged in as `standard_user`.
- User is on the inventory/products page.

### Acceptance Criteria
1. Given the user is logged in  
   When the inventory page loads  
   Then the product list should be visible  
   And multiple product cards should be displayed.

2. Given the user is on the inventory page  
   When the user selects sort option `Name (A to Z)`  
   Then products should be sorted alphabetically ascending.

3. Given the user is on the inventory page  
   When the user selects sort option `Name (Z to A)`  
   Then products should be sorted alphabetically descending.

4. Given the user is on the inventory page  
   When the user selects sort option `Price (low to high)`  
   Then products should be sorted by price ascending.

5. Given the user is on the inventory page  
   When the user selects sort option `Price (high to low)`  
   Then products should be sorted by price descending.

### Automation Notes
- Capture all displayed product names and prices before/after sorting.
- Do not hard-code only one product order if the site data changes; compare sorted UI list with programmatically sorted list.
- Suggested reusable functions:
  - `getProductNames()`
  - `getProductPrices()`
  - `sortProducts(option)`
  - `verifySortedAscending(values)`
  - `verifySortedDescending(values)`

---

## US-003: Add and Remove Products from Cart

### User Story
As a logged-in shopper,  
I want to add and remove products from my cart,  
so that I can control what I intend to purchase.

### Business Value
Cart actions must be accurate because they directly affect checkout and order totals.

### Preconditions
- User is logged in as `standard_user`.
- User is on the inventory page.
- Cart is empty or application state is reset.

### Test Data
Example products:
- Sauce Labs Backpack
- Sauce Labs Bike Light

### Acceptance Criteria
1. Given the user is on the inventory page  
   When the user clicks `Add to cart` for `Sauce Labs Backpack`  
   Then the button should change to `Remove`  
   And the cart badge should show `1`.

2. Given the user has one item in the cart  
   When the user adds `Sauce Labs Bike Light`  
   Then the cart badge should show `2`.

3. Given the user has added products to the cart  
   When the user opens the cart page  
   Then the added products should be listed in the cart.

4. Given the user is on the cart page  
   When the user removes one product  
   Then that product should no longer appear in the cart  
   And the cart badge count should decrease.

5. Given all products are removed from the cart  
   Then the cart badge should not be displayed or should indicate zero items.

### Automation Notes
- Validate both UI button state and cart badge count.
- Validate product name consistency between Inventory and Cart pages.
- Suggested reusable functions:
  - `addProductToCart(productName)`
  - `removeProductFromCart(productName)`
  - `openCart()`
  - `getCartBadgeCount()`
  - `verifyProductInCart(productName)`
  - `verifyProductNotInCart(productName)`

---

## US-004: Complete Checkout for Selected Products

### User Story
As a shopper with products in my cart,  
I want to complete checkout by entering my information,  
so that I can place an order successfully.

### Business Value
Checkout is the core end-to-end purchase journey and should work reliably from cart review to order confirmation.

### Preconditions
- User is logged in as `standard_user`.
- At least one product is added to the cart.
- User is on the cart page.

### Test Data
| Field | Value |
|---|---|
| First Name | Jatin |
| Last Name | Tester |
| Postal Code | M5H 1H1 |

### Acceptance Criteria
1. Given the user has products in the cart  
   When the user clicks `Checkout`  
   Then the checkout information page should be displayed.

2. Given the user is on checkout information page  
   When the user enters first name, last name, and postal code  
   And clicks `Continue`  
   Then the checkout overview page should be displayed.

3. Given the user is on checkout overview page  
   Then selected products should be displayed  
   And item subtotal, tax, and total should be visible.

4. Given the user reviews the checkout overview  
   When the user clicks `Finish`  
   Then the order confirmation page should be displayed.

5. Given the order is completed  
   Then the confirmation message should indicate successful purchase  
   And the user should be able to return back home/products page.

### Automation Notes
- Validate navigation through:
  - Cart page
  - Checkout information page
  - Checkout overview page
  - Checkout complete page
- Validate confirmation text such as successful order completion.
- Suggested reusable functions:
  - `checkout(firstName, lastName, postalCode)`
  - `verifyCheckoutOverview()`
  - `finishCheckout()`
  - `verifyOrderConfirmation()`

---

## US-005: Validate Checkout Form Errors and Logout

### User Story
As a shopper,  
I want checkout fields to be mandatory and logout to end my session,  
so that incomplete orders are blocked and my session remains secure.

### Business Value
Mandatory checkout validation protects data quality, while logout confirms session control.

### Preconditions
- User is logged in as `standard_user`.
- User has at least one item in the cart.
- User is on the checkout information page.

### Acceptance Criteria
1. Given the user is on checkout information page  
   When the user clicks `Continue` without entering any details  
   Then a first name required error should be displayed.

2. Given the user enters first name only  
   When the user clicks `Continue`  
   Then a last name required error should be displayed.

3. Given the user enters first name and last name only  
   When the user clicks `Continue`  
   Then a postal code required error should be displayed.

4. Given the user is logged in  
   When the user opens the side menu  
   And clicks `Logout`  
   Then the user should return to the login page.

5. Given the user has logged out  
   Then protected inventory/cart pages should not be accessible without logging in again.

### Automation Notes
- Keep checkout validation separate from happy-path checkout.
- Verify error message container is visible and contains expected text.
- After logout, verify username and password fields are visible.
- Suggested reusable functions:
  - `attemptCheckoutWithoutRequiredFields()`
  - `verifyCheckoutError(errorText)`
  - `openMenu()`
  - `logout()`
  - `verifyLoginPage()`
