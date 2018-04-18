//var DynamoDBManager  = require('./uploader/dynamoDBManager');
var HTTPHandler = require('./uploader/HTTPhandler');
var chokidar    = require('chokidar');
var timer       = require('timers')
var fs          = require('fs')
var path        = require('path');

const USER_ID = "aafeab4b4bdddca3345b589d7d137818";

var raw_data_path     = path.join(__dirname, 'raw_data/');
var upload_data_path  = path.join(__dirname, 'raw_data/', 'uploads/');

var ppg_write_file   = path.join(__dirname, 'raw_data/', 'uploads/', 'ppg/test.txt'); // chokidar.watch(folder_path + 'temperature/'   , {ignored: /[\/\\]\./});
var eda_write_file   = path.join(__dirname, 'raw_data/', 'uploads/', 'eda/upload.txt'); // chokidar.watch(folder_path + 'eda/'     , {ignored: /[\/\\]\./});
var accel_write_file = path.join(__dirname, 'raw_data/', 'uploads/', 'accelerometer/upload.txt'); // chokidar.watch(folder_path + 'accelerometer/' , {ignored: /[\/\\]\./});
var gyro_write_file  = path.join(__dirname, 'raw_data/', 'uploads/', 'gyroscope/upload.txt'); // chokidar.watch(folder_path + 'gyroscope/'     , {ignored: /[\/\\]\./});
var temp_write_file  = path.join(__dirname, 'raw_data/', 'uploads/', 'temperature/upload.txt'); // chokidar.watch(folder_path + 'ppg/'     , {ignored: /[\/\\]\./}); var writeFileTemp   = fs.createWriteStream('/Users/jorge/Documents/javascipt_workspace/docking_station/raw_data/uploads/ppg/test.txt', {flags: 'w'});

var watcherTemp  = chokidar.watch(raw_data_path + 'temperature/' , {ignored: /[\/\\]\./});
var watcherAccel = chokidar.watch(raw_data_path + 'accelerometer/' , {ignored: /[\/\\]\./});
var watcherGyro  = chokidar.watch(raw_data_path + 'gyroscope/'     , {ignored: /[\/\\]\./});
var watcherPpg   = chokidar.watch(raw_data_path + 'ppg/'           , {ignored: /[\/\\]\./});
var watcherEda   = chokidar.watch(raw_data_path + 'eda/'           , {ignored: /[\/\\]\./});

var tempFiles  = [];
var accelFiles = [];
var gyroFiles  = [];
var ppgFiles   = [];
var edaFiles   = [];

// TEMP INCLUIDA EN EDA
watcherTemp
  .on('add', function(event){
    if (tempFiles.length > 0){
      // DynamoDBManager.uploadToDynamo('temperature', tempFiles[0], "martinTest"); // Para publicacion inmediata
      console.log("TEMP FILES > " + tempFiles[0]);
      createLoaderFile(USER_ID, "temperature", tempFiles[0], temp_write_file); //  file to read edaFiles[0], file to write in ../eda/upload.txt
      HTTPHandler.PostDataPackage(temp_write_file);                   //  file to read upload info in ../eda/upload.txt
      tempFiles.shift();
    }
    tempFiles.push(event);
  });

watcherEda
  .on('add', function(event){
    if (edaFiles.length > 0){
      // DynamoDBManager.uploadToDynamo('eda', edaFiles[0], "martinDemo");
      console.log("EDA FILES > " + edaFiles[0]);
      createLoaderFile(USER_ID, "eda", edaFiles[0], eda_write_file); //  file to read edaFiles[0], file to write in ../eda/upload.txt
      HTTPHandler.PostDataPackage(eda_write_file);                   //  file to read upload info in ../eda/upload.txt
      edaFiles.shift();
    }
    edaFiles.push(event);
  });

watcherPpg.on('add', function(event){
  if (ppgFiles.length > 0){
    console.log("PPG FILES > " + ppgFiles[0]);
    createLoaderFile(USER_ID, "ppg", ppgFiles[0], ppg_write_file); //  file to read edaFiles[0], file to write in ../ppg/test.txt
    HTTPHandler.PostDataPackage(ppg_write_file);                   //  file to read upload info in ../ppg/text.txt
    ppgFiles.shift();
  }
  ppgFiles.push(event);
});

watcherAccel.on('add', function(event){
  if (accelFiles.length > 0){
    console.log("Accel File Uploaded: " + accelFiles[0]);
    createLoaderFile(USER_ID, "accelerometer", accelFiles[0], accel_write_file); //  file to read edaFiles[0], file to write in ../ppg/test.txt
    HTTPHandler.PostDataPackage(accel_write_file);                   //  file to read upload info in ../ppg/text.txt
    accelFiles.shift();
  }
  accelFiles.push(event);
});

watcherGyro.on('add', function(event){
  if (gyroFiles.length > 0){
    createLoaderFile(USER_ID, "gyroscope", gyroFiles[0], gyro_write_file); //  file to read edaFiles[0], file to write in ../ppg/test.txt
    HTTPHandler.PostDataPackage(gyro_write_file);                   //  file to read upload info in ../ppg/text.txt
    gyroFiles.shift();
  }
  gyroFiles.push(event);
});

createLoaderFile = function(user_id, sensor, read_file, write_file){
  var information = fs.readFileSync(read_file, 'utf-8');
//  var timestamp = read_file.split("/").pop().split(".")[0]; // not working on windows because of the split commmand with backslashes...
  var timestamp = new Date().getTime(); // temporary solution to stamp a time to the files uploaded
  var data = {
    "id": user_id + "_" + timestamp,
    "user_id": user_id,
    "sensor": sensor,
    "package_timestamp":timestamp,
    "package_data":information
  };
  console.log("Data: " + JSON.stringify(data));
  console.log("write file: " + write_file);
  try{
    fs.writeFileSync(write_file, JSON.stringify(data));
    console.log('File sent to the cloud: ' + write_file) // success case, the file was saved
  } catch(err) {
    if (err) throw err;
  };
}
