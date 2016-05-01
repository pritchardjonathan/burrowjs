"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  getUserHandler = require("../../../../services/api/handlers/get-user"),
  MongoDbStub = require("../../../stubs/MongoDbStub"),
  KoaContextStub = require("../../../stubs/KoaContextStub");

describe("get user", function(){
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

    sut = getUserHandler(mongoDbStub.stub);
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
    assert.isTrue(collectionStub.take.calledWith(10), "Doesn't query mongodb with the default take() value");
  });
  it("queries mongodb for a page of users (skip/take)", function *(){
    koaContextStub.request.body = { skip: 10, take: 20 };
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.skip.calledWith(ctx.skip), "Doesn't skip the correct number of results");
    assert.isTrue(collectionStub.take.calledWith(ctx.take), "Doesn't query mongodb for the correct number of results");
  });
  it("queries mongodb by search text", function *(){
    koaContextStub.request.body = { searchtext: "joe" };
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.find.calledWith(sinon.match({ $text: "joe" })), "Doesn't perform a full-text search on the user mongodb collection ");
  });
  it("queries mongodb for the active user", function *(){
    koaContextStub.request.state = { user: { id: "123ABC", name: "Joe Bloggs", email: "test@test.com" } };
    koaContextStub.request.authenticated = true;

    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.find.calledWith(sinon.match({ _id: "123ABC" })), "Doesn't query mongodb for authenticated users details");
  });
});