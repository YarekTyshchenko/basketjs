var dgram = require("dgram");
var debuf = require('./debuf');

var server = dgram.createSocket("udp4");

server.on("message", function (msg, rinfo) {
  var packets = debuf.decode(msg);
  console.log(packets);
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(25827);