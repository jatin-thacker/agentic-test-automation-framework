User Story: Login with valid and invalid credentials

As a shopper,
I need to sign in to Saucedemo,
So that I can access the product catalog.

Business Value:
- Ensures only valid users can reach inventory while restricted/incorrect accounts are blocked.

Preconditions:
- User is on the login page.
- Application is reachable.

Acceptance Criteria:
- Given the user is on the login page
- When the user logs in with username `standard_user` and password `secret_sauce`
- Then the user should be redirected to the inventory page
- When the user logs in with username `locked_out_user` and password `secret_sauce`
- Then the user should remain on login and see an error message
- When the user leaves username empty and submits login
- Then the user should see a username-required error
- When the user leaves password empty and submits login
- Then the user should see a password-required error
- When the user logs in with username `wrong_user` and password `wrong_pass`
- Then the user should see a username/password mismatch error
