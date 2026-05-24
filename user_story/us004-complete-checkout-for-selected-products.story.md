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
