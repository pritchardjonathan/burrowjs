function World(){
  this.defaultEmail = "test@test.com";
  this.defaultPassword = "SomeP@55";

  this.authenticatedUser = null;
  this.authenticationToken = null;
  this.users = [];
  this.searchResults = [];


  this.response = null;
}
module.exports = World;