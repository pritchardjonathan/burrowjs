Feature: As an authenticated user I want to be able to delete myself from the system

  Scenario: Authenticated user deletes himself from the system
    Given a user exists
    And I am logged in
    When I try to delete myself from the system
    Then the response status code should be 200
    And I should not be able to retrieve the authenticated users details
    And I should not be able to logout
    And I should not be able to login

  Scenario: Authenticated user deletes someone else from the system
    Given a user with name "Joe Blogs" email "test@test.com" and password "somepass" exists
    And a user with name "Sam Smith" email "test2@test2.com" and password "somepass2" exists
    And I am logged in as "Joe Blogs"
    When I try to delete "Sam Smith" from the system
    Then the response status code should be 401
    And I should be able to login using the credentials "test2@test2.com" and password "somepass2"
    And I should be able to retrieve the authenticated users details