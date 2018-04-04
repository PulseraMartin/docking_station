// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide

var IR_TEMPERATURE_UUID                     = 'f000aa0004514000b000000000000000';

var IR_TEMPERATURE_CONFIG_UUID              = 'f000aa0204514000b000000000000000';
var IR_TEMPERATURE_DATA_UUID                = 'f000aa0104514000b000000000000000';
var IR_TEMPERATURE_PERIOD_UUID              = 'f000aa0304514000b000000000000000';

var SIMPLE_KEY_UUID                         = 'ffe0';
var SIMPLE_KEY_DATA_UUID                    = 'ffe1';

// DEVICE ID: (Biomonitor >  0x0106) : (BabyMonitor > Device_ID 0x0703)

var DEVICE_ID_UUID                     = 'f000AC00-0451-4000-B000-00000000-0000';

var DEVICE_ID_DATA_UUID                = 'f000ac0104514000b000000000000000';
var DEVICE_ID_ADDRESS_UUID             = 'f000ac0204514000b000000000000000';
var DEVICE_ID_DEVICE_UUID              = 'f000ac0304514000b000000000000000';


function SensorTagCommon() {
  this.onIrTemperatureChangeBinded      = this.onIrTemperatureChange.bind(this);
  this.onSimpleKeyChangeBinded          = this.onSimpleKeyChange.bind(this);
}

SensorTagCommon.prototype.toString = function() {
  return JSON.stringify({
    id: this.id,
    type: this.type
  });
};

SensorTagCommon.prototype.writePeriodCharacteristic = function(serviceUuid, characteristicUuid, period, callback) {
  period /= 10; // input is scaled by units of 10ms

  if (period < 1) {
    period = 1;
  } else if (period > 255) {
    period = 255;
  }

  this.writeUInt8Characteristic(serviceUuid, characteristicUuid, period, callback);
};

// Device ID
SensorTagCommon.prototype.setDeviceID = function(callback) {
  var period_hex = '0x0303';
  var characteristic = this._characteristics[DEVICE_ID_UUID][DEVICE_ID_DEVICE_UUID];
  var buf_period_hex = new Buffer([period_hex]);
  characteristic.write(buf_period_hex, true, function(error) {
    console.log('Device ID: ' + period_hex);
  });
  this.readDataCharacteristic(DEVICE_ID_UUID, DEVICE_ID_DATA_UUID, function(error, data) {
    var deviceID = data.readInt16LE(0);
    console.log("Device ID: " + deviceID);
  });
    // callback();
};

SensorTagCommon.prototype.readDeviceId = function() {
  this.readDataCharacteristic(DEVICE_ID_UUID, DEVICE_ID_DATA_UUID, function(error, data) {
    var deviceID = data.readInt16LE(0);
    callback(deviceID);
  });
};

// CC2650SensorTag.prototype.convertDeviceID = function(data) {
//   var deviceID = data.readInt16LE(0) / 128.0;
//   callback(deviceID);
// };

//////////

SensorTagCommon.prototype.enableConfigCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.writeUInt8Characteristic(serviceUuid, characteristicUuid, 0x01, callback);
};

SensorTagCommon.prototype.disableConfigCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.writeUInt8Characteristic(serviceUuid, characteristicUuid, 0x00, callback);
};

// Temperature
SensorTagCommon.prototype.setIrTemperaturePeriod = function(period, callback) {
  var period_hex = '0x' + (+period).toString(16).toUpperCase();
  var characteristic = this._characteristics[IR_TEMPERATURE_UUID][IR_TEMPERATURE_PERIOD_UUID];
  var buf_period_hex = new Buffer([period_hex]);
  characteristic.write(buf_period_hex, true, function(error) {
    console.log('IR temp period set to: ' + period_hex);
    });
    callback();
};

SensorTagCommon.prototype.enableIrTemperature = function(callback) {
  this.enableConfigCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_CONFIG_UUID, callback);
};

SensorTagCommon.prototype.disableIrTemperature = function(callback) {
  this.disableConfigCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_CONFIG_UUID, callback);
};

SensorTagCommon.prototype.readIrTemperature = function(callback) {
  this.readDataCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertIrTemperatureData(data, function(objectTemperature, ambientTemperature) {
      callback(null, objectTemperature, ambientTemperature);
    }.bind(this));
  }.bind(this));
};

SensorTagCommon.prototype.onIrTemperatureChange = function(data) {
  this.convertIrTemperatureData(data, function(objectTemperature, ambientTemperature) {
    this.emit('irTemperatureChange', objectTemperature, ambientTemperature);
  }.bind(this));
};

SensorTagCommon.prototype.notifyIrTemperature = function(callback) {
  this.notifyCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_DATA_UUID, true, this.onIrTemperatureChangeBinded, callback);
};

SensorTagCommon.prototype.unnotifyIrTemperature = function(callback) {
  this.notifyCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_DATA_UUID, false, this.onIrTemperatureChangeBinded, callback);
};

SensorTagCommon.prototype.onSimpleKeyChange = function(data) {
  this.convertSimpleKeyData(data, function(/*left, right, ...*/) {
    var emitArguments = Array.prototype.slice.call(arguments);
    emitArguments.unshift('simpleKeyChange');

    this.emit.apply(this, emitArguments);
  }.bind(this));
};

SensorTagCommon.prototype.convertSimpleKeyData = function(data, callback) {
  var b = data.readUInt8(0);

  var left = (b & 0x2) ? true : false;
  var right = (b & 0x1) ? true : false;

  callback(left, right);
};

SensorTagCommon.prototype.notifySimpleKey = function(callback) {
  this.notifyCharacteristic(SIMPLE_KEY_UUID, SIMPLE_KEY_DATA_UUID, true, this.onSimpleKeyChangeBinded, callback);
};

SensorTagCommon.prototype.unnotifySimpleKey = function(callback) {
  this.notifyCharacteristic(SIMPLE_KEY_UUID, SIMPLE_KEY_DATA_UUID, false, this.onSimpleKeyChangeBinded, callback);
};

module.exports = SensorTagCommon;
