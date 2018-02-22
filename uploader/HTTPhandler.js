var qs        = require("querystring");
var http      = require("http");
var fs        = require("fs");
var serverConstants = require("./serverConstants");
var file_str  = '/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/ppg/upload_data_package/test.txt';

var endpoint      = 'http://localhost:3000/packageRecord',
    hostname      = "localhost",
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

var HTTPhandler = function () { };

HTTPhandler.PostDataPackage = function() {
  // console.log(serverConstants.getConstants["hostname"]);
  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
    });
  });

  fs.readFile(file_str, "utf8" , function (err, data) {
      // if (err) throw err;
      req.write(qs.stringify(JSON.parse(data)));
      console.log("READ data from file: " + data);
      req.end();
    });
  // req.end();
};

module.exports = HTTPhandler;
