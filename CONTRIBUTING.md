# Contributing

API development should follow BDD process with unit tests written to cover technical details that are not externally testable (e.g. ensuring mongo indexes)

## Style Guidelines

* Folder and file names should be lowercase-hyphenated
* Module variables should be camelCase
* Favour Promises over callbacks

## Roadmap

1. MVP
  * Single feed stream - data.parliament.gov.uk QnA
  * Monolith app
  * Plain text comments
  * Url comments
2. Advanced comments
  * Stats comment - manual or ONS
  * Change.org petition comment
3. Generalise streams and add second to prove (e.g. bbc iplayer news programmes)
4. Port to microservice architecture
