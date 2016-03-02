"use strict";

// Builtin Modules
const
  http = require("http"),
  https = require("https"),
  fs = require("fs");

// External Modules
const
  jsdom = require("jsdom");

// Builtin Classes
const EventEmitter = require("events");

function SdomServerRequestListener(request, response) {

  this.emit("request", request, response);

  var contentType = response.getHeader("content-type");
}

class SdomServer extends EventEmitter {

  constructor(requestListener, options) {
    this._server = (options.secure ? https : https)
      .createServer(SdomServerRequestListener.bind(this));

    if(requestListener) {
      this.addEventListener("request", requestListener);
    }
  }

  listen(port) {
    return this._server.listen(port);
  }

};

module.exports = SdomServer;
