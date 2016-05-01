"use strict";

var userSupport = require("../support/user"),
  authSupport = require("../support/authentication"),
  email,
  world = require("../support/world"),
  expect = require("chai").expect;

var myStepDefinitionsWrapper = function () {
  if(!this.world) this.world = world;

  this.When(/^I try to register some user$/, function (callback) {
    var world = this,
      user = { email: world.defaultEmail, password: world.defaultPassword };
    userSupport.register(user)
      .then(function(result){
        if(result.body){
          user.id = result.body.id; // keep password and add id returned from API
          world.users.push(user);
        }
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to register (a|another) user with email "([^"]*)"$/, function (ignore1, email, callback) {
    const world = this,
      user = { email: email, password: "SomeP@55" };
    world.email = email;
    userSupport.register(user)
      .then(function(result){
        if(result.body){
          user.id = result.body.id; // keep password and add id returned from API
          world.users.push(user);
        }
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Given(/^a user exists$/, function(callback){
    const world = this,
      user = { email: world.defaultEmail, password: world.defaultPassword };
    userSupport.register(user)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        user.id = result.body.id; // keep password and add id returned from API
        world.users.push(user);
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
        user.id = result.body.id; // keep password and add id returned from API
        world.users.push(user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Given(/^a user with name "([^"]*)" email "([^"]*)" and password "([^"]*)" exists$/, function (name, email, password, callback) {
    const world = this,
      user = { name: name, email: email, password: password };
    userSupport.register(user)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        user.id = result.body.id; // keep password and add id returned from API
        world.users.push(user);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to register (a|another) user with email "([^"]*)" and password "([^"]*)"$/, function (ignore1, email, password, callback) {
    var world = this,
      user = { email: email, password: password };
    userSupport.register(user)
      .then(function(result){
        if(result.body){
          user.id = result.body.id; // keep password and add id returned from API
          world.users.push(user);
        }
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
          if(world.authenticationToken){
            // User is authenticated so call should succeed with empty result
            expect(result.response.statusCode).to.equal(200);
            expect(result.body).to.be.a("array");
            expect(result.body.length).to.equal(0);
          } else {
            expect(result.response.statusCode).to.equal(401);
          }

        } else {
          expect(result.response.statusCode).to.equal(200);
          expect(result.body).to.be.a("array");
          expect(result.body.length).to.equal(1);
          world.users = world.users.concat(result.body);
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
        if(result.body instanceof Array) world.users = world.users.concat(result.body);
        world.searchResults = result.body;
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I search for a user with "([^"]*)" search text$/, function (searchText, callback) {
    var world = this;
    userSupport.get(searchText, null, null, false, world.authenticationToken)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        world.searchResults = result.body;
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I search for "([^"]*)" skipping the first (\d+) and taking the next (\d+)$/, function (searchText, skip, take, callback) {
    var world = this;
    userSupport.get(searchText, +skip, +take, false, world.authenticationToken)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        world.searchResults = result.body;
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^search results should contain (\d+) users$/, function (resultCount) {
    expect(this.searchResults.length).to.equal(+resultCount);
  });

  this.Then(/^user (\d+) in the search results should be called "([^"]*)"$/, function (userIndex, userName) {
    userIndex = userIndex - 1;
    expect(this.searchResults).to.not.be.undefined;
    expect(this.searchResults.length).to.be.at.least(userIndex + 1);
    expect(this.searchResults[userIndex].name).to.equal(userName);
  });

  this.Given(/^(\d+) users exist with the name containing "([^"]*)"$/, function (userCount, userNameFragment, callback) {
    const world = this,
      creationPromises = [];
    for(var i = 0; i < +userCount; i++){
      let user = {
        name: userNameFragment + i,
        email: `test${i}@test.com`,
        password: "5omeP4ss"
      };
      creationPromises.push(userSupport.register(user));
      world.users.push(user);
    }

    Promise.all(creationPromises)
      .then(function(){
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^the search results should contain (\d+) items$/, function(expectedItemCount){
    expect(this.searchResults).to.not.be.undefined;
    expect(this.searchResults.length).to.equal(+expectedItemCount);
  });

  this.Then(/^the search results should match the last (\d+) users created$/, function (fromIndex) {
    var usersCreated = this.users.slice(fromIndex, this.users.length);
    for(let userResult of this.searchResults){
      var matchFound = usersCreated.some((createdUser) => {
        return createdUser.name == userResult.name &&
          createdUser.email == userResult.email;
      });
      expect(matchFound).to.be.true;
    }
  });

  this.When(/^I try to change my name to "([^"]*)"$/, function (newName, callback) {
    var world = this;
    userSupport.get(null, null, null, true, world.authenticationToken)
      .then(function(getResult){
        expect(getResult.response.statusCode).to.equal(200);
        expect(getResult.body).to.not.be.undefined;
        expect(getResult.body).to.be.a("array");
        expect(getResult.body.length).to.equal(1);
        return userSupport.update({ name: newName }, getResult.body[0].id, world.authenticationToken)
          .then(function(result){
            // Reflect what the new state should be for later comparison
            world.users[0].name = newName;
            world.response = result.response;
            callback();
          })
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to change the name of a user with id "([^"]*)" to "([^"]*)"$/, function (userId, newName, callback) {
    var world = this;
    userSupport.update({ name: newName }, userId, world.authenticationToken)
      .then(function(result){
        if(result.body) world.users.push(result.body);
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to perform an empty update$/, function (callback) {
    var world = this;
    userSupport.update({ }, world.users[0].id, world.authenticationToken)
      .then(function(result){
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
        expect(result.body.length).to.equal(1);
        delete updatedUser.password;
        expect(updatedUser).to.deep.equal(result.body[0]);

        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to update "([^"]*)" name to "([^"]*)"$/, function (targetUserName, newName, callback) {
    var world = this;
    userSupport.get(targetUserName, null, null, false, world.authenticationToken)
      .then(function(result){
        expect(result.response.statusCode).to.equal(200);
        expect(result.body.length).to.equal(1);
        return userSupport.update({ name: newName }, result.body[0].id, world.authenticationToken)
          .then(function(result){
            world.response = result.response;
            callback();
          });
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to change my email to "([^"]*)"$/, function (newEmail, callback) {
    const world = this;
    userSupport.update({ email: newEmail }, world.users[0].id, world.authenticationToken)
      .then(function(result){
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to change my password to "([^"]*)"$/, function (newPassword, callback) {
    const world = this;
    userSupport.update({ password: newPassword }, world.users[0].id, world.authenticationToken)
      .then(function(result){
        world.users[0].password = newPassword;
        world.response = result.response;
        callback();
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to delete myself from the system$/, function (callback) {
    var world = this;
    userSupport.get(null, null, null, true, world.authenticationToken)
      .then(function(result){
        expect(result.body).to.be.a("array");
        expect(result.body.length).to.equal(1);
        return userSupport.remove(result.body[0].id, world.authenticationToken)
          .then(function(result){
            world.response = result.response;
            callback();
          });
      })
      .catch(function(err){ callback(err); });
  });

  this.When(/^I try to delete "([^"]*)" from the system$/, function (userName, callback) {
    var world = this;
    userSupport.get(userName, null, null, null, world.authenticationToken)
      .then(function(result){
        expect(result.body).to.be.a("array");
        expect(result.body.length).to.be.at.least(1);
        return userSupport.get(result.body[0].id)
          .then(function(result){
            world.response = result.response;
            callback()
          })
      })
      .catch(function(err){ callback(err); });
  });

  this.Then(/^user number (\d+) should have the name "([^"]*)"$/, function (userIndex, userName) {
    userIndex = userIndex - 1;
    expect(this.searchResults.length).to.be.at.least(userIndex);
    expect(this.searchResults[userIndex].name).to.equal(userName);
  });

  this.Then(/^user number (\d+) should have the email "([^"]*)"$/, function (userIndex, userEmail) {
    userIndex = userIndex - 1;
    expect(this.searchResults.length).to.be.at.least(userIndex);
    expect(this.searchResults[userIndex].email).to.equal(userEmail);
  });

  this.Then(/^user number (\d+) should not have a password property$/, function (userIndex) {
    userIndex = userIndex - 1;
    expect(this.searchResults.length).to.be.at.least(userIndex);
    expect(this.searchResults[userIndex].password).to.be.undefined;
  });

  this.Then(/^retrieved user count should be (\d+)$/, function (userCount) {
    expect(this.searchResults).to.not.be.undefined;
    expect(this.searchResults.length).to.equal(+userCount);
  });



};
module.exports = myStepDefinitionsWrapper;