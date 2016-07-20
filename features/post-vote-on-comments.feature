Feature: As an authenticated user I want to be able to vote on comments

  Scenario: User up votes a comment
    Given a user exists
    And I am logged in
    And a QA feed item exists
    And the QA feed item has a comment
    When I up vote the comment
    Then the response status code should be 200
    And it should appear among the comments votes
    And the comment should have an overall vote score of 1

  Scenario: User down votes a comment
    Given a user exists
    And I am logged in
    And a QA feed item exists
    And the QA feed item has a comment
    When I down vote the comment
    Then the response status code should be 200
    And it should appear among the comments votes
    And the comment should have an overall vote score of -1

  Scenario: Unauthenticated user tries to vote on a comment
    Given I am logged out
    And a QA feed item exists
    When I down vote the QA feed item
    Then the response status code should be 401

  Scenario: User votes on non-existent comment
    Given a user exists
    And I am logged in
    When I up vote comment 'someinvalidid'
    Then the response status code should be 400

