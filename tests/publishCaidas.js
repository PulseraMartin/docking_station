#!/usr/bin/env node

var AWS = require("aws-sdk");
var amqp = require('amqplib/callback_api');

AWS.config.update({
  region: "sa-east-1",
  endpoint: "dynamodb.sa-east-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient()

function postTemp(q){
  setInterval(function() { getTempDynamo() }, 500);
}

function publishTemp(q, value){
  amqp.connect('amqp://martin:n0melase@54.233.152.245:5672',
  function(err, conn){
    conn.createChannel(function(err, ch) {
      var msg = value;
      ch.assertQueue(q, {durable: false});
      ch.sendToQueue(q, new Buffer(msg));
      console.log(" [x] Sent %s", msg);
    });
  });
}

function getTempDynamo(){
  var paramsQuery = {
      TableName : "martinDemo",
      KeyConditionExpression: "sensor = :val",
      ExpressionAttributeValues: {
          ":val":"caidas",
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
              publishTemp('caidas',
              '{"Evento":{"timeStamp":' + item.data.split('\t')[1] +
                             ',"caida":' + item.data.split('\t')[2] + '}}');
          });
      }
    });
  };

  postTemp('caidas');
