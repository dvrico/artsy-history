var Artsy = require('./artsy.js')

var Round = function() {
    this.artwork
    this.artistOne
    this.artistTwo
    this.artistThree
    this.artistFour

    this.artistArray = []
}

Round.prototype.fillInArtists = function(CATEGORY) {
    this.artistArray = Artsy.queryForCategory(fromRoot, toPath, category)

    this.artistOne = artistArray[0]
    this.artistTwo = artistArray[1]
    this.artistThree = artistArray[2]
    this.artistFour = artistArray[3]
}

Round.prototype.correctAnswer = function(array) {
    // array is this.artistArray
    return Math.floor(Math.random() * (array.length + 1))
}

Round.prototype.fillInArtworkFor = function(correctArtist) {
    // calling this function will look like this: fillInArtworkFor(correctAnswer)
    this.artwork = Artsy.getArtwork(correctArtist)
}
