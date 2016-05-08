module.exports = function(name){
  return {
    debug(){
      console.log.apply(null, arguments);
    },
    info(){
      console.info.apply(null, arguments);
    },
    warn(){
      console.warn.apply(null, arguments);
    },
    error(){
      console.log.apply(null, arguments);
    }
  }
};