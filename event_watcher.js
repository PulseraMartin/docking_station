var DynamoDBManager  = require('./uploader/dynamoDBManager');
var chokidar    = require('chokidar');
var timer       = require('timers')

var watcherAccelEvents = chokidar.watch('/Users/jorge/Documents/workspace/datos/data/accelerometer/events/' , {ignored: /[\/\\]\./});
var accelFilesEvents = [];

watcherAccelEvents
  .on('add', function(event){
    if (accelFilesEvents.length > 0){
      DynamoDBManager.uploadToDynamo('caidas', accelFilesEvents[0], "martinTest");
      console.log("Accel File Uploaded: " + accelFilesEvents[0]);
      accelFilesEvents.shift();
    }
    accelFilesEvents.push(event);
  });
