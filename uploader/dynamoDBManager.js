// Load the AWS SDK for Node.js
var i = console.log(Math.round(new Date().getTime()/1000.0).toFixed(1));
var AWS   = require('aws-sdk');
var path  = require('path');
var fs    = require('fs');

// Load credentials and set region from JSON file
AWS.config.loadFromPath("/Users/jorge/Documents/javascipt_workspace/docking_station/uploader/config.json");
AWS.config.update({endpoint: "https://dynamodb.sa-east-1.amazonaws.com"});

var DynamoDBManager = function () { };

DynamoDBManager.uploadToDynamo = function (sensor, file_path, table) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var information = fs.readFileSync(file_path, 'utf-8');
  console.log("INFORMACION: " + information);
  var params = {
      TableName:table,
      Item:{
        "sensor":sensor,
        "timeStamp":file_path.split("/").pop(),
        "data":information
        }
  };
  docClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
      }
  });
  console.log(Math.round(new Date().getTime()/1000.0) - i);
};

DynamoDBManager.getItemFromDynamo = function (sensor, timestamp, bucket) {

}


module.exports = DynamoDBManager;
