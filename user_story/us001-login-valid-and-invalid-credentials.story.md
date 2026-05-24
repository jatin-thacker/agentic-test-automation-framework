## US-001: Login to SauceDemo with Valid and Invalid Credentials

### User Story
As a SauceDemo shopper,  
I want to log in with valid credentials,  
so that I can access the product inventory page.

### Business Value
Valid users should be able to access the shopping experience, while invalid or restricted users should be blocked with clear error messages.

### Preconditions
- User is on the SauceDemo login page.
- Application is available.
- Test data is available.

### Test Data
| Scenario | Username | Password | Expected Result |
|---|---|---|---|
| Valid login | standard_user | secret_sauce | User lands on Products/Inventory page |
| Locked user | locked_out_user | secret_sauce | Error message is displayed |
| Empty username | blank | secret_sauce | Username required error |
| Empty password | standard_user | blank | Password required error |
| Invalid credentials | wrong_user | wrong_password | Username/password mismatch error |

### Acceptance Criteria
1. Given the user is on the login page  
   When the user enters `standard_user` and `secret_sauce`  
   Then the user should be redirected to the inventory page.

2. Given the user is on the login page  
   When the user logs in with `locked_out_user` and `secret_sauce`  
   Then the user should remain on the login page  
   And an error message should be displayed.

3. Given the user is on the login page  
   When the user clicks Login without entering username  
   Then a username required error should be displayed.

4. Given the user is on the login page  
   When the user enters username but leaves password blank  
   Then a password required error should be displayed.

### Automation Notes
- Verify URL contains `/inventory.html` after successful login.
- Verify page title/header contains `Swag Labs` or Products page is visible.
- Validate error banner text for negative scenarios.
- Suggested reusable function: `login(username, password)`.
