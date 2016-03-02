# Node.js SDOM Interface

### Install
```
npm install sdom
```

### Usage
```JavaScript
const sdom = require("sdom");
const fs = require("fs");

var server = sdom.createServer(function(request, response) {
  // Serve files as normal.

  // SDOM will handle parsing data with the Content-Type
  // 'application/html' or 'text/html' and run the server
  // scripts.
});

server.listen(80);
```
