"use strict";

var request = require("request");

const apiUrl = "http://localhost:5000/api/user";

exports.register = function(userData, callback){
  request({ uri: apiUrl, json: userData, method: "POST" }, function(err, response, body){
      if(err) callback(err);
      else if(response.statusCode != 200) callback(new Error(`Server returned a ${response.statusCode} status code`));
      else callback(null, JSON.parse(body));
    });
};
