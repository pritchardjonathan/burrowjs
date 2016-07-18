function World(){
  this.defaultEmail = "test@test.com";
  this.defaultPassword = "SomeP@55";

  this.authenticatedUser = null;
  this.authenticationToken = null;

  this.users = [];

  this.qas = [];

  this.comments = [];

  this.votes = [];

  this.searchResults = [];

  this.getResults = [];

  this.response = null;
}
module.exports = World;