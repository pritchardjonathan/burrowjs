"use strict";

module.exports = class MongoDbStub{
  constructor(sandbox){
    var self = this;
    self.collectionStub = {
      find: sandbox.stub(),
      findOne: sandbox.stub(),
      skip: sandbox.stub(),
      limit: sandbox.stub(),
      toArray: sandbox.stub(),
      insert: sandbox.stub(),
      update: sandbox.stub()
    };
    self.collectionStub.find.returns(self.collectionStub);
    self.collectionStub.findOne.returns(Promise.resolve([]));
    self.collectionStub.skip.returns(self.collectionStub);
    self.collectionStub.limit.returns(self.collectionStub);
    self.collectionStub.toArray.returns(Promise.resolve([]));
    self.collectionStub.insert.returns(Promise.resolve([]));
    self.collectionStub.update.returns(Promise.resolve([]));

    self.stub = sandbox.stub().returns({
      collection: sandbox.stub().returns(self.collectionStub)
    });
  }
};