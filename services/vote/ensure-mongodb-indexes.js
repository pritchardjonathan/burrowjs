"use strict";

module.exports = function(db){
  return db.collection("votes").ensureIndex({
    "parentId": 1,
    "parentType": 1
  });
};
