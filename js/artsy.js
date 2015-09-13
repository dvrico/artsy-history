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
            this.artistArtworks = artistArray
        })
    },
    getArtwork: function(artistArtworks) {
        return new Promise (function(resolve, reject) {
            traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)
            console.log(artistArtworks.length)
            for(var i=0; i < artistArtworks.length; i++) {

                console.log(artistArtworks.length)
                traverson
                .from(artistArtworks[i]._links.artworks.href)
                .jsonHal()
                .withRequestOptions({
                    headers: {
                        'X-Xapp-Token': this.xappToken,
                        'Accept': 'application/vnd.artsy-v2+json'
                    }
                })
                .getResource(function(error, artworks) {
                    if (error) {
                        console.log('another error..')
                        reject()
                    } else {
                        if(artworks._embedded.artworks.length > 0) {
                            console.log(artworks)
                            this.artworkArray.push(artworks._embedded.artworks[0]._links.thumbnail.href)
                        }
                        if(this.artworkArray.length >= 2) {
                            //getDegas()
                            resolve(this.artworkArray)
                        }
                    }
                })
            }
        })
    }
} // END OF ARTSY OBJECT
