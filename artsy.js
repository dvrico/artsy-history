var request = require('superagent')
var traverson = require('traverson')
var JsonHalAdapter = require('traverson-hal')

var clientID = '00665d46bb4f56d42b98',
    clientSecret = '86d483720aa6dedc9c86d1129a995749',
    apiUrl = 'https://api.artsy.net/api/tokens/xapp_token'

var artistArray = []

module.exports = {
    xappToken: '',

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
                    })
            }
        )
    },
    queryForCategory: function(START, PATH, CATEGORY) {
        traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

        var api = traverson
        .from(START)
        .jsonHal()
        .withRequestOptions({
          headers: {
            'X-Xapp-Token': this.xappToken,
            'Accept': 'application/vnd.artsy-v2+json'
          }
        })

        api
        .newRequest()
        .follow(PATH)
        .withTemplateParameters({ id: CATEGORY })
        .getResource(function(error, resource) {
            if (error) {
                console.log('Error with the Query!')
            }
            for (var i=0; i<4; i++) {
                artistArray.push(resource._embedded.artists[i])
            }
            console.log(artistArray)
            var artistArtworks = artistArray
            //getImagesOfArtists(artistArtworks)
        })
    }
} // END OF ARTSY OBJECT
