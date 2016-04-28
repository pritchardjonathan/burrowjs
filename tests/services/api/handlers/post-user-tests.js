"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  getUserHandler = require("../../../../services/api/handlers/post-user"),
  MongoDbStub = require("../../../stubs/MongoDbStub"),
  bcrypt = require("bcrypt");

describe("post user", function(){
  var sandbox,
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

    let mongoDbStub = new MongoDbStub(sandbox);
    collectionStub = mongoDbStub.collectionStub;

    sut = getUserHandler(mongoDbStub.stub);
  });

  afterEach(function () {
    // Restore all the things made through the sandbox
    sandbox.restore();
  });

  it("checks that the email isn't already taken", function *(){
    let ctx = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    yield sut(ctx);
    assert.isTrue(collectionStub.find.calledOnce, "Doesn't query mongodb")
    assert.isTrue(collectionStub.find.calledWith({ email: ctx.email }), "Doesn't query mongodb for existing email");
  });

  it("inserts the user into the 'users' mongodb collection", function *(){
    let ctx = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    yield sut(ctx);
    assert.isTrue(collectionStub.insert.calledOnce, "User not saved to mongodb")
    assert.isTrue(collectionStub.insert.calledWith(sinon.match({ name: ctx.name, email: ctx.email })), "Password not hashed");
  });

  it("hashes the users password", function *() {
    let ctx = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    yield sut(ctx);
    let expected = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    assert.isTrue(collectionStub.insert.calledOnce, "User not saved to mongodb")
    assert.isUndefined(collectionStub.insert.firstCall.args[0].password, "Plain password field found");
    assert.isDefined(collectionStub.insert.firstCall.args[0].passwordHash, "Password hash not found");
    assert.notEqual(collectionStub.insert.firstCall.args[0].passwordHash, ctx.password, "Password not hashed");
  });




});