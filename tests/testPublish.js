#!/usr/bin/env node

var AWS = require("aws-sdk"); var amqp =
require('amqplib/callback_api'); //

AWS.config.loadFromPath("config.json");

function postTemp(q){
  setInterval(function() { getTempDynamo() }, 500);
  //publishTemp(q, "25 desde funcion");
}
function publishTemp(q, value){
  amqp.connect('amqp://martin:n0melase@54.233.152.245:5672',
function(err, conn){
    conn.createChannel(function(err, ch) {
      var msg = value;
      ch.assertQueue(q, {durable: false});
      // Note: on Node 6 Buffer.from(msg) should be used
      ch.sendToQueue(q, new Buffer(msg));
      console.log(" [x] Sent %s", msg);
    });
    //setTimeout(function() { conn.close(); process.exit(0) }, 250);
  });
}
function getTempDynamo(){
  AWS.config.update({
    region: "sa-east-1",
    endpoint: "dynamodb.sa-east-1.amazonaws.com"
  });
  var docClient = new AWS.DynamoDB.DocumentClient();
  //    var paramsQuery = {
  //     TableName : "martinTest",
  //     KeyConditionExpression: "sensor = :val",
  //     ExpressionAttributeValues: {
  //         ":val":"temperature",
  //     },
  //     ScanIndexForward: false,
  //     Limit: 1
  // };
  //
  // docClient.query(paramsQuery, function(err, data) {
  //     if (err) {
  //         console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
  //     } else {
  //         console.log("Query succeeded.");
  //         data.Items.forEach(function(item) {
  //             console.log(" -", item.timeStamp + ": " + item.data);
  //         });
  //     }
  //   });
  var params = {
    TableName: "martinTest",
    KeyConditionExpression: "sensor = :s",
    ExpressionAttributeValues: {
      ":s": "temperature"
    },
    scanIndexForward: false,
    Limit: 3
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("Query succeeded.");
      var data = data.Items[0];
      publishTemp('temperature', data.timeStamp + ": " + data.data);
      //   data.Items.forEach(function(item) {
      //   console.log(" -", item.timeStamp + ": " + item.data);
      //   publishTemp('temperature', item.data);
      //  });
    }
  });
};

getTempDynamo();
// postTemp('temperature');
