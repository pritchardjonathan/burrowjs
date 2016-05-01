"use strict";

var request = require("request-promise");

const apiUrl = "http://localhost:5000/api/user";

exports.register = function(userData){
  return request({
    uri: apiUrl,
    json: userData,
    method: "POST",
    resolveWithFullResponse: true,
    simple: false
  })
    .then(function( response){
      return { body: response.body, response };
    });
};

exports.get = function(searchText, skip, take, authenticated, authenticationToken){
  var queryString = {},
    headers = {};
  if(typeof searchText === "string") queryString["searchtext"] = searchText;
  if(typeof skip === "number") queryString["skip"] = skip;
  if(typeof take === "number") queryString["take"] = take;
  if(typeof authenticated === "boolean"){
    queryString["authenticated"] = authenticated;
  }
  headers["Authorization"] = "Bearer " + authenticationToken;
  return request({
    uri: apiUrl,
    method: "GET",
    resolveWithFullResponse: true,
    simple: false,
    qs: queryString,
    headers: headers,
    json: true
  }).then(function(response){
    var body = response.body;
    if(!body) body = [];
    return { body, response };
  });
};

exports.update = function(updateFields, userId, authorizationToken){
  return request({
    uri: `${apiUrl}/${userId}`,
    json: updateFields,
    method: "POST",
    resolveWithFullResponse: true,
    simple: false,
    headers: {
      Authorization: "Bearer " + authorizationToken
    }
  }).then(function(response){
    return { body: response.body, response };
  })
};

exports.remove = function(userId, authorizationToken){
  return request({
    uri: `${apiUrl}/${userId}`,
    method: "DELETE",
    resolveWithFullResponse: true,
    simple: false,
    headers: {
      Authorization: "Bearer " + authorizationToken
    }
  }).then(function(response){
    return { response };
  })
};