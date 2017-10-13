#!/usr/bin/env node

var AWS = require("aws-sdk");
var amqp = require('amqplib/callback_api');

AWS.config.loadFromPath("config.json");

var docClient = new AWS.DynamoDB.DocumentClient()

function postTemp(q){
  setInterval(function() { getTempDynamo(q) }, 500);
}

function getTempDynamo(q){
  AWS.config.update({
    region: "sa-east-1",
    endpoint: "dynamodb.sa-east-1.amazonaws.com"
  });

  var paramsQueryCaidas = {
      TableName : "martinTest",
      KeyConditionExpression: "sensor = :val",
      ExpressionAttributeValues: {
          ":val":q,
      },
      ScanIndexForward: false,
      Limit: 1
  };

  docClient.query(paramsQueryCaidas, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("Query succeeded.");
      var data = data.Items[0];
      var promedio = data.data.split('\t')[1];
      var msg = '{"temperature":{"timestamp":' + data.timeStamp.split('.')[0] + ', "promedio":' +  promedio + '},' +
                 '"fall":{"timestamp":' + 123456 +',"promedio":' + 1 + '}}';
      publishTemp('temperature', msg);
    }
  });
};

function publishTemp(q, value){
  amqp.connect('amqp://test:test@54.233.152.245:5672/martinMQT',
  function(err, conn){
    conn.createChannel(function(err, ch) {
      var msg = value;
      ch.assertQueue(q, {durable: false});
      ch.sendToQueue(q, new Buffer(msg));
      console.log(" [x] Sent %s", msg);
    });
  });
}

postTemp('temperature');
