Feature: As an authenticated user I want to be able to vote on feed items

  Scenario: User up votes a feed item
    Given a user exists
    And I am logged in
    And a QA feed item exists
    When I up vote the QA feed item
    Then the response status code should be 200
    And it should appear among the QA feed items votes
    And the QA feed item should have an overall vote score of 1

  Scenario: User down votes a feed item
    Given a user exists
    And I am logged in
    And a QA feed item exists
    When I down vote the QA feed item
    Then the response status code should be 200
    And it should appear among the QA feed items votes
    And the QA feed item should have an overall vote score of -1

  Scenario: Unauthenticated user tries to post a vote to a feed item
    Given I am logged out
    And a QA feed item exists
    When I down vote the QA feed item
    Then the response status code should be 401
    And it should not appear among the QA feed items votes

  Scenario: User posts a vote to non-existent feed item
    Given a user exists
    And I am logged in
    When I up vote QA feed item 'someinvalidid'
    Then the response status code should be 400

