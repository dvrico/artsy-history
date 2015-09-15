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

        $scope.panelTab = 1
        $scope.panelSelectTab = function(setTab) {
            $scope.panelTab = setTab
        }
        $scope.panelIsSelected = function(checkTab) {
            return $scope.panelTab === checkTab
        }

        $scope.categoriesForGameSession = []
        $scope.displayRound = 0
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
            displayRound($scope.gameRound)
        }

        displayRound =  function(gameRound) {
            $scope.displayRound++
            $scope.showSecondSetOfChoices = false

            $scope.displayCategoryOne = $scope.gameRound.categoryOne
            $scope.displayCategoryTwo = $scope.gameRound.categoryTwo
            $scope.displayCategoryThree = $scope.gameRound.categoryThree
            $scope.displayCategoryFour = $scope.gameRound.categoryFour
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
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.gameRound)
                    }
                    break;
                case 2:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryTwo)
                    if($scope.gameRound.correctCategory === $scope.displayCategoryTwo) {
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.gameRound)
                    }
                    break;
                case 3:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryThree)
                    if($scope.gameRound.correctCategory === $scope.displayCategoryThree) {
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.gameRound)
                    }
                    break;
                case 4:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryFour)
                    if($scope.gameRound.correctCategory === $scope.displayCategoryFour) {
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
                        checkGameRounds()
                    }
                    break;
                case 2:
                    console.log($scope.gameRound.correctArtist === $scope.displayArtistTwo)
                    if($scope.gameRound.correctArtist === $scope.displayArtistTwo) {
                        checkGameRounds()
                    }
                    break;
                case 3:
                    console.log($scope.gameRound.correctArtist === $scope.displayArtistThree)
                    if($scope.gameRound.correctArtist === $scope.displayArtistThree) {
                        checkGameRounds()
                    }
                    break;
                case 4:
                    console.log($scope.gameRound.correctArtist === $scope.displayArtistFour)
                    if($scope.gameRound.correctArtist === $scope.displayArtistFour) {
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
        return Math.floor(Math.random() * (array.length))
    }

    GameSession.prototype.getArtsyData = function(gameRound) {

        // The data-fetching promise blob of doom

        Artsy.requestToken()
            .then(function(xappToken) {
                // Get Auth-token first
                return xappToken;
            }).then(function(xappToken) {
                // Choose a random category and return an array of artists.
                // Pause and set variables for future reference.

                var fromRoot = 'https://api.artsy.net/api'
                var toPath = ['gene', 'artists']
                var choosenCategory = gameRound.allCategories[gameRound.randomizer(gameRound.allCategories)]
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

                        var choosenArtist = arrayOfArtists[gameRound.randomizer(arrayOfArtists)]
                        console.log("Choosen Artist: ", choosenArtist)
                        gameRound.correctArtist = choosenArtist.name
                        console.log('correct artist: ', gameRound.correctArtist)

                        Artsy.getArtwork(choosenArtist, xappToken)
                            .then(function(artwork) {
                                // Grab all available artwork from choose artist and
                                // select a random artwork to be the question.

                                console.log("choosen artist artwork: ", artwork)
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
                                //console.log($scope.gameRound.correctArtworkLink)
                                //updateDisplay($scope.gameRound)

                                //return $scope.gameRound.correctArtworkLink
                            })
                    })
            })

    }
})(); //END OF IIFE
