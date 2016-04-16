Feature: As an authenticated user I want to be able to update my details

  Scenario: Update authenticated users details
    Given a user with name "Joe Blogs" email "test@test.com" and password "somepass" exists
    And is logged in
    When I try to change my name to "Jon Blogs"
    Then the response status code should be 200
    And my details should be updated
    
  Scenario: Update someone elses details
    Given a user with name "Joe Blogs" email "test@test.com" and password "somepass" exists
    And a user with name "Sam Smith" email "test2@test2.com" and password "somepass2" exists
    And I am logged in as "Joe Blogs"
    When I try to update "Sam Smiths" name to "Mr Smith"
    Then the response status code should be 401