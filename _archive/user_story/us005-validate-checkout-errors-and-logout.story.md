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
