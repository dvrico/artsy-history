var request = require('superagent')
var traverson = require('traverson')
var JsonHalAdapter = require('traverson-hal')

var clientID = '00665d46bb4f56d42b98',
    clientSecret = '86d483720aa6dedc9c86d1129a995749',
    apiUrl = 'https://api.artsy.net/api/tokens/xapp_token',
    xappToken;

var artistArray = []



module.exports = {

    requestToken: function() {
        return new Promise(
            function(resolve, reject) {
                request
                    .post(apiUrl)
                    .send({ client_id: clientID, client_secret: clientSecret })
                    .end(function(err, res) {
                        if (err) {
                            reject()
                        } else {
                            resolve(res.body.token)
                        }
                        //xappToken = res.body.token
                        //console.log(xappToken)
                        //return promise
                    })
            }
        )
    },
    queryForCategory: function(CATEGORY) {
        traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

        var api = traverson
        .from('https://api.artsy.net/api')
        .jsonHal()
        .withRequestOptions({
          headers: {
            'X-Xapp-Token': this.xappToken,
            'Accept': 'application/vnd.artsy-v2+json'
          }
        })

        api
        .newRequest()
        .follow('gene', 'artists')
        .withTemplateParameters({ id: CATEGORY })
        .getResource(function(error, resource) {
            if (error) {
                console.log('Error with the Query!')
            }
            //console.log(resource)
            for (var i=0; i<4; i++) {
                //var placeholder = resource._embedded.artists[Math.floor(Math.random()*5)]
                artistArray.push(resource._embedded.artists[i])
            }
            console.log(artistArray)
            var artistArtworks = artistArray
            //getImagesOfArtists(artistArtworks)
        })
    }
} // END OF ARTSY OBJECT
