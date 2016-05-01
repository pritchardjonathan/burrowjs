"use strict";
const route = require("koa-route");
const bcrypt = require("bcrypt");
const fieldValidatorMap = {};
const fieldTransformerMap = {};
const mongoDb = require("mongodb");
var usersCollection;

module.exports = function(db) {
  usersCollection = db.collection("users");

  return function *(id) {
    const self = this;
    if(!id){
      self.throw("User ID is required", 400);
      return;
    }
    if(!mongoDb.ObjectID.isValid(id)){
      self.throw("Invalid user ID", 400);
      return;
    }

    if(self.state.user.id !== id){
      self.throw("Cannot edit another users profile", 401);
      return;
    }

    id = mongoDb.ObjectID(id);

    if(!Object.keys(self.request.body).length){
      self.throw("Nothing to update", 400);
      return;
    }

    yield validate(self.request.body)
      .then(transform.bind(this, self.request.body))
      .then(update.bind(this, id, self.request.body))
      .then(function(){
        self.status = 200;
      })
      .catch(function(err){
        self.throw(err.message, err.status);
      });

  };

  function validate(data){
    let validations = [];
    for(var key of Object.keys(data)){
      var fieldValidators = fieldValidatorMap[key];
      if(!fieldValidators) return Promise.reject({ message: `Cannot update field '${key}'`, status: 400 });
      for(var validator of fieldValidators){
        if(typeof validator === "function") validations.push(validator(data[key]));
      }
    }
    return Promise.all(validations);
  }

  function transform(data){
    let transformations = [];
    for(var key of Object.keys(data)){
      var fieldTransformers = fieldTransformerMap[key];
      if(!fieldTransformers || !fieldTransformers.length) continue;
      for(var transformer of fieldTransformers){
        transformations.push(transformer(data[key], data));
      }
    }
    return Promise.all(transformations);
  }

  function update(id, fields){
    return usersCollection.update({ _id: id }, { $set: fields }, { multi: false })
      .catch(function(){
        return Promise.reject({ message: "Error updating user", status: 500 });
      });
  }

};

//Validators. Empty array means field is allowed without validations
fieldValidatorMap["name"] = [];

fieldValidatorMap["password"] = [
  function passwordIsValid(pass){
    return new Promise(function(resolve, reject){
      if(pass && pass.length >= 8 && pass.search(/[0-9]/) != -1) resolve();
      else reject({ message: "Invalid password. Must be at least 8 characters and contain at least one number", status: 400 });
    });
  }
];
fieldValidatorMap["email"] = [
  function emailIsValid(email){
    return new Promise(function(resolve, reject){
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(re.test(email)) resolve();
      else reject({ message: "Invalid email address", status: 400 });
    });
  },
  function emailIsUnique(email){
    return new Promise(function(resolve, reject){
      usersCollection.count({ email: email })
        .then(function(userCount){
          if(userCount > 0) reject({ message: "Email already exists", status: 409 });
          else resolve();
        })
        .catch(function(err){
          reject({ message: "Error validating email", status: 500 });
        });
    });
  }
];

// Transformers

fieldTransformerMap["password"] = [
  function hashPassword(password, data){
    return new Promise(function(resolve, reject) {
      bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
          reject({ message: "Problem hashing password", status: 500 });
          return;
        }
        delete data.password;
        data.passwordHash = hash;
        resolve();
      });
    })
  }
];
