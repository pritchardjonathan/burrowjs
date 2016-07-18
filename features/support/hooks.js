"use strict";

const db = require("promised-mongo")("sovote");
const qaDb = require("promised-mongo")("sovote-uk-parliament-qa-feed-service");
const commentDb = require("promised-mongo")("sovote-comment-service");
const voteDb = require("promised-mongo")("sovote-vote-service");
const mpExtractionDb = require("promised-mongo")("sovote-uk-parliament-mp-extraction-service");
const apiEnsureDbIndexes = require("../../services/api/ensure-mongodb-indexes");
const qaEnsureDbIndexes = require("../../services/uk-parliament-qa-feed/ensure-mongodb-indexes");
const commentEnsureDbIndexes = require("../../services/comment/ensure-mongodb-indexes");
const voteEnsureDbIndexes = require("../../services/vote/ensure-mongodb-indexes");

module.exports = function(){
  this.After(function(scenario, callback){
    db.collection("users").drop()
      .then(function(){
        return qaDb.collection("qnas").drop();
      })
      .then(function(){
        return mpExtractionDb.collection("check-record").drop();
      })
      .then(function(){
        return voteDb.collection("votes").drop();
      })
      .then(function(){
        return apiEnsureDbIndexes(db);
      })
      .then(function(){
        return qaEnsureDbIndexes(db);
      })
      .then(function(){
        return commentDb.collection("comments").drop();
      })
      .then(function(){
        return commentEnsureDbIndexes(db);
      })
      .then(function(){
        return voteEnsureDbIndexes(db);
      })
      .then(function(){
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });
};
