"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  getUserHandler = require("../../../../services/api/handlers/get-user"),
  MongoDbStub = require("../../../stubs/MongoDbStub"),
  KoaContextStub = require("../../../stubs/KoaContextStub");

describe("api get user", function(){
  var sandbox,
    collectionStub,
    koaContextStub,
    sut;
  before(function(){
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

  });

  beforeEach(function () {
    // Create a sandbox for the test
    sandbox = sinon.sandbox.create();

    let mongoDbStub = new MongoDbStub(sandbox);
    collectionStub = mongoDbStub.collectionStub;

    koaContextStub = new KoaContextStub(sandbox).stub;

    sut = getUserHandler(mongoDbStub.stub());
  });

  afterEach(function () {
    // Restore all the things made through the sandbox
    sandbox.restore();
  });

  it("queries mongodb for users", function *(){
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.find.calledOnce, "Doesn't query mongodb");
  });
  it("queries mongodb for default page values when none are supplied", function *(){
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.find.calledOnce, "Doesn't query mongodb");
    assert.isTrue(collectionStub.skip.calledWith(0), "Doesn't query mongodb with the default skip() value");
    assert.isTrue(collectionStub.limit.calledWith(10), "Doesn't query mongodb with the default take() value");
  });
  it("queries mongodb for a page of users (skip/take)", function *(){
    koaContextStub.request.query = { skip: 10, take: 20 };
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.skip.calledWith(koaContextStub.request.query.skip), "Doesn't skip the correct number of results");
    assert.isTrue(collectionStub.limit.calledWith(koaContextStub.request.query.take), "Doesn't query mongodb for the correct number of results");
  });
  it("queries mongodb by search text", function *(){
    koaContextStub.request.query = { searchtext: "joe" };
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.find.calledWith(sinon.match({ $text: { $search: "joe" } })), "Doesn't perform a full-text search on the user mongodb collection ");
  });
  it("queries mongodb for the active user", function *(){
    koaContextStub.state = { user: { id: "507f191e810c19729de860ea", name: "Joe Bloggs", email: "test@test.com" } };
    koaContextStub.request.query.authenticated = "true";

    yield sut.apply(koaContextStub);
    assert.equal(collectionStub.find.firstCall.args[0]._id.toString(), "507f191e810c19729de860ea", "Doesn't query mongodb for authenticated users details");
  });
});