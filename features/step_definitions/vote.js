"use strict";

var voteSupport = require("../support/vote"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {
  this.Given(/^the QA feed item has (\d+) ([^"]*) vote$/, function (voteCount, voteDirection, callback) {
    let world = this;
    voteCount = parseInt(voteCount);
    let addVotePromises = [];
    for(let i = 0; i < voteCount; i++){
      addVotePromises.push(addVote(voteDirection === "up" ? 1 : -1));
    }
    Promise.all(addVotePromises)
      .then(function(){
        callback();
      }).catch(function(err){
      callback(err);
    });

    function addVote(score){
      let vote = {
        parentType: "uk-parliament-qa",
        parentId: world.qas[0].id,
        score: score
      };
      return new Promise(function(resolve, reject){
        voteSupport.post(vote, world.authenticationToken)
          .then(function(createResult){
            voteSupport.get("uk-parliament-qa", world.qas[0].id, world.authenticationToken)
              .then(function(getResult){
                try {
                  var matchFound = false;
                  expect(getResult.body.length).to.not.equal(0);
                  for(var vote of getResult.body){
                    if(vote.id === createResult.body.id) matchFound = true;
                  }
                  expect(matchFound).to.be.true;
                  world.votes.push(createResult.body);
                  resolve();
                } catch(err){
                  reject();
                }
              });
          }).catch(function(err){
          reject(err);
        });
      })
    }
  });

  this.Then(/^the QA feed item should have an overall vote score of (\d+)$/, function (expectedVoteScore) {
    expect(this.searchResults).to.exist;
    expect(this.searchResults.length).to.equal(1);
    expect(this.searchResults[0].voteScore).to.equal(parseInt(expectedVoteScore));
  });

  this.When(/^I request votes for the QnA feed item$/, function (callback) {
    let world = this;
    voteSupport.get("uk-parliament-qa", world.qas[0].id, world.authenticationToken)
      .then(function(getResult){
        expect(getResult.body.length).to.not.equal(0);
        world.getResults = getResult.body;
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });

  this.Then(/^the votes result should contain (\d+) item$/, function (expectedResultCount) {
    expect(this.getResults).to.exist;
    expect(this.getResults.length).to.equal(parseInt(expectedResultCount));
  });

  this.Then(/^the vote result (\d+) should have score (\d+)$/, function (voteIndex, expectedScore) {
    voteIndex = parseInt(voteIndex);
    expectedScore = parseInt(expectedScore);
    expect(this.getResults).to.exist;
    expect(this.getResults.length).to.be.at.least(voteIndex);
    expect(this.getResults[voteIndex - 1].score).to.equal(expectedScore);
  });

  this.When(/^I ([up|down]*) vote QA feed item '([^"]*)'$/, function (direction, parentId, callback) {
    let world = this,
      vote = {
        parentId: parentId,
        parentType: "uk-parliament-qa",
        score: direction === "up" ? 1 : -1
      };
    voteSupport.post(vote, world.authenticationToken)
      .then(function(result){
        world.votes.push(result.body);
        world.response = result.response;
        callback();
      });
  });

  this.Then(/^it should ([^"]*)appear among the QA feed items votes$/, function (negated, callback) {
    let world = this;
    voteSupport.get("uk-parliament-qa", world.qas[0].id, world.authenticationToken)
      .then(function(result){
        if(negated){
          expect(result.response.statusCode).to.equal(401);
          expect(result.body).to.be.a("string");
        } else {
          expect(result.response.statusCode).to.equal(200);
          expect(result.body).to.not.be.a("string");
          expect(result.body.length).to.be.at.least(1);
          let match = null;
          for(var vote of result.body){
            if(vote.parentId === world.qas[0].id &&
              vote.parentType === "uk-parliament-qa" &&
              vote.score == world.votes[0].score){
              match = vote;
            }
          }
          expect(match).to.not.be.null;
        }
        callback();
      })
      .catch(function(err){
        callback(err);
      })
  });

  this.When(/^I ([up|down]*) vote the QA feed item$/, function (direction, callback) {
    let world = this,
      vote = {
        parentId: world.qas[0].id,
        parentType: "uk-parliament-qa",
        score: direction === "up" ? 1 : -1
      };
    voteSupport.post(vote, world.authenticationToken)
      .then(function(result){
        world.votes.push(result.body);
        world.response = result.response;
        callback();
      });
  });
};

module.exports = myStepDefinitionsWrapper;