"use strict";

module.exports = function App(){
  const db = require("promised-mongo")(process.env.MONGODB_NAME);
  const request = require("request-promise");
  const config = require("./config");
  const cron = require("node-cron");
  const xml2js = require("xml2js");
  const qaCollection = db.collection("qnas");
  const moment = require("moment");
  const log = require("../../common/logger")("Uk Parliament QA Feed App");
  const burrow = require("burrow");

  const xml2jsOptions = {
    explicitArray: false,
    ignoreAttrs: true
  };

  require("./ensure-mongodb-indexes")(db);

  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "UK Parliament QnA extraction service")
    .then(function(){
      log.info("Burrow connected");
      log.info("Subscribing for QnA extractions");

      burrow.subscribe("uk-parliament-qa-extracted", function(qa){
        log.info("Received QnA extraction event");
        let qaFeedItem = {
          type: "uk-parliament-qa",
          body: qa
        };
        qaCollection.update({ "body.parliamentDataId": qa.parliamentDataId }, qaFeedItem, { upsert: true })
          .then(function(){
            log.info("Upserted QnA");
          })
          .catch(function(err){
            log.error(err);
          });
      });

      burrow.rpc.listen("uk-parliament-qa-get", "0.0.0", function(payload){
        return qaCollection
          .find({})
          .skip(payload.skip)
          .limit(payload.take)
          .toArray();
      });
    })
    .catch(function(err){
      log.error(err);
    });
};