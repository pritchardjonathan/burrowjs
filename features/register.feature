Feature: As a new user I want to be able to register

  @createsUser
  @clearDb
  Scenario: Register as new user
    When I try to register some user
    Then the response status code should be 200
    And I should be able to login using those credentials
    And I should be able to retrieve the authenticated users details

  @createsUser
  @clearDb
  Scenario: Email address is already in use
    Given a user with email "test@test.com" and password "somep4ss" exists
    When I try to register another user with email "test@test.com"
    Then the response status code should be 409
    And the reason phrase should be "'test@test.com' already exists"

  @createsUser
  @clearDb
  Scenario: Register without supplying a password
    When I try to register without supplying a password
    Then the response status code should be 400

  @clearDb
  Scenario: Register with short password
    When I try to register a user with email "test@test.com" and password "blah"
    Then the response status code should be 400

  @clearDb
  Scenario: Register with password containing no numbers
    When I try to register a user with email "test@test.com" and password "blahblah"
    Then the response status code should be 400

  @createsUser
  @clearDb
  Scenario: Register with a blank password
    When I try to register a user with email "test@test.com" and password ""
    Then the response status code should be 400

  @createsUser
  @clearDb
  Scenario: Register without supplying an email
    When I try to register without supplying an email
    Then the response status code should be 400

  @createsUser
  @clearDb
  Scenario: Register with a blank email
    When I try to register a user with email "" and password "somep4ss"
    Then the response status code should be 400