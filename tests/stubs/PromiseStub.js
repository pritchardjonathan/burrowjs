"use strict";

module.exports = class PromiseStub {
  constructor(sandbox){
    var self = this;

    self.stub = {
      then: sinon.stub
    }
  }
};