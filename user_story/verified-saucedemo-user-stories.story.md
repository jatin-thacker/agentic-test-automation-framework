# Verified SauceDemo User Stories

The following user stories are based on a hands-on walkthrough of https://www.saucedemo.com.
They assume login with `standard_user` and password `secret_sauce`.

---

## US-1: Login with Valid and Invalid Credentials

**Story:** As a shopper, I need to sign in to Saucedemo so that I can access the product catalog.

**Business Value:** Ensures only valid users can reach the inventory while blocking restricted or incorrect accounts.

**Preconditions:**
- User is on the login page, which lists accepted usernames and the common password.
- Application is reachable.

**Test Data (example):**

| Scenario         | Username            | Password      | Expected Outcome                                 |
|------------------|---------------------|---------------|--------------------------------------------------|
| Valid login      | standard_user       | secret_sauce  | Redirects to inventory page                      |
| Locked user      | locked_out_user     | secret_sauce  | Stays on login with error message                |
| Missing username | (blank)             | secret_sauce  | Shows username required error                    |
| Missing password | standard_user       | (blank)       | Shows password required error                    |
| Invalid combo    | wrong_user          | wrong_pass    | Shows username and password do not match error   |

**Acceptance Criteria:**
1. Logging in with `standard_user / secret_sauce` moves the user to the inventory page.
2. Logging in with `locked_out_user` displays an error and stays on the login screen.
3. Leaving the username field empty triggers a username-required message.
4. Leaving the password field empty triggers a password-required message.

**Notes:** The login form shows allowed usernames and the shared password.
Provide a reusable `login(username, password)` function in automated tests.

---

## US-2: Browse and Sort Products

**Story:** As a logged-in user, I want to view and sort products so that I can find items by name or price.

**Business Value:** Enhances the browsing experience by letting customers organize inventory.

**Preconditions:** User is authenticated and on the inventory page.

**Acceptance Criteria:**
1. After login, the inventory page lists multiple products (name, image, description, and price).
2. The sort drop-down provides options:
   - Name (A to Z)
   - Name (Z to A)
   - Price (low to high)
   - Price (high to low)
3. Choosing Name (A to Z) orders products alphabetically ascending; choosing Name (Z to A) orders them descending.
4. Choosing Price (low to high) sorts by ascending price; Price (high to low) sorts by descending price.

**Notes:** For automated verification, capture product names/prices, apply the sort programmatically, and compare with UI order.

---

## US-3: Add and Remove Products from the Cart

**Story:** As a shopper, I want to add and remove items from my cart so that I can control what I plan to purchase.

**Business Value:** Accurate cart operations are essential for a trustworthy checkout experience.

**Preconditions:** User is logged in, on the inventory page, and cart is empty.

**Acceptance Criteria:**
1. Clicking **Add to cart** on a product changes the button to **Remove** and shows a cart badge count of 1.
2. Adding another product increments the cart badge to 2.
3. Opening the cart icon displays all selected items with quantity, description, and price.
4. Clicking **Remove** in the cart removes that item and decreases the badge count accordingly.
5. When all items are removed, the badge disappears and the cart shows no products.

**Notes:** Use helper functions like `addProductToCart(productName)`, `openCart()`, `removeProductFromCart(productName)`, and `getCartBadgeCount()`.

---

## US-4: Checkout and Complete an Order

**Story:** As a shopper with items in my cart, I need to complete checkout by entering my information so that I can place an order.

**Business Value:** Represents the end-to-end purchase flow from cart to order confirmation.

**Preconditions:** At least one product is in the cart and user is on the cart page.

**Acceptance Criteria:**
1. Clicking **Checkout** opens a form for first name, last name, and postal code.
2. Submitting without any input triggers a First Name is required error.
3. Entering only the first name triggers a Last Name is required error.
4. Entering first and last name without postal code triggers a Postal Code is required error.
5. Entering all three fields (for example, Jatin, Tester, M5H1H1) and clicking **Continue** leads to the overview page showing selected items, item total, tax, and total.
6. Clicking **Finish** displays an order confirmation with a check mark and a Back Home button.
7. The **Back Home** button returns to the inventory page with the cart cleared.

**Notes:** Include functions such as `checkout(firstName, lastName, postalCode)`, `verifyCheckoutOverview()`, and `finishCheckout()`.

---

## US-5: Validate Checkout Form Errors and Log Out

**Story:** As a user, I want validation for mandatory checkout fields and the ability to end my session securely.

**Business Value:** Prevents incomplete orders and ensures session control.

**Preconditions:** User is logged in and at the checkout information page.

**Acceptance Criteria:**
1. Leaving all fields blank and clicking **Continue** shows an error for the first required field.
2. Filling first name but not last name triggers a last-name error.
3. Filling first and last name but missing postal code triggers a postal-code error.
4. From the inventory page, opening the side menu reveals options such as All Items, About, Logout, and Reset App State.
5. Clicking **Logout** returns the user to the login page with the username/password fields visible and prevents access to inventory without re-authentication.

**Notes:** Ensure tests verify both field-validation messages and successful session termination.
Use functions like `openMenu()`, `logout()`, and `verifyLoginPage()`.
