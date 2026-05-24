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
