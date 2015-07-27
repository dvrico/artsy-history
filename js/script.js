//Obtain an authentication token that can be used to make API requests by POSTing to
// /api/tokens/xapp_token. Using curl:
//curl -v -X POST "https://api.artsy.net/api/tokens/xapp_token?client_id=00665d46bb4f56d42b98&client_secret=86d483720aa6dedc9c86d1129a995749"

var request = require('superagent');

var clientID = '00665d46bb4f56d42b98',
    clientSecret = '86d483720aa6dedc9c86d1129a995749',
    apiUrl = 'https://api.artsy.net/api/tokens/xapp_token',
    xappToken;

request
  .post(apiUrl)
  .send({ client_id: clientID, client_secret: clientSecret })
  .end(function(err, res) {
    if (err) {
      return console.log('error')
    }
    xappToken = res.body.token;
    getEdgar();
  });

function getEdgar(url) {
  request
    .get('https://api.artsy.net/api/artists/edgar-degas')
    .set('X-Xapp-Token', xappToken)
    .end(function(err, res) {
      if (err) {
        return console.log('error')
      }
      console.log(res.body.name + ' was born in ' + res.body.birthday + ' in ' + res.body.hometown)
    })
}
