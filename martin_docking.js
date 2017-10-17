var fs        = require('fs');
var writable  = require('stream').Writable;
var util      = require('util');
var SensorTag = require('./lib/sensortag');
var events    = require('events');
var Constants = require('constants');

const TEMP_READING_PERIOD     = process.argv[2];   // Minimo 300 ms default 1 //
const MPU_READING_PERIOD      = process.argv[3];   // Minimo 100 ms Max 2550 ms default 1 //
const MAX3010_READING_PERIOD  = process.argv[4];   // Defecto 100 hrtz (10 ms) dafault 100 //
const EDA_READING_PERIOD      = process.argv[5];   // default 1 //
//var time = Math.round(new Date().getTime()/1000.0);
var time = new Date().getTime();
// Data files
var Temp_path   = "/raw_data/temperature/";
var Accel_path  = "/raw_data/accelerometer/";
var Gyro_path   = "/raw_data/gyroscope/";
var Ppg_path    = "/raw_data/ppg/";
var Eda_path    = "/raw_data/eda/";

var writeFileTemp   = fs.createWriteStream(__dirname + Temp_path  + "00.init_temp"  + time + ".txt");
var writeFileAccel  = fs.createWriteStream(__dirname + Accel_path + "00.init_accel" + time + ".txt");
var writeFileGyro   = fs.createWriteStream(__dirname + Gyro_path  + "00.init_gyro"  + time + ".txt");
var writeFilePpg    = fs.createWriteStream(__dirname + Ppg_path   + "00.init_ppg"   + time + ".txt");
var writeFileEda    = fs.createWriteStream(__dirname + Eda_path   + "00.init_eda"   + time + ".txt");
// listen for sensortags:
SensorTag.discover(function(tag){
  // exit the program when the sensortag is disconected
  tag.on('disconect', function(){
    process.exit(0);
  })

  /////////////////////////////////////////////////////////////////////
  //// DEFINIR PERFILE DE USO DE LOS DISTINTOS SENSORES MAPA DE ESTADOS
  //// CONTEXTO 1: modo_safe => {  }, MODO SAFE SE PUEDE SACAR EL BRAZALETE
  //// CONTEXTO 2: modo_unsafe => { MIC }
  //// CONTEXTO 3: modo_activo => { ACCEL, GYRO, TEMP }
  //// CONTEXTO 4: modo_durmiendo => { ACCEL, GYRO, MAXIM }
  function connectAndSetUpMe(){
    console.log('connectAndSetUp');
    mode = "unsafe-active";
    tag.connectAndSetUp(activateSensors);
  }

  function activateSensors(){
    mode = 0; // modo_safe_activo
    switch(mode) {
      case 0:
        console.log('Modo Safe Activo: Temperatura, Acelerometro, Giroscopio');
        console.log('Constants: ' + Constants.eda);
        tag.setEDAPeriod(EDA_READING_PERIOD, setEdaMe);
        //tag.setMax3010Period(MAX3010_READING_PERIOD, setPpgMe);
        //tag.setIrTemperaturePeriodNew(TEMP_READING_PERIOD, setIrTemperatureMe);
        //tag.setMPU9250Period(MPU_READING_PERIOD, setMPU9250Me);
        //tag.setMPU9250PeriodNew(MPU_READING_PERIOD, setMPU9250Me);
        //tag.onSecondChange(fileAdmin);
        break;
    }
  }

  function fileAdmin(){
    time = tag.getCurrentTimestamp();
    writeFileTemp   = fs.createWriteStream(__dirname + Temp_path  + time + ".txt");
    writeFileAccel  = fs.createWriteStream(__dirname + Accel_path + time + ".txt");
    writeFileGyro   = fs.createWriteStream(__dirname + Gyro_path  + time + ".txt");
    writeFilePpg    = fs.createWriteStream(__dirname + Ppg_path   + time + ".txt");
    writeFileEda    = fs.createWriteStream(__dirname + Eda_path   + time + ".txt");
  }

  function setEdaMe(){
    console.log("en setEdaMe");
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
        console.log("A :" + time + '\t' + x.toFixed(4) + '\t' + y.toFixed(4) + '\t' + z.toFixed(4) + '\n');
        writeFileAccel.write(time + '\t' + x.toFixed(5)+ '\t' + y.toFixed(5)+ '\t' + z.toFixed(5)+ '\n');
      });
    });
  }

  function notifyMeGyro(){
    tag.notifyMPU9250(function(){
      tag.on('gyroscopeChange', function(xG, yG, zG){
        var time = new Date().getTime();
        //  console.log("G :" + time + '\t' + xG.toFixed(1) + '\t' + yG.toFixed(1) + '\t' + zG.toFixed(1) + '\n');
        writeFileGyro.write(time + '\t' + xG.toFixed(5)+ '\t' + yG.toFixed(5) + '\t' + zG.toFixed(5) + '\n');
      });
    });
  }

  function notifyMePpg(){
    tag.notifyMax3010(function listenForPpgReading(){
      tag.on('Max3010Change', function(a1, a2, a3, a4){
        var time = new Date().getTime();
        //console.log("P : " + time + '\t' + a1.toFixed(1) + '\t' + a2.toFixed(1) + '\t' + a3.toFixed(1) + '\t' + a4.toFixed(1) + '\n');
        //writeFilePpg.write(time + '\t' + a1.toFixed(1) + '\t' + a2.toFixed(1) + '\t' + a3.toFixed(1) + '\t' + a4.toFixed(1) + '\n');
        console.log(time + '\t' + a1 + '\t' + a2 + '\n');
        writeFilePpg.write(time + '\t' + a1 + '\t' + a2 + '\n');
      });
    });
  }

  function notifyMeEda(){
console.log("en notifyMeEda");
    tag.notifyEDA(function listenForEdaReading(){
	tag.on('EdaChange', function(a1, a2, a3, a4){
	    var time=new Date().getTime();
        console.log("Escribiendo EDA: " + time + '\t' + a1.toFixed(1) + '\t' + a2.toFixed(1) + '\t' + a3 + '\t' + a4.toFixed(1) + '\n');
        writeFileEda.write(time + '\t' + a1.toFixed(1) + '\t' + a2.toFixed(1) + '\t' + a3.toFixed(1) + '\t' + a4.toFixed(1) + '\n');
      });
    });
  }

  connectAndSetUpMe();
});
