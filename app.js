var express = require('express')
var app = express()


//ROUTES
//----------
app.get('/', function (req, res) {
  res.render('views/index.html')
})


//SERVER
//----------
var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://localhost:' + port)
})
