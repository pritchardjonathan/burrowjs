'use strict';
var request = require("request-promise");

const apiUrl = "http://localhost:5000/api/authentication"

exports.login = function(email, password){
  return request({
    uri: apiUrl,
    method: "GET",
    resolveWithFullResponse: true,
    simple: false,
    qs: { email, password }
  }).then(function(response){
    return { response };
  });
};

exports.logout = function(callback){
  return request({
    uri: apiUrl,
    method: "DELETE",
    resolveWithFullResponse: true,
    simple: false
  }).then(function(response){
    return { response }
  })
};