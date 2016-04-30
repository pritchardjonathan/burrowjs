"use strict";
const mongoDb = require("mongodb");

module.exports = function(db) {
  var usersCollection = db.collection("users");
  return function *(id){
    var self = this;
    if(self.state.user.id !== id){
      self.status = 401;
      return;
    }
    yield usersCollection.remove({ _id: mongoDb.ObjectID(id) })
      .then(function(){
        self.status = 200;
      })
      .catch(function(err){
        self.status = 500;
      });
  }
};