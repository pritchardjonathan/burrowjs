"use strict";

var authSupport = require("../support/authentication"),
  world = require("../support/world"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {

  this.World = world;

  this.Given(/^I am logged in$/, login);
  this.Given(/^is logged in$/, login);
  this.Then(/^I should be able to login using those credentials$/, login);
  function login (callback) {
    var email, password,
      world = this;
    if(world.users.length > 0){
      let user = world.users[0];
      email = user.email;
      password = user.password;
    } else {
      email = world.defaultEmail;
      password = world.defaultPassword;
    }
    authSupport.login(email, password)
      .then(function (result) {
        expect(result.response.statusCode).to.equal(200);
        world.response = result.response;
        world.authenticationToken = result.response.body;
        callback();
      })
      .catch(function(err){ callback(err); });
  }

  this.Given(/^I am logged in as "([^"]*)"$/, function (userName, callback) {
    var targetUser,
      world = this;
    userName = userName.toLowerCase();
    for(var user of world.users){
      if(user.name.toLowerCase() == userName){
        targetUser = user;
        break;
      }
    }
    expect(targetUser).to.not.be.undefined;
    expect(targetUser.password).to.not.be.undefined;
    authSupport.login(targetUser.email, targetUser.password)
      .then(function (result) {
        expect(result.response.statusCode).to.equal(200);
        world.response = result.response;
        world.authenticationToken = result.response.body;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to login using the correct credentials$/, function tryLogin (callback) {
    var world = this;
    authSupport.login(this.email, this.password)
      .then(function(result){
        world.response = result.response;
        if(result.response.body) world.authenticationToken = result.response.body;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^I should ([not ]*)be able to login using the credentials "([^"]*)" and password "([^"]*)"$/, function (negated, email, password, callback) {
    var world = this;
    authSupport.login(email, password)
      .then(function (result) {
        expect(result.response.statusCode).to.equal(200);
        world.response = result.response;
        world.authenticationToken = result.response.body;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^I should not be able to login$/, function (callback) {
    var email, password,
      world = this;
    if(this.users.length > 0){
      let user = world.users[0];
      email = user.email;
      password = user.password;
    } else {
      email = world.defaultEmail;
      password = world.defaultPassword;
      authSupport.login(email, password)
        .then(function (result) {
          expect(result.response.statusCode).to.not.equal(200);
          world.response = result.response;
          callback();
        })
        .catch(function(err){ callback(err); });
    }
  });

  this.Given(/^I am logged out$/, function (callback) {
    authSupport.logout()
      .then(function (result) {
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^I should be able to logout$/, function (callback) {
    var world = this;
    authSupport.logout()
      .then(function (result) {
        expect(result.response.statusCode).to.equal(200);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });


  this.Then(/^I should not be able to logout$/, function (callback) {
    var world = this;
    authSupport.logout()
      .then(function (result) {
        expect(result.response.statusCode).to.not.equal(200);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

};
module.exports = myStepDefinitionsWrapper;