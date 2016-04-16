"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  getUserHandler = require("../../../../services/api/handlers/get-user");

describe("get user", function(){
  var sandbox = sinon.sandbox.create(),
    collectionStub,
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
    collectionStub = {
      find: sandbox.stub(),
      skip: sandbox.stub(),
      take: sandbox.stub(),
      toArray: sandbox.stub()
    };
    collectionStub.find.returns(collectionStub);
    collectionStub.skip.returns(collectionStub);
    collectionStub.take.returns(collectionStub);
    collectionStub.toArray.returns(Promise.resolve([]));

    let mongoDbStub = {
      collection: function(){ return collectionStub }
    };

    sut = getUserHandler(mongoDbStub);
  });

  afterEach(function () {
    // Restore all the things made through the sandbox
    sandbox.restore();
  });

  it("queries mongodb for users", function *(){
    let ctx = {};
    yield sut(ctx);
    assert.isTrue(collectionStub.find.calledOnce, "Doesn't query mongodb");
  });
  it("queries mongodb for default page values when none are supplied", function *(){
    let ctx = { };
    yield sut(ctx);
    assert.isTrue(collectionStub.find.calledOnce, "Doesn't query mongodb");
    assert.isTrue(collectionStub.skip.calledWith(0), "Doesn't query mongodb with the default skip() value");
    assert.isTrue(collectionStub.take.calledWith(10), "Doesn't query mongodb with the default take() value");
  });
  it("queries mongodb for a page of users (skip/take)", function *(){
    let ctx = { skip: 10, take: 20 };
    yield sut(ctx);
    assert.isTrue(collectionStub.skip.calledWith(ctx.skip), "Doesn't skip the correct number of results");
    assert.isTrue(collectionStub.take.calledWith(ctx.take), "Doesn't query mongodb for the correct number of results");
  });
  it("queries mongodb by search text", function *(){
    let ctx = { searchtext: "joe" };
    yield sut(ctx);
    assert.isTrue(collectionStub.find.calledWith(sinon.match({ $text: "joe" })), "Doesn't perform a full-text search on the user mongodb collection ");
  });
  it("queries mongodb for the active user", function *(){
    let ctx = { authenticated: true, state: { user: { id: "123ABC", name: "Joe Bloggs", email: "test@test.com" } } };
    yield sut(ctx);
    assert.isTrue(collectionStub.find.calledWith(sinon.match({ _id: "123ABC" })), "Doesn't query mongodb for authenticated users details");
  });
});