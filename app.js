// REQUIRE DEPENDENCIES
var express = require('express')
var http = require('http')
var path = require('path')
var request = require('superagent')
var app = express()

// CONFIGURE SETTINGS
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// CONNECT TO DB

// DEFINE MIDDLEWARE

/*
 * Request Token from Artsy API
 */
var clientID = '00665d46bb4f56d42b98'
var clientSecret = '86d483720aa6dedc9c86d1129a995749'
var apiUrl = 'https://api.artsy.net/api/tokens/xapp_token'
var xappToken
var degas
var degasThumbnail

request
  .post(apiUrl)
  .send({ client_id: clientID, client_secret: clientSecret })
  .end(function(err, res) {
    if (err) {
      return console.log('error')
    }
    xappToken = res.body.token;
    //console.log(res.body)

    getDegas();
  });
/*
 * Get Degas info from Artsy API
 */
function getDegas() {
  request
    .get('https://api.artsy.net/api/artists/edgar-degas')
    .set('X-Xapp-Token', xappToken)
    .end(function(err, res) {
      if (err) {
        return console.log('error')
      }
      console.log(res.body)
      degasThumbnail = res.body._links.thumbnail.href
      degas = '\n' + res.body.name + '\n' + 'Birthday: ' + res.body.birthday + '\n' + 'Hometown: ' + res.body.hometown + '\n' + 'Nationality: ' + res.body.nationality;
      getThumbnail
      //degasArtwork = res.body._links.artworks.href
      //getDegasArtwork()
      // this cb calls the function below to retrieve Degas info after auth token is generated
    })
}

function getThumbnail() {
  request
    .get(degasThumbnail)
    .set('X-Xapp-Token', xappToken)
    .end(function(err, res) {
      if (err) {
        return console.log('error')
      }
      console.log(res.body)
    })
}

// DEFINE ROUTES
app.get('/', function(req, res) {
  res.render('index', {msg: 'Welcome to the Art(sy) History Flash Card Game!'})
})

app.get('/token', function(req, res) {
  res.render('degas', {msg: degasThumbnail})
})

// START SERVER
//-------------
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
