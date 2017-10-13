/*
Modifica el registro que permite activar y desactiva la lectura de cada uno de los sensores.
0:  	Gyroscope z axis enable, 1:  	Gyroscope y axis enable, 2:  	Gyroscope x axis enable, 3:  	Accelerometer z axis enable, 4:  	Accelerometer y axis enable
5:  	Accelerometer x axis enable, 6:  	Magnetometer enable (all axes), 7:  	Wake-On-Motion Enable, 8,9:	Accelerometer range (0=2G, 1=4G, 2=8G, 3=16G)
10:15	Not used, config: 0x03FF : enable all, and  Accel range of 16G
*/

function MovementService(service) {

  // Setea caracteristicas del sensor de movimiento MPU
  service.discoverCharacteristics(null, function(error, characteristics) {
    // Seteo de las caracteristicas del sensor. Recive una instancia de servicio
    for (var i in characteristics) {
      var characteristic = characteristics[i];
      console.log('Characteristic n: '+ i + ', Char uuid: '+characteristic.uuid );
      switch(characteristic.uuid){
        // MPU9250_PERIOD_UUID
        case 'f000aa8304514000b000000000000000':
              console.log('Movement period config');
              setMPU9250Period(characteristic,0x0B); // 0x0B = 11
              break;
        // MPU9250_DATA_UUID
        case 'f000aa8104514000b000000000000000':
              console.log('Movement Data subscription');
              notifyMeAccel(characteristic); // reemplaza a MovementCh(characteristic);
              break;
        // MPU9250_CONFIG_UUID
        case 'f000aa8204514000b000000000000000':
              console.log('Movement Start sensor data adquisition');
              enableAccelerometer(characteristic,0x03FF); // config: 0x03FF : enable all, and  Accel range of 16G
              break;
      }
    }
  });
}

function enableAccelerometer(characteristic, control) {
  var buf = new Buffer(2);
  buf.writeUInt16LE(control, 0);
  console.log('Buf = '+ buf.toString('ascii') );
  characteristic.write(buf, true, function(error) {
    console.log('Write '+ buf.toString('ascii') +' to read Movement data');
  });
  characteristic.read(function(error, data) {
    console.log('MStart char '+characteristic.uuid+' Data readed: '+ data.toString('hex'));
  });
}

function notifyMeAccel(characteristic) {
  // true to enable notify
  characteristic.on('read', function(data, isNotification) {
    if(isNotification){
      // Aca se debe escribir a archivo
      console.log('Value Movement data: ', data.toString('hex'));
    }
  });

  characteristic.notify(true, function(error){
    console.log('Movement notification ON');
  });
}

function setMPU9250Period(characteristic, control) {
  var buf = new Buffer(1);
  buf.writeUInt8(control, 0);
  console.log('Buf MP = '+ buf.toString('ascii') );

  characteristic.write(buf, true, function(error) {
    console.log('Write '+ buf.toString('ascii') +' to MP config');
  });
  characteristic.read(function(error, data) {
    console.log('MP char  '+characteristic.uuid+' Data readed: '+data.toString('hex'));
  });
}

module.exports = MovementService;
