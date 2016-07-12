"use strict";

const pMongo = require("promised-mongo");
const utils = require("./utils");
const request = require("request-promise");

const db = pMongo("sovote-uk-parliament-qa-feed-service");
const qaCollection = db.collection("qnas");

const apiUrl = "http://localhost:5000/api/uk-parliament-qa";


exports.generateQAFeedItems = function(count, options){

  var qas = [];
  for(var i = 0; i < count; i++){
    qas.push({
      "_id" : pMongo.ObjectId(),
      "type": "uk-parliament-qa",
      body: {
        "parliamentDataId": utils.generateInteger(1, 100000),
        "heading": "heading " + i,
        "answer": {
          "id": utils.generateInteger(1, 5000),
          "member": {
            "id": utils.generateInteger(1, 10000),
            "name": "name " + i,
            "constituency": "constituency " + i
          },
          "answeringBody": {
            "id": utils.generateInteger(1, 100),
            "name": "name " + i,
            "shortName": "shortName " + i,
            "sortName": "sortName " + i
          },
          "text": "text " + i,
          "updated": utils.generateDateString(1262304000000, new Date().getTime())
        },
        "question": {
          "id": utils.generateInteger(1, 50000),
          "member": {
            "id": utils.generateInteger(1, 10000),
            "name": "name " + i,
            "constituency": "constituency " + i
          },
          "targetBody": {
            "id": utils.generateInteger(1, 100),
            "name": "name " + i,
            "shortName": "shortName " + i,
            "sortName": "sortName " + i
          },
          "text": "text " + i,
          "updated": utils.generateDateString(1262304000000, new Date().getTime())
        }
      }
    });
  }
  return qas;
};

exports.get = function(skip, take){
  var queryString = {},
    headers = {};
  if(typeof skip === "number") queryString["skip"] = skip;
  if(typeof take === "number") queryString["take"] = take;
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

exports.insert = function(qa){
  return qaCollection.insert(qa)
};