var authSupport = require("../support/authentication"),
  world = require("../support/world"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {

  this.World = world;

  this.Given(/^I am logged in$/, login);
  this.Given(/^is logged in$/, login);
  this.Then(/^I should be able to login using those credentials$/, login);
  function login (callback) {
    authSupport.login(this.email, this.password, function (err, success) {
      expect(err).to.be.null;
      expect(success).to.be.true;
      callback();
    });
  }

  this.When(/^I try to login using the correct credentials$/, function tryLogin (callback) {
    authSupport.login(this.email, this.password, function (err, success) {
      callback();
    });
  });

  this.Then(/^I should ([not ]*)be able to login using the credentials "([^"]*)" and password "([^"]*)"$/, function (negated, email, password, callback) {
    authSupport.login(email, password, function (err, success) {
      expect(err).to.be.null;
      expect(success).to.be.true;
      callback();
    });
  });

  this.Given(/^I am logged out$/, logout);
  this.Then(/^I should be able to logout$/, logout);
  function logout (callback) {
    authSupport.logout(function (err, success) {
      expect(err).to.be.null;
      expect(success).to.be.true;
      callback();
    });
  }

  this.Given(/^I am logged in as "([^"]*)"$/, function (arg1, callback) {
    callback.pending();
  });

  this.Then(/^I should not be able to logout$/, function (callback) {
    callback.pending();
  });

  this.Then(/^I should not be able to login$/, function (callback) {
    callback.pending();
  });
};
module.exports = myStepDefinitionsWrapper;