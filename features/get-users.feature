Feature: As an authenticated user I want to be able to get my details and search for other users

  @createsUser
  @clearDb
  Scenario: Get authenticated users data
    Given a user with name "Joe Blogs" email "test@test.com" and password "somep4ss" exists
    And I am logged in
    When I try to retrieve the authenticated users details
    Then the response status code should be 200
    And retrieved user count should be 1
    And user number 1 should have the name "Joe Blogs"
    And user number 1 should have the email "test@test.com"
    And user number 1 should not have a password property

  @createsUser
  @clearDb
  Scenario: Reject request for authenticated user data when no user is authenticated
    Given I am logged out
    Then I should not be able to retrieve the authenticated users details

  @createsUser
  @clearDb
  Scenario: Search for users
    Given a user with name "Joe Blogs" email "test@test.com" and password "somep4ss" exists
    And a user with name "Sam Smith" email "test2@test.com" and password "somep4ss2" exists
    When I search for a user with "blogs" search text
    Then search results should contain 1 users
    And user 1 in the search results should be called "Joe Blogs"

  @createsUser
  @clearDb
  Scenario: Page user search results
    Given 20 users exist with the name containing "Joe Blogs"
    When I search for "Joe Blogs" skipping the first 10 and taking the next 10
    Then the search results should match the last 10 users created

