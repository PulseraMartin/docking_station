var DynamoDBManager  = require('./uploader/dynamoDBManager');
var HTTPHandler = require('./uploader/HTTPhandler');
var chokidar    = require('chokidar');
var timer       = require('timers');
var fs          = require('fs');
var path        = require('path');

const USER_ID = "aafeab4b4bdddca3345b589d7d137818";

// var folder_path = '/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/'; // MAC LOCAL
// var folder_path = '/home/pi/Desktop/docking_station_V_0.1/'; // RASPBERRY
var raw_data_path     = path.join(__dirname, 'raw_data/');
var upload_data_path  = path.join(__dirname, 'raw_data/', 'uploads/');

var ppg_write_file  = path.join(__dirname, 'raw_data/', 'uploads/', 'ppg/test.txt');
var eda_write_file  = path.join(__dirname, 'raw_data/', 'uploads/', 'eda/upload.txt');
// var uploadFile   = fs.createWriteStream(upload_data_path + 'ppg/test.txt', {flags: 'w'});

var watcherTemp  = chokidar.watch(raw_data_path + 'temperature/'   , {ignored: /[\/\\]\./});
var watcherAccel = chokidar.watch(raw_data_path + 'accelerometer/' , {ignored: /[\/\\]\./});
var watcherGyro  = chokidar.watch(raw_data_path + 'gyroscope/'     , {ignored: /[\/\\]\./});
var watcherPpg   = chokidar.watch(raw_data_path + 'ppg/'           , {ignored: /[\/\\]\./});
var watcherEda   = chokidar.watch(raw_data_path + 'eda/'           , {ignored: /[\/\\]\./});

var tempFiles  = [];
var accelFiles = [];
var gyroFiles  = [];
var ppgFiles   = [];
var edaFiles   = [];

watcherEda
   .on('add', function(event){
     if (edaFiles.length > 0){
       // DynamoDBManager.uploadToDynamo('eda', edaFiles[0], "martinDemo");
       console.log("PPG FILES > " + edaFiles[0]);
       createLoaderFile(USER_ID, "eda", edaFiles[0], eda_write_file); //  file to read edaFiles[0], file to write in ../eda/upload.txt
       HTTPHandler.PostDataPackage(eda_write_file);                   //  file to read upload info in ../eda/upload.txt
       console.log("EDA Listo!");
       ppgFiles.shift();
     }
     edaFiles.push(event);
   });

// usa "martinDemo" en Dynamo
watcherPpg
   .on('add', function(event){
     if (ppgFiles.length > 0){
       console.log("PPG FILES > " + ppgFiles[0]);
       // createLoaderFile(USER_ID, "ppg", ppgFiles[0]);
       createLoaderFile(USER_ID, "ppg", ppgFiles[0], ppg_write_file); //  file to read edaFiles[0], file to write in ../ppg/test.txt
       HTTPHandler.PostDataPackage(ppg_write_file);                   //  file to read upload info in ../ppg/text.txt
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

createLoaderFile = function(user_id, sensor, read_file, write_file){
  var information = fs.readFileSync(read_file, 'utf-8');
  var timestamp = read_file.split("/").pop().split(".")[0];
  console.log("Timestamp: " + timestamp);
  var data = {
    "id": user_id + "_" + timestamp,
    "user_id": user_id,
    "sensor": sensor,
    "package_timestamp":timestamp,
    "package_data":information
  };
  console.log("Data: " + data);
  // fs.writeFile(upload_data_path + 'ppg/test.txt', JSON.stringify(data), (err) => {
  fs.writeFile(write_file, JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('Lyric saved!') // success case, the file was saved
  });
}

  // createLoaderFile = function(user_id, sensor, file_path){
  //   var information = fs.readFileSync(file_path, 'utf-8');
  //   var timestamp = file_path.split("/").pop().split(".")[0];
  //   console.log("Timestamp: " + timestamp);
  //   var data = {
  //     "id": user_id + "_" + timestamp,
  //     "user_id": user_id,
  //     "sensor": sensor,
  //     "package_timestamp":timestamp,
  //     "package_data":information
  //   };
  //   console.log("Data: " + data);
  //   // uploadFile is a fs.createWriteStream, the write method writes in chunks. Proper to write big files
  //   // uploadFile.write(JSON.stringify(data));
  //   // uploadFile.on('finish', () => {
  //   //   console.log('wrote all data to file');
  //   // });
  //   // uploadFile.end();
  //   // fs.writeFile keeps the whole file in memory
  //   fs.writeFile(upload_data_path + 'ppg/test.txt', JSON.stringify(data), (err) => {
  //     if (err) throw err;
  //     // success case, the file was saved
  //     console.log('Lyric saved!')
  //   });
  // }
