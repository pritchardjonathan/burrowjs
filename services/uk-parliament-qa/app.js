"use strict";

module.exports = function App(){
  const db = require("promised-mongo")("sovote");
  const request = require("request-promise");
  const config = require("./config");
  const cron = require("node-cron");
  const xml2js = require("xml2js");
  const qaCollection = db.collection("uk-parliament-qnas");
  const moment = require("moment");
  const log = require("../../common/logger")("Uk Parliament QA Extraction App");
  const burrow = require("burrow");

  const xml2jsOptions = {
    explicitArray: false,
    ignoreAttrs: true
  };

  require("./ensure-mongodb-indexes")(db);

  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "UK Parliament QnA extraction service")
    .then(function(){
      log.info("Burrow Connected");
      log.info("Subscribing for QnA extractions");

      burrow.subscribe("uk-parliament-qa-extracted", function(qa){
        log.info("Received QnA extraction event");
        qaCollection.update({ parliamentDataId: qa.parliamentDataId }, qa, { upsert: true })
          .then(function(){
            log.info("Upserted QnA");
          })
          .catch(function(err){
            log.error(err);
          });
      });
    })
    .catch(function(err){
      log.error(err);
    });
};