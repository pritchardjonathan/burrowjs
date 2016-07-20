"use strict";

module.exports = function App(){
  const log = require("../../common/logger")("Comment App");
  const burrow = require("burrow");
  const pMongo = require("promised-mongo");
  const db = pMongo(process.env.MONGODB_NAME);
  const commentsCollection  = db.collection("comments");

  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "Comment service")
    .then(function(){
      log.info("Burrow connected");
      log.info("Subscribing for Create Comment RPC requests");
      burrow.rpc.listen("create-comment", "0.0.0", function(comment){
        log.info("Received Create Comment RPC request");
        return commentsCollection.insert(comment)
          .then(function(insertedComment){
            burrow.publish("comment-created", insertedComment);
            return insertedComment;
          });
      });
      burrow.rpc.listen("get-comments", "0.0.0", function(payload){
        if(payload.id){
          return commentsCollection
            .findOne({ _id: pMongo.ObjectId(payload.id) })
            .then(function(comment){
              var comments = [];
              if(comment) comments.push(comment);
              return Promise.resolve(transform(comments));
            });
        } else {
          return commentsCollection
            .find({})
            .skip(payload.skip)
            .limit(payload.take)
            .toArray()
            .then(function(comments){
              return Promise.resolve(transform(comments));
            });
        }
      });
      burrow.rpc.listen("comment-exists", "0.0.0", function(id){
        if(!pMongo.ObjectId.isValid(id)) return Promise.resolve(false);
        return commentsCollection
          .findOne({ _id: pMongo.ObjectId(id) })
          .then(function(qa){
            return !!qa;
          })
      });
      burrow.subscribe("vote-created", function(vote){
        if(vote.parentType != "comment") return;
        commentsCollection
          .findOne({ _id: pMongo.ObjectId(vote.parentId) })
          .then(function(comment){
            if(!comment) return;
            if(!comment.voteScore) comment.voteScore = 0;
            comment.voteScore += vote.score;
            return commentsCollection.update({ _id: comment._id }, comment, { })
              .then(function(){
                log.info(`Updated Comment ${comment._id.toString()} with a vote of ${vote.score} creating a new voteScore of ${comment.voteScore}`);
              });
          });
      });
    })
    .catch(function(err){
      log.error(err);
    });
};

function transform(comments){
  return comments.map(function(comment){
    comment.id = comment._id.toString();
    delete comment["_id"];
    return comment;
  });
}