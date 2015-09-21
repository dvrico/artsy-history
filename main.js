(function() {
    var app = angular.module('main', []);
    var Artsy = require('./js/artsy.js')
    var Categories = require('./js/categories.js')

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
        $scope.displayRoundNumber = 0
        $scope.displayScore = 0
        $scope.displayCategoriesSelected = 4
        $scope.whenGameIsReady = false

        var defaultCategoryMessage = 'Oops, something went wrong..'

        $scope.selectCategory = function(categoryNum) {
            $scope.categoriesForGameSession.push(Categories.lib[categoryNum])
            $scope.displayCategoriesSelected--
            if (!$scope.displayCategoriesSelected) $scope.whenGameIsReady = true;
        }

        $scope.nextRound = function() {
            $scope.panelSelectTab(3)  //Putting this in the HTML along with newRound() causes a bug where the game sometimes won't run (div/button issue)
            $scope.newRound = new GameSession($scope.categoriesForGameSession)
            var choosenCategory = getRandomCategory($scope.newRound.allCategories)
            getArtsyData(choosenCategory)
                .then(function(data) {
                    $scope.$apply(function(){
                        assignNewRound(data)
                        $scope.displayRound()
                    })
                })
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
            console.log(data)
            $scope.newRound.correctArtist = data[1].name

            $scope.newRound.correctArtworkObject = randomizer(data[2])
            $scope.newRound.correctArtworkTitle = $scope.newRound.correctArtworkObject.title

            var correctArtwork = document.getElementById('correctArtwork')
            correctArtwork.src = $scope.newRound.correctArtworkObject._links.thumbnail.href.replace(/medium/g, 'large')
            $scope.newRound.correctArtworkLink = $scope.newRound.correctArtworkObject._links.thumbnail.href

            setMultipleChoice(data[0])

            console.log("title: ", $scope.newRound.correctArtworkTitle)
            console.log('correct artist: ', $scope.newRound.correctArtist)
            console.log("newRound: ", correctArtwork.src)
            console.log("ALL IZ DONE")
        }

        function setMultipleChoice(arrayOfArtists) {

            var randomArtists = []
            // First find the correct artist for the answer and push them to the array
            for (var i = 0; i < arrayOfArtists.length; i++) {
                if ($scope.newRound.correctArtist === arrayOfArtists[i].name) {
                    randomArtists.push(arrayOfArtists[i].name)
                    arrayOfArtists.splice(i, 1)
                }
            }
            // Then randomly choose 3 more artists and push them to the array
            for (var counter = 1; counter < 4; counter++) {
                    var n = randomizer(arrayOfArtists, true)
                    randomArtists.push(arrayOfArtists[n].name)
                    arrayOfArtists.splice(n, 1)
            }
            // Finally assign newRound keys to the items in the array randomly
            var random = shuffle(randomArtists)
            $scope.newRound.artistOne = random[0]
            $scope.newRound.artistTwo = random[1]
            $scope.newRound.artistThree = random[2]
            $scope.newRound.artistFour = random[3]
        }

        function shuffle(array) {
            var arr = []
            array.reverse()
            var x = array.splice(randomizer(array, true), 1)
            var y = array.splice(randomizer(array, true), 1)
            arr = array.concat(x).concat(y)
            return arr
        }

        function getRandomCategory(categories) {
            var randomCategory = randomizer(categories)
            $scope.newRound.correctCategory = randomCategory.name
            console.log('Correct Category: ', $scope.newRound.correctCategory)
            return randomCategory
        }

        function randomizer(array, needNumber) {
            var randomNumber = Math.floor(Math.random() * (array.length))
            if (needNumber) {
                return randomNumber
            } else {
                return array[randomNumber]
            }
        }

        $scope.displayRound = function(newRound) {
            $scope.displayRoundNumber++
            $scope.showSecondSetOfChoices = false

            $scope.displayCategoryOne = $scope.newRound.categoryOne
            $scope.displayCategoryTwo = $scope.newRound.categoryTwo
            $scope.displayCategoryThree = $scope.newRound.categoryThree
            $scope.displayCategoryFour = $scope.newRound.categoryFour
            $scope.displayArtworkTitle = $scope.newRound.correctArtworkTitle
        }

        function updateDisplay() {
            $scope.displayArtistOne = $scope.newRound.artistOne
            $scope.displayArtistTwo = $scope.newRound.artistTwo
            $scope.displayArtistThree = $scope.newRound.artistThree
            $scope.displayArtistFour = $scope.newRound.artistFour
        }

        $scope.checkFirstSet = function(number) {
            //Refactor Note: Just use the if-check with the display passed as an argument. No need for switch.
            // console.log(choice === $scope.newRound.correctCategory)
            // console.log(choice)
            // if(choice === $scope.newRound.correctCategory) {
            //     $scope.displayScore++
            //     $scope.showSecondSetOfChoices = true
            //     updateDisplay($scope.newRound)
            // }

            switch (number) {
                case 1:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryOne)
                    if($scope.newRound.correctCategory === $scope.displayCategoryOne) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
                    }
                    break;
                case 2:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryTwo)
                    if($scope.newRound.correctCategory === $scope.displayCategoryTwo) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
                    }
                    break;
                case 3:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryThree)
                    if($scope.newRound.correctCategory === $scope.displayCategoryThree) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
                    }
                    break;
                case 4:
                    console.log($scope.newRound.correctCategory === $scope.displayCategoryFour)
                    if($scope.newRound.correctCategory === $scope.displayCategoryFour) {
                        $scope.displayScore++
                        $scope.showSecondSetOfChoices = true
                        updateDisplay($scope.newRound)
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
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
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
                    }
                    break;
                case 2:
                    console.log($scope.newRound.correctArtist === $scope.displayArtistTwo)
                    if($scope.newRound.correctArtist === $scope.displayArtistTwo) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
                    }
                    break;
                case 3:
                    console.log($scope.newRound.correctArtist === $scope.displayArtistThree)
                    if($scope.newRound.correctArtist === $scope.displayArtistThree) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
                    }
                    break;
                case 4:
                    console.log($scope.newRound.correctArtist === $scope.displayArtistFour)
                    if($scope.newRound.correctArtist === $scope.displayArtistFour) {
                        $scope.displayScore += 2
                        checkGameRounds()
                    } else {
                        console.log('WRONG!')
                        checkGameRounds()
                    }
                    break;
                default:
                    console.log('Something went wrong with checkSecondSet()')
                    break;
            }
        }

        function checkGameRounds() {
            if ($scope.displayRoundNumber >= 10) {
                endGame()
            } else {
                console.log('Make new round?')
                $scope.nextRound()
            }
        }

        function endGame() {
            $scope.panelTab = 4
        }

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

})(); //END OF IIFE
