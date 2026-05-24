User Story: Checkout validation errors and logout

As a user,
I want validation for mandatory checkout fields and secure logout,
So that incomplete orders are blocked and session control is preserved.

Business Value:
- Prevents incomplete orders and enforces secure session termination.

Preconditions:
- User is logged in.
- User is at checkout information page.

Acceptance Criteria:
- Given the user is on checkout information page
- When the user clicks Continue with all fields blank
- Then an error should appear for the first required field
- When the user enters first name only and clicks Continue
- Then last-name required error should appear
- When the user enters first and last name only and clicks Continue
- Then postal-code required error should appear
- Given the user is on inventory page
- When the user opens side menu
- Then menu should display All Items, About, Logout, and Reset App State options
- When the user clicks Logout
- Then user should return to login page
- And inventory should not be accessible without re-authentication
