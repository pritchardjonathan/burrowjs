Feature: As a new user I want to be able to register

  @createsUser
  Scenario: Register as new user
    Given a user exists
    When I try to login using the correct credentials
    Then the response status code should be 200
    And I should be able to retrieve the authenticated users details

  @createsUser
  Scenario: Email address is already in use
    Given a user with email "test@test.com" and password "somepass" exists
    When I try to register another user with email "test@test.com"
    Then the response status code should be 409
    And the reason phrase should be "Email already in use"

  @createsUser
  Scenario: Register without supplying a password
    When I try to register without supplying a password
    Then the response status code should be 400

  @createsUser
  Scenario: Register with a blank password
    When I try to register a user with email "test@test.com" and password ""
    Then the response status code should be 400

  @createsUser
  Scenario: Register without supplying an email
    When I try to register without supplying an email
    Then the response status code should be 400

  @createsUser
  Scenario: Register with a blank email
    When I try to register a user with email "" and password "somepass"
    Then the response status code should be 400