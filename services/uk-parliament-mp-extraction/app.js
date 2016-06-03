"use strict";

module.exports = function App(){
  const log = require("../../common/logger")("UK Parliament MP Extraction App");
  const burrow = require("burrow");
  const db = require("promised-mongo")(process.env.MONGODB_NAME);
  const recordCollection  = db.collection("check-record");
  const hash = require("object-hash");
  const request = require("request-promise");
  const Promise = require("bluebird");
  const rateLimitDelay = 5000;

  log.info("Connecting burrow");
  burrow.connect(process.env.RABBITMQ, "UK Parliament MP extraction service")
    .then(function(){
      log.info("Burrow connected");
      log.info("Subscribing for QnA extraction");
      burrow.subscribe("uk-parliament-qa-extracted", function(qa){
        log.info("Received QnA extraction event");
          return checkUpdateMember(qa.question.member)
            .then(function(){
              return checkUpdateMember(qa.answer.member)
            });
      });
    })
    .catch(function(err){
      log.error(err);
    });

  function checkUpdateMember(member){
    log.info(`Checking member '${member.name}'...`)
    return getMemberRecord(member.id)
      .then(function(memberRecord){
        let cutoff = Date.now() - (1000 * 60 * 60 * 24);
        if(memberRecord != null && memberRecord.updated > cutoff){
          log.info(`Skipping '${member.name}'. Already checked today`);
          return;
        }
        log.info(`Extracting member '${member.name}'...`);
        let startTime = Date.now();
        return extractMemberDetails(member.id)
          .then(function(memberExtraction){
            let newHash = hash(memberExtraction);
            if(memberRecord == null || memberRecord.hash != newHash){
              burrow.publish("uk-parliament-mp-extracted", memberExtraction);
              log.info(`Extracted member '${member.name}' in ${Date.now() - startTime}ms - ${memberRecord == null ? 'New' : 'Changed'}`)
            } else {
              log.info(`Extracted member '${member.name}' in ${Date.now() - startTime}ms - No Change`);
            }
            // Update the record regardless because the update value has to be updated for rate limiting
            return updateRecord(member.id, newHash);
          })
          .then(function(){

            return new Promise(function(resolve, reject){
              // Rate limiter
              console.log(`Pausing for ${rateLimitDelay}ms to limit rate`);
              setTimeout(function(){
                resolve();
              }, rateLimitDelay);
            });
          });
      })

  }

  function getMemberRecord(id){
    return recordCollection
      .findOne({ memberId: id })
      .then(function(record){
        return record;
      });
  }

  function extractMemberDetails(id){
    return request({
      uri: "http://data.parliament.uk/membersdataplatform/services/mnis/members/query/id=" + id,
      method: "GET",
      headers: {
        "Content-Type": "application/json ; charset=utf-8"
      }
    }).then(function(response){
      var jsonResponse = JSON.parse(cleanString(response));
      if(jsonResponse.Members){
        if(Array.isArray(jsonResponse.Members.Member) && jsonResponse.Members.Member.length){
          return jsonResponse.Members.Member[0];
        } else {
          return jsonResponse.Members.Member;
        }
      }
    });
  }

  function cleanString(input) {
    var output = "";
    for (var i=0; i<input.length; i++) {
      if (input.charCodeAt(i) <= 127) {
        output += input.charAt(i);
      }
    }
    return output;
  }

  function updateRecord(id, hash){
    return recordCollection
      .update({
        memberId: id
      },{
        memberId: id,
        hash: hash,
        updated: new Date()
      }, {
        upsert: true
      }).then(function(){
        console.log("updated record");
      });
  }
};