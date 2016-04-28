"use strict";

const db = require("promised-mongo")("sovote");

module.exports = function(){
  this.After("@createsUser", function(scenario, callback){
    // TODO: Remove user
    console.log("TODO: remove user...");
    callback();
  });

  this.After(function(scenario, callback){
    console.log("Clearing database");
    db.collection("users").drop()
      .then(function(){
        console.log("dropped");
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });
};
