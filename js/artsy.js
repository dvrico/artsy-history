var request = require('superagent')
var traverson = require('traverson')
var JsonHalAdapter = require('traverson-hal')

var clientID = '00665d46bb4f56d42b98',
    clientSecret = '86d483720aa6dedc9c86d1129a995749',
    apiUrl = 'https://api.artsy.net/api/tokens/xapp_token'

var artistArray = []

module.exports = {
    xappToken: '',
    artistArtworks: [],
    artworkArray: [],
    //artistArray: [],        // This was outside module.exports before testing.

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
                            //console.log(res.body)
                            resolve(res.body.token)
                        }
                    })
            }
        )
    },
    getArtists: function(START, PATH, CATEGORY, TOKEN) {
        traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

        return new Promise(
            function(resolve, reject) {
                var api = traverson
                    .from(START)
                    .jsonHal()
                    .withRequestOptions({
                        headers: {
                            'X-Xapp-Token': TOKEN,
                            'Accept': 'application/vnd.artsy-v2+json'
                        }
                    })

                api
                .newRequest()
                .follow(PATH)
                .withTemplateParameters({ id: CATEGORY })
                .getResource(function(error, resource) {
                    if (error) {
                        reject()
                    }
                    console.log("Choosen Category: ", resource)
                    for (var i=0; i < resource._embedded.artists.length; i++) {
                        artistArray.push(resource._embedded.artists[i])
                    }
                    resolve(artistArray)
                    //console.log(artistArray)
                    //this.artistArtworks = artistArray
                })
            }
        )
    },
    getArtwork: function(ARTIST, TOKEN) {
        traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

        return new Promise (function(resolve, reject) {
            traverson
            .from(ARTIST._links.artworks.href)
            .jsonHal()
            .withRequestOptions({
                headers: {
                    'X-Xapp-Token': TOKEN,
                    'Accept': 'application/vnd.artsy-v2+json'
                }
            })
            .getResource(function(error, resource) {
                if (error) {
                    console.log('another error..')
                    reject()
                } else {
                    //console.log(resource)
                    resolve(resource._embedded.artworks)
                }
            })
        })
    }
} // END OF ARTSY OBJECT
