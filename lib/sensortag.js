var CC2650SensorTag = require('./cc2650');
var SensorTag = require('./martin-mobile');

var SensorTag = function() {
};

SensorTag.discoverAll = function(onDiscover) {
  CC2650SensorTag.discoverAll(onDiscover);
};

SensorTag.stopDiscoverAll = function(onDiscover) {
  CC2650SensorTag.stopDiscoverAll(onDiscover);
};

SensorTag.discover = function(callback) {
  var onDiscover = function(sensorTag) {
    SensorTag.stopDiscoverAll(onDiscover);

    callback(sensorTag);
  };

  SensorTag.discoverAll(onDiscover);
};

SensorTag.discoverByAddress = function(address, callback) {
  address = address.toLowerCase();

  var onDiscoverByAddress = function(sensorTag) {
    if (sensorTag._peripheral.address === address) {
      SensorTag.stopDiscoverAll(onDiscoverByAddress);

      callback(sensorTag);
    }
  };

  SensorTag.discoverAll(onDiscoverByAddress);
};

SensorTag.discoverById = function(id, callback) {
  var onDiscoverById = function(sensorTag) {
    if (sensorTag.id === id) {
      SensorTag.stopDiscoverAll(onDiscoverById);

      callback(sensorTag);
    }
  };

  SensorTag.discoverAll(onDiscoverById);
};

// deprecated
SensorTag.discoverByUuid = function(uuid, callback) {
  var onDiscoverByUuid = function(sensorTag) {
    if (sensorTag.uuid === uuid) {
      SensorTag.stopDiscoverAll(onDiscoverByUuid);

      callback(sensorTag);
    }
  };

  SensorTag.discoverAll(onDiscoverByUuid);
};

SensorTag.CC2650 = CC2650SensorTag;

module.exports = SensorTag;
