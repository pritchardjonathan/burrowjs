"use strict";

var userSupport = require("../support/user"),
  authSupport = require("../support/authentication"),
  email,
  world = require("../support/world"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {
  if(!this.world) this.world = world;

  this.When(/^I try to register some user$/, function (callback) {
    var world = this;
    userSupport.register({ email: world.defaultEmail, password: world.defaultPassword })
      .then(function(result){
        if(result.user) world.users.push(result.user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to register (a|another) user with email "([^"]*)"$/, function (ignore1, email, callback) {
    var world = this;
    world.email = email;
    userSupport.register({ email: email, password: "SomeP@55" })
      .then(function(result){
        if(result.user) world.users.push(result.user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });
  this.Given(/^a user exists$/, function(callback){
    var world = this;
    userSupport.register({ email: world.defaultEmail, password: world.defaultPassword })
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        expect(result.user).to.not.be.falsy;
        world.users.push(result.user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Given(/^a user with email "([^"]*)" and password "([^"]*)" exists$/, function(email, password, callback){
    const world = this,
      user  = { email: email, password: password };
    userSupport.register(user)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        world.users.push(user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Given(/^a user with name "([^"]*)" email "([^"]*)" and password "([^"]*)" exists$/, function (name, email, password, callback) {
    var world = this;
    userSupport.register({ name: name, email: email, password: password })
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        if(result.user) world.users.push(result.user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to register (a|another) user with email "([^"]*)" and password "([^"]*)"$/, function (ignore1, email, password, callback) {
    var world = this;
    userSupport.register({ email: email, password: password })
      .then(function(result){
        if(result.user) world.users.push(result.user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to register without supplying a password$/, function (callback) {
    var world = this;
    userSupport.register({ email: world.defaultEmail })
      .then(function(result){
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to register without supplying an email$/, function (callback) {
    var world = this;
    userSupport.register({ password: world.defaultPassword })
      .then(function(result){
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^I should ([^"]*)be able to retrieve the authenticated users details$/, function (negated, callback) {
    var world = this;
    userSupport.get(null, null, null, true, world.authenticationToken)
      .then(function(result){
        if(negated){
          expect(result.response.statusCode).to.not.equal(200);
        } else {
          expect(result.response.statusCode).to.equal(200);
          expect(result.body.length).to.equal(1);
          world.users = world.users.concat(result.data);
        }
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to retrieve the authenticated users details$/, function (callback) {
    var world = this;
    userSupport.get(null, null, null, true, world.authenticationToken)
      .then(function(result){
        world.users = world.users.concat(result.data);
        world.searchResults = result.data;
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I search for a user with "([^"]*)" search text$/, function (searchText, callback) {
    var world = this;
    userSupport.get(searchText, null, null, false)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        world.searchResults = result.data;
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I search for "([^"]*)" skipping the first (\d+) and taking the next (\d+)$/, function (searchText, skip, take, callback) {
    var world = this;
    userSupport.get(searchText, skip, take, false)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        world.searchResults = result.data;
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^search results should contain (\d+) users$/, function (resultCount, callback) {
    expect(this.searchResults.length).to.equal(resultCount);
  });

  this.Then(/^user (\d+) in the search results should be called "([^"]*)"$/, function (userIndex, userName, callback) {
    expect(this.searchResults.length).to.be.atLeast(userIndex); // 1 based index
  });

  this.Given(/^(\d+) users exist with the name containing "([^"]*)"$/, function (userCount, userNameFragment, callback) {
    var matchingUserCount = 0;
    userNameFragment = userNameFragment.toLowerCase();
    for (let user of this.searchResults){
      if(user.name && user.name.toLowerCase().indexOf(userNameFragment) != -1) matchingUserCount++;
    }
    expect(matchingUserCount).to.equal(userCount);
  });

  this.Then(/^the search results should match the last (\d+) users created$/, function (fromIndex, callback) {
    var usersCreated = this.users.slice(fromIndex, this.users.length);
    for(let userResult of this.searchResults){
      var matchFound = usersCreated.some((createdUser) => {
        return createdUser.id == userResult.id &&
          createdUser.name == userResult.name &&
          createdUser.email == userResult.email;
      });
      expect(matchFound).to.be.true();
    }
    callback();
  });

  this.When(/^I try to change my name to "([^"]*)"$/, function (newName, callback) {
    var world = this;
    userSupport.update({ name: newName }, world.authenticatedUser.id)
      .then(function(result){
        if(result.user) world.users.push(result.user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^my details should be updated$/, function (callback) {
    var world = this;
    var updatedUser = world.users[world.users.length - 1];
    userSupport.get(null, null, null, true, world.authenticationToken)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        expect(result.data.length).to.equal(1);
        expect(updatedUser).to.deepEqual(result.data[0]);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to update "([^"]*)" name to "([^"]*)"$/, function (targetUserName, newName, callback) {
    var world = this;
    userSupport.get(targetUserName, null, null, false)
      .then(function(result){
        world.response = result.response;
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to delete myself from the system$/, function (callback) {
    var world = this;
    userSupport.get(world.authenticatedUser.id)
      .then(function(result){
        world.response = result.response;
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to delete "([^"]*)" from the system$/, function (userName, callback) {
    var world = this;
    userSupport.get(userName, null, null, true, world.authenticationToken)
      .then(function(result){
        expect(result.body.length).to.be.atLeast(1);
        return userSupport.get(result.body[0].id)
          .then(function(result){
            world.response = result.response;
          })
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^user number (\d+) should have the name "([^"]*)"$/, function (userIndex, userName, callback) {
    expect(world.searchResults.length).to.be.atLeast(userIndex);
    expect(world.searchResults[userIndex].name).to.equal(userName);
  });

  this.Then(/^user number (\d+) should have the email "([^"]*)"$/, function (userIndex, userEmail, callback) {
    expect(world.searchResults.length).to.be.atLeast(userIndex);
    expect(world.searchResults[userIndex].email).to.equal(userEmail);
  });

  this.Then(/^user number (\d+) should not have a password property$/, function (userIndex, callback) {
    expect(world.searchResults.length).to.be.atLeast(userIndex);
    expect(world.searchResults[userIndex].password).to.be.undefined;
  });

  this.Then(/^retrieved user count should be (\d+)$/, function (userCount, callback) {
    expect(world.searchResults.length).to.equal(userCount);
  });

};
module.exports = myStepDefinitionsWrapper;