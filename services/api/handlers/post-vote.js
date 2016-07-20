"use strict";

const log = require("../../../common/logger")("API Service POST vote");
const burrow = require("burrow");
const parentIdCheckers = {};

module.exports = function(){
  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "API Service POST vote")
    .then(function(){
      log.info("Burrow connected");
    });
  return function *(){
    try {
      let vote = {
        score: this.request.body["score"],
        parentType: this.request.body["parentType"],
        parentId: this.request.body["parentId"]
      };

      let checker = parentIdCheckers[vote.parentType];
      if(!checker){
        this.status = 400;
        this.body = "Invalid parentType";
        return;
      }
      var valid = yield checker(vote.parentId);
      if(!valid){
        this.status = 400;
        this.body = "Invalid parentId";
        return;
      }

      let createdVote = yield burrow.rpc.call("create-vote", vote);
      this.body = {
        id: createdVote._id,
        parentType: createdVote.parentType,
        parentId: createdVote.parentId,
        score: createdVote.score
      }
    } catch(err) {
      log.error(err);
      this.status = 500;
    }
  }
};

parentIdCheckers["uk-parliament-qa"] = function(id){
  return burrow.rpc.call("uk-parliament-qa-exists", id);
};
parentIdCheckers["comment"] = function(id){
  return burrow.rpc.call("comment-exists", id);
};