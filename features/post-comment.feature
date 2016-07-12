Feature: As an authenticated user I want to be able to post a comment to a feed item

Scenario: User posts a comment
  Given a user exists
  And I am logged in
  And a QA feed item exists
  When I post a comment to the QA feed item
  Then the response status code should be 200
  And it should appear among the QA feed item comments
  And the QA feed items comment count should be 1

Scenario: Unauthenticated user tries to post a comment to a feed item
  Given I am logged out
  And a QA feed item exists
  When I post a comment to the QA feed item
  Then the response status code should be 401
  And it should not appear among the QA feed item comments

Scenario: User posts a comment to non-existent feed item
  Given a user exists
  And I am logged in
  When I post a comment to QA feed item 'someinvalidid'
  Then the response status code should be 400

Scenario: User posts a comment to a comment
  Given a user exists
  And I am logged in
  And a QA feed item exists
  And the QA feed item has a comment
  When I post a comment to the comment
  Then the response status code should be 200
  And it should appear among the comments comments

Scenario: Unauthenticated user tries to post a comment to a comment
  Given I am logged out
  And a QA feed item exists
  And the QA feed item has a comment
  When I post a comment to the comment
  Then the response status code should be 401
  And it should not appear among the comments comments



Scenario: User posts a comment to non-existent comment

