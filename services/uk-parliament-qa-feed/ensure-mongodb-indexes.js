"use strict";

module.exports = function(db){
  return db.collection("qnas").ensureIndex({
      "heading": "text",
      "answer.member.name": "text",
      "answer.answer.answeringBody.name": "text",
      "answer.text": "text",
      "question.member.name": "text",
      "question.text": "text",
      "answer.updated": 1
    }, { name: "search" });
};
