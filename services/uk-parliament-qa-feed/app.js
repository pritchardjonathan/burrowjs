"use strict";

module.exports = function App(){
  const pMongo = require("promised-mongo");
  const db = pMongo(process.env.MONGODB_NAME);
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
  burrow.connect(process.env.RABBITMQ, "UK Parliament QnA Feed service")
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

      burrow.subscribe("comment-created", function(comment){
        if(comment.parentType != "uk-parliament-qa") return;
        qaCollection
          .findOne({ _id: pMongo.ObjectId(comment.parentId) })
          .then(function(qa){
            if(!qa) return;
            if(!qa.commentCount) qa.commentCount = 0;
            qa.commentCount++;
            return qaCollection.update({ _id: qa._id }, qa, { })
              .then(function(){
                log.info(`Updated QA ${qa._id.toString()} with comment '${comment.message}'`);
              });
          });
      });

      burrow.subscribe("vote-created", function(vote){
        if(vote.parentType != "uk-parliament-qa") return;
        qaCollection
          .findOne({ _id: pMongo.ObjectId(vote.parentId) })
          .then(function(qa){
            if(!qa) return;
            if(!qa.voteScore) qa.voteScore = 0;
            qa.voteScore += vote.score;
            return qaCollection.update({ _id: qa._id }, qa, { })
              .then(function(){
                log.info(`Updated QA ${qa._id.toString()} with a vote of ${vote.score} creating a new voteScore of ${qa.voteScore}`);
              });
          });
      });

      burrow.rpc.listen("uk-parliament-qa-get", "0.0.0", function(payload){
        return qaCollection
          .find({})
          .skip(payload.skip)
          .limit(payload.take)
          .toArray()
          .then(function(qas){
            return Promise.resolve(qas.map(function(qa){
              qa.id = qa._id.toString();
              delete qa["_id"];
              return qa;
            }));
          });
      });
      burrow.rpc.listen("uk-parliament-qa-exists", "0.0.0", function(id){
        if(!pMongo.ObjectId.isValid(id)) return Promise.resolve(false);
        return qaCollection
          .findOne({ _id: pMongo.ObjectId(id) })
          .then(function(qa){
            return !!qa;
          })
      });
    })
    .catch(function(err){
      log.error(err);
    });
};