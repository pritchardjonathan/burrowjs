"use strict";

module.exports = function(db){
  return db.collection("qnas").ensureIndex({
    "parentId": 1,
    "parentType": 1
  });
};
