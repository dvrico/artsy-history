var request = require('superagent')
var traverson = require('traverson')
var JsonHalAdapter = require('traverson-hal')

var clientID = '00665d46bb4f56d42b98',
    clientSecret = '86d483720aa6dedc9c86d1129a995749',
    apiUrl = 'https://api.artsy.net/api/tokens/xapp_token',
    xappToken

var degas, degasArtwork;
var elDegasBio = document.getElementById('artistBio')
var elDegasLink = document.getElementById('artistLink')
var elDegasArt = document.getElementById('artistImage')

request
    .post(apiUrl)
    .send({ client_id: clientID, client_secret: clientSecret })
    .end(function(err, res) {
        if (err) {
          console.log('error')
        }
        xappToken = res.body.token
        console.log(xappToken)

        getDegas()
    })

var getDegas = function() {
    traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

    var api = traverson
    .from('https://api.artsy.net/api')
    .jsonHal()
    .withRequestOptions({
      headers: {
        'X-Xapp-Token': xappToken,
        'Accept': 'application/vnd.artsy-v2+json'
      }
    })

    api
    .newRequest()
    .follow('artist')
    .withTemplateParameters({ id: '4dadd2177129f05924000c68' })
    .getResource(function(error, edgarDegas) {
        if (error) {
            console.log('error!')
        }
        console.log(edgarDegas)
        degas = edgarDegas.name + ' | ' + 'Birthday: ' + edgarDegas.birthday + ' | ' + 'Hometown: ' + edgarDegas.hometown + ' | ' + 'Nationality: ' + edgarDegas.nationality;
        var artwork = edgarDegas._links.artworks.href
        getDegasArtwork(artwork)
    });
}

var getDegasArtwork = function(artwork) {
    traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

    traverson
    .from(artwork)
    .jsonHal()
    .withRequestOptions({
        headers: {
            'X-Xapp-Token': xappToken,
            'Accept': 'application/vnd.artsy-v2+json'
        }
    })
    .getResource(function(error, allArtwork) {
        if (error) {
            console.log('another error..')
        }
        console.log(allArtwork)
        console.log(allArtwork._embedded.artworks[3].title)
        degasArtwork = allArtwork._embedded.artworks[3].title;
        degasTheDanceLesson = allArtwork._embedded.artworks[3]._links.thumbnail.href
        displayDegas()
    })
}

var displayDegas = function() {
    elDegasBio.innerHTML = degas
    elDegasLink.innerHTML = degasArtwork
    //degasTheDanceLesson = "https://d32dm0rphc51dk.cloudfront.net/W3vatICkbl1aYyGGuHdt8g/large.jpg"
    elDegasArt.src=degasTheDanceLesson
}
