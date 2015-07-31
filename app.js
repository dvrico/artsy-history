var express = require('express')
var http = require('http')
var app = express()
app.use(express.static('views'))

//create node http.request and request api.artsy.
//console log the data that is requested.
var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://localhost:%s', port)
})
var options = {
  hostname: 'https://api.artsy.net/api',
  //id & secret might need to go into a req.write() instead of here
  path: '/tokens/xapp_token?client_id=00665d46bb4f56d42b98&client_secret=86d483720aa6dedc9c86d1129a995749',
  method: 'POST',
  keepAlive: true
}

var req = http.request(options, function(res) {
  res.setEncoding('utf8')
  res.on('data', function(body) {
    console.log(body)
  })
})

//might need to make this a callback for var server
req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

req.end()
app.get('/', function(req, res) {
  res.send("Hello World!")
})
