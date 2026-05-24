User Story: Browse and sort products

As a logged-in user,
I want to view and sort products,
So that I can find items by name or price.

Business Value:
- Enhances browsing by allowing users to organize inventory quickly.

Preconditions:
- User is authenticated and on the inventory page.

Acceptance Criteria:
- Given the user is on the inventory page
- Then multiple products should be listed with name, image, description, and price
- And a sort dropdown should provide:
  - Name (A to Z)
  - Name (Z to A)
  - Price (low to high)
  - Price (high to low)
- When the user selects Name (A to Z)
- Then products should be sorted by name ascending
- When the user selects Name (Z to A)
- Then products should be sorted by name descending
- When the user selects Price (low to high)
- Then products should be sorted by price ascending
- When the user selects Price (high to low)
- Then products should be sorted by price descending
