"use strict";

const
  http = require("http"),
  fs = require("fs");

const SdomServer = require("classes/SdomServer.js");

const defaultOptions = {
  secure: false
};

function copyCombineObject(base) {
  var obj = {};

  for(let propertyName in base) {
    obj[propertyName] = base[propertyName];
    for(let i=1; arguments.length > i; i++) {
      let additional = arguments[i];
      if(additional.hasOwnProperty(propertyName)) {
        obj[propertyName] = additional[propertyName];
        break;
      }
    }
  }

  return obj;
}

exports.createServer = function() {
  var requestListener = null, options;
  if(typeof arguments[0] === "function") {
    requestListener = arguments[0];
  } else
  if(typeof arguments[0] === "object") {
    options = copyCombineObject(defaultOptions, arguments[0]);
    if(typeof arguments[1] === "function") {
      requestListener = arguments[1];
    }
  } else {
    throw Error("sdom.createServer - invalid arguments.");
  }


  return new SdomServer(options, requestListener);
};
