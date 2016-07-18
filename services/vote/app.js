"use strict";

module.exports = function App(){
  const log = require("../../common/logger")("Vote App");
  const burrow = require("burrow");
  const pMongo = require("promised-mongo");
  const db = pMongo(process.env.MONGODB_NAME);
  const votesCollection  = db.collection("votes");

  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "Vote service")
    .then(function(){
      log.info("Burrow connected");
      log.info("Subscribing for Create Vote RPC requests");
      burrow.rpc.listen("create-vote", "0.0.0", function(vote){
        log.info("Received Create Vote RPC request");
        return votesCollection.insert(vote)
          .then(function(insertedVote){
            burrow.publish("vote-created", insertedVote);
            return insertedVote;
          });
      });
      burrow.rpc.listen("get-votes", "0.0.0", function(payload){
        if(payload.id){
          return votesCollection
            .findOne({ _id: pMongo.ObjectId(payload.id) })
            .then(function(vote){
              var votes = [];
              if(vote) votes.push(vote);
              return Promise.resolve(transform(votes));
            });
        } else {
          return votesCollection
            .find({})
            .skip(payload.skip)
            .limit(payload.take)
            .toArray()
            .then(function(votes){
              return Promise.resolve(transform(votes));
            });
        }
      });
      burrow.rpc.listen("vote-exists", "0.0.0", function(id){
        if(!pMongo.ObjectId.isValid(id)) return Promise.resolve(false);
        return votesCollection
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

function transform(votes){
  return votes.map(function(vote){
    vote.id = vote._id.toString();
    delete vote["_id"];
    return vote;
  });
}