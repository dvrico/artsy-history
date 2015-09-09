var request = require('superagent')
var traverson = require('traverson')
var JsonHalAdapter = require('traverson-hal')

var clientID = '00665d46bb4f56d42b98',
    clientSecret = '86d483720aa6dedc9c86d1129a995749',
    apiUrl = 'https://api.artsy.net/api/tokens/xapp_token',
    xappToken

var degas, degasArtwork;
var degasTheDanceLesson;
var elDegasBio = document.getElementById('artistBio')
var elDegasLink = document.getElementById('artistLink')
var elDegasArt = document.getElementById('artistImage')

var elfirstArtist = document.getElementById('firstArtist')
var elfirstImage = document.getElementById('firstImage')

var elsecondArtist = document.getElementById('secondArtist')
var elsecondImage = document.getElementById('secondImage')

var elthirdArtist = document.getElementById('thirdArtist')
var elthirdImage = document.getElementById('thirdImage')

var elfourthArtist = document.getElementById('fourthArtist')
var elfourthImage = document.getElementById('fourthImage')

var impressionism = '4d90d191dcdd5f44a500004e'
var impressionismDescription;
var artistArray = []

request
    .post(apiUrl)
    .send({ client_id: clientID, client_secret: clientSecret })
    .end(function(err, res) {
        if (err) {
          console.log('error')
        }
        xappToken = res.body.token
        console.log(xappToken)

        query()
    })

var query = function() {
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
    .follow('gene', 'artists')
    .withTemplateParameters({ id: impressionism })
    .getResource(function(error, query) {
        if (error) {
            console.log('Error with the Query!')
        }
        //console.log(query)
        for (var i=0; i<4; i++) {
            //var placeholder = query._embedded.artists[Math.floor(Math.random()*5)]
            artistArray.push(query._embedded.artists[i])
        }
        console.log(artistArray)
        getDegas()
    })
}

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
        //console.log(allArtwork)
        console.log(allArtwork._embedded.artworks[3].title)
        degasArtwork = allArtwork._embedded.artworks[3].title;
        degasTheDanceLesson = allArtwork._embedded.artworks[3]._links.thumbnail.href
        displayDegas()
    })
}

var displayDegas = function() {
    elDegasBio.innerHTML = degas
    elDegasLink.innerHTML = degasArtwork
    elDegasArt.src=degasTheDanceLesson

    elfirstArtist.innerHTML = '<p>' + artistArray[0].name + '</p>'
    // elfirstImage.src=

    elsecondArtist.innerHTML = '<p>' + artistArray[1].name + '</p>'
    // elfirstImage.src=

    elthirdArtist.innerHTML = '<p>' + artistArray[2].name + '</p>'
    // elfirstImage.src=

    elfourthArtist.innerHTML = '<p>' + artistArray[3].name + '</p>'
    // elfirstImage.src=
}