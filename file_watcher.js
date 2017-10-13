var DynamoDBManager  = require('./uploader/dynamoDBManager');
var chokidar    = require('chokidar');
var timer       = require('timers')

var watcherTemp  = chokidar.watch('/home/pi/Desktop/docking_station_V_0.1/raw_data/temperature/'   , {ignored: /[\/\\]\./});
var watcherAccel = chokidar.watch('/home/pi/Desktop/docking_station_V_0.1/raw_data/accelerometer/' , {ignored: /[\/\\]\./});
var watcherGyro  = chokidar.watch('/home/pi/Desktop/docking_station_V_0.1/raw_data/gyroscope/'     , {ignored: /[\/\\]\./});
var watcherPpg   = chokidar.watch('/home/pi/Desktop/docking_station_V_0.1/raw_data/ppg/'     , {ignored: /[\/\\]\./});
var watcherEda   = chokidar.watch('/home/pi/Desktop/docking_station_V_0.1/raw_data/eda/'     , {ignored: /[\/\\]\./});


var tempFiles  = [];
var accelFiles = [];
var gyroFiles  = [];
var ppgFiles   = [];
var edaFiles   = [];

watcherEda
   .on('add', function(event){
     if (edaFiles.length > 0){
       DynamoDBManager.uploadToDynamo('eda', edaFiles[0], "martinDemo");
       console.log("EDA Listo!");
       ppgFiles.shift();
     }
     edaFiles.push(event);
   });

watcherPpg
   .on('add', function(event){
     if (ppgFiles.length > 0){
       DynamoDBManager.uploadToDynamo('ppg', ppgFiles[0], "martinDemo");
       console.log("Temp Listo!");
       ppgFiles.shift();
     }
     ppgFiles.push(event);
   });

watcherTemp
  .on('add', function(event){
    if (tempFiles.length > 0){
      DynamoDBManager.uploadToDynamo('temperature', tempFiles[0], "martinTest"); // Para publicacion inmediata
      console.log("Temp Listo!");
      tempFiles.shift();
    }
    tempFiles.push(event);
  });

watcherAccel
  .on('add', function(event){
    if (accelFiles.length > 0){
      DynamoDBManager.uploadToDynamo('accelerometer', accelFiles[0], "martinDemo");
      console.log("Accel File Uploaded: " + accelFiles[0]);
      accelFiles.shift();
    }
    accelFiles.push(event);
  });

watcherGyro
  .on('add', function(event){
    if (gyroFiles.length > 0){
      DynamoDBManager.uploadToDynamo('gyroscope', gyroFiles[0], "martinDemo");
      console.log("Gyro File Uploaded: " + gyroFiles[0]);
      gyroFiles.shift();
    }
    gyroFiles.push(event);
  });
