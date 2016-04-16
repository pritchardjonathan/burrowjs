"use strict";
const route = require("koa-route");

const defaultSkip = 0;
const defaultTake = 10;

module.exports = function(db){
  var usersCollection = db.collection("users");

  return function *(ctx){
    try {
      var query;
      if(ctx.authenticated) query = usersCollection.find({ _id: ctx.state.user.id });
      else if(ctx.searchtext) query = usersCollection.find({ $text: ctx.searchtext });
      else query = usersCollection.find();

      query = query
        .skip(ctx.skip !== undefined ? ctx.skip : defaultSkip)
        .take(ctx.take !== undefined ? ctx.take : defaultTake);

      var users = yield query.toArray();

      ctx.body = users;
      ctx.status = 200;
    } catch(err){
      console.log(err);
      ctx.status = 500;
    }
  };
};