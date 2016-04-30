"use strict";

const db = require("promised-mongo")("sovote");
const ensureDbIndexes = require("../../common/ensure-mongodb-indexes");

module.exports = function(){
  this.After(function(scenario, callback){
    db.collection("users").drop()
      .then(function(){
        return ensureDbIndexes(db);
      })
      .then(function(){
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });
};
