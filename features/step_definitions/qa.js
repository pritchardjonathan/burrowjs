"use strict";

var qaSupport = require("../support/qa"),
  authSupport = require("../support/authentication"),
  world = require("../support/world"),
  expect = require("chai").expect,
  pMongo = require("promised-mongo"),
  utils = require("../support/utils"),
  db = pMongo("sovote-uk-parliament-qa-feed-service"),
  qaCollection = db.collection("qnas");

var myStepDefinitionsWrapper = function () {
  if(!this.world) this.world = world;

  this.Given(/^(\d+) QnAs exist$/, function (qaCount, callback) {
    let world = this,
      qas = qaSupport.generateQAFeedItems(qaCount);
    qaCollection.insert(qas)
      .then(function(){
        world.qas = world.qas.concat(qas);
        callback();
      })
      .catch(function(err){
        callback(err);
      })
  });

  this.When(/^I request QnA feed items, skipping the first (\d+) and taking the next (\d+)$/, function (skip, take, callback) {
    let world = this;
    qaSupport.get(+skip, +take)
      .then(function(result){
        world.searchResults = result.body;
        world.response = result.response;
        callback();
      });
  });

  this.Then(/^The response should contain (\d+) QnA items$/, function (count) {
    expect(this.searchResults.length).to.equal(+count);
  });

  this.Then(/^The response should contain the last (\d+) QnA items created$/, function (lastCount) {
    expect(this.searchResults.length).to.be.at.least(lastCount);
    let lastCreatedQnAs = this.qas.slice(this.qas.length - lastCount, this.qas.length);
    for(var qa of lastCreatedQnAs){
      var matchFound = this.searchResults.some(function(searchResult){
        return searchResult._id === qa._id.toString();
      });
      expect(matchFound).to.be.true;
    }

  });
};
module.exports = myStepDefinitionsWrapper;