User Story: Login and logout flow works end-to-end

As a registered user,
I want to log in and then log out from the application,
So that I can securely start and end my session.

Acceptance Criteria:
- Given the user is on the login page
- When the user logs in with valid credentials
- Then the user should be navigated to the inventory page
- And the inventory container should be visible
- When the user opens the application menu
- And clicks the logout option
- Then the user should be redirected to the login page
- And the login form should be visible
- And opening the protected inventory URL without re-login should not grant access
- And using browser back after logout should not restore an authenticated session
