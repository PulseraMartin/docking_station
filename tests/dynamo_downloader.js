// Get item from DynamoDB
var i = Math.round(new Date().getTime()).toFixed(1);
var AWS = require("aws-sdk");
var path = require('path');
var fs = require('fs');

AWS.config.loadFromPath("config.json");

AWS.config.update({
  region: "sa-east-1",
  endpoint: "dynamodb.sa-east-1.amazonaws.com"
});

// var root_path = "/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/testing_data/";
var root_path = "/Users/jorge/Documents/workspace/raw_data/";
var accel_root = "accelerometer/";
var gyro_root = "gyroscope/";

var docClient = new AWS.DynamoDB.DocumentClient();

function getLatestRecord(){
  setInterval(
    function(){
      getLastRecord("accelerometer", root_path + accel_root);
      getLastRecord("gyroscope", root_path + gyro_root);
    },
    900);
};

function getLastRecord(sensor, path){
  var tableName = "martinDemo";
  var KeyCondExp = sensor + " =: val";
  var paramsQuery = {
      TableName : tableName,
      KeyConditionExpression: "sensor = :val",
      ExpressionAttributeValues: {
          ":val":sensor,
      },
      ScanIndexForward: false,
      Limit: 1
  };

  docClient.query(paramsQuery, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("Query succeeded.");
      data.Items.forEach(function(item) {
        console.log(" -", item.timeStamp + ": " + item.data);
        var info = item.data.split('\n');
        var file = fs.createWriteStream(path + item.timeStamp);
        file.on('error', function(err) { /* error handling */ });
        info.forEach(function(v) { file.write(v); });
        file.end();
      })
    };
  });
};

getLatestRecord();
