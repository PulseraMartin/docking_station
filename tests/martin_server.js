// Load the http module to create an http server.
var http = require('http');
var request = require('request');

// Configure our HTTP server to respond with Hello World to all requests.
var res = "Inicializando";

var server = http.createServer(function (request, response) {
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  getTemp("temperature");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World: " + res);
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");


function getTemp(q){
  request.post(
    'http://test:test@54.233.152.245:15672/api/queues/martinMQT/temperature/get',
    { json: { encoding: 'auto', requeue: true, count: 1 } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let info = body[0];
        if (info == null) {
          res = '{"err":"no info available"}';
        }
        else {
          res = body[0]['payload'];
        }
      }
    }
  );
};
