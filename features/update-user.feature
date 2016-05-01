Feature: As an authenticated user I want to be able to update my details

  @clearDb
  Scenario: Update authenticated users details
    Given a user with name "Joe Blogs" email "test@test.com" and password "somep4ss" exists
    And is logged in
    When I try to change my name to "Jon Blogs"
    Then the response status code should be 200
    And my details should be updated

  @clearDb
  Scenario: Update users details with invalid user ID
    Given a user exists
    And is logged in
    When I try to change the name of a user with id "someinvalidid" to "Jon Blogs"
    Then the response status code should be 400

  @clearDb
  Scenario: Change password
    Given a user with name "Joe Blogs" email "test@test.com" and password "somep4ss" exists
    And is logged in
    When I try to change my password to "some0therp4ss"
    Then the response status code should be 200
    And I should be able to login using those credentials
    And I should not be able to login using the credentials "test@test.com" and password "somep4ss"

  @clearDb
  Scenario: Perform user update with no data
    Given a user exists
    And is logged in
    When I try to perform an empty update
    Then the response status code should be 400

  @clearDb
  Scenario: Update users details with invalid email
    Given a user exists
    And is logged in
    When I try to change my email to "blahblah.com"
    Then the response status code should be 400

  @clearDb
  Scenario: Update users details with invalid password
    Given a user exists
    And is logged in
    When I try to change my password to "blah"
    Then the response status code should be 400

  @clearDb
  Scenario: Update someone elses details
    Given a user with name "Joe Blogs" email "test@test.com" and password "somep4ss" exists
    And a user with name "Sam Smith" email "test2@test2.com" and password "somep4ss2" exists
    And I am logged in as "Joe Blogs"
    When I try to update "Sam Smiths" name to "Mr Smith"
    Then the response status code should be 401