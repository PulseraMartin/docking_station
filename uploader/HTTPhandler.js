var qs        = require("querystring");
var http      = require("http");
var fs        = require("fs");
var serverConstants = require("./serverConstants");
var path        = require('path');
// var file_str  = '/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/uploads/ppg/test.txt';
// var upload_data_path  = path.join(__dirname, '..','raw_data/', 'uploads/', 'ppg/test.txt');
// var read_file  = path.join(__dirname, '..','raw_data/', 'uploads/', 'ppg/test.txt');

var endpoint      = 'http://localhost:3000/packageRecord',
    // hostname      = "localhost", // local test
    hostname      = "18.231.118.122",    // production
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

var HTTPhandler = function() { }

HTTPhandler.PostDataPackage = function(read_file) {
  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
    });
  });

  fs.readFile(read_file, "utf8" , function (err, data) {
      // if (err) throw err;
      req.write(qs.stringify(JSON.parse(data)));
      console.log("READ data from file: " + data);
      req.end();
    });
  // req.end();
};

module.exports = HTTPhandler;
