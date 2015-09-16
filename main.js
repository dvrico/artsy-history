(function() {
    var app = angular.module('main', []);

    app.controller('GameController', ['$scope', function($scope) {
        //Panel Controller got sucked in by game controller..
        $scope.panelTab = 1
        $scope.panelSelectTab = function(setTab) {
            $scope.panelTab = setTab
        }
        $scope.panelIsSelected = function(checkTab) {
            return $scope.panelTab === checkTab
        }

        $scope.categoriesForGameSession = []
        $scope.displayRound = 0
        $scope.displayScore = 0
        $scope.displayCategoriesSelected = 4
        $scope.whenGameIsReady = false

        var defaultCategoryMessage = 'Oops, something went wrong..'

        $scope.displayCategoryOne = defaultCategoryMessage
        $scope.displayCategoryTwo = defaultCategoryMessage
        $scope.displayCategoryThree = defaultCategoryMessage
        $scope.displayCategoryFour = defaultCategoryMessage

        $scope.displayArtistOne = defaultCategoryMessage
        $scope.displayArtistTwo = defaultCategoryMessage
        $scope.displayArtistThree = defaultCategoryMessage
        $scope.displayArtistFour = defaultCategoryMessage

        $scope.selectCategory = function(category) {
            $scope.categoriesForGameSession.push(category)
            $scope.displayCategoriesSelected--
            if (!$scope.displayCategoriesSelected) $scope.whenGameIsReady = true;
        }

        $scope.newRound = function() {
            $scope.gameRound = new GameSession($scope.categoriesForGameSession)
            $scope.gameRound.getArtsyData($scope.gameRound)
            displayRound()

            // Artsy.requestToken()
            //     //.then(getRandomCategory) // resolves with 1 random category
            //     .then(getArtists)
            //     .then(function(data) {
            //         console.log(data);
            //     }) // 4 artists in this category
            //     //.then(getArtwork) // picks an artist, ensures there is artwork, returns artwork
            //     //.then(display);
            //
            // function getArtists(token) {
            //     var category = $scope.gameRound.randomizer($scope.categoriesForGameSession);
            //     return Artsy.getArtists(token, category).then(function(artists) {
            //         return {
            //             token: token,
            //             category: category,
            //             artists: artists
            //         };
            //     });
            // }
        }

        displayRound = function(gameRound) {
            $scope.displayRound++
            $scope.showSecondSetOfChoices = false

            $scope.displayCategoryOne = $scope.gameRound.categoryOne
            $scope.displayCategoryTwo = $scope.gameRound.categoryTwo
            $scope.displayCategoryThree = $scope.gameRound.categoryThree
            $scope.displayCategoryFour = $scope.gameRound.categoryFour
            $scope.displayArtworkTitle = $scope.gameRound.correctArtworkTitle
        }

        updateDisplay = function(gameRound) {
            $scope.displayArtistOne = $scope.gameRound.artistOne
            $scope.displayArtistTwo = $scope.gameRound.artistTwo
            $scope.displayArtistThree = $scope.gameRound.artistThree
            $scope.displayArtistFour = $scope.gameRound.artistFour
        }

        $scope.checkFirstSet = function(number) {
            switch (number) {
                case 1:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryOne)
                    if($scope.gameRound.correctCategory === $scope.displayCategoryOne) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.gameRound)
                    }
                    break;
                case 2:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryTwo)
                    if($scope.gameRound.correctCategory === $scope.displayCategoryTwo) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.gameRound)
                    }
                    break;
                case 3:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryThree)
                    if($scope.gameRound.correctCategory === $scope.displayCategoryThree) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.gameRound)
                    }
                    break;
                case 4:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryFour)
                    if($scope.gameRound.correctCategory === $scope.displayCategoryFour) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.gameRound)
                    }
                    break;
                default:
                    console.log('Something went wrong with checkFirstSet()')
                    break;
            }
        }

        $scope.checkSecondSet = function(number) {
            switch (number) {
                case 1:
                    console.log($scope.gameRound.correctArtist === $scope.displayArtistOne)
                    if($scope.gameRound.correctArtist === $scope.displayArtistOne) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    }
                    break;
                case 2:
                    console.log($scope.gameRound.correctArtist === $scope.displayArtistTwo)
                    if($scope.gameRound.correctArtist === $scope.displayArtistTwo) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    }
                    break;
                case 3:
                    console.log($scope.gameRound.correctArtist === $scope.displayArtistThree)
                    if($scope.gameRound.correctArtist === $scope.displayArtistThree) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    }
                    break;
                case 4:
                    console.log($scope.gameRound.correctArtist === $scope.displayArtistFour)
                    if($scope.gameRound.correctArtist === $scope.displayArtistFour) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    }
                    break;
                default:
                    console.log('Something went wrong with checkSecondSet()')
                    break;
            }
        }

        function checkGameRounds() {
            if ($scope.displayRound >= 3) {
                endGame()
            } else {
                $scope.newRound()
            }
        }

        function endGame() {
            $scope.panelTab = 4
        }

        // This is probably go into its own file once the lib gets bigger.
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

    var Artsy = require('./js/artsy.js')

    function GameSession (categories) {
        this.allCategories = categories
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

    GameSession.prototype.randomizer = function(array) {
        var randomNumber = Math.floor(Math.random() * (array.length))
        return array[randomNumber]
    }

    GameSession.prototype.getArtsyData = function(gameRound) {

        // The data-fetching promise blob of doom

        return Artsy.requestToken()
                .then(function(xappToken) {
                    // Choose a random category and return an array of artists.
                    // Pause and set variables for future reference.
                    console.log('O HAI, UR TOKEN IZ GUD')

                    var fromRoot = 'https://api.artsy.net/api'
                    var toPath = ['gene', 'artists']
                    var choosenCategory = gameRound.randomizer(gameRound.allCategories)
                    gameRound.correctCategory = choosenCategory.name
                    console.log("choosen category: ", gameRound.correctCategory)

                    return Artsy.getArtists(fromRoot, toPath, choosenCategory.id, xappToken)
                            .then(function(arrayOfArtists) {
                                // Pause and set artists to multiple choice variables.
                                //console.log("Second then: ", arrayOfArtists)
                                gameRound.artistOne = arrayOfArtists[0].name
                                gameRound.artistTwo = arrayOfArtists[1].name
                                gameRound.artistThree = arrayOfArtists[2].name
                                gameRound.artistFour = arrayOfArtists[3].name
                                console.log('GOTZ ARTISTZ, NOW LOOK FUR ARTZ')
                                return findArtworkForChoosenArtist(arrayOfArtists, xappToken, gameRound)
                            })
                })
    }



    function findArtworkForChoosenArtist(arrayOfArtists, xappToken, gameRound) {
        var choosenArtist = gameRound.randomizer(arrayOfArtists)
        //console.log(choosenArtist)
        return Artsy.getArtwork(choosenArtist, xappToken)
                .then(function(artwork) {
                    if(artwork.length > 0) {
                        assignDataToVariables(choosenArtist, artwork, gameRound)
                    } else {
                        console.log("FOUNDZ NO ARTZ, TRYIN AGAIN.")
                        return findArtworkForChoosenArtist(arrayOfArtists, xappToken, gameRound)
                    }
                })
    }

    function assignDataToVariables(choosenArtist, artwork, gameRound) {
        console.log("HAZ ARTWORKZ. STOP DA RECURSEZ.")
        //console.log("choosen artist artwork: ", artwork)
        var correctArtwork = document.getElementById('correctArtwork')

        // Set data for the current game round
        gameRound.correctArtworkObject = gameRound.randomizer(artwork)
        gameRound.correctArtworkTitle = gameRound.correctArtworkObject.title
        console.log("title: ", gameRound.correctArtworkTitle)
        gameRound.correctArtist = choosenArtist.name
        console.log('correct artist: ', gameRound.correctArtist)
        correctArtwork.src = gameRound.correctArtworkObject._links.thumbnail.href.replace(/medium/g, 'large')
        gameRound.correctArtworkLink = gameRound.correctArtworkObject._links.thumbnail.href
        console.log("gameRound: ", correctArtwork.src)
        return displayRound
    }

})(); //END OF IIFE
