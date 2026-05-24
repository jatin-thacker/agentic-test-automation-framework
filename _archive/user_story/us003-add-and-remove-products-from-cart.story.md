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
