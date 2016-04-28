Feature: As an existing user I want to be able to authenticate

  @createsUser
  @clearDb
  Scenario: Login with correct credentials
    Given a user with email "test@test.com" and password "somep4ss" exists
    Then I should be able to login using those credentials
    And I should be able to retrieve the authenticated users details

  @createsUser
  @clearDb
  Scenario: Login with incorrect email
    Given a user with email "test@test.com" and password "somep4ss" exists
    Then I should not be able to login using the credentials "some@otheraddress.com" and password "somep4ss"
    And I should not be able to retrieve the authenticated users details

  @createsUser
  @clearDb
  Scenario: Login with incorrect password
    Given a user with email "test@test.com" and password "somep4ss" exists
    Then I should not be able to login using the credentials "test@test.com" and password "someotherp4ss"
    And I should not be able to retrieve the authenticated users details
