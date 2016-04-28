Feature: As an authenticated user I want to be able to logout

  @clearDb
  Scenario: Logout
    Given a user with email "test@test.com" and password "somep4ss" exists
    And I am logged in
    Then I should be able to logout
    And I should not be able to retrieve the authenticated users details