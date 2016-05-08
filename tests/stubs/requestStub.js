"use strict";

module.exports = class RequestStub {
  constructor(sandbox){
    var self = this;

    self.stub = sandbox.stub().returns(Promise.resolve());
  }
};