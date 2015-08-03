// REQUIRE DEPENDENCIES
var express = require('express')
var http = require('http')
var path = require('path')
var app = express()

// CONFIGURE SETTINGS
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// CONNECT TO DB

// DEFINE MIDDLEWARE

// DEFINE ROUTES
app.all('*', function(req, res) {
  res.render('index', {msg: 'Welcome to the Art(sy) History Flash Card Game!'})
})

// START SERVER
//----------
http
  .createServer(app)
  .listen(
    app.get('port'),
    function() {
      console.log(
        'Express server listening on port ' +
        app.get('port')
      )
    }
  )

// SPAWN WORKERS (OPTIONAL)
