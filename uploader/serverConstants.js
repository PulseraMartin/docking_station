var constants = {hostname:"localhost"};

var serverConstants = function () {};

serverConstants.getConstants = function(){
  console.dir(constants);
  return constants["hostname"];
};


module.exports = serverConstants;
