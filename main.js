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
            $scope.gameRound = new GameSession($scope.categoriesForGameSession)
            getArtsyData($scope.gameRound)

            //correctArtwork.src = 'https://d32dm0rphc51dk.cloudfront.net/yCsq0Uq-rUQ5FuTVM--FPA/large.jpg'
            $scope.displayCategoryOne = $scope.gameRound.categoryOne
            $scope.displayCategoryTwo = $scope.gameRound.categoryTwo
            $scope.displayCategoryThree = $scope.gameRound.categoryThree
            $scope.displayCategoryFour = $scope.gameRound.categoryFour

        }

        function getArtsyData(gameRound) {

            // The data-fetching promise blob of doom

            // (This can become a method of the GameSession Object later on... away from everything else)

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
                    $scope.gameRound.correctCategory = choosenCategory.name

                    Artsy.getArtists(fromRoot, toPath, choosenCategory.id, xappToken)
                        .then(function(arrayOfArtists) {
                            // Pause and set artists to multiple choice variables.

                            console.log("Second then: ", arrayOfArtists)
                            $scope.gameRound.artistOne = arrayOfArtists[0].name
                            $scope.gameRound.artistTwo = arrayOfArtists[1].name
                            $scope.gameRound.artistThree = arrayOfArtists[2].name
                            $scope.gameRound.artistFour = arrayOfArtists[3].name
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

                                    $scope.gameRound.correctArtworkObject = artwork[0]
                                    $scope.gameRound.correctArtworkTitle = $scope.gameRound.correctArtworkObject.title
                                    // Set artwork link now rather than later
                                    correctArtwork.src = $scope.gameRound.correctArtworkObject._links.thumbnail.href
                                    $scope.gameRound.correctArtworkLink = $scope.gameRound.correctArtworkObject._links.thumbnail.href

                                    console.log("gameRound: ", $scope.gameRound.correctArtworkObject)
                                    console.log("gameRound: ", $scope.gameRound.correctArtworkTitle)
                                    console.log("gameRound: ", $scope.gameRound.correctArtworkLink)
                                    //console.log($scope.gameRound.correctArtworkLink)
                                    //$scope.updateDisplay($scope.gameRound)

                                    //return $scope.gameRound.correctArtworkLink
                                })
                        })
                })

        }

        function randomItem(array) {
            return Math.floor(Math.random() * (array.length))
        }

        $scope.updateDisplay = function(gameRound) {
            $scope.displayCategoryOne = $scope.gameRound.artistOne
            $scope.displayCategoryTwo = $scope.gameRound.artistTwo
            $scope.displayCategoryThree = $scope.gameRound.artistThree
            $scope.displayCategoryFour = $scope.gameRound.artistFour
            //console.log("$scope.gameRound Object: ", $scope.gameRound.artistOne)
            //console.log("display: ", $scope.displayCategoryOne)
            console.log($scope.displayCategoryOne)
            console.log($scope.displayCategoryTwo)
            console.log($scope.displayCategoryThree)
            console.log($scope.displayCategoryFour)
        }

        $scope.checkAnswer = function(number) {
            switch (number) {
                case 1:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryOne)
                    break;
                case 2:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryTwo)
                    break;
                case 3:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryThree)
                    break;
                case 4:
                    console.log($scope.gameRound.correctCategory === $scope.displayCategoryFour)
                    break;
                default:
                    console.log('Something went wrong with checkAnswer()')
                    break;
            }
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
