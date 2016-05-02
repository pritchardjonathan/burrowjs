"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  getUserHandler = require("../../../../services/api/handlers/create-user"),
  MongoDbStub = require("../../../stubs/MongoDbStub"),
  KoaContextStub = require("../../../stubs/KoaContextStub"),
  bcrypt = require("bcrypt");

describe("create user", function(){
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

  it("checks that the email isn't already taken", function *(){
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    collectionStub.insert.returns({
      _id: "2039ufs0df09sudj2io3jrf",
      name: koaContextStub.request.body.name,
      email: koaContextStub.request.body.email,
      password: koaContextStub.request.body.password
    });
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.find.calledOnce, "Doesn't query mongodb");
    assert.isTrue(collectionStub.find.calledWith({ email: koaContextStub.request.body.email }), "Doesn't query mongodb for existing email");
  });

  it("inserts the user into the 'users' mongodb collection", function *(){
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    collectionStub.insert.returns({
      _id: "2039ufs0df09sudj2io3jrf",
      name: koaContextStub.request.body.name,
      email: koaContextStub.request.body.email,
      password: koaContextStub.request.body.password
    });
    yield sut.apply(koaContextStub);
    assert.isTrue(collectionStub.insert.calledOnce, "User not saved to mongodb")
    assert.isTrue(collectionStub.insert.calledWith(sinon.match({ name: koaContextStub.request.body.name, email: koaContextStub.request.body.email })), "Password not hashed");
  });

  it("makes sure the password is long enough and contains at least 8 characters", function *(){
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5mlpw"
    };
    yield sut.apply(koaContextStub);
    assert.isTrue(koaContextStub.throw.calledWith("Invalid password", 400));
  });

  it("makes sure the password contains at least one number", function *(){
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "simplepassword"
    };
    yield sut.apply(koaContextStub);
    assert.isTrue(koaContextStub.throw.calledWith("Invalid password", 400));
  });

  it("makes sure a password is supplied", function *(){
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      email: "test@test.com"
    };
    yield sut.apply(koaContextStub);
    assert.isTrue(koaContextStub.throw.calledWith("Invalid password", 400));
  });

  it("makes sure an email is supplied", function *(){
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      password: "5omep455"
    };
    yield sut.apply(koaContextStub);
    assert.isTrue(koaContextStub.throw.calledWith("An email is required", 400));
  });

  it("hashes the users password", function *() {
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    collectionStub.insert.returns({
      _id: "2039ufs0df09sudj2io3jrf",
      name: koaContextStub.request.body.name,
      email: koaContextStub.request.body.email,
      password: koaContextStub.request.body.password
    });
    yield sut.apply(koaContextStub);
    let expected = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    assert.isTrue(collectionStub.insert.calledOnce, "User not saved to mongodb")
    assert.isUndefined(collectionStub.insert.firstCall.args[0].password, "Plain password field found");
    assert.isDefined(collectionStub.insert.firstCall.args[0].passwordHash, "Password hash not found");
    assert.notEqual(collectionStub.insert.firstCall.args[0].passwordHash, koaContextStub.request.body.password, "Password not hashed");
  });

  it("returns the created users data excluding password", function *(){
    koaContextStub.request.body = {
      name: "Joe Bloggs",
      email: "test@test.com",
      password: "5omep455"
    };
    collectionStub.insert.returns({
      _id: "2039ufs0df09sudj2io3jrf",
      name: koaContextStub.request.body.name,
      email: koaContextStub.request.body.email,
      password: koaContextStub.request.body.password
    });
    yield sut.apply(koaContextStub);
    assert.isUndefined(koaContextStub.body.password);
  });


});