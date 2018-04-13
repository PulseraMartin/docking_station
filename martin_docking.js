var fs        = require('fs');
var writable  = require('stream').Writable;
var util      = require('util');
var SensorTag = require('./lib/sensortag');
var events    = require('events');
var Constants = require('constants');

const MONITORING_MODE         = process.argv[2];   // Minimo 300 ms default 1 //
const TEMP_READING_PERIOD     = 1; //process.argv[3];   // Minimo 300 ms default 1 //
const MPU_READING_PERIOD      = 50; //process.argv[4];   // Minimo 100 ms Max 2550 ms default 1 //
const EDA_READING_PERIOD      = 10; //process.argv[5];   // default 1 //
const MAX3010_READING_PERIOD  = 50; //process.argv[6];   // Defecto 100 hrtz (10 ms) dafault 100 //
var mode = 1;
//var mode = 1;
//var time = Math.round(new Date().getTime()/1000.0);
var time = new Date().getTime();
// Data files
var Temp_path   = "/raw_data/temperature/";
var Accel_path  = "/raw_data/accelerometer/";
var Gyro_path   = "/raw_data/gyroscope/";
var Ppg_path    = "/raw_data/ppg/";
var Eda_path    = "/raw_data/eda/";

var writeFileTemp   = fs.createWriteStream(__dirname + Temp_path  + time + ".txt"); // fs.createWriteStream(__dirname + Temp_path  + "00.init_temp"  + time + ".txt");
var writeFileAccel  = fs.createWriteStream(__dirname + Accel_path + time + ".txt"); // fs.createWriteStream(__dirname + Accel_path + "00.init_accel" + time + ".txt");
var writeFileGyro   = fs.createWriteStream(__dirname + Gyro_path  + time + ".txt"); // fs.createWriteStream(__dirname + Gyro_path  + "00.init_gyro"  + time + ".txt");
var writeFilePpg    = fs.createWriteStream(__dirname + Ppg_path   + time + ".txt"); // fs.createWriteStream(__dirname + Ppg_path   + "00.init_ppg"   + time + ".txt");
var writeFileEda    = fs.createWriteStream(__dirname + Eda_path   + time + ".txt"); // fs.createWriteStream(__dirname + Eda_path   + "00.init_eda"   + time + ".txt");

// listen for sensortags:
///////////
// function runMonitoring(){
///////
SensorTag.discover(function(tag){
  // exit the program when the sensortag is disconected
  tag.on('disconect', function(){
    process.exit(0);
  })

  /////////////////////////////////////////////////////////////////////
  //// DEFINIR PERFILE DE USO DE LOS DISTINTOS SENSORES MAPA DE ESTADOS
  //// CONTEXTO 1: modo_safe => {  }, MODO SAFE SE PUEDE SACAR EL BRAZALETE
  function connectAndSetUpMe(){
    console.log('connectAndSetUp');
    tag.connectAndSetUp(activateSensors);
  }

  function activateSensors(){
    //var mode = 1; //MONITORING_MODE; // modo_safe_activo
    notifyDeviceID();
  //  console.log(mode);
  //  switch(+mode) {
  //  case 0:
  //    console.log('Modo Normal Activo: Temperatura, Acelerometro, Giroscopio');
  //      tag.setIrTemperaturePeriod(TEMP_READING_PERIOD, setIrTemperatureMe);
  //      tag.setMPU9250Period(MPU_READING_PERIOD, setMPU9250Me);
        // tag.setEDAPeriod(EDA_READING_PERIOD, setEdaMe);
  //      tag.setMax3010Period(MAX3010_READING_PERIOD, setPpgMe);
  //      tag.onSecondChange(fileAdmin);
  //      break;
  //    case 1:
  //      console.log('Modo Temperature debug: Temperature');
  //      tag.setIrTemperaturePeriod(TEMP_READING_PERIOD, setIrTemperatureMe);
  //      tag.onSecondChange(fileAdmin);
  //      break;
  //    case 2:
  //      console.log('Modo MPU debug: Accelerometer & Gyroscope');
  //      tag.setMPU9250Period(MPU_READING_PERIOD, setMPU9250Me);
  //      tag.onSecondChange(fileAdmin);
  //      break;
  //    case 3:
  //      console.log('Modo Eda debug: ElectroDermal Activity');
  //      tag.setEDAPeriod(EDA_READING_PERIOD, setEdaMe);
  //      tag.onSecondChange(fileAdmin);
  //      break;
  //    case 4:
  //      console.log('Modo PPG debug: Photoplethysmography');
  //      tag.setMax3010Period(MAX3010_READING_PERIOD, setPpgMe);
  //      tag.onSecondChange(fileAdmin);
  //      break;
  //  }
  }

  function fileAdmin(){
    console.log("EN MARTINGDOCKING");
    time = tag.getCurrentTimestamp();
    if (mode == 3) {
      console.log("EDA -- TEMP ^^");
      //writeFileEda    = fs.createWriteStream(__dirname + Eda_path   + time + ".txt");
      writeFileTemp   = fs.createWriteStream(__dirname + Temp_path  + time + ".txt");
    } else if (mode == 4) {
      console.log("Accel -- Gyro -- PPG ^^");
      writeFileAccel  = fs.createWriteStream(__dirname + Accel_path + time + ".txt");
      writeFileGyro   = fs.createWriteStream(__dirname + Gyro_path  + time + ".txt");
      writeFilePpg    = fs.createWriteStream(__dirname + Ppg_path   + time + ".txt");
    } else {
      console.log("ELSE ^^");
      writeFileTemp   = fs.createWriteStream(__dirname + Temp_path  + time + ".txt");
      writeFileAccel  = fs.createWriteStream(__dirname + Accel_path + time + ".txt");
      writeFileGyro   = fs.createWriteStream(__dirname + Gyro_path  + time + ".txt");
      writeFilePpg    = fs.createWriteStream(__dirname + Ppg_path   + time + ".txt");
      writeFileEda    = fs.createWriteStream(__dirname + Eda_path   + time + ".txt");
    };
    console.log("SALI MARTINGDOCKING");
  }

  function notifyDeviceID(){
    console.log("Getting Device ID ********");
    tag.readDeviceId(function(device_id){
      console.log("Device ID: " + device_id);
      if (device_id=="262") {
        mode = 3;
        console.log('Modo Bio monitor -> Eda debug: ElectroDermal Activity');
        tag.setEDAPeriod(EDA_READING_PERIOD, setEdaMe); // EDA includes temperature
        tag.onSecondChange(fileAdmin);
      } else if (device_id == "1795") {
        mode = 4;
        console.log('Modo BB monitor -> PPG debug: Photoplethysmography + Innertial');
        tag.setMax3010Period(MAX3010_READING_PERIOD, setPpgMe);
        tag.setMPU9250Period(MPU_READING_PERIOD, setMPU9250Me);
        tag.onSecondChange(fileAdmin);
      } else {
        mode = 1;
        tag.setEDAPeriod(EDA_READING_PERIOD, setEdaMe);
        tag.setMax3010Period(MAX3010_READING_PERIOD, setPpgMe);
        tag.setMPU9250Period(MPU_READING_PERIOD, setMPU9250Me);
        tag.onSecondChange(fileAdmin);
      }
    });
  }

  function setEdaMe(){
    console.log("Enable EdaMe");
    tag.enableEDA(notifyMeEda);
  }

  function setPpgMe(){
    console.log("Enable PPG" + '\n');
    tag.enableMax3010(notifyMePpg);
  }

  function setMPU9250Me(){
    console.log("Enable Mov" + '\n');
    tag.enableAccelerometer(notifyMeAccel);
    tag.enableGyroscope(notifyMeGyro);
  }

  function setIrTemperatureMe(){
    console.log("Enable TEMP" + '\n');
    tag.enableIrTemperature(notifyMeTemp);
  }

  function notifyMeTemp(){
    tag.notifyIrTemperature(function listenForTempReading(){
      tag.on('irTemperatureChange', function(objectTemp, ambientTemp){
        var time = new Date().getTime();
        console.log("T :" + time + '\t' + objectTemp.toFixed(1) + '\t' + ambientTemp.toFixed(1) + '\n');
        writeFileTemp.write(time + '\t' + objectTemp.toFixed(1) + '\t' + ambientTemp.toFixed(1) + '\n');
      });
    });
  }

  function notifyMeAccel(){
    tag.notifyAccelerometer(function(){
      tag.on('accelerometerChange', function(x, y, z){
        var time = new Date().getTime();
        console.log("A :" + time + '\t' + x.toFixed(5) + '\t' + y.toFixed(5) + '\t' + z.toFixed(5) + '\n');
        writeFileAccel.write(time + '\t' + x.toFixed(5)+ '\t' + y.toFixed(5)+ '\t' + z.toFixed(5)+ '\n');
      });
    });
  }

  function notifyMeGyro(){
    tag.notifyMPU9250(function(){
      tag.on('gyroscopeChange', function(xG, yG, zG){
        var time = new Date().getTime();
        console.log("G :" + time + '\t' + xG.toFixed(5) + '\t' + yG.toFixed(5) + '\t' + zG.toFixed(5) + '\n');
        writeFileGyro.write(time + '\t' + xG.toFixed(5)+ '\t' + yG.toFixed(5) + '\t' + zG.toFixed(5) + '\n');
      });
    });
  }

  function notifyMePpg(){
    tag.notifyMax3010(function listenForPpgReading(){
      tag.on('Max3010Change', function(a1, a2, a3, a4){
        var time = new Date().getTime();
        console.log("P : " + time + '\t' + a1 + '\t' + a2 + '\n');
        writeFilePpg.write(time + '\t' + a1 + '\t' + a2 + '\n');
      });
    });
  }

  function notifyMeEda(){
    console.log("en notifyMeEda");
    tag.notifyEDA(function listenForEdaReading(){
      tag.on('EdaChange', function(a1, a2, a3, a4){
        var time=new Date().getTime();
        console.log("Escribiendo EDA: " + time + '\t' + a1 + '\t' + a2 + '\n');
        console.log("Escribiendo TEMP: " + time + '\t' + a3.toFixed(2) + '\n');
        writeFileEda.write(time + '\t' + a1 + '\t' + a2 + '\n');
        writeFileTemp.write(time + '\t' + a3.toFixed(2) + '\n');
      });
    });
  }

  connectAndSetUpMe();
});


//////////
// };
