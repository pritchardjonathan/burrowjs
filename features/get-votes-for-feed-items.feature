Feature: As a user I want to be able to get feed item votes


  Scenario: User gets QnA vote summary
    Given a user exists
    And I am logged in
    And a QA feed item exists
    And the QA feed item has 1 up vote
    When I request the QnA
    Then the response status code should be 200
    And the QA feed item should have an overall vote score of 1

  Scenario: User gets votes for QnA feed item
    Given a user exists
    And I am logged in
    And a QA feed item exists
    And the QA feed item has 1 up vote
    When I request votes for the QnA feed item
    Then the response status code should be 200
    And the votes result should contain 1 item
    And the vote result 1 should have score 1