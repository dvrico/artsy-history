var http = require('http')
var request = require('superagent');

//SET UP REQUEST FOR ARTSY API
//----------------------------------
var clientID = '00665d46bb4f56d42b98'
var clientSecret = '86d483720aa6dedc9c86d1129a995749'
var apiUrl = 'https://api.artsy.net/api/tokens/xapp_token'
var xappToken;
var degas;
var degasArtwork;

// REQUEST TOKEN AND CALLBACK REQUEST DEGAS INFO
//----------------------------------------------------
request
  .post(apiUrl)
  .send({ client_id: clientID, client_secret: clientSecret })
  .end(function(err, res) {
    if (err) {
      return console.log('error')
    }
    xappToken = res.body.token;
    console.log(res.body)

    getDegas();
  });

//CREATE SERVER
//---------------------
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(xappToken)
  res.write(degas)
  res.end()
}).listen(8000, '127.0.0.1')

console.log('Server running at http://127.0.0.1:8000')


function getDegas() {
  request
    .get('https://api.artsy.net/api/artists/edgar-degas')
    .set('X-Xapp-Token', xappToken)
    .end(function(err, res) {
      if (err) {
        return console.log('error')
      }
      console.log(res.body)
      degas = '\n' + res.body.name + '\n' + 'Birthday: ' + res.body.birthday + '\n' + 'Hometown: ' + res.body.hometown + '\n' + 'Nationality: ' + res.body.nationality;
      degasArtwork = res.body._links.artworks.href
      // getDegasArtwork()
      // this cb calls the function below to retrieve Degas info after auth token is generated
    })
}

function getDegasArtwork() {
  request
    .get(degasArtwork)
    .set('X-Xapp-Token', xappToken)
    .end(function(err, res) {
      if (err) {
        return console.log('error2')
      }
      console.log('OBTAINED DEGAS ARTWORK')
      console.log(res.body)
    })
}
