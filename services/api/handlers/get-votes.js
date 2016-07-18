"use strict";

const log = require("../../../common/logger")("API Service GET vote");
const burrow = require("burrow");

const defaultSkip = 0;
const defaultTake = 10;

module.exports = function(){
  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "API Service GET vote")
    .then(function(){
      log.info("Burrow connected");
    });
  return function *(){
    try {
      let payload = {};
      payload.skip = this.request.query["skip"];
      payload.take = this.request.query["take"];
      payload.id = this.request.query["id"];
      payload.skip = typeof payload.skip === "undefined" ? defaultSkip : +payload.skip;
      payload.take = typeof payload.take === "undefined" ? defaultTake : +payload.take;

      this.body = yield burrow.rpc.call("get-votes", payload);
    } catch(err) {
      log.error(err);
      this.status = 500;
    }
  }
};