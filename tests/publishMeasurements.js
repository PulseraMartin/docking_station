#!/usr/bin/env node

var AWS = require("aws-sdk");
var amqp = require('amqplib/callback_api');

AWS.config.loadFromPath("config.json");
var measurements = new Array(2).fill(0);

var docClient = new AWS.DynamoDB.DocumentClient()
AWS.config.update({
  region: "sa-east-1",
  endpoint: "dynamodb.sa-east-1.amazonaws.com"
});

function postTemp(q){
  setInterval(function() { getTempDynamo(q) }, 500);
}

function getTempDynamo(q){

  var paramsQueryCaidas = {
      TableName : "martinTest",
      KeyConditionExpression: "sensor = :val",
      ExpressionAttributeValues: {
          ":val":q,
      },
      ScanIndexForward: false,
      Limit: 1
  };
  getTemperatureDynamo();
  getCaidasDynamo();
  var msg = '{"temperature":{"timestamp":' + measurements[1][0] + ', "promedio":' +  measurements[1][1] + '},' +
             '"fall":{"timestamp":' + measurements[0][0] +',"promedio":' + measurements[0][1] + '}}';
  console.log("TEST: " + msg);
  publishTemp('temperature', msg);
};


function getTemperatureDynamo(){

  var paramsQueryTemp = {
      TableName : "martinTest",
      KeyConditionExpression: "sensor = :val",
      ExpressionAttributeValues: {
          ":val":"temperature",
      },
      ScanIndexForward: false,
      Limit: 1
  };

  docClient.query(paramsQueryTemp, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log("Query succeeded.");
      var data = data.Items[0];
      var promedio = data.data.split('\t')[1];
      measurements[1] = [data.data.split('\t')[0], data.data.split('\t')[1]];
    }
  });
};


function getCaidasDynamo(){

  var paramsQueryCaidas = {
      TableName : "martinTest",
      KeyConditionExpression: "sensor = :val",
      ExpressionAttributeValues: {
          ":val":"caidas",
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
      measurements[0] = [data.data.split('\t')[0], data.data.split('\t')[1]];
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

postTemp('caidas');
