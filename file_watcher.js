var DynamoDBManager  = require('./uploader/dynamoDBManager');
var HTTPHandler = require('./uploader/HTTPhandler');
var chokidar    = require('chokidar');
var timer       = require('timers')
var fs          = require('fs')

const USER_ID = "aafeab4b4bdddca3345b589d7d137818";
var raw_data_path = "/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/";

var folder_path = '/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/'; // MAC LOCAL
// var folder_path = '/home/pi/Desktop/docking_station_V_0.1/'; // RASPBERRY

var watcherTemp  = chokidar.watch(folder_path + 'temperature/'   , {ignored: /[\/\\]\./});
var watcherAccel = chokidar.watch(folder_path + 'accelerometer/' , {ignored: /[\/\\]\./});
var watcherGyro  = chokidar.watch(folder_path + 'gyroscope/'     , {ignored: /[\/\\]\./});
var watcherPpg   = chokidar.watch(folder_path + 'ppg/'     , {ignored: /[\/\\]\./});
var watcherEda   = chokidar.watch(folder_path + 'eda/'     , {ignored: /[\/\\]\./});

// var writeFileTemp   = fs.createWriteStream(folder_path + 'ppg/upload_data_package/test.txt');
var writeFileTemp   = fs.createWriteStream('/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/uploads/ppg/test.txt', {flags: 'w'});

var tempFiles  = [];
var accelFiles = [];
var gyroFiles  = [];
var ppgFiles   = [];
var edaFiles   = [];

// watcherEda
//    .on('add', function(event){
//      if (edaFiles.length > 0){
//        DynamoDBManager.uploadToDynamo('eda', edaFiles[0], "martinDemo");
//        console.log("EDA Listo!");
//        ppgFiles.shift();
//      }
//      edaFiles.push(event);
//    });

// usa "martinDemo" en Dynamo
watcherPpg
   .on('add', function(event){
     if (ppgFiles.length > 0){
       console.log("PPG FILES > " + ppgFiles[0]);
       createLoaderFile(USER_ID, "ppg", ppgFiles[0]);
       HTTPHandler.PostDataPackage();
       console.log("PPG Listo!");
       ppgFiles.shift();
     }
     ppgFiles.push(event);
   });

// watcherTemp
//   .on('add', function(event){
//     if (tempFiles.length > 0){
//       DynamoDBManager.uploadToDynamo('temperature', tempFiles[0], "martinTest"); // Para publicacion inmediata
//       console.log("Temp Listo!");
//       tempFiles.shift();
//     }
//     tempFiles.push(event);
//   });
//
// watcherAccel
//   .on('add', function(event){
//     if (accelFiles.length > 0){
//       DynamoDBManager.uploadToDynamo('accelerometer', accelFiles[0], "martinDemo");
//       console.log("Accel File Uploaded: " + accelFiles[0]);
//       accelFiles.shift();
//     }
//     accelFiles.push(event);
//   });
//
// watcherGyro
//   .on('add', function(event){
//     if (gyroFiles.length > 0){
//       DynamoDBManager.uploadToDynamo('gyroscope', gyroFiles[0], "martinDemo");
//       console.log("Gyro File Uploaded: " + gyroFiles[0]);
//       gyroFiles.shift();
//     }
//     gyroFiles.push(event);
//   });

  createLoaderFile = function(user_id, sensor, file_path){
    var information = fs.readFileSync(file_path, 'utf-8');
    var timestamp = file_path.split("/").pop().split(".")[0];
    console.log("Timestamp: " + timestamp);
    var data = {
      "id": user_id + "_" + timestamp,
      "user_id": user_id,
      "sensor": sensor,
      "package_timestamp":timestamp,
      "package_data":information
    };
    console.log("Data: " + data);
    writeFileTemp.write(JSON.stringify(data));
  }
