"use strict";

module.exports = class MongoDbStub{
  constructor(sandbox){
    var self = this;
    self.collectionStub = {
      find: sandbox.stub(),
      skip: sandbox.stub(),
      take: sandbox.stub(),
      toArray: sandbox.stub(),
      insert: sandbox.stub()
    };
    self.collectionStub.find.returns(self.collectionStub);
    self.collectionStub.skip.returns(self.collectionStub);
    self.collectionStub.take.returns(self.collectionStub);
    self.collectionStub.toArray.returns(Promise.resolve([]));

    self.stub = {
      collection: sandbox.stub().returns(self.collectionStub)
    };
  }
}