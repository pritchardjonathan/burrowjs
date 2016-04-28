"use strict";

var world = require("../support/world"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {
  if(!this.world) this.world = world;

  this.Then(/^the response status code should be (\d+)$/, function (statusCode, callback) {
    expect(this.response).to.not.be.null;
    expect(this.response.statusCode).to.equal(+statusCode);
    callback();
  });

  this.Then(/^the reason phrase should be "([^"]*)"$/, function (reasonPhrase, callback) {
    expect(this.response).to.not.be.null;
    expect(this.response.body).to.equal(reasonPhrase);
    callback();
  });
};
module.exports = myStepDefinitionsWrapper;