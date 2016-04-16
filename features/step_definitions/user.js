var userSupport = require("../support/user"),
  authSupport = require("../support/authentication"),
  email,
  world = require("../support/world"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {

  this.Given(/^a user exists/, function (callback) {
    userSupport.register({ email: this.email, password: this.password }, function(){
      callback();
    });
  });

  this.When(/^I try to register (a|another) user with email "([^"]*)"$/, function (ignore1, email, callback) {
    this.email = email;
    userSupport.register({ email: email, password: "SomeP@55" }, function(){
      callback.pending();
    });
  });
  this.Given(/^a user with email "([^"]*)" and password "([^"]*)" exists$/, register);
  this.When(/^I try to register (a|another) user with email "([^"]*)" and password "([^"]*)"$/, register);
  function register (email, password, callback) {
    userSupport.register({ email: email, password: password }, function(err, response){
      expect(err).to.be.null;
      callback();
    });
  }

  this.When(/^I try to register without supplying a password$/, function (callback) {
    userSupport.register({ email: this.email }, function(err, response){
      expect(err).to.not.be.null;
      callback();
    });
  });

  this.When(/^I try to register without supplying an email$/, function (callback) {
    userSupport.register({ password: this.password }, function(err, response){
      expect(err).to.not.be.null;
      callback();
    });
  });


  this.Then(/^I should ([^"]*)be able to retrieve the authenticated users details$/, function (negated, callback) {
    callback.pending();
  });


  this.Given(/^a user with name "([^"]*)" email "([^"]*)" and password "([^"]*)" exists$/, function (arg1, arg2, arg3, callback) {
    callback.pending();
  });

  this.When(/^I search for a user with "([^"]*)" search text$/, function (arg1, callback) {
    callback.pending();
  });


  this.Then(/^search results should contain (\d+) users$/, function (arg1, callback) {
    callback.pending();
  });

  this.Then(/^user (\d+) in the search results should be called "([^"]*)"$/, function (arg1, arg2, callback) {
    callback.pending();
  });

  this.Given(/^(\d+) users exist with the name containing "([^"]*)"$/, function (arg1, arg2, callback) {
    callback.pending();
  });

  this.When(/^I search for "([^"]*)" skipping the first (\d+) and taking the next (\d+)$/, function (arg1, arg2, arg3, callback) {
    callback.pending();
  });

  this.Then(/^the search results should match the last (\d+) users created$/, function (arg1, callback) {
    callback.pending();
  });

  this.When(/^I try to change my name to "([^"]*)"$/, function (newName, callback) {
    callback.pending();
  });

  this.Then(/^my details should be updated$/, function (callback) {
    callback.pending();
  });

  this.When(/^I try to update "([^"]*)" name to "([^"]*)"$/, function (arg1, arg2, callback) {
    callback.pending();
  });

  this.When(/^I try to delete myself from the system$/, function (callback) {
    callback.pending();
  });

  this.When(/^I try to delete "([^"]*)" from the system$/, function (arg1, callback) {
    callback.pending();
  });

  this.When(/^I retrieve the authenticated users details$/, function (callback) {
    callback.pending();
  });

  this.Then(/^user number (\d+) should have the name "([^"]*)"$/, function (arg1, arg2, callback) {
    callback.pending();
  });

  this.Then(/^user number (\d+) should have the email "([^"]*)"$/, function (arg1, arg2, callback) {
    callback.pending();
  });

  this.Then(/^user number (\d+) should not have a password property$/, function (arg1, callback) {
    callback.pending();
  });

  this.Then(/^retrieved user count should be (\d+)$/, function (arg1, callback) {
    callback.pending();
  });
};
module.exports = myStepDefinitionsWrapper;