Feature: As an existing user I want to be able to authenticate

  @createsUser
  Scenario: Login with correct credentials
    Given a user with email "test@test.com" and password "somepass" exists
    Then I should be able to login using those credentials
    And I should be able to retrieve the authenticated users details

  @createsUser
  Scenario: Login with incorrect email
    Given a user with email "test@test.com" and password "somepass" exists
    Then I should not be able to login using the credentials "some@otheraddress.com" and password "somepass"
    And I should not be able to retrieve the authenticated users details

  @createsUser
  Scenario: Login with incorrect password
    Given a user with email "test@test.com" and password "somepass" exists
    Then I should not be able to login using the credentials "test@test.com" and password "someotherpass"
    And I should not be able to retrieve the authenticated users details
