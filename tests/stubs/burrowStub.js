"use strict";

module.exports = class RequestStub {
  constructor(sandbox){
    var self = this;

    self.connectPromise = Promise.resolve();

    self.stub = {
      connect: sandbox.stub().returns(self.connectPromise),
      publish: sandbox.stub(),
      subscribe: sandbox.stub(),
      rpc: {
        call: sandbox.stub(),
        listen: sandbox.stub()
      }
    };
  }
};