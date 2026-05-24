User Story: Checkout and complete an order

As a shopper with items in my cart,
I need to complete checkout by entering my information,
So that I can place an order.

Business Value:
- Covers end-to-end purchase flow from cart to confirmation.

Preconditions:
- At least one item is in cart.
- User is on cart page.

Acceptance Criteria:
- Given the user is on the cart page with at least one product
- When the user clicks Checkout
- Then checkout information form should open with first name, last name, and postal code
- When the user submits with all fields blank
- Then First Name required error should be shown
- When the user enters first name only and submits
- Then Last Name required error should be shown
- When the user enters first and last name without postal code and submits
- Then Postal Code required error should be shown
- When the user enters first name, last name, and postal code and clicks Continue
- Then checkout overview page should show selected items, item total, tax, and total
- When the user clicks Finish
- Then order confirmation should be displayed with Back Home button
- When the user clicks Back Home
- Then the user should return to inventory page with cleared cart
