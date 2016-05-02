"use strict";

module.exports = class KoaStub {
  constructor(sandbox){
    var self = this;

    self.koaAppStub = {
      use: sandbox.stub(),
      listen: sandbox.stub()
    };

    self.stub = function(){
      return self.koaAppStub;
    };
  }
};