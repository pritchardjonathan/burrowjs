"use strict";

const log = require("../../../common/logger")("API Service POST comment");
const burrow = require("burrow");
const parentIdCheckers = {};

module.exports = function(){
  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "API Service POST comment")
    .then(function(){
      log.info("Burrow connected");
    });
  return function *(){
    try {
      let comment = {
        message: this.request.body["message"],
        parentType: this.request.body["parentType"],
        parentId: this.request.body["parentId"]
      };

      let checker = parentIdCheckers[comment.parentType];
      if(!checker){
        this.status = 400;
        this.body = "Invalid parentType";
        return;
      }
      var valid = yield checker(comment.parentId);
      if(!valid){
        this.status = 400;
        this.body = "Invalid parentId";
        return;
      }

      let createdComment = yield burrow.rpc.call("create-comment", comment);
      this.body = {
        id: createdComment._id,
        parentType: createdComment.parentType,
        parentId: createdComment.parentId
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