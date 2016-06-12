Feature: As a user I want to be able to page and search for QnAs

Scenario: Page QnA feed items
  Given 20 QnAs exist
  When I request QnA feed items, skipping the first 10 and taking the next 10
  Then the response status code should be 200
  Then The response should contain 10 QnA items
  And The response should contain the last 10 QnA items created