"use strict";

module.exports = function App(){
  const db = require("promised-mongo")("sovote");
  const request = require("request-promise");
  const config = require("./config");
  const cron = require("node-cron");
  const xml2js = require("xml2js");
  const qaCollection = db.collection("uk-parliament-qnas");
  const moment = require("moment");
  const log = require("../../common/logger")("Uk Parliament QA Extraction App");

  const xml2jsOptions = {
    explicitArray: false,
    ignoreAttrs: true
  };

  require("./ensure-mongodb-indexes")(db);

  cron.schedule(config.qAExtractCron, importQAAtomFeed);

  if(config.runQAExtractionImmediately) importQAAtomFeed();

  function importQAAtomFeed(){
    log.info("Querying Atom feed");
    request({
      uri: config.qAAtomFeedUri,
      method: "GET"
    }).then(function(response){
      log.info("Deserialising Atom feed");
      if(!response) return null;
      return new Promise(function(resolve, reject){
        xml2js.parseString(response, xml2jsOptions, function(err, result){
          if(err){
            reject(err);
            return;
          }
          resolve(result);
        });
      })
      .then(function(qAFeed){
        var reports = [];
        if(!qAFeed) return null;
        for(var feedItem of qAFeed.feed.entry){
          let uri = feedItem.id;
          if(!uri.endsWith(".xml")) continue;
          reports.push(new Promise(function(resolve, reject){
            request({
              uri: uri,
              method: "GET"
            }).then(resolve);
          }));
        }
        log.info(`Atom feed returned ${reports.length} reports`);
        log.info("Requesting details");
        return Promise.all(reports);
      })
      .then(function(responses){
        log.info("Deserialising details");
        var serialiseResponses = [];
        for(var response of responses){
          serialiseResponses.push(new Promise(function(resolve, reject){
            xml2js.parseString(response, xml2jsOptions, function(err, result){
              if(err){
                reject(err);
                return;
              }
              resolve(result);
            });
          }));
        }
        return Promise.all(serialiseResponses);
      })
      .then(function(qAReports){
        var upserts = [];
        // Upsert database
        for(var report of qAReports){
          if(!Array.isArray(report.DailyReport.ReportQuestions)) report.DailyReport.ReportQuestions = [ report.DailyReport.ReportQuestions ];
          for(var reportQuestion of report.DailyReport.ReportQuestions){
            if(!Array.isArray(reportQuestion.ReportQuestion)) reportQuestion.ReportQuestion = [ reportQuestion.ReportQuestion ];
            for(var question of reportQuestion.ReportQuestion){
              let qa = transformQA(question);
              upserts.push(qaCollection.update({ parliamentDataId: qa.parliamentDataId }, qa, { upsert: true }));
            }
          }
        }
        log.info(`Importing ${upserts.length} QnA entities`)
        return Promise.all(upserts);
      })
      .then(function(){
        log.info("Finished import");
      })
      .catch(function(err){
        log.error(err);
        throw err;
      });
    });
  }

  function transformQA(data){
    return {
      parliamentDataId: +data.Identifer.Id,
      heading: data.Heading,
      answer: {
        id: +data.Answer.CurrentVersion.AnswerId,
        member: transformMember(data.Answer.CurrentVersion.Minister),
        answeringBody: transformAnsweringBody(data.Answer.CurrentVersion.AnsweringBody),
        text: data.Answer.CurrentVersion.Text,
        updated: moment(data.Answer.CurrentVersion.LastUpdated).toDate()
      },
      question:{
        id: +data.Question.Uin,
        member: transformMember(data.Question.TablingMember),
        targetBody: transformAnsweringBody(data.Question.AnsweringBody),
        text: data.Question.Text,
        updated: moment(data.Question.UpdatedDate).toDate()
      }
    }
  }

  function transformMember(data){
    return {
      id: +data.MemberId,
      name: data.MemberName,
      constituency: data.Constituency
    }
  }

  function transformHouse(data){
    return {
      id: +data.HouseId,
      name: data.HouseName
    };
  }

  function transformAnsweringBody(data){
    return {
      id: +data.AnsweringBodyId,
      name: data.AnsweringBodyName,
      shortName: data.AnsweringBodyShortName,
      sortName: data.AnsweringBodySortName
    }
  }

};