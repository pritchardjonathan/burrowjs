module.exports = function(){
  this.After("@createsUser", function(scenario, callback){
    // TODO: Remove user
    console.log("TODO: remove user...");
    callback();
  });
};