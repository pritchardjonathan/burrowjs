var myStepDefinitionsWrapper = function () {

  this.Then(/^the response status code should be (\d+)$/, function (arg1, callback) {
    callback.pending();
  });

  this.Then(/^the reason phrase should be "([^"]*)"$/, function (arg1, callback) {
    callback.pending();
  });
};
module.exports = myStepDefinitionsWrapper;