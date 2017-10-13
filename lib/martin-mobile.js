// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide

// TEMP
var IR_TEMPERATURE_UUID                     = 'f000aa0004514000b000000000000000';
var IR_TEMPERATURE_CONFIG_UUID              = 'f000aa0204514000b000000000000000';
var IR_TEMPERATURE_DATA_UUID                = 'f000aa0104514000b000000000000000';
var IR_TEMPERATURE_PERIOD_UUID              = 'f000aa0304514000b000000000000000';

function Martin() {
  this.onIrTemperatureChangeBinded      = this.onIrTemperatureChange.bind(this);
}

Martin.prototype.toString = function() {
  return JSON.stringify({
    id: this.id,
    type: this.type
  });
};

/// Time functions to set the file system management
Martin.prototype.onSecondChange = function(callback) {
  setInterval(function(){
    // this.emit('secondChange', Math.round(new Date().getTime()/1000.0));
    callback();
    },
    1000);
  };

Martin.prototype.writePeriodCharacteristic = function(serviceUuid, characteristicUuid, period, callback) {
  period /= 10; // input is scaled by units of 10ms

  if (period < 1) {
    period = 1;
  } else if (period > 255) {
    period = 255;
  }

  this.writeUInt8Characteristic(serviceUuid, characteristicUuid, period, callback);
};

Martin.prototype.enableConfigCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.writeUInt8Characteristic(serviceUuid, characteristicUuid, 0x01, callback);
};

Martin.prototype.disableConfigCharacteristic = function(serviceUuid, characteristicUuid, callback) {
  this.writeUInt8Characteristic(serviceUuid, characteristicUuid, 0x00, callback);
};

Martin.prototype.setIrTemperaturePeriod = function(period, callback) {
  this.writePeriodCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_PERIOD_UUID, period, callback);
};

Martin.prototype.enableIrTemperature = function(callback) {
  this.enableConfigCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_CONFIG_UUID, callback);
};

Martin.prototype.disableIrTemperature = function(callback) {
  this.disableConfigCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_CONFIG_UUID, callback);
};

Martin.prototype.readIrTemperature = function(callback) {
  this.readDataCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertIrTemperatureData(data, function(objectTemperature, ambientTemperature) {
      callback(null, objectTemperature, ambientTemperature);
    }.bind(this));
  }.bind(this));
};

Martin.prototype.onIrTemperatureChange = function(data) {
  this.convertIrTemperatureData(data, function(objectTemperature, ambientTemperature) {
    this.emit('irTemperatureChange', objectTemperature, ambientTemperature);
  }.bind(this));
};

Martin.prototype.notifyIrTemperature = function(callback) {
  this.notifyCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_DATA_UUID, true, this.onIrTemperatureChangeBinded, callback);
};

Martin.prototype.unnotifyIrTemperature = function(callback) {
  this.notifyCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_DATA_UUID, false, this.onIrTemperatureChangeBinded, callback);
};
//////////// Seteo de periodo
Martin.prototype.setIrTemperaturePeriod = function(period, callback) {
  console.log("Seteando temp period: " + period);
  this.writePeriodCharacteristic(IR_TEMPERATURE_UUID, IR_TEMPERATURE_PERIOD_UUID, period, callback);
  // console.log("Temp period seteada");
};

Martin.prototype.setIrTemperaturePeriod2 = function(period, callback) {
  console.log("Seteando temp period: " + period);
  var characteristic = this._characteristics[IR_TEMPERATURE_UUID][IR_TEMPERATURE_PERIOD_UUID];
  characteristic.write(
    new Buffer([0x01]),
    true,
    function(error) {
      console.log('Write 01, to read IR temp data')
      characteristic.on('read', function(data, isNotification) {
        if(isNotification){
          // Aca se debe escribir a archivo;
          console.log('value Ir Tem  now: ', data.toString('hex')+' C');
        }
      });

      characteristic.notify(true, function(error){
        console.log('Ir temp notification ON');
      });
    });
};

//////////////

module.exports = Martin;
