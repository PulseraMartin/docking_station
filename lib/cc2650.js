// http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide

var NobleDevice = require('noble-device');

var Common = require('./common');

/// EDA profile
var EDA_UUID                        = 'f000aab004514000b000000000000000';
var EDA_DATA_UUID                   = 'f000aab104514000b000000000000000';
var EDA_CONFIG_UUID                 = 'f000aab204514000b000000000000000';
var EDA_PERIDO_UUID                 = 'f000aab304514000b000000000000000';

//// MAX sensor added
var MAX3010_DATA_UUID               = 'f000aa9104514000b000000000000000';
var MAX3010_CONFIG_UUID             = 'f000aa9204514000b000000000000000';
var MAX3010_PERIDO_UUID             = 'f000aa9304514000b000000000000000';

//// MAX sensor added
var MAX3010_UUID                    = 'f000aa9004514000b000000000000000';
////
var MPU9250_UUID                    = 'f000aa8004514000b000000000000000';
var BAROMETRIC_PRESSURE_UUID        = 'f000aa4004514000b000000000000000';
var IO_UUID                         = 'f000aa6404514000b000000000000000';
var LUXOMETER_UUID                  = 'f000aa7004514000b000000000000000';

var MPU9250_CONFIG_UUID             = 'f000aa8204514000b000000000000000';
var MPU9250_DATA_UUID               = 'f000aa8104514000b000000000000000';
var MPU9250_PERIOD_UUID             = 'f000aa8304514000b000000000000000';

var MPU9250_GYROSCOPE_MASK          = 0x0007;
var MPU9250_ACCELEROMETER_MASK      = 0x0238;
var MPU9250_MAGNETOMETER_MASK       = 0x0040;

var IO_DATA_UUID                    = 'f000aa6504514000b000000000000000';
var IO_CONFIG_UUID                  = 'f000aa6604514000b000000000000000';

var CC2650SensorTag = function(peripheral) {
  NobleDevice.call(this, peripheral);
  Common.call(this);

  this.type = 'cc2650';
  this.mpu9250mask = 0;
  this.mpu9250notifyCount = 0;

  this.onMPU9250ChangeBinded     = this.onMPU9250Change.bind(this);
  this.onMax3010ChangeBinded     = this.onMax3010Change.bind(this);
  this.onEDAChangeBinded	 = this.onEDAChange.bind(this);
};

CC2650SensorTag.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;
  var serviceUuids = peripheral.advertisement.serviceUuids;

  return (localName === 'CC2650 SensorTag') || (localName === 'SensorTag 2.0') || (serviceUuids.indexOf('aa80') > -1 );
};

NobleDevice.Util.inherits(CC2650SensorTag, NobleDevice);
NobleDevice.Util.mixin(CC2650SensorTag, NobleDevice.DeviceInformationService);
NobleDevice.Util.mixin(CC2650SensorTag, Common);

CC2650SensorTag.prototype.convertIrTemperatureData = function(data, callback) {
  var ambientTemperature = data.readInt16LE(2) / 128.0;
  var objectTemperature = data.readInt16LE(0) / 128.0;

  callback(objectTemperature, ambientTemperature);
};

////////////////////////
//// Adding EDA    ////
CC2650SensorTag.prototype.convertEDAData = function(data, callback) {
  console.log("DATA EDA & TEMP");

  var a1 = data.readUInt8(0);
  var a2 = data.readUInt8(1)<<8;
  var Vo=a1+a2;
  a1 = data.readUInt8(2);
  a2 = data.readUInt8(3)<<8;
  var Vb = a1+a2;
  a1 = data.readUInt8(4);
  a2 = data.readUInt8(5)<<8;
  var temp =a1+a2;
  var a4 = 0;
  callback(Vo, Vb, temp*-0.00481+46.505, a4);
};

CC2650SensorTag.prototype.setEDAPeriod = function(period, callback) {
  var period_hex = '0x' + (+period).toString(16).toUpperCase();
  var characteristic = this._characteristics[EDA_UUID][EDA_PERIDO_UUID];
  var period_hex = new Buffer([period_hex]);
  characteristic.write(period_hex, true, function(error) {
    console.log('Write 01, to read EDA data');
    });
    callback();
};

CC2650SensorTag.prototype.enableEDA = function(callback) {
  console.log("en CC2650 enableEDA");
  this.enableConfigCharacteristic(EDA_UUID, EDA_CONFIG_UUID, callback);
  console.log("EDA enabled");
};

CC2650SensorTag.prototype.disableEDA = function(callback) {
  this.disableConfigCharacteristic(EDA_UUID, EDA_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.readEDA = function(callback) {
  this.readDataCharacteristic(EDA_PERIDO_UUID, EDA_PERIDO_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertEDAData(data, function(a1, a2, a3, a4) {
      callback(null, a1, a2, a3, a4);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.onEDAChange = function(data) {
  this.convertEDAData(data, function(a1, a2, a3, a4) {
    this.emit('EdaChange', a1, a2, a3, a4);
  }.bind(this));
};

CC2650SensorTag.prototype.notifyEDA = function(callback) {
  this.notifyCharacteristic(EDA_UUID, EDA_DATA_UUID, true, this.onEDAChangeBinded, callback);
};

CC2650SensorTag.prototype.unnotifyEDA = function(callback) {
  this.notifyCharacteristic(EDA_UUID, EDA_DATA_UUID, false, this.onEDAChangeBinded, callback);
};

CC2650SensorTag.prototype.setEDA = function(period, callback) {
  this.writePeriodCharacteristic(EDA_UUID, EDA_PERIDO_UUID, period, callback);
};

////////////////////////
//// Adding MAX3010 ////
CC2650SensorTag.prototype.convertPpgData = function(data, callback) {
  var a1 = new Uint32Array(1);
  var a2 = new Uint32Array(1);
  a1[0]=data.readUInt16LE(0);
  aux=data.readUInt8(2);
  a1[0]=a1[0]+(aux<<16);
  a2[0]=data.readUInt16LE(3);
  aux=data.readUInt8(5);
  a2[0]=a2[0]+(aux<<16);
  var a3=0;
  var a4=0;
  callback(a1, a2, a3, a4);
};

CC2650SensorTag.prototype.setMax3010Period = function(period, callback) {
  // this.writePeriodCharacteristic(MAX3010_UUID, MAX3010_PERIDO_UUID, period, callback);
  // console.log('0 [setMax3010Period] ' + period);
  // console.log('1 [setMax3010Period] ' + period_hex);
  var period_hex = '0x' + (+period).toString(16).toUpperCase();
  var characteristic = this._characteristics[MAX3010_UUID][MAX3010_PERIDO_UUID];
  var period_hex = new Buffer([period_hex]);
  characteristic.write(period_hex, true, function(error) {
    console.log('Write period, to read Max3010');
    });
    callback();
};

CC2650SensorTag.prototype.enableMax3010 = function(callback) {
  this.enableConfigCharacteristic(MAX3010_UUID, MAX3010_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.disableMax3010 = function(callback) {
  this.disableConfigCharacteristic(MAX3010_UUID, MAX3010_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.readMAX3010 = function(callback) {
  this.readDataCharacteristic(MAX3010_PERIDO_UUID, MAX3010_PERIDO_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertPpgData(data, function(a1, a2, a3, a4) {
      callback(null, a1, a2, a3, a4);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.onMax3010Change = function(data) {
  this.convertPpgData(data, function(a1, a2, a3, a4) {
    this.emit('Max3010Change', a1, a2, a3, a4);
  }.bind(this));
};

CC2650SensorTag.prototype.notifyMax3010 = function(callback) {
  this.notifyCharacteristic(MAX3010_UUID, MAX3010_DATA_UUID, true, this.onMax3010ChangeBinded, callback);
};

CC2650SensorTag.prototype.unnotifyMax3010 = function(callback) {
  this.notifyCharacteristic(MAX3010_UUID, MAX3010_DATA_UUID, false, this.onMax3010ChangeBinded, callback);
};

CC2650SensorTag.prototype.setMax3010 = function(period, callback) {
  this.writePeriodCharacteristic(MAX3010_UUID, MAX3010_PERIDO_UUID, period, callback);
};

///////////////
// MPU9250 ////
CC2650SensorTag.prototype.setMPU9250Period = function(period, callback) {
  console.log('0 [setMPU9250Period] ' + period);
  var period_hex = '0x' + (+period).toString(16).toUpperCase();
  console.log('1 [setMPU9250Period] ' + period_hex);
  var characteristic = this._characteristics[MPU9250_UUID][MPU9250_PERIOD_UUID];
  period_hex = new Buffer([period_hex]);
  characteristic.write(period_hex, true, function(error) {
    console.log('Write 01, to read IR temp data');
    });
    callback();
};

CC2650SensorTag.prototype.enableMPU9250 = function(mask, callback) {
  this.mpu9250mask |= mask;

  // for now, always write 0x007f, magnetometer does not seem to notify its specific mask is used
  this.writeUInt16LECharacteristic(MPU9250_UUID, MPU9250_CONFIG_UUID, 0x007f, callback);
};

CC2650SensorTag.prototype.disableMPU9250 = function(mask, callback) {
  this.mpu9250mask &= ~mask;

  if (this.mpu9250mask === 0) {
    this.writeUInt16LECharacteristic(MPU9250_UUID, MPU9250_CONFIG_UUID, 0x0000, callback);
  } else if (typeof(callback) === 'function') {
    callback();
  }
};

CC2650SensorTag.prototype.notifyMPU9250 = function(callback) {
  this.mpu9250notifyCount++;

  if (this.mpu9250notifyCount === 1) {
    this.notifyCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, true, this.onMPU9250ChangeBinded, callback);
  } else if (typeof(callback) === 'function') {
    callback();
  }
};

CC2650SensorTag.prototype.unnotifyMPU9250 = function(callback) {
  this.mpu9250notifyCount--;

  if (this.mpu9250notifyCount === 0) {
    this.notifyCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, false, this.onMPU9250ChangeBinded, callback);
  } else if (typeof(callback) === 'function') {
    callback();
  }
};

CC2650SensorTag.prototype.enableAccelerometer = function(callback) {
  this.enableMPU9250(MPU9250_ACCELEROMETER_MASK, callback);
};

CC2650SensorTag.prototype.disableAccelerometer = function(callback) {
  this.disableMPU9250(MPU9250_ACCELEROMETER_MASK, callback);
};

CC2650SensorTag.prototype.readAccelerometer  = function(callback) {
  this.readDataCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertMPU9250Data(data, function(x, y, z) {
      callback(null, x, y, z);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.onMPU9250Change = function(data) {
  this.convertMPU9250Data(data, function(x, y, z, xG, yG, zG, xM, yM, zM) {
    if (this.mpu9250mask & MPU9250_ACCELEROMETER_MASK) {
      this.emit('accelerometerChange', x, y, z);
    }

    if (this.mpu9250mask & MPU9250_GYROSCOPE_MASK) {
      this.emit('gyroscopeChange', xG, yG, zG);
    }

    if (this.mpu9250mask & MPU9250_MAGNETOMETER_MASK) {
      this.emit('magnetometerChange', xM, yM, zM);
    }
  }.bind(this));
};

CC2650SensorTag.prototype.convertMPU9250Data = function(data, callback) {
  // 250 deg/s range
  var xG = data.readInt16LE(0) / 128.0;
  var yG = data.readInt16LE(2) / 128.0;
  var zG = data.readInt16LE(4) / 128.0;

  // we specify 8G range in setup
  var x = data.readInt16LE(6) / 4096.0;
  var y = data.readInt16LE(8) / 4096.0;
  var z = data.readInt16LE(10) / 4096.0;

  callback(x, y, z, xG, yG, zG);
};

CC2650SensorTag.prototype.notifyAccelerometer = function(callback) {
  this.notifyMPU9250(callback);
};

CC2650SensorTag.prototype.unnotifyAccelerometer = function(callback) {
  this.unnotifyMPU9250(callback);
};

CC2650SensorTag.prototype.setAccelerometerPeriod = function(period, callback) {
  this.setMPU9250Period(period, callback);
};

CC2650SensorTag.prototype.enableMagnetometer = function(callback) {
  this.enableMPU9250(MPU9250_MAGNETOMETER_MASK, callback);
};

CC2650SensorTag.prototype.disableMagnetometer = function(callback) {
  this.disableMPU9250(MPU9250_MAGNETOMETER_MASK, callback);
};

CC2650SensorTag.prototype.readMagnetometer = function(callback) {
  this.readDataCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertMPU9250Data(data, function(x, y, z, xG, yG, zG, xM, yM, zM) {
      callback(null, xM, yM, zM);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.notifyMagnetometer = function(callback) {
  this.notifyMPU9250(callback);
};

CC2650SensorTag.prototype.unnotifyMagnetometer = function(callback) {
  this.unnotifyMPU9250(callback);
};

CC2650SensorTag.prototype.setMagnetometerPeriod = function(period, callback) {
  this.setMPU9250Period(period, callback);
};

CC2650SensorTag.prototype.setGyroscopePeriod = function(period, callback) {
  this.setMPU9250Period(period, callback);
};

CC2650SensorTag.prototype.enableGyroscope = function(callback) {
  this.enableMPU9250(MPU9250_GYROSCOPE_MASK, callback);
};

CC2650SensorTag.prototype.disableGyroscope = function(callback) {
  this.disableMPU9250(MPU9250_GYROSCOPE_MASK, callback);
};

CC2650SensorTag.prototype.readGyroscope = function(callback) {
  this.readDataCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertMPU9250Data(data, function(x, y, z, xG, yG, zG) {
      callback(null, xG, yG, zG);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.notifyGyroscope = function(callback) {
  this.notifyMPU9250(callback);
};

CC2650SensorTag.prototype.unnotifyGyroscope = function(callback) {
  this.unnotifyMPU9250(callback);
};

CC2650SensorTag.prototype.readIoData = function(callback) {
  this.readUInt8Characteristic(IO_UUID, IO_DATA_UUID, callback);
};

CC2650SensorTag.prototype.writeIoData = function(value, callback) {
  this.writeUInt8Characteristic(IO_UUID, IO_DATA_UUID, value, callback);
};

CC2650SensorTag.prototype.readIoConfig = function(callback) {
  this.readUInt8Characteristic(IO_UUID, IO_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.writeIoConfig = function(value, callback) {
  this.writeUInt8Characteristic(IO_UUID, IO_CONFIG_UUID, value, callback);
};

CC2650SensorTag.prototype.convertSimpleKeyData = function(data, callback) {
  var b = data.readUInt8(0);

  var left = (b & 0x2) ? true : false;
  var right = (b & 0x1) ? true : false;
  var reedRelay = (b & 0x4) ? true : false;

  callback(left, right, reedRelay);
};

/// Time functions to set the file system management
CC2650SensorTag.prototype.onSecondChange = function(callback) {
  setInterval(function(){
    // this.emit('secondChange', Math.round(new Date().getTime()/1000.0));
    callback();
    },
    1000);
  };

CC2650SensorTag.prototype.getCurrentTimestamp = function(){
    return Math.round(new Date().getTime()/1000.0);
  }

module.exports = CC2650SensorTag;
