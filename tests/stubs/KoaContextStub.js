"use strict";

module.exports = class KoaContextStub{
  constructor(sandbox){
    var self = this;

    self.stub = {
      request: {
        body: null,
        state: null,
        query: {}
      },
      throw: sandbox.stub(),
      status: 404
    };
  }
}