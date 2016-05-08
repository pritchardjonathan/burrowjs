"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  MongoDbStub = require("../../stubs/MongoDbStub"),
  KoaStub = require("../../stubs/KoaStub");

describe("api app", function(){
  var sandbox,
    mongoDbStub,
    koaStub,
    ensureIndexesStub,
    sut;
  before(function(){
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerAllowable("../../../services/api/app");
  });

  beforeEach(function () {
    // Create a sandbox for the test
    sandbox = sinon.sandbox.create();

    mongoDbStub = new MongoDbStub(sandbox);
    mockery.registerMock("promised-mongo", mongoDbStub.stub);

    koaStub = new KoaStub(sandbox);
    mockery.registerMock("koa", koaStub.stub);

    ensureIndexesStub = sandbox.stub();
    mockery.registerMock("../../common/ensure-mongodb-indexes", ensureIndexesStub);

    sut = require("../../../services/api/app");

  });

  afterEach(function () {
    // Restore all the things made through the sandbox
    sandbox.restore();
  });

  it("ensures indexes on startup", function *(){;
    assert.isTrue(ensureIndexesStub.calledOnce, "Doesn't ensure indexes");
  });

});