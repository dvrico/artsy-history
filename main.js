'use strict';

var Artsy = require('./js/artsy.js');

var degas, degasArtwork;
var degasTheDanceLesson;
var elDegasBio = document.getElementById('artistBio');
var elDegasLink = document.getElementById('artistLink');
var elDegasArt = document.getElementById('artistImage');

var elfirstArtist = document.getElementById('firstArtist');
var elfirstImage = document.getElementById('firstImage');
var firstArtistArtwork;

var elsecondArtist = document.getElementById('secondArtist');
var elsecondImage = document.getElementById('secondImage');

var elthirdArtist = document.getElementById('thirdArtist');
var elthirdImage = document.getElementById('thirdImage');

var elfourthArtist = document.getElementById('fourthArtist');
var elfourthImage = document.getElementById('fourthImage');

var impressionism = '4d90d191dcdd5f44a500004e';

var fromRoot = 'https://api.artsy.net/api'
var toPath = ['gene', 'artists']

var impressionismDescription;

var artworkArray = []
//var artistArray = []
//var xappToken;

Artsy.requestToken()
    .then(function(xappToken) {
        console.log(xappToken)
        Artsy.xappToken = xappToken
        Artsy.queryForCategory(fromRoot, toPath, impressionism)
        getArtworksFromArtists()
    })

var getArtworksFromArtists = function() {
    Artsy.getArtwork(Artsy.artistArtworks)
        .then(function(artwork) {
            artworkArray = artwork
        })
}



// var getDegas = function() {
//     traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)
//
//     var api = traverson
//     .from('https://api.artsy.net/api')
//     .jsonHal()
//     .withRequestOptions({
//         headers: {
//             'X-Xapp-Token': xappToken,
//             'Accept': 'application/vnd.artsy-v2+json'
//         }
//     })
//
//     api
//     .newRequest()
//     .follow('artist')
//     .withTemplateParameters({ id: '4dadd2177129f05924000c68' })
//     .getResource(function(error, edgarDegas) {
//         if (error) {
//             console.log('error!')
//         }
//         console.log(edgarDegas)
//         degas = edgarDegas.name + ' | ' + 'Birthday: ' + edgarDegas.birthday + ' | ' + 'Hometown: ' + edgarDegas.hometown + ' | ' + 'Nationality: ' + edgarDegas.nationality;
//         var artwork = edgarDegas._links.artworks.href
//         getDegasArtwork(artwork)
//     });
// }
//
// var getDegasArtwork = function(artwork) {
//     traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)
//
//     traverson
//     .from(artwork)
//     .jsonHal()
//     .withRequestOptions({
//         headers: {
//             'X-Xapp-Token': xappToken,
//             'Accept': 'application/vnd.artsy-v2+json'
//         }
//     })
//     .getResource(function(error, allArtwork) {
//         if (error) {
//             console.log('another error..')
//         }
//         //console.log(allArtwork)
//         console.log(allArtwork._embedded.artworks[3].title)
//         degasArtwork = allArtwork._embedded.artworks[3].title;
//         degasTheDanceLesson = allArtwork._embedded.artworks[3]._links.thumbnail.href
//         displayDegas()
//     })
// }
//
// var displayDegas = function() {
//     elDegasBio.innerHTML = degas
//     elDegasLink.innerHTML = degasArtwork
//     elDegasArt.src=degasTheDanceLesson
//
//     elfirstArtist.innerHTML = artistArray[0].name
//     elfirstImage.src=artworkArray[0]
//
//     elsecondArtist.innerHTML = artistArray[1].name
//     elsecondImage.src=artworkArray[1]
//
//     elthirdArtist.innerHTML = artistArray[2].name
//     //elthirdImage.src=artworkArray[2]  // This artist does not have artwork
//
//     elfourthArtist.innerHTML = artistArray[3].name
//     //elfourthImage.src=artworkArray[3]  //This artist does not have artwork
// }
