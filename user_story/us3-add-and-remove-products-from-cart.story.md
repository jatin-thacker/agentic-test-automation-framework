User Story: Add and remove products from cart

As a shopper,
I want to add and remove items from my cart,
So that I can control what I plan to purchase.

Business Value:
- Accurate cart operations are essential for a trustworthy checkout experience.

Preconditions:
- User is logged in.
- User is on inventory page.
- Cart starts empty.

Acceptance Criteria:
- Given the user is on the inventory page
- When the user clicks Add to cart on one product
- Then the product button should change to Remove
- And cart badge count should be 1
- When the user adds another product
- Then cart badge count should be 2
- When the user opens the cart
- Then all selected items should be visible with quantity, description, and price
- When the user removes one product in cart
- Then the removed item should disappear
- And cart badge count should decrease accordingly
- When all items are removed
- Then cart badge should disappear
