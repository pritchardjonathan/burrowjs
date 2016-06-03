"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  RequestStub = require("../../stubs/RequestStub"),
  MongoDbStub = require("../../stubs/MongoDbStub"),
  BurrowStub = require("../../stubs/burrowStub"),
  Sut = require("../../../services/uk-parliament-mp-extraction/app");

describe("UK parliament MP service", function(){
  describe("app", function(){
    var sandbox,
      mongoDbStub,
      requestStub,
      burrowStub,
      hashStub,
      mockExtractedQA,
      qMpDetailOptions,
      aMpDetailOptions,
      mockQMPRawExtraction,
      mockQMPExtraction,
      mockAMPRawExtraction,
      mockAMPExtraction,
      sut;
    before(function(){
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      });
      mockery.registerAllowable("../../../services/uk-parliament-mp/app");
    });

    beforeEach(function () {
      // Create a sandbox for the test
      sandbox = sinon.sandbox.create();

      requestStub = new RequestStub(sandbox);
      requestStub.stub.hello = "world";
      mockery.registerMock("request-promise", requestStub.stub);

      mongoDbStub = new MongoDbStub(sandbox);
      mockery.registerMock("promised-mongo", mongoDbStub.stub);

      burrowStub = new BurrowStub(sandbox);
      mockery.registerMock("burrow", burrowStub.stub);

      mockExtractedQA = {
        "parliamentDataId": 516154,
        "heading": "Higher Education",
        "answer": {
          "id": 58367,
          "member": {
            "id": 4039,
            "name": "Joseph Johnson",
            "constituency": "Orpington"
          },
          "answeringBody": {
            "id": 26,
            "name": "Department for Business, Innovation and Skills",
            "shortName": "Business, Innovation and Skills",
            "sortName": "Business, Innovation and Skills"
          },
          "text": "<p>At the February European Council, the Government negotiated a new settlement, giving the United Kingdom a special status in a reformed European Union. The Government's position, as set out by my right hon. Friend the Prime Minister to the House on 22 February, is that the UK will be stronger, safer and better off remaining in a reformed EU.<\/p>",
          "updated": new Date()
        },
        "question": {
          "id": 35759,
          "member": {
            "id": 4392,
            "name": "Steven Paterson",
            "constituency": "Stirling"
          },
          "targetBody": {
            "id": 26,
            "name": "Department for Business, Innovation and Skills",
            "shortName": "Business, Innovation and Skills",
            "sortName": "Business, Innovation and Skills"
          },
          "text": "To ask the Secretary of State for Business, Innovation and Skills, what assessment he has made of the potential implications for UK Erasmus students, lecturers and research fellows of the UK leaving the EU.",
          "updated": new Date()
        }
      };

      qMpDetailOptions = {
        uri: "http://data.parliament.uk/membersdataplatform/services/mnis/members/query/id=4392",
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      };
      aMpDetailOptions = {
        uri: "http://data.parliament.uk/membersdataplatform/services/mnis/members/query/id=4039",
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      };

      mockQMPRawExtraction = `
      {
        "Members": {
          "Member": {
            "@Member_Id": "4392",
            "@Dods_Id": "121911",
            "@Pims_Id": "6134",
            "DisplayAs": "Steven Paterson",
            "ListAs": "Paterson, Steven",
            "FullTitle": "Steven Paterson MP",
            "LayingMinisterName": null,
            "DateOfBirth": "1975-04-25T00:00:00",
            "DateOfDeath": {
              "@xsi:nil": "true",
              "@xmlns:xsi": "http:\/\/www.w3.org\/2001\/XMLSchema-instance"
            },
            "Gender": "M",
            "Party": {
              "@Id": "29",
              "#text": "Scottish National Party"
            },
            "House": "Commons",
            "MemberFrom": "Stirling",
            "HouseStartDate": "2015-05-07T00:00:00",
            "HouseEndDate": {
              "@xsi:nil": "true",
              "@xmlns:xsi": "http:\/\/www.w3.org\/2001\/XMLSchema-instance"
            },
            "CurrentStatus": {
              "@Id": "0",
              "@IsActive": "True",
              "Name": "Current Member",
              "Reason": null,
              "StartDate": "2015-05-07T00:00:00"
            }
          }
        }
      }`;
      mockQMPExtraction = JSON.parse(mockQMPRawExtraction);
      mockAMPRawExtraction = `
      {
        "Members": {
          "Member": {
            "@Member_Id": "4039",
            "@Dods_Id": "83602",
            "@Pims_Id": "5599",
            "DisplayAs": "Joseph Johnson",
            "ListAs": "Johnson, Joseph",
            "FullTitle": "Joseph Johnson MP",
            "LayingMinisterName": "Joseph Johnson",
            "DateOfBirth": "1971-12-23T00:00:00",
            "DateOfDeath": {
              "@xsi:nil": "true",
              "@xmlns:xsi": "http:\/\/www.w3.org\/2001\/XMLSchema-instance"
            },
            "Gender": "M",
            "Party": {
              "@Id": "4",
              "#text": "Conservative"
            },
            "House": "Commons",
            "MemberFrom": "Orpington",
            "HouseStartDate": "2010-05-06T00:00:00",
            "HouseEndDate": {
              "@xsi:nil": "true",
              "@xmlns:xsi": "http:\/\/www.w3.org\/2001\/XMLSchema-instance"
            },
            "CurrentStatus": {
              "@Id": "0",
              "@IsActive": "True",
              "Name": "Current Member",
              "Reason": null,
              "StartDate": "2015-05-07T00:00:00"
            }
          }
        }
      }`;
      mockAMPExtraction = JSON.parse(mockAMPRawExtraction)

      hashStub = sandbox.stub();
      hashStub.withArgs(mockQMPExtraction.Members.Member).returns(Promise.resolve("firsthash"));
      hashStub.withArgs(mockAMPExtraction.Members.Member).returns(Promise.resolve("secondhash"));
      mockery.registerMock("object-hash", hashStub);

    });

    afterEach(function () {
      // Restore all the things made through the sandbox
      sandbox.restore();
    });

    describe("uk-parliament-qa-extracted event received", function (){

      it("checks MP data for changes when uk-parliament-qa-extracted is received", function *(){
        // Given

        // Stub the calls to data.parliament
        requestStub.stub.withArgs(qMpDetailOptions).returns(Promise.resolve(mockQMPRawExtraction));
        requestStub.stub.withArgs(aMpDetailOptions).returns(Promise.resolve(mockAMPRawExtraction));

        // When
        sut = new Sut();

        // Then
        yield burrowStub.connectPromise.then(function(){
          assert.isTrue(burrowStub.stub.subscribe.calledWith("uk-parliament-qa-extracted"), "Doesn't subscribe to QA extraction event");
          // Trigger subscriber callback
          var handler = burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1];
          return handler(mockExtractedQA)
            .then(function(){
              sinon.assert.calledWith(requestStub.stub, qMpDetailOptions);
              sinon.assert.calledWith(requestStub.stub, aMpDetailOptions);
            });
        });
      });

      it("publishes mp-extracted event when new MP is detected", function *(){
        // Given
        mongoDbStub.collectionStub.findOne.withArgs({ memberId: 4392 }).returns(Promise.resolve(null));
        mongoDbStub.collectionStub.findOne.withArgs({ memberId: 4039 }).returns(Promise.resolve(null));
        // Stub the calls to data.parliament
        requestStub.stub.withArgs(qMpDetailOptions).returns(Promise.resolve(mockQMPRawExtraction));
        requestStub.stub.withArgs(aMpDetailOptions).returns(Promise.resolve(mockAMPRawExtraction));

        // When
        sut = new Sut();

        // Then
        yield burrowStub.connectPromise.then(function(){
          assert.isTrue(burrowStub.stub.subscribe.calledWith("uk-parliament-qa-extracted"), "Doesn't subscribe to QA extraction event");
          // Trigger subscriber callback
          var handler = burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1];
          return handler(mockExtractedQA)
            .then(function(){
              sinon.assert.calledWith(burrowStub.stub.publish, "uk-parliament-mp-extracted", mockQMPExtraction.Members.Member);
              sinon.assert.calledWith(burrowStub.stub.publish, "uk-parliament-mp-extracted", mockAMPExtraction.Members.Member);
            });
        });
      });

      it("sets correct 'updated' date on local record when new MP is detected", function *(){
        // Given
        mongoDbStub.collectionStub.findOne.withArgs({ memberId: 4392 }).returns(Promise.resolve(null));
        mongoDbStub.collectionStub.findOne.withArgs({ memberId: 4039 }).returns(Promise.resolve(null));
        // Stub the calls to data.parliament
        requestStub.stub.withArgs(qMpDetailOptions).returns(Promise.resolve(mockQMPRawExtraction));
        requestStub.stub.withArgs(aMpDetailOptions).returns(Promise.resolve(mockAMPRawExtraction));

        // When
        sut = new Sut();

        // Then
        yield burrowStub.connectPromise.then(function(){
          assert.isTrue(burrowStub.stub.subscribe.calledWith("uk-parliament-qa-extracted"), "Doesn't subscribe to QA extraction event");
          // Trigger subscriber callback
          var handler = burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1];
          return handler(mockExtractedQA)
            .then(function(){
              sinon.assert.calledWithMatch(mongoDbStub.collectionStub.update.firstCall, sinon.match(function(value){
                return value.memberId == 4392 &&
                  value.hash == "firsthash" &&
                  value.updated.getTime() > Date.now() - 100;
              }, "Questioner record not updated correctly"));
              sinon.assert.calledWithMatch(mongoDbStub.collectionStub.update.secondCall, sinon.match(function(value){
                return value.memberId == 4039 &&
                  value.hash == "secondhash" &&
                  value.updated.getTime() > Date.now() - 100;
              }, "Answerer record not updated correctly"));
            });
        });
      });

      it("publishes mp-extracted event when MP details have changed", function *(){
        // Given
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4392 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "originaldifferentfirsthash",
            updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }));
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4039 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "originaldifferentsecondhash",
            updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }));
        // Stub the calls to data.parliament
        requestStub.stub.withArgs(qMpDetailOptions).returns(Promise.resolve(mockQMPRawExtraction));
        requestStub.stub.withArgs(aMpDetailOptions).returns(Promise.resolve(mockAMPRawExtraction));

        // When
        sut = new Sut();

        // Then
        yield burrowStub.connectPromise.then(function(){
          assert.isTrue(burrowStub.stub.subscribe.calledWith("uk-parliament-qa-extracted"), "Doesn't subscribe to QA extraction event");
          // Trigger subscriber callback
          var handler = burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1];
          return handler(mockExtractedQA)
            .then(function(){
              sinon.assert.calledWith(burrowStub.stub.publish, "uk-parliament-mp-extracted", mockQMPExtraction.Members.Member);
              sinon.assert.calledWith(burrowStub.stub.publish, "uk-parliament-mp-extracted", mockAMPExtraction.Members.Member);
            });
        });
      });

      it("updates 'updated' date on record when MP details change", function *(){
        // Given
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4392 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "originaldifferentfirsthash",
            updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }));
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4039 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "originaldifferentsecondhash",
            updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }));
        // Stub the calls to data.parliament
        requestStub.stub.withArgs(qMpDetailOptions).returns(Promise.resolve(mockQMPRawExtraction));
        requestStub.stub.withArgs(aMpDetailOptions).returns(Promise.resolve(mockAMPRawExtraction));

        // When
        sut = new Sut();

        // Then
        yield burrowStub.connectPromise.then(function(){
          assert.isTrue(burrowStub.stub.subscribe.calledWith("uk-parliament-qa-extracted"), "Doesn't subscribe to QA extraction event");
          // Trigger subscriber callback
          var handler = burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1];
          return handler(mockExtractedQA)
            .then(function(){
              sinon.assert.calledWithMatch(mongoDbStub.collectionStub.update.firstCall, sinon.match(function(value){
                return value.memberId == 4392 &&
                  value.hash == "firsthash" &&
                  value.updated.getTime() > Date.now() - 100;
              }, "Questioner record not updated correctly"));
              sinon.assert.calledWithMatch(mongoDbStub.collectionStub.update.secondCall, sinon.match(function(value){
                return value.memberId == 4039 &&
                  value.hash == "secondhash" &&
                  value.updated.getTime() > Date.now() - 100;
              }, "Answerer record not updated correctly"));
            });
        });
      });

      it("doesn't publish mp-extracted event if nothing has changed", function *(){
        // Given
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4392 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "firsthash",
            updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }));
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4039 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "secondhash",
            updated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }));

        // Stub the calls to data.parliament
        requestStub.stub.withArgs(qMpDetailOptions).returns(Promise.resolve(mockQMPRawExtraction));
        requestStub.stub.withArgs(aMpDetailOptions).returns(Promise.resolve(mockAMPRawExtraction));

        // When
        sut = new Sut();

        // Then
        yield burrowStub.connectPromise.then(function(){
          assert.isTrue(burrowStub.stub.subscribe.calledWith("uk-parliament-qa-extracted"), "Doesn't subscribe to QA extraction event");
          // Trigger subscriber callback
          var handler = burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1];
          return handler(mockExtractedQA)
            .then(function(){
              sinon.assert.callCount(burrowStub.stub.publish, 0);
            });
        });
      });

      it("doesn't extract the same MP more than once a day", function *(){
        // Given
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4392 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "originaldifferentfirsthash",
            updated: new Date(Date.now() - 1000 * 60 * 60) }));
        mongoDbStub.collectionStub.findOne
          .withArgs({ memberId: 4039 })
          .returns(Promise.resolve({
            memberId: 4392,
            hash: "originaldifferentsecondhash",
            updated: new Date(Date.now() - 1000 * 60 * 60) }));
        // Stub the calls to data.parliament
        requestStub.stub.withArgs(qMpDetailOptions).returns(Promise.resolve(mockQMPRawExtraction));
        requestStub.stub.withArgs(aMpDetailOptions).returns(Promise.resolve(mockAMPRawExtraction));

        // When
        sut = new Sut();

        // Then
        yield burrowStub.connectPromise.then(function(){
          assert.isTrue(burrowStub.stub.subscribe.calledWith("uk-parliament-qa-extracted"), "Doesn't subscribe to QA extraction event");
          // Trigger subscriber callback
          burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1](mockExtractedQA);

          sinon.assert.callCount(requestStub.stub, 0);
        });
      });
    });
  });
});

