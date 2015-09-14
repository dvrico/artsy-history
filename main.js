(function() {
    var app = angular.module('main', []);

    app.controller('PanelController', [function() {
        this.tab = 1
        this.selectTab = function(setTab) {
            this.tab = setTab
        }
        this.isSelected = function(checkTab) {
            return this.tab === checkTab
        }
    }]) // END OF PANEL CONTROLLER

    app.controller('GameController', ['$scope', function($scope) {
        var Artsy = require('./js/artsy.js')
        $scope.categoriesForGameSession = []
        $scope.displayCategoriesSelected = 4
        $scope.whenGameIsReady = false

        var defaultCategoryMessage = 'Oops, something went wrong..'

        $scope.displayCategoryOne = defaultCategoryMessage
        $scope.displayCategoryTwo = defaultCategoryMessage
        $scope.displayCategoryThree = defaultCategoryMessage
        $scope.displayCategoryFour = defaultCategoryMessage

        $scope.selectCategory = function(category) {
            $scope.categoriesForGameSession.push(category)
            $scope.displayCategoriesSelected--
            if (!$scope.displayCategoriesSelected) $scope.whenGameIsReady = true;
        }

        $scope.gameStart = function() {
            var gameRound = new GameSession($scope.categoriesForGameSession)
            getArtsyData(gameRound)

            //correctArtwork.src = 'https://d32dm0rphc51dk.cloudfront.net/yCsq0Uq-rUQ5FuTVM--FPA/large.jpg'
            $scope.displayCategoryOne = gameRound.categoryOne
            $scope.displayCategoryTwo = gameRound.categoryTwo
            $scope.displayCategoryThree = gameRound.categoryThree
            $scope.displayCategoryFour = gameRound.categoryFour

        }

        function getArtsyData(gameRound) {

            // The data-fetching promise blob of doom

            Artsy.requestToken()
                .then(function(xappToken) {
                    // Get Auth-token first
                    //Artsy.xappToken = xappToken
                    return xappToken;
                }).then(function(xappToken) {
                    // Choose a random category and return an array of artists.
                    // Pause and set variables for future reference.

                    var categories = $scope.categoriesForGameSession
                    var fromRoot = 'https://api.artsy.net/api'
                    var toPath = ['gene', 'artists']
                    var choosenCategory = categories[randomItem($scope.categoriesForGameSession)]
                    console.log("choosen category: ", choosenCategory)
                    gameRound.correctCategory = choosenCategory.name

                    Artsy.getArtists(fromRoot, toPath, choosenCategory.id, xappToken)
                        .then(function(arrayOfArtists) {
                            // Pause and set artists to multiple choice variables.

                            console.log("Second then: ", arrayOfArtists)
                            gameRound.artistOne = arrayOfArtists[0].name
                            gameRound.artistTwo = arrayOfArtists[1].name
                            gameRound.artistThree = arrayOfArtists[2].name
                            gameRound.artistFour = arrayOfArtists[3].name
                            return arrayOfArtists;

                        }).then(function(arrayOfArtists) {
                            // Choose a random artist from the group to be the
                            // correct anwser to the current round.

                            var choosenArtist = arrayOfArtists[randomItem(arrayOfArtists)]
                            console.log("Choosen Artist: ", choosenArtist)

                            Artsy.getArtwork(choosenArtist, xappToken)
                                .then(function(artwork) {
                                    // Grab all available artwork from choose artist and
                                    // select a random artwork to be the question.

                                    console.log("From main.js side: ", artwork)
                                    var correctArtwork = document.getElementById('correctArtwork')
                                    // Set other data to variables for info in the round.

                                    gameRound.correctArtworkObject = artwork[0]
                                    gameRound.correctArtworkTitle = gameRound.correctArtworkObject.title
                                    // Set artwork link now rather than later
                                    correctArtwork.src = gameRound.correctArtworkObject._links.thumbnail.href
                                    gameRound.correctArtworkLink = gameRound.correctArtworkObject._links.thumbnail.href

                                    console.log("gameRound: ", gameRound.correctArtworkObject)
                                    console.log("gameRound: ", gameRound.correctArtworkTitle)
                                    console.log("gameRound: ", gameRound.correctArtworkLink)
                                    //console.log(gameRound.correctArtworkLink)
                                    //$scope.updateDisplay(gameRound)

                                    //return gameRound.correctArtworkLink
                                })
                        })
                })

        }

        function randomItem(array) {
            return Math.floor(Math.random() * (array.length))
        }

        $scope.updateDisplay = function(gameRound) {
            $scope.displayCategoryOne = gameRound.artistOne
            $scope.displayCategoryTwo = gameRound.artistTwo
            $scope.displayCategoryThree = gameRound.artistThree
            $scope.displayCategoryFour = gameRound.artistFour
            //console.log("gameRound Object: ", gameRound.artistOne)
            //console.log("display: ", $scope.displayCategoryOne)
            console.log($scope.displayCategoryOne)
            console.log($scope.displayCategoryTwo)
            console.log($scope.displayCategoryThree)
            console.log($scope.displayCategoryFour)
        }

        $scope.categorylib = [
            {
                name: 'Impressionism',
                id: '4d90d191dcdd5f44a500004e',
                description: '',
            },
            {
                name: 'Expressionism',
                id: '53c801277261695ed8c70100',
                description: '',
            },
            {
                name: 'High Renaissance',
                id: '4f26f327dc7f670001000126',
                description: '',
            },
            {
                name: 'Romanticism',
                id: '4d90d192dcdd5f44a500006b',
                description: '',
            }
        ]

    }]) // END OF GAME CONTROLLER



    function GameSession (categories) {
        this.categoryOne = categories[0].name
        this.categoryTwo = categories[1].name
        this.categoryThree = categories[2].name
        this.categoryFour = categories[3].name

        this.correctArtworkObject;
        this.correctArtworkTitle;
        this.correctArtworkLink;
        this.correctArtist;
        this.correctCategory;

        this.artistOne;
        this.artistTwo;
        this.artistThree;
        this.artistFour;
    }

})(); //END OF IIFE
