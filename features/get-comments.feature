Feature: As an authenticated user I want to be able to get comments

  Scenario: User requests QnA comments
    Given a user exists
    And I am logged in
    And a QA feed item exists
    And the QA feed item has a comment
    When I request comments for the QA feed item
    Then the response status code should be 200
    And the result should contain the comment

  Scenario: User requests QnA with a comment
    Given a user exists
    And I am logged in
    And a QA feed item exists
    When I post a comment to the QA feed item
    And I request the QnA
    Then the response status code should be 200
    And the QnA result should contain the comment