"use strict";
const route = require("koa-route");
const bcrypt = require("bcrypt");

module.exports = function(db) {
  var usersCollection = db.collection("users");

  return function *() {
    const self = this,
      password = self.request.body["password"],
      email = this.request.body["email"];

    if(!passwordIsValid(password)){
      self.throw("Invalid password", 400);
      return;
    }

    if(!password){
      self.throw("A password is required", 400);
      return;
    }
    if(!email){
      self.throw("An email is required", 400);
      return;
    }

    yield  usersCollection
        .find({ email: email })
        .toArray()
        .then(function (existingUsers) {
          if (existingUsers.length) {
            self.throw(`'${email}' already exists`, 409);
            return;
          }
          return new Promise(function(resolve, reject) {
            bcrypt.hash(password, 10, function (err, hash) {
              if (err) {
                reject(err);
                return;
              }
              resolve(hash);
            });
          })
            .then(function(hash){
              return usersCollection.insert({
                name: self.request.body["name"],
                email: self.request.body["email"],
                passwordHash: hash
              });
            })
            .then(function(createdUser){
              self.body = {
                id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email
              };
            });
        });
  }

  function passwordIsValid(pass){
    return pass && pass.length >= 8 && pass.search(/[0-9]/) != -1;
  }
};