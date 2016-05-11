"use strict";

module.exports = class RequestStub {
  constructor(sandbox){
    var self = this;

    self.stub = {
      connect: sandbox.stub().returns(Promise.resolve()),
      publish: sandbox.stub(),
      subscribe: sandbox.stub(),
      rpc: {
        call: sandbox.stub(),
        listen: sandbox.stub()
      }
    };
  }
};