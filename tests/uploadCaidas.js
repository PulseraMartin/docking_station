// #!/usr/bin/env node
//
// var amqp = require('amqplib/callback_api');
//
// amqp.connect('amqp://localhost', function(err, conn) {
//   conn.createChannel(function(err, ch) {
//     var q = 'temperature';
//
//     ch.assertQueue(q, {durable: false});
//     console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
//     ch.consume(q, function(msg) {
//       console.log(" [x] Received %s", msg.content.toString());
//     }, {noAck: true});
//   });
// });

var request = require('request');

request.post(
    'http://test:test@54.233.152.245:15672/api/queues/martinMQT/temperature/get',
    { json: { encoding: 'auto', requeue: true, count: 1 } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let info = body[0]['payload'];
          console.log(info);
        }
    }
);



// const request = require('request');
//
// const options = {
//     url: 'http://test:test@54.233.152.245:15672/api/queues/martinMQT/temperature/get',
//     method: 'POST',
//     headers: {
//         'Accept': 'application/json',
//         'Accept-Charset': 'utf-8',
//         'User-Agent': 'my-reddit-client'
//     },
//     multipart: [
//       {
//         'content-type': 'application/json',
//         body: JSON.stringify({encoding: 'auto', requeue: true, count: 1 })
//       }
//     ]
// };
//
// request(options, function(err, res, body) {
//     let json = JSON.parse(body);
//     console.log(json);
// });


// var http = require("http");
//
// var options = {
//   "method": "POST",
//   "hostname": "54.233.152.245",
//   "port": "15672",
//   "path": "/api/queues/martinMQT/temperature/get",
//   "headers": {
//     "authorization": "Basic dGVzdDp0ZXN0",
//     "content-type": "application/x-www-form-urlencoded",
//     "cache-control": "no-cache"
//     // "postman-token": "022153ff-1299-0c50-e788-f30a26afe1ba"
//   }
// };
//
// var req = http.request(options, function (res) {
//   var chunks = [];
//
//   res.on("data", function (chunk) {
//     chunks.push(chunk);
//     console.log(chunks);
//   });
//
//   res.on("end", function () {
//     var body = Buffer.concat(chunks);
//     console.log(body.toString());
//   });
// });
