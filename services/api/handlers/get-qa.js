"use strict";

const log = require("../../../common/logger")("API Service GET qa");
const burrow = require("burrow");

const defaultSkip = 0;
const defaultTake = 10;

module.exports = function(){
  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "API Service GET qa")
    .then(function(){
      log.info("Burrow connected");
    });
  return function *(){
    try {
      let payload = {};
      payload.skip = this.request.query["skip"];
      payload.take = this.request.query["take"];
      payload.skip = typeof payload.skip === "undefined" ? defaultSkip : +payload.skip;
      payload.take = typeof payload.take === "undefined" ? defaultSkip : +payload.take;

      this.body = yield burrow.rpc.call("uk-parliament-qa-get", payload);
    } catch(err) {
      console.log(err);
      this.status = 500;
    }
  }
};