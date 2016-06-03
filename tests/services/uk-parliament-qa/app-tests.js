"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  MongoDbStub = require("../../stubs/MongoDbStub"),
  BurrowStub = require("../../stubs/burrowStub"),
  Sut = require("../../../services/uk-parliament-qa/app"),
  config = {
    qAAtomFeedUri: "http://api.data.parliament.uk/resources/files/feed?dataset=7",
    qAExtractCron: "* * * * * *"
  };

describe("UK parliament QnA app", function(){
  describe("app", function(){
    var sandbox,
      mongoDbStub,
      ensureIndexesStub,
      burrowStub,
      sut;
    before(function(){
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      });
      mockery.registerAllowable("../../../services/uk-parliament-qa/app");
    });

    beforeEach(function () {
      // Create a sandbox for the test
      sandbox = sinon.sandbox.create();

      mongoDbStub = new MongoDbStub(sandbox);
      mockery.registerMock("promised-mongo", mongoDbStub.stub);

      ensureIndexesStub = sandbox.stub();
      mockery.registerMock("./ensure-mongodb-indexes", ensureIndexesStub);

      mockery.registerMock("./config", config);

      burrowStub = new BurrowStub(sandbox);
      mockery.registerMock("burrow", burrowStub.stub);

    });

    afterEach(function () {
      // Restore all the things made through the sandbox
      sandbox.restore();
    });

    it("ensures indexes on startup", function *(){
      sut = new Sut();
      assert.isTrue(ensureIndexesStub.calledOnce, "Doesn't ensure indexes");
    });

    it("Upserts QnA entries in mongo", function *(){
      var extractedQA ={
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
            "updated": new Date(1462270471463)
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
            "updated": new Date(1461792440897)
          }
        };
      sut = new Sut();
      yield burrowStub.connectPromise.then(function(){
        // Trigger subscriber callback
        burrowStub.stub.subscribe.withArgs("uk-parliament-qa-extracted").firstCall.args[1](extractedQA);

        assert.isTrue(mongoDbStub.collectionStub.update.calledWith({ parliamentDataId: extractedQA.parliamentDataId }, extractedQA, { upsert: true }));
      });
    });

  });
});

