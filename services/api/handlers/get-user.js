"use strict";
const route = require("koa-route");
const mongoDb = require("mongodb")

const defaultSkip = 0;
const defaultTake = 10;

module.exports = function(db){
  var usersCollection = db.collection("users");

  return function *(){
    try {
      var query;
      if(this.request.query["authenticated"]) query = usersCollection.find({ _id: mongoDb.ObjectID(this.state.user.id) });
      else if(this.request.query["searchtext"]) query = usersCollection.find({ $text: this.searchtext });
      else query = usersCollection.find();

      query = query
        .skip(this.request.query["skip"] !== undefined ? this.request.query["skip"] : defaultSkip)
        .limit(this.request.query["take"] !== undefined ? this.request.query["take"] : defaultTake);

      var users = yield query.toArray();

      // Sanitise result
      users = users.map(function(user){
        return {
          name: user.name,
          email: user.email
        };
      });

      this.body = users;
      this.status = 200;
    } catch(err) {
      console.log(err);
      this.status = 500;
    }
  };
};