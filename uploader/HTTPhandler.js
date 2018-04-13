var serverConstants = require("./serverConstants");
var qs              = require("querystring");
var http            = require("http");
var fs              = require("fs");
var path            = require('path');
var upload_data_path= path.join(__dirname, '/../raw_data/uploads/');

var endpoint      = 'http://localhost:3000/packageRecord',
    hostname      = "18.231.118.122",    // production "localhost", // local test
    port          = "3000",
    create_path   = "/packageRecord",
    content_type  = "application/x-www-form-urlencoded",
    cache_control = "no-cache";

var options = { "method": "POST", "hostname": hostname, "port": port, "path": create_path,
  "headers": {
    "content-type": content_type,
    "cache-control": cache_control
  }
};

var HTTPhandler = function () { }

HTTPhandler.PostDataPackage = function(post_data) {
  var req = http.request(options, function (res) {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
    });
  });

//  fs.readFileSync(post_data, "utf8" , function (err, data) {
//      if (err) throw err;
//      sendRequest(data);
//      req.write(qs.stringify(JSON.parse(data)));
//      console.log("READ data from file: " + data);
//      req.end();
//    });

//  function sendRequest(string){
//    console.log("READ data from file: " + string);
//    req.write(qs.stringify(JSON.parse(string)));
//    req.end();
//  }

  fs.readFile(post_data, "utf8" , function (err, data) {
      if (err) throw err;
      req.write(qs.stringify(JSON.parse(data)));
      console.log("READ data from file: " + data);
      req.end();
    });
};

module.exports = HTTPhandler;
