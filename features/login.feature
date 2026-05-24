Feature: Login
  Validate user login outcomes on SauceDemo.

  @smoke @login
  Scenario: Successful login
    Given the user launches the application
    When the user logs in using test data row "StandardUser"
    Then the user should be navigated to the inventory page

  @regression @login
  Scenario: Invalid login shows error
    Given the user launches the application
    When the user logs in using test data row "LockedOutUser"
    Then the user should see a login error message
