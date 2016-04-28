"use strict";
const route = require("koa-route"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken");

module.exports = function(db){
  var usersCollection = db.collection("users");

  return function *(){
    const self = this,
      password = self.request.query["password"],
      email = this.request.query["email"];

    yield  usersCollection
      .find({ email: email })
      .toArray()
      .then(function(users){
        if(!users.length){
          self.status = 404;
          return;
        }
        let user = users[0];
        return new Promise(function(resolve, reject){
          bcrypt.compare(password, user.passwordHash, function(err, match){
            if(err){
              reject(err);
              return;
            }
            if(!match){
              self.status = 404;
              resolve();
              return;
            }
            let token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "10d" });
            self.body = token;
            self.status = 200;
            resolve();
          });
        });
      });
  };
};