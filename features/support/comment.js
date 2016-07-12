"use strict";

const utils = require("./utils");
const request = require("request-promise");

const apiUrl = "http://localhost:5000/api/comment";

exports.post = function(comment, authenticationToken){
  let headers = {};
  headers["Authorization"] = "Bearer " + authenticationToken;
  return request({
    uri: apiUrl,
    method: "POST",
    resolveWithFullResponse: true,
    simple: false,
    json: comment,
    headers: headers
  }).then(function(response){
    return { body: response.body, response };
  });
};

exports.get = function(parentType, parentId, authenticationToken){
  let headers = {};
  headers["Authorization"] = "Bearer " + authenticationToken;
  return request({
    uri: apiUrl + "?parentType=" + parentType + "&parentId=" + parentId,
    method: "GET",
    resolveWithFullResponse: true,
    simple: false,
    headers: headers,
    json: true
  }).then(function(response){
    return { body: response.body, response };
  });
};

