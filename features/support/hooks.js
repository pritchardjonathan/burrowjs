"use strict";

const db = require("promised-mongo")("sovote");
const qaDb = require("promised-mongo")("sovote-uk-parliament-qa-service");
//const mpDb = require("promised-mongo")("sovote-uk-parliament-mp-service");
const mpExtractionDb = require("promised-mongo")("sovote-uk-parliament-mp-extraction-service");
const apiEnsureDbIndexes = require("../../services/api/ensure-mongodb-indexes");
const qaEnsureDbIndexes = require("../../services/uk-parliament-qa/ensure-mongodb-indexes");

module.exports = function(){
  this.After(function(scenario, callback){
    db.collection("users").drop()
      .then(function(){
        return qaDb.collection("qnas").drop();
      })
      /*.then(function(){
        return mpDb.collection("mps").drop();
      })*/
      .then(function(){
        return mpExtractionDb.collection("check-record").drop();
      })
      .then(function(){
        return apiEnsureDbIndexes(db);
      })
      /*.then(function(){
        return mpEnsureDbIndexes(db);
      })*/
      .then(function(){
        return qaEnsureDbIndexes(db);
      })
      .then(function(){
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });
};
