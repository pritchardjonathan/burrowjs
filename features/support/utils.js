"use strict";

exports.generateInteger = function(min, max){
  return Math.floor(Math.random() * (max - min)) + min;
};
exports.generateDateString = function(min, max){
  return new Date(exports.generateInteger(min, max)).toISOString();
};