Feature: As a user I want to be able to get comment votes


  Scenario: User gets comments vote summary
    Given a user exists
    And I am logged in
    And a QA feed item exists
    And the QA feed item has a comment
    And the comment has 1 up vote
    When I request the comment
    Then the response status code should be 200
    And the comment should have an overall vote score of 1

  Scenario: User gets votes for comment
    Given a user exists
    And I am logged in
    And a QA feed item exists
    And the QA feed item has a comment
    And the comment has 1 up vote
    When I request votes for the comment
    Then the response status code should be 200
    And the votes result should contain 1 item
    And the vote result 1 should have score 1