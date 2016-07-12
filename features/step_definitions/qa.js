"use strict";

var qaSupport = require("../support/qa"),
  world = require("../support/world"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {
  if(!this.world) this.world = world;

  this.Given(/^(\d+) QnAs exist$/, function (qaCount, callback) {
    let world = this,
      qas = qaSupport.generateQAFeedItems(qaCount);
    qaSupport.insert(qas)
      .then(function(){
        world.qas = world.qas.concat(qas.map(function(qa){
          qa.id = qa._id.toString();
          delete qa["_id"];
          return qa;
        }));
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });

  this.Given(/^a QA feed item exists$/, function (callback) {
    let world = this,
      qas = qaSupport.generateQAFeedItems(1);
    qaSupport.insert(qas[0])
      .then(function(insertedQa){
        insertedQa.id = insertedQa._id.toString();
        delete insertedQa["_id"];
        world.qas.push(insertedQa);
        callback();
      })
      .catch(function(err){
        callback(err);
      });
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
        return searchResult.id === qa.id;
      });
      expect(matchFound).to.be.true;
    }

  });

  this.Then(/^the QA feed items comment count should be (\d+)$/, function (commentCount, callback) {
    let world = this;
    qaSupport.get(0, 1)
      .then(function(result){
        expect(result.body).to.exist;
        expect(result.body.length).to.equal(1);
        expect(result.body[0].id).to.equal(world.qas[0].id);
        expect(result.body[0].commentCount).to.equal(+commentCount);
        callback();
      })
      .catch(function(err){
        callback(err);
      });
  });
};
module.exports = myStepDefinitionsWrapper;