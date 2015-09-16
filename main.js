(function() {
    var app = angular.module('main', []);
    var Artsy = require('./js/artsy.js')

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

        $scope.selectCategory = function(category) {
            $scope.categoriesForGameSession.push(category)
            $scope.displayCategoriesSelected--
            if (!$scope.displayCategoriesSelected) $scope.whenGameIsReady = true;
        }

        $scope.nextRound = function() {
            $scope.panelSelectTab(3)  //Putting this in the HTML along with newRound() causes a bug where the game sometimes won't run (div/button issue)
            //resetDisplay()
            $scope.newRound = new GameSession($scope.categoriesForGameSession)
            var choosenCategory = getRandomCategory($scope.newRound.allCategories)
            getArtsyData(choosenCategory)
                .then(function(data) {
                    assignNewRound(data)
                    displayRound()
                })
            //displayRound()

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
            //     var category = $scope.newRound.randomizer($scope.categoriesForGameSession);
            //     return Artsy.getArtists(token, category).then(function(artists) {
            //         return {
            //             token: token,
            //             category: category,
            //             artists: artists
            //         };
            //     });
            // }
        }

        function getArtsyData(choosenCategory) {
            var fromRoot = 'https://api.artsy.net/api'
            var toPath = ['gene', 'artists']
            var data = []

            return Artsy.requestToken()
                    .then(function(xappToken) {
                        return Artsy.getArtists(fromRoot, toPath, choosenCategory.id, xappToken)
                            .then(function(arrayOfArtists) {
                                data.push(arrayOfArtists)
                                return findArtworkForChoosenArtist(arrayOfArtists, xappToken, data)
                            })
                    })

                        // console.log('O HAI, UR TOKEN IZ GUD')
                        // return Artsy.getArtists(fromRoot, toPath, choosenCategory.id, xappToken)
                        //         .then(function(arrayOfArtists) {
                        //             // Pause and set artists to multiple choice variables.
                        //             //console.log("Second then: ", arrayOfArtists)
                        //             newRound.artistOne = arrayOfArtists[0].name
                        //             newRound.artistTwo = arrayOfArtists[1].name
                        //             newRound.artistThree = arrayOfArtists[2].name
                        //             newRound.artistFour = arrayOfArtists[3].name
                        //             console.log('GOTZ ARTISTZ, NOW LOOK FUR ARTZ')
                        //             return findArtworkForChoosenArtist(arrayOfArtists, xappToken, newRound)
                        //         })
                    //})
        }

        function findArtworkForChoosenArtist(arrayOfArtists, xappToken, data) {
            var choosenArtist = randomizer(arrayOfArtists)
            return Artsy.getArtwork(choosenArtist, xappToken)
                    .then(function(artwork) {
                        if(artwork.length > 0) {
                            console.log("HAZ ARTWORKZ. STOP DA RECURSEZ.")
                            data.push(choosenArtist, artwork)
                            return data
                        } else {
                            console.log("FOUNDZ NO ARTZ, TRYIN AGAIN.")
                            return findArtworkForChoosenArtist(arrayOfArtists, xappToken, data)
                        }
                    })
        }

        function assignNewRound(data) {
            // data consists of [ArrayOfArtists, correctArtist Object, correctArtist's artworkObject]

            $scope.newRound.artistOne = data[0][0].name
            $scope.newRound.artistTwo = data[0][1].name
            $scope.newRound.artistThree = data[0][2].name
            $scope.newRound.artistFour = data[0][3].name

            $scope.newRound.correctArtist = data[1].name

            $scope.newRound.correctArtworkObject = randomizer(data[2])
            $scope.newRound.correctArtworkTitle = $scope.newRound.correctArtworkObject.title

            var correctArtwork = document.getElementById('correctArtwork')
            correctArtwork.src = $scope.newRound.correctArtworkObject._links.thumbnail.href.replace(/medium/g, 'large')
            $scope.newRound.correctArtworkLink = $scope.newRound.correctArtworkObject._links.thumbnail.href

            console.log("title: ", $scope.newRound.correctArtworkTitle)
            console.log('correct artist: ', $scope.newRound.correctArtist)
            console.log("newRound: ", correctArtwork.src)
            console.log("ALL IZ DONE")
        }

        function getRandomCategory(categories) {
            var randomCategory = randomizer(categories)
            $scope.newRound.correctCategory = randomCategory.name
            console.log('Correct Category: ', $scope.newRound.correctCategory)
            return randomCategory
        }

        function randomizer(array) {
            var randomNumber = Math.floor(Math.random() * (array.length))
            return array[randomNumber]
        }

        function resetDisplay() {
            $scope.displayCategoryOne = defaultCategoryMessage
            $scope.displayCategoryTwo = defaultCategoryMessage
            $scope.displayCategoryThree = defaultCategoryMessage
            $scope.displayCategoryFour = defaultCategoryMessage

            $scope.displayArtistOne = defaultCategoryMessage
            $scope.displayArtistTwo = defaultCategoryMessage
            $scope.displayArtistThree = defaultCategoryMessage
            $scope.displayArtistFour = defaultCategoryMessage
        }

        function displayRound(newRound) {
            $scope.displayRound++
            $scope.showSecondSetOfChoices = false

            $scope.displayCategoryOne = $scope.newRound.categoryOne
            $scope.displayCategoryTwo = $scope.newRound.categoryTwo
            $scope.displayCategoryThree = $scope.newRound.categoryThree
            $scope.displayCategoryFour = $scope.newRound.categoryFour
            $scope.displayArtworkTitle = $scope.newRound.correctArtworkTitle
        }

        function updateDisplay(newRound) {
            $scope.displayArtistOne = $scope.newRound.artistOne
            $scope.displayArtistTwo = $scope.newRound.artistTwo
            $scope.displayArtistThree = $scope.newRound.artistThree
            $scope.displayArtistFour = $scope.newRound.artistFour
        }

        $scope.checkFirstSet = function(number) {
            //Refactor Note: Just use the if-check with the display passed as an argument. No need for switch.
            switch (number) {
                case 1:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryOne)
                    if($scope.newRound.correctCategory === $scope.displayCategoryOne) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
                    }
                    break;
                case 2:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryTwo)
                    if($scope.newRound.correctCategory === $scope.displayCategoryTwo) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
                    }
                    break;
                case 3:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryThree)
                    if($scope.newRound.correctCategory === $scope.displayCategoryThree) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
                    }
                    break;
                case 4:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryFour)
                    if($scope.newRound.correctCategory === $scope.displayCategoryFour) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
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
                    console.log($scope.newRound.correctArtist === $scope.displayArtistOne)
                    if($scope.newRound.correctArtist === $scope.displayArtistOne) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    }
                    break;
                case 2:
                    console.log($scope.newRound.correctArtist === $scope.displayArtistTwo)
                    if($scope.newRound.correctArtist === $scope.displayArtistTwo) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    }
                    break;
                case 3:
                    console.log($scope.newRound.correctArtist === $scope.displayArtistThree)
                    if($scope.newRound.correctArtist === $scope.displayArtistThree) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    }
                    break;
                case 4:
                    console.log($scope.newRound.correctArtist === $scope.displayArtistFour)
                    if($scope.newRound.correctArtist === $scope.displayArtistFour) {
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
                console.log('Make new round?')
                $scope.nextRound()
            }
        }

        function endGame() {
            $scope.panelTab = 4
        }

        // This should probably go into its own file once the lib gets bigger.
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

    GameSession.prototype.getArtsyData = function(newRound) {

        // The data-fetching promise blob of doom

        return Artsy.requestToken()
                .then(function(xappToken) {
                    // Choose a random category and return an array of artists.
                    // Pause and set variables for future reference.
                    console.log('O HAI, UR TOKEN IZ GUD')

                    var fromRoot = 'https://api.artsy.net/api'
                    var toPath = ['gene', 'artists']

                    return Artsy.getArtists(fromRoot, toPath, choosenCategory.id, xappToken)
                            .then(function(arrayOfArtists) {
                                // Pause and set artists to multiple choice variables.
                                //console.log("Second then: ", arrayOfArtists)
                                newRound.artistOne = arrayOfArtists[0].name
                                newRound.artistTwo = arrayOfArtists[1].name
                                newRound.artistThree = arrayOfArtists[2].name
                                newRound.artistFour = arrayOfArtists[3].name
                                console.log('GOTZ ARTISTZ, NOW LOOK FUR ARTZ')
                                return findArtworkForChoosenArtist(arrayOfArtists, xappToken, newRound)
                            })
                })
    }



    // function findArtworkForChoosenArtist(arrayOfArtists, xappToken, newRound) {
    //     var choosenArtist = newRound.randomizer(arrayOfArtists)
    //     //console.log(choosenArtist)
    //     return Artsy.getArtwork(choosenArtist, xappToken)
    //             .then(function(artwork) {
    //                 if(artwork.length > 0) {
    //                     assignDataToNewRound(choosenArtist, artwork, newRound)
    //                 } else {
    //                     console.log("FOUNDZ NO ARTZ, TRYIN AGAIN.")
    //                     return findArtworkForChoosenArtist(arrayOfArtists, xappToken, newRound)
    //                 }
    //             })
    // }
    //
    // function assignDataToNewRound(choosenArtist, artwork, newRound) {
    //     console.log("HAZ ARTWORKZ. STOP DA RECURSEZ.")
    //     //console.log("choosen artist artwork: ", artwork)
    //     var correctArtwork = document.getElementById('correctArtwork')
    //
    //     // Set data for the current game round
    //     newRound.correctArtworkObject = newRound.randomizer(artwork)
    //     newRound.correctArtworkTitle = newRound.correctArtworkObject.title
    //     console.log("title: ", newRound.correctArtworkTitle)
    //     newRound.correctArtist = choosenArtist.name
    //     console.log('correct artist: ', newRound.correctArtist)
    //     correctArtwork.src = newRound.correctArtworkObject._links.thumbnail.href.replace(/medium/g, 'large')
    //     newRound.correctArtworkLink = newRound.correctArtworkObject._links.thumbnail.href
    //     console.log("newRound: ", correctArtwork.src)
    //     //return displayRound
    // }

})(); //END OF IIFE
