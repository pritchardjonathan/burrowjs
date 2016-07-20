"use strict";

var commentSupport = require("../support/comment"),
  qaSupport = require("../support/qa"),
  authSupport = require("../support/authentication"),
  world = require("../support/world"),
  expect = require("chai").expect,
  pMongo = require("promised-mongo"),
  utils = require("../support/utils"),
  db = pMongo("sovote-uk-parliament-qa-feed-service"),
  commentsCollection = db.collection("comments");

var myStepDefinitionsWrapper = function () {
  if(!this.world) this.world = world;

  this.Given(/^the QA feed item has a comment$/, function (callback) {
    let world = this,
      qa = world.qas[0],
      comment = {
        parentId: qa.id,
        parentType: "uk-parliament-qa",
        message: "some comment..."
      };
    commentSupport.post(comment, world.authenticationToken)
      .then(function(createResult){
        return commentSupport.get("uk-parliament-qa", qa.id, world.authenticationToken)
          .then(function(getResult){
            var matchFound = false;
            expect(getResult.body.length).to.not.equal(0);
            for(var comment of getResult.body){
              if(comment.id === createResult.body.id) matchFound = true;
            }
            expect(matchFound).to.be.true;
            world.comments.push(createResult.body);
            callback();
          });
      })
      .catch(function(err){
        callback(err);
      });
  });

  this.Then(/^it should([^"]*) appear among the QA feed item comments$/, function (negated, callback) {
    let world = this,
    qa = world.qas[0];
    commentSupport.get("uk-parliament-qa", qa, world.authenticationToken)
      .then(function(result) {
        expect(result.body.length).to.be.at.least(1);
        let insertedComment = world.comments[0];
        let matchingComment = null;
        for (let comment of result.body){
          if(comment.id === insertedComment.id) matchingComment = comment;
        }
        expect(matchingComment).to.not.be.null;
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });

  this.When(/^I post a comment to the QA feed item$/, function (callback) {
    let world = this,
      comment = {
      parentId: world.qas[0].id,
      parentType: "uk-parliament-qa",
      message: "Blah blah some comment"
    };
    commentSupport.post(comment, world.authenticationToken)
      .then(function(result){
        world.comments.push(result.body);
        world.response = result.response;
        callback();
      });
  });

  this.When(/^I post a comment to QA feed item '([^"]*)'$/, function (qaId, callback) {
    let world = this;
    let comment = {
      parentId: qaId,
      parentType: "uk-parliament-qa",
      message: "Blah blah some comment"
    };
    commentSupport.post(comment, world.authenticationToken)
      .then(function(result){
        world.comments.push(result.body);
        world.response = result.response;
        callback();
      });
  });

  this.When(/^I post a comment to the comment$/, function (callback) {
    let world = this,
      comment = {
        parentId: world.comments[0].id,
        parentType: "comment",
        message: "Blah blah some comments comment"
      };
    commentSupport.post(comment, world.authenticationToken)
      .then(function(result){
        world.comments.push(result.body);
        world.response = result.response;
        callback();
      });
  });

  this.Then(/^it should([^"]*) appear among the comments comments$/, function (negated, callback) {
    let world = this,
      comment = world.comments[0];
    commentSupport.get("comment", comment, world.authenticationToken)
      .then(function(result) {
        expect(result.body.length).to.be.at.least(1);
        let insertedComment = world.comments[0];
        let matchingComment = null;
        for (let comment of result.body){
          if(comment.id === insertedComment.id) matchingComment = comment;
        }
        expect(matchingComment).to.not.be.null;
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });

  this.When(/^I request comments for the QA feed item$/, function (callback) {
    let world = this;
    commentSupport.get("uk-parliament-qa", world.qas[0].id, world.authenticationToken)
      .then(function(result){
        if(result.body.length){
          world.getResults = result.body;
        }
        callback();
      })
  });

  this.Then(/^the result should contain the comment$/, function () {
    let world = this,
      matchFound = false,
      targetCommentId = world.comments[0].id;
    for(var comment of world.getResults){
      if(comment.id === targetCommentId) matchFound = true;
    }
    expect(matchFound).to.be.true;
  });

  this.Then(/^the QnA result should contain the comment$/, function () {
    expect(this.searchResults.length).to.be.at.least(1);
    expect(this.searchResults[0].commentCount).to.equal(1);
  });

  this.Then(/^the comment should have an overall vote score of ([^"]*)$/, function (expectedScore, callback) {
    let world = this;
    commentSupport.get("comment", world.comments[0].id, world.authenticationToken)
      .then(function(result){
        let commentId = world.comments[0].id;
        let comment = null;
        for(var gotComment of result.body){
          if(gotComment.id == commentId){
            comment = gotComment;
            break;
          }
        }
        expect(comment).to.not.be.null;
        expect(comment.voteScore).to.equal(parseInt(expectedScore));
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });

  this.When(/^I request the comment$/, function (callback) {
    let world = this,
      targetComment = world.comments[0];
    commentSupport.get(targetComment.parentType, targetComment.parentId, world.authenticationToken)
      .then(function(result){
        let gotComment = null;
        for(let comment of result.body){
          if(comment.id === targetComment.id){
            gotComment = comment;
            break;
          }
        }
        expect(gotComment).to.not.be.null;
        world.response = result.response;
        world.getResults = [ gotComment ];
        callback();
      })
      .catch(function(err){
        callback(err);
      })
  });
};
module.exports = myStepDefinitionsWrapper;