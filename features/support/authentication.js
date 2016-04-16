'use strict';
var request = require("request");

const apiUrl = "http://localhost:5000/api/authentication"

exports.login = function(email, password, callback){
  request({
    uri: apiUrl + "?email=" + email + "&password=" + password,
    method: "GET"
  }, function(err, response, body){
    if(err) callback(err, false);
    else if(response.statusCode == 404) callback(null, false); // Login failed
    else if(response.statusCode != 200) callback(new Error(`Server returned a ${response.statusCode} status code`), false);
    else callback(null, true);
  });
};

exports.logout = function(callback){
  request
    .del(apiUrl)
    .on("response", function(response){
      if(response.statusCode === 200){
        callback(null, true);
      }
      callback(new Error(`Server responded with a ${response.statusCode} status code`));
    })
    .on("error", function(err){
      callback(err);
    })
};