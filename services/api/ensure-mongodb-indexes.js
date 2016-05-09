"use strict";

module.exports = function(db){
  return db.collection("users").ensureIndex({ name: "text" });
};
