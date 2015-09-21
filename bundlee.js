(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var request = require('superagent')
var traverson = require('traverson')
var JsonHalAdapter = require('traverson-hal')

var clientID = '00665d46bb4f56d42b98',
    clientSecret = '86d483720aa6dedc9c86d1129a995749',
    apiUrl = 'https://api.artsy.net/api/tokens/xapp_token'

var artistArray = []

module.exports = {
    xappToken: '',
    artistArtworks: [],
    artworkArray: [],
    //artistArray: [],        // This was outside module.exports before testing.

    requestToken: function() {
        return new Promise(
            function(resolve, reject) {
                request
                    .post(apiUrl)
                    .send({ client_id: clientID, client_secret: clientSecret })
                    .end(function(err, res) {
                        if (err) {
                            reject()
                        } else {
                            //console.log(res.body)
                            resolve(res.body.token)
                        }
                    })
            }
        )
    },
    getArtists: function(START, PATH, CATEGORY, TOKEN) {
        traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

        return new Promise(
            function(resolve, reject) {
                var api = traverson
                    .from(START)
                    .jsonHal()
                    .withRequestOptions({
                        headers: {
                            'X-Xapp-Token': TOKEN,
                            'Accept': 'application/vnd.artsy-v2+json'
                        }
                    })

                api
                .newRequest()
                .follow(PATH)
                .withTemplateParameters({ id: CATEGORY })
                .getResource(function(error, resource) {
                    if (error) {
                        reject()
                    }
                    console.log("Choosen Category: ", resource)
                    for (var i=0; i < resource._embedded.artists.length; i++) {
                        artistArray.push(resource._embedded.artists[i])
                    }
                    resolve(artistArray)
                    //console.log(artistArray)
                    //this.artistArtworks = artistArray
                })
            }
        )
    },
    getArtwork: function(ARTIST, TOKEN) {
        traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

        return new Promise (function(resolve, reject) {
            traverson
            .from(ARTIST._links.artworks.href)
            .jsonHal()
            .withRequestOptions({
                headers: {
                    'X-Xapp-Token': TOKEN,
                    'Accept': 'application/vnd.artsy-v2+json'
                }
            })
            .getResource(function(error, resource) {
                if (error) {
                    console.log('another error..')
                    reject()
                } else {
                    //console.log(resource)
                    resolve(resource._embedded.artworks)
                }
            })
        })
    }
} // END OF MODULE.EXPORTS

},{"superagent":4,"traverson":51,"traverson-hal":7}],2:[function(require,module,exports){


// This should probably go into its own file once the lib gets bigger.
module.exports = {

    lib: [
        {
            name: 'Impressionism',
            id: '4d90d191dcdd5f44a500004e',
        },
        {
            name: 'Expressionism',
            id: '53c801277261695ed8c70100',
        },
        {
            name: 'High Renaissance',
            id: '4f26f327dc7f670001000126',
        },
        {
            name: 'Romanticism',
            id: '4d90d192dcdd5f44a500006b',
        },
    ]
}
/* These categories aren't pulling up any artworks
{
    name: 'Fauvism',
    id: '4d90d190dcdd5f44a5000044',
},
{
    name: 'Pop Art',
    id: '4e5e41670d2c670001030350',
},
{
    name: 'Surrealism',
    id: '4d90d192dcdd5f44a5000071',
},
// Cubism is only pulling up ONE artwork (Pablo Picasso)
{
    name: 'Cubism',
    id: '4d90d190dcdd5f44a500003e',
},
*/

},{}],3:[function(require,module,exports){
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

},{"./js/artsy.js":1,"./js/categories.js":2}],4:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? (this || self)
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this.getHeader('Content-Type');
    var serialize = request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

Request.prototype.then = function (fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":5,"reduce":6}],5:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],6:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],7:[function(require,module,exports){
'use strict';

var halfred = require('halfred');

function JsonHalAdapter(log) {
  this.log = log;
}

JsonHalAdapter.mediaType = 'application/hal+json';

// TODO Pass the traversal state into the adapter... and possibly also only
// modify it, do not return anything.
JsonHalAdapter.prototype.findNextStep = function(doc, key, preferEmbedded) {
  this.log.debug('parsing hal');
  var ctx = {
    doc: doc,
    halResource: halfred.parse(doc),
    parsedKey: parseKey(key),
    linkStep: null,
    embeddedStep: null,
  };
  resolveCurie(ctx);
  findLink(ctx, this.log);
  findEmbedded(ctx, this.log);
  return prepareResult(ctx, key, preferEmbedded);
};

function prepareResult(ctx, key, preferEmbedded) {
  var step;
  if (preferEmbedded || ctx.parsedKey.mode === 'all') {
    step = ctx.embeddedStep || ctx.linkStep;
  } else {
    step = ctx.linkStep || ctx.embeddedStep;
  }

  if (step) {
    return step;
  } else {
    var message = 'Could not find a matching link nor an embedded document '+
      'for ' + key + '.';
    if (ctx.linkError) {
      message += ' Error while resolving linked documents: ' + ctx.linkError;
    }
    if (ctx.embeddedError) {
      message += ' Error while resolving embedded documents: ' +
        ctx.embeddedError;
    }
    message += ' Document: ' + JSON.stringify(ctx.doc);

    throw new Error(message);
  }
}

function parseKey(key) {
  var match = key.match(/(.*)\[(.*):(.*)\]/);
  // ea:admin[title:Kate] => access by secondary key
  if (match) {
    return {
      mode: 'secondary',
      key: match[1],
      secondaryKey: match[2],
      secondaryValue: match[3],
      index: null,
    };
  }
  // ea:order[3] => index access into embedded array
  match = key.match(/(.*)\[(\d+)\]/);
  if (match) {
    return {
      mode: 'index',
      key: match[1],
      secondaryKey: null,
      secondaryValue: null,
      index: match[2],
    };
  }
  // ea:order[$all] => meta-key, return full array
  match = key.match(/(.*)\[\$all\]/);
  if (match) {
    return {
      mode: 'all',
      key: match[1],
      secondaryKey: null,
      secondaryValue: null,
      index: null,
    };
  }
  // ea:order => simple link relation
  return {
    mode: 'first',
    key: key,
    secondaryKey: null,
    secondaryValue: null,
    index: null,
  };
}

function resolveCurie(ctx) {
  if (ctx.halResource.hasCuries()) {
    ctx.parsedKey.curie =
      ctx.halResource.reverseResolveCurie(ctx.parsedKey.key);
  }
}

function findLink(ctx, log) {
  var linkArray = ctx.halResource.linkArray(ctx.parsedKey.key);
  if (!linkArray) {
    linkArray = ctx.halResource.linkArray(ctx.parsedKey.curie);
  }
  if (!linkArray || linkArray.length === 0) {
    return;
  }

  switch (ctx.parsedKey.mode) {
    case 'secondary':
      findLinkBySecondaryKey(ctx, linkArray, log);
      break;
    case 'index':
      findLinkByIndex(ctx, linkArray, log);
      break;
    case 'first':
      findLinkWithoutIndex(ctx, linkArray, log);
      break;
    default:
      throw new Error('Illegal mode: ' + ctx.parsedKey.mode);
  }
}

function findLinkBySecondaryKey(ctx, linkArray, log) {
  // client selected a specific link by an explicit secondary key like 'name',
  // so use it or fail
  var i = 0;
  for (; i < linkArray.length; i++) {
    var val = linkArray[i][ctx.parsedKey.secondaryKey];
    /* jshint -W116 */
    if (val != null && val == ctx.parsedKey.secondaryValue) {
      if (!linkArray[i].href) {
        ctx.linkError = 'The link ' + ctx.parsedKey.key + '[' +
          ctx.parsedKey.secondaryKey + ':' + ctx.parsedKey.secondaryValue +
            '] exists, but it has no href attribute.';
        return;
      }
      log.debug('found hal link: ' + linkArray[i].href);
      ctx.linkStep = { url: linkArray[i].href };
      return;
    }
    /* jshint +W116 */
  }
  ctx.linkError = ctx.parsedKey.key + '[' + ctx.parsedKey.secondaryKey + ':' +
      ctx.parsedKey.secondaryValue +
     '] requested, but there is no such link.';
}

function findLinkByIndex(ctx, linkArray, log) {
  // client specified an explicit array index for this link, so use it or fail
  if (!linkArray[ctx.parsedKey.index]) {
    ctx.linkError = 'The link array ' + ctx.parsedKey.key +
        ' exists, but has no element at index ' + ctx.parsedKey.index + '.';
    return;
  }
  if (!linkArray[ctx.parsedKey.index].href) {
    ctx.linkError = 'The link ' + ctx.parsedKey.key + '[' +
      ctx.parsedKey.index + '] exists, but it has no href attribute.';
    return;
  }
  log.debug('found hal link: ' + linkArray[ctx.parsedKey.index].href);
  ctx.linkStep = { url: linkArray[ctx.parsedKey.index].href };
}

function findLinkWithoutIndex(ctx, linkArray, log) {
  // client did not specify an array index for this link, arbitrarily choose
  // the first that has a href attribute
  var link;
  for (var index = 0; index < linkArray.length; index++) {
    if (linkArray[index].href) {
      link = linkArray[index];
      break;
    }
  }
  if (link) {
    if (linkArray.length > 1) {
      log.warn('Found HAL link array with more than one element for ' +
          'key ' + ctx.parsedKey.key + ', arbitrarily choosing index ' + index +
          ', because it was the first that had a href attribute.');
    }
    log.debug('found hal link: ' + link.href);
    ctx.linkStep = { url: link.href };
  }
}

function findEmbedded(ctx, log) {
  log.debug('checking for embedded: ' + ctx.parsedKey.key +
      (ctx.parsedKey.index ? ctx.parsedKey.index : ''));

  var resourceArray = ctx.halResource.embeddedArray(ctx.parsedKey.key);
  if (!resourceArray || resourceArray.length === 0) {
    return null;
  }
  log.debug('Found an array of embedded resource for: ' + ctx.parsedKey.key);

  switch (ctx.parsedKey.mode) {
    case 'secondary':
      findEmbeddedBySecondaryKey(ctx, resourceArray, log);
      break;
    case 'index':
      findEmbeddedByIndex(ctx, resourceArray, log);
      break;
    case 'all':
      findEmbeddedAll(ctx);
      break;
    case 'first':
      findEmbeddedWithoutIndex(ctx, resourceArray, log);
      break;
    default:
      throw new Error('Illegal mode: ' + ctx.parsedKey.mode);
  }
}

function findEmbeddedBySecondaryKey(ctx, embeddedArray, log) {
  // client selected a specific embed by an explicit secondary key,
  // so use it or fail
  var i = 0;
  for (; i < embeddedArray.length; i++) {
    var val = embeddedArray[i][ctx.parsedKey.secondaryKey];
    /* jshint -W116 */
    if (val != null && val == ctx.parsedKey.secondaryValue) {
      log.debug('Found an embedded resource for: ' + ctx.parsedKey.key + '[' +
      ctx.parsedKey.secondaryKey + ':' + ctx.parsedKey.secondaryValue + ']');
      ctx.embeddedStep = { doc: embeddedArray[i].original() };
      return;
    }
    /* jshint +W116 */
  }
  ctx.embeddedError = ctx.parsedKey.key + '[' + ctx.parsedKey.secondaryKey +
    ':' + ctx.parsedKey.secondaryValue +
    '] requested, but the embedded array ' + ctx.parsedKey.key +
    ' has no such element.';
}

function findEmbeddedByIndex(ctx, resourceArray, log) {
  // client specified an explicit array index, so use it or fail
  if (!resourceArray[ctx.parsedKey.index]) {
    ctx.embeddedError = 'The embedded array ' + ctx.parsedKey.key +
      ' exists, but has no element at index ' + ctx.parsedKey.index + '.';
    return;
  }
  log.debug('Found an embedded resource for: ' + ctx.parsedKey.key + '[' +
      ctx.parsedKey.index + ']');
  ctx.embeddedStep = {
    doc: resourceArray[ctx.parsedKey.index].original()
  };
}

function findEmbeddedAll(ctx) {
  ctx.embeddedStep = {
    doc: ctx.halResource.original()._embedded[ctx.parsedKey.key]
  };
}

function findEmbeddedWithoutIndex(ctx, resourceArray, log) {
  // client did not specify an array index, arbitrarily choose first
  if (resourceArray.length > 1) {
    log.warn('Found HAL embedded resource array with more than one element ' +
      ' for key ' + ctx.parsedKey.key +
      ', arbitrarily choosing first element.');
  }
  ctx.embeddedStep = { doc: resourceArray[0].original() };
}

module.exports = JsonHalAdapter;

},{"halfred":8}],8:[function(require,module,exports){
var Parser = require('./lib/parser')
  , validationFlag = false;

module.exports = {

  parse: function(unparsed) {
    return new Parser().parse(unparsed, validationFlag);
  },

  enableValidation: function(flag) {
    validationFlag = (flag != null) ? flag : true;
  },

  disableValidation: function() {
    validationFlag = false;
  }
};

},{"./lib/parser":10}],9:[function(require,module,exports){
'use strict';

/*
 * A very naive copy-on-write immutable stack. Since the size of the stack
 * is equal to the depth of the embedded resources for one HAL resource, the bad
 * performance for the copy-on-write approach is probably not a problem at all.
 * Might be replaced by a smarter solution later. Or not. Whatever.
 */
function ImmutableStack() {
  if (arguments.length >= 1) {
    this._array = arguments[0];
  } else {
    this._array = [];
  }
}

ImmutableStack.prototype.array = function() {
  return this._array;
};

ImmutableStack.prototype.isEmpty = function(array) {
  return this._array.length === 0;
};

ImmutableStack.prototype.push = function(element) {
  var array = this._array.slice(0);
  array.push(element);
  return new ImmutableStack(array);
};

ImmutableStack.prototype.pop = function() {
  var array = this._array.slice(0, this._array.length - 1);
  return new ImmutableStack(array);
};

ImmutableStack.prototype.peek = function() {
  if (this.isEmpty()) {
    throw new Error('can\'t peek on empty stack');
  }
  return this._array[this._array.length - 1];
};

module.exports = ImmutableStack;

},{}],10:[function(require,module,exports){
'use strict';

var Resource = require('./resource')
  , Stack = require('./immutable_stack');

var linkSpec = {
  href: { required: true, defaultValue: null },
  templated: { required: false, defaultValue: false },
  type: { required: false, defaultValue: null },
  deprecation: { required: false, defaultValue: null },
  name: { required: false, defaultValue: null },
  profile: { required: false, defaultValue: null },
  title: { required: false, defaultValue: null },
  hreflang: { required: false, defaultValue: null }
};

function Parser() {
}

Parser.prototype.parse = function parse(unparsed, validationFlag) {
  var validation = validationFlag ? [] : null;
  return _parse(unparsed, validation, new Stack());
};

function _parse(unparsed, validation, path) {
  if (unparsed == null) {
    return unparsed;
  }
  var allLinkArrays = parseLinks(unparsed._links, validation,
      path.push('_links'));
  var curies = parseCuries(allLinkArrays);
  var allEmbeddedArrays = parseEmbeddedResourcess(unparsed._embedded,
      validation, path.push('_embedded'));
  var resource = new Resource(allLinkArrays, curies, allEmbeddedArrays,
      validation);
  copyNonHalProperties(unparsed, resource);
  resource._original = unparsed;
  return resource;
}

function parseLinks(links, validation, path) {
  links = parseHalProperty(links, parseLink, validation, path);
  if (links == null || links.self == null) {
    // No links at all? Then it implictly misses the self link which it SHOULD
    // have according to spec
    reportValidationIssue('Resource does not have a self link', validation,
        path);
  }
  return links;
}

function parseCuries(linkArrays) {
  if (linkArrays) {
    return linkArrays.curies;
  } else {
    return [];
  }
}

function parseEmbeddedResourcess(original, parentValidation, path) {
  var embedded = parseHalProperty(original, identity, parentValidation, path);
  if (embedded == null) {
    return embedded;
  }
  Object.keys(embedded).forEach(function(key) {
    embedded[key] = embedded[key].map(function(embeddedElement) {
      var childValidation = parentValidation != null ? [] : null;
      var embeddedResource = _parse(embeddedElement, childValidation,
          path.push(key));
      embeddedResource._original = embeddedElement;
      return embeddedResource;
    });
  });
  return embedded;
}

/*
 * Copy over non-hal properties (everything that is not _links or _embedded)
 * to the parsed resource.
 */
function copyNonHalProperties(unparsed, resource) {
  Object.keys(unparsed).forEach(function(key) {
    if (key !== '_links' && key !== '_embedded') {
      resource[key] = unparsed[key];
    }
  });
}

/*
 * Processes one of the two main hal properties, that is _links or _embedded.
 * Each sub-property is turned into a single element array if it isn't already
 * an array. processingFunction is applied to each array element.
 */
function parseHalProperty(property, processingFunction, validation, path) {
  if (property == null) {
    return property;
  }

  // create a shallow copy of the _links/_embedded object
  var copy = {};

  // normalize each link/each embedded object and put it into our copy
  Object.keys(property).forEach(function(key) {
    copy[key] = arrayfy(key, property[key], processingFunction,
        validation, path);
  });
  return copy;
}

function arrayfy(key, object, fn, validation, path) {
  if (isArray(object)) {
    return object.map(function(element) {
      return fn(key, element, validation, path);
    });
  } else {
    return [fn(key, object, validation, path)];
  }
}


function parseLink(linkKey, link, validation, path) {
  if (!isObject(link)) {
    throw new Error('Link object is not an actual object: ' + link +
      ' [' + typeof link + ']');
  }

  // create a shallow copy of the link object
  var copy = shallowCopy(link);

  // add missing properties mandated by spec and do generic validation
  Object.keys(linkSpec).forEach(function(key) {
    if (copy[key] == null) {
      if (linkSpec[key].required) {
        reportValidationIssue('Link misses required property ' + key + '.',
            validation, path.push(linkKey));
      }
      if (linkSpec[key].defaultValue != null) {
        copy[key] = linkSpec[key].defaultValue;
      }
    }
  });

  // check more inter-property relations mandated by spec
  if (copy.deprecation) {
    log('Warning: Link ' + pathToString(path.push(linkKey)) +
        ' is deprecated, see ' + copy.deprecation);
  }
  if (copy.templated !== true && copy.templated !== false) {
    copy.templated = false;
  }

  if (!validation) {
    return copy;
  }
  if (copy.href && copy.href.indexOf('{') >= 0 && !copy.templated) {
    reportValidationIssue('Link seems to be an URI template ' +
        'but its "templated" property is not set to true.', validation,
        path.push(linkKey));
  }
  return copy;
}

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function isObject(o) {
  return typeof o === 'object';
}

function identity(key, object) {
  return object;
}

function reportValidationIssue(message, validation, path) {
  if (validation) {
    validation.push({
      path: pathToString(path),
      message: message
    });
  }
}

// TODO fix this ad hoc mess - does ie support console.log as of ie9?
function log(message) {
  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    console.log(message);
  }
}

function shallowCopy(source) {
  var copy = {};
  Object.keys(source).forEach(function(key) {
    copy[key] = source[key];
  });
  return copy;
}

function pathToString(path) {
  var s = '$.';
  for (var i = 0; i < path.array().length; i++) {
    s += path.array()[i] + '.';
  }
  s = s.substring(0, s.length - 1);
  return s;
}

module.exports = Parser;

},{"./immutable_stack":9,"./resource":11}],11:[function(require,module,exports){
'use strict';

function Resource(links, curies, embedded, validationIssues) {
  var self = this;
  this._links = links || {};
  this._initCuries(curies);
  this._embedded = embedded || {};
  this._validation = validationIssues || [];
}

Resource.prototype._initCuries = function(curies) {
  this._curiesMap = {};
  if (!curies) {
    this._curies = [];
  } else {
    this._curies = curies;
    for (var i = 0; i < this._curies.length; i++) {
      var curie = this._curies[i];
      this._curiesMap[curie.name] = curie;
    }
  }
  this._preResolveCuries();
};

Resource.prototype._preResolveCuries = function() {
  this._resolvedCuriesMap = {};
  for (var i = 0; i < this._curies.length; i++) {
    var curie = this._curies[i];
    if (!curie.name) {
      continue;
    }
    for (var rel in this._links) {
      if (rel !== 'curies') {
        this._preResolveCurie(curie, rel);
      }
    }
  }
};

Resource.prototype._preResolveCurie = function(curie, rel) {
  var link = this._links[rel];
  var prefixAndReference = rel.split(/:(.+)/);
  var candidate = prefixAndReference[0];
  if (curie.name === candidate) {
    if (curie.templated && prefixAndReference.length >= 1) {
      // TODO resolving templated CURIES should use a small uri template
      // lib, not coded here ad hoc
      var href = curie.href.replace(/(.*){(.*)}(.*)/, '$1' +
          prefixAndReference[1] + '$3');
      this._resolvedCuriesMap[href] = rel;
    } else {
      this._resolvedCuriesMap[curie.href] = rel;
    }
  }
};

Resource.prototype.allLinkArrays = function() {
  return this._links;
};

Resource.prototype.linkArray = function(key) {
  return propertyArray(this._links, key);
};

Resource.prototype.link = function(key, index) {
  return elementOfPropertyArray(this._links, key, index);
};

Resource.prototype.hasCuries = function(key) {
  return this._curies.length > 0;
};

Resource.prototype.curieArray = function(key) {
  return this._curies;
};

Resource.prototype.curie = function(name) {
  return this._curiesMap[name];
};

Resource.prototype.reverseResolveCurie = function(fullUrl) {
  return this._resolvedCuriesMap[fullUrl];
};

Resource.prototype.allEmbeddedResourceArrays = function () {
  return this._embedded;
};

Resource.prototype.embeddedResourceArray = function(key) {
  return propertyArray(this._embedded, key);
};

Resource.prototype.embeddedResource = function(key, index) {
  return elementOfPropertyArray(this._embedded, key, index);
};

Resource.prototype.original = function() {
  return this._original;
};

function propertyArray(object, key) {
  return object != null ? object[key] : null;
}

function elementOfPropertyArray(object, key, index) {
  index = index || 0;
  var array = propertyArray(object, key);
  if (array != null && array.length >= 1) {
    return array[index];
  }
  return null;
}

Resource.prototype.validationIssues = function() {
  return this._validation;
};

// alias definitions
Resource.prototype.allLinks = Resource.prototype.allLinkArrays;
Resource.prototype.allEmbeddedArrays =
    Resource.prototype.allEmbeddedResources =
    Resource.prototype.allEmbeddedResourceArrays;
Resource.prototype.embeddedArray = Resource.prototype.embeddedResourceArray;
Resource.prototype.embedded = Resource.prototype.embeddedResource;
Resource.prototype.validation = Resource.prototype.validationIssues;

module.exports = Resource;

},{}],12:[function(require,module,exports){
'use strict';

// TODO Replace by a proper lightweight logging module, suited for the browser

var enabled = false;
function Logger(id) {
  if (id == null) {
    id = '';
  }
  this.id = id;
}

Logger.prototype.enable = function() {
  this.enabled = true;
};

Logger.prototype.debug = function(message) {
  if (enabled) {
    console.log(this.id + '/debug: ' + message);
  }
};

Logger.prototype.info = function(message) {
  if (enabled) {
    console.log(this.id + '/info: ' + message);
  }
};

Logger.prototype.warn = function(message) {
  if (enabled) {
    console.log(this.id + '/warn: ' + message);
  }
};

Logger.prototype.error = function(message) {
  if (enabled) {
    console.log(this.id + '/error: ' + message);
  }
};

function minilog(id) {
  return new Logger(id);
}

minilog.enable = function() {
  enabled = true;
};

module.exports = minilog;

},{}],13:[function(require,module,exports){
'use strict';

module.exports = {
  isArray: function(o) {
    if (o == null) {
      return false;
    }
    return Object.prototype.toString.call(o) === '[object Array]';
  }
};

},{}],14:[function(require,module,exports){
'use strict';

var superagent = require('superagent');

function Request() {}

Request.prototype.get = function(uri, options, callback) {
  return mapRequest(superagent.get(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.post = function(uri, options, callback) {
  return mapRequest(superagent.post(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.put = function(uri, options, callback) {
  return mapRequest(superagent.put(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.patch = function(uri, options, callback) {
  return mapRequest(superagent.patch(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.del = function(uri, options, callback) {
  return mapRequest(superagent.del(uri), options)
    .end(handleResponse(callback));
};

function mapRequest(superagentRequest, options) {
  options = options || {};
  mapQuery(superagentRequest, options);
  mapHeaders(superagentRequest, options);
  mapAuth(superagentRequest, options);
  mapBody(superagentRequest, options);
  mapForm(superagentRequest, options);
  return superagentRequest;
}

function mapQuery(superagentRequest, options) {
  var qs = options.qs;
  if (qs != null) {
    superagentRequest = superagentRequest.query(qs);
  }
}

function mapHeaders(superagentRequest, options) {
  var headers = options.headers;
  if (headers != null) {
    superagentRequest = superagentRequest.set(headers);
  }
}

function mapAuth(superagentRequest, options) {
  var auth = options.auth;
  if (auth != null) {
    superagentRequest = superagentRequest.auth(
      auth.user || auth.username,
      auth.pass || auth.password
    );
  }
}

function mapBody(superagentRequest, options) {
  if (options != null) {
    var body = options.body;
    if (body != null) {
      superagentRequest = superagentRequest.send(body);
    }
  }
}

function mapForm(superagentRequest, options) {
  if (options != null) {
    var form = options.form;
    if (form != null) {
      superagentRequest = superagentRequest.send(form);
      superagentRequest = superagentRequest.set('Content-Type',
          'application/x-www-form-urlencoded');
    }
  }
}

// map XHR response object properties to Node.js request lib's response object
// properties
function mapResponse(response) {
  response.body = response.text;
  response.statusCode = response.status;
  return response;
}

function handleResponse(callback) {
  return function(err, response) {
    if (err) {
      if (!response) {
        // network error or timeout, no response
        return callback(err);
      } else {
        // Since 1.0.0 superagent calls the callback with an error if the status
        // code of the response is not in the 2xx range. In this cases, it also
        // passes in the response. To align things with request, call the
        // callback without the error but just with the response.
        callback(null, mapResponse(response));
      }
    } else {
      callback(null, mapResponse(response));
    }
  };
}

module.exports = new Request();

},{"superagent":4}],15:[function(require,module,exports){
'use strict';

/*
 * Copied from underscore.string module. Just the functions we need, to reduce
 * the browserified size.
 */

var _s = {
  startsWith: function(str, starts) {
    if (starts === '') return true;
    if (str == null || starts == null) return false;
    str = String(str); starts = String(starts);
    return str.length >= starts.length && str.slice(0, starts.length) === starts;
  },

  endsWith: function(str, ends){
    if (ends === '') return true;
    if (str == null || ends == null) return false;
    str = String(str); ends = String(ends);
    return str.length >= ends.length &&
      str.slice(str.length - ends.length) === ends;
  },

  splice: function(str, i, howmany, substr){
    var arr = _s.chars(str);
    arr.splice(~~i, ~~howmany, substr);
    return arr.join('');
  },

  contains: function(str, needle){
    if (needle === '') return true;
    if (str == null) return false;
    return String(str).indexOf(needle) !== -1;
  },

  chars: function(str) {
    if (str == null) return [];
    return String(str).split('');
  }
};

module.exports = _s;

},{}],16:[function(require,module,exports){
'use strict';

var resolveUrl = require('resolve-url');

exports.resolve = function(from, to) {
  return resolveUrl(from, to);
};

},{"resolve-url":49}],17:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

exports.abortTraversal = function abortTraversal() {
  log.debug('aborting link traversal');
  this.aborted = true;
  if (this.currentRequest) {
    log.debug('request in progress. trying to abort it, too.');
    this.currentRequest.abort();
  }
};

exports.registerAbortListener = function registerAbortListener(t, callback) {
  if (t.currentRequest) {
    t.currentRequest.on('abort', function() {
      exports.callCallbackOnAbort(t);
    });
  }
};

exports.callCallbackOnAbort = function callCallbackOnAbort(t) {
  log.debug('link traversal aborted');
  if (!t.callbackHasBeenCalledAfterAbort) {
    t.callbackHasBeenCalledAfterAbort = true;
    t.callback(exports.abortError(), t);
  }
};

exports.abortError = function abortError() {
  var error = new Error('Link traversal process has been aborted.');
  error.name = 'AbortError';
  error.aborted = true;
  return error;
};

},{"minilog":12}],18:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , applyTransforms = require('./transforms/apply_transforms')
  , httpRequests = require('./http_requests')
  , isContinuation = require('./is_continuation')
  , walker = require('./walker');

var checkHttpStatus = require('./transforms/check_http_status')
  , continuationToDoc =
      require('./transforms/continuation_to_doc')
  , continuationToResponse =
      require('./transforms/continuation_to_response')
  , convertEmbeddedDocToResponse =
      require('./transforms/convert_embedded_doc_to_response')
  , extractDoc =  require('./transforms/extract_doc')
  , extractResponse =  require('./transforms/extract_response')
  , extractUrl =  require('./transforms/extract_url')
  , fetchLastResource =  require('./transforms/fetch_last_resource')
  , executeLastHttpRequest = require('./transforms/execute_last_http_request')
  , executeHttpRequest = require('./transforms/execute_http_request')
  , parse = require('./transforms/parse');

/**
 * Starts the link traversal process and end it with an HTTP get.
 */
exports.get = function(t, callback) {
  var transformsAfterLastStep;
  if (t.convertResponseToObject) {
    transformsAfterLastStep = [
      continuationToDoc,
      fetchLastResource,
      checkHttpStatus,
      parse,
      extractDoc,
    ];
  } else {
    transformsAfterLastStep = [
      continuationToResponse,
      fetchLastResource,
      convertEmbeddedDocToResponse,
      extractResponse,
    ];
  }
  walker.walk(t, transformsAfterLastStep, callback);
  return createTraversalHandle(t);
};

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URL to the callback.
 */
exports.getUrl = function(t, callback) {
  walker.walk(t, [ extractUrl ], callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
exports.post = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.post,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
exports.put = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.put,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
exports.patch = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.patch,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
exports.delete = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.del,
      callback);
  return createTraversalHandle(t);
};

function walkAndExecute(t, request, method, callback) {
  var transformsAfterLastStep;
  if (t.convertResponseToObject) {
    transformsAfterLastStep = [
      executeHttpRequest,
      checkHttpStatus,
      parse,
      extractDoc,
    ];
  } else {
    transformsAfterLastStep = [
      executeLastHttpRequest,
    ];
  }

  t.lastMethod = method;
  walker.walk(t, transformsAfterLastStep, callback);
}

function createTraversalHandle(t) {
  return {
    abort: t.abortTraversal
  };
}

},{"./abort_traversal":17,"./http_requests":20,"./is_continuation":21,"./transforms/apply_transforms":27,"./transforms/check_http_status":28,"./transforms/continuation_to_doc":29,"./transforms/continuation_to_response":30,"./transforms/convert_embedded_doc_to_response":31,"./transforms/execute_http_request":33,"./transforms/execute_last_http_request":34,"./transforms/extract_doc":35,"./transforms/extract_response":36,"./transforms/extract_url":37,"./transforms/fetch_last_resource":38,"./transforms/parse":41,"./walker":47,"minilog":12}],19:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , standardRequest = require('request')
  , util = require('util');

var actions = require('./actions')
  , abortTraversal = require('./abort_traversal').abortTraversal
  , mediaTypeRegistry = require('./media_type_registry')
  , mediaTypes = require('./media_types')
  , mergeRecursive = require('./merge_recursive');

var log = minilog('traverson');

// Maintenance notice: The constructor is usually called without arguments, the
// mediaType parameter is only used when cloning the request builder in
// newRequest().
function Builder(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  this.adapter = this._createAdapter(this.mediaType);
  this.contentNegotiation = true;
  this.convertResponseToObjectFlag = false;
  this.links = [];
  this.jsonParser = JSON.parse;
  this.requestModuleInstance = standardRequest;
  this.requestOptions = {};
  this.resolveRelativeFlag = false;
  this.preferEmbedded = false;
  this.lastTraversalState = null;
  this.continuation = null;
  // Maintenance notice: when extending the list of configuration parameters,
  // also extend this.newRequest and initFromTraversalState
}

Builder.prototype._createAdapter = function(mediaType) {
  var AdapterType = mediaTypeRegistry.get(mediaType);
  if (!AdapterType) {
    throw new Error('Unknown or unsupported media type: ' + mediaType);
  }
  log.debug('creating new ' + AdapterType.name);
  return new AdapterType(log);
};

/**
 * Returns a new builder instance which is basically a clone of this builder
 * instance. This allows you to initiate a new request but keeping all the setup
 * (start URL, template parameters, request options, body parser, ...).
 */
Builder.prototype.newRequest = function() {
  var clonedRequestBuilder = new Builder(this.getMediaType());
  clonedRequestBuilder.contentNegotiation =
    this.doesContentNegotiation();
  clonedRequestBuilder.convertResponseToObject(this.convertsResponseToObject());
  clonedRequestBuilder.from(shallowCloneArray(this.getFrom()));
  clonedRequestBuilder.withTemplateParameters(
    cloneArrayOrObject(this.getTemplateParameters()));
  clonedRequestBuilder.withRequestOptions(
    cloneArrayOrObject(this.getRequestOptions()));
  clonedRequestBuilder.withRequestLibrary(this.getRequestLibrary());
  clonedRequestBuilder.parseResponseBodiesWith(this.getJsonParser());
  clonedRequestBuilder.resolveRelative(this.doesResolveRelative());
  clonedRequestBuilder.preferEmbeddedResources(
      this.doesPreferEmbeddedResources());
  clonedRequestBuilder.continuation = this.continuation;
  // Maintenance notice: when extending the list of configuration parameters,
  // also extend initFromTraversalState
  return clonedRequestBuilder;
};

/**
 * Disables content negotiation and forces the use of a given media type.
 * The media type has to be registered at Traverson's media type registry
 * before via traverson.registerMediaType (except for media type
 * application/json, which is traverson.mediaTypes.JSON).
 */
Builder.prototype.setMediaType = function(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  this.adapter = this._createAdapter(mediaType);
  this.contentNegotiation =
    (mediaType === mediaTypes.CONTENT_NEGOTIATION);
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON);
 */
Builder.prototype.json = function() {
  this.setMediaType(mediaTypes.JSON);
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON_HAL);
 */
Builder.prototype.jsonHal = function() {
  this.setMediaType(mediaTypes.JSON_HAL);
  return this;
};

/**
 * Enables content negotiation (content negotiation is enabled by default, this
 * method can be used to enable it after a call to setMediaType disabled it).
 */
Builder.prototype.useContentNegotiation = function() {
  this.setMediaType(mediaTypes.CONTENT_NEGOTIATION);
  this.contentNegotiation = true;
  return this;
};

/**
 * Set the root URL of the API, that is, where the link traversal begins.
 */
Builder.prototype.from = function(url) {
  this.startUrl = url;
  return this;
};

/**
 * Provides the list of link relations to follow
 */
Builder.prototype.follow = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.links = arguments[0];
  } else {
    this.links = Array.prototype.slice.apply(arguments);
  }
  return this;
};

/**
 * Alias for follow.
 */
Builder.prototype.walk = Builder.prototype.follow;

/**
 * Provide template parameters for URI template substitution.
 */
Builder.prototype.withTemplateParameters = function(parameters) {
  this.templateParameters = parameters;
  return this;
};

/**
 * Provide options for HTTP requests (additional HTTP headers, for example).
 * This function resets any request options, that had been set previously, that
 * is, multiple calls to withRequestOptions are not cumulative. Use
 * addRequestOptions to add request options in a cumulative way.
 *
 * Options can either be passed as an object or an array. If an object is
 * passed, the options will be used for each HTTP request. If an array is
 * passed, each element should be an options object and the first array element
 * will be used for the first request, the second element for the second request
 * and so on. null elements are allowed.
 */
Builder.prototype.withRequestOptions = function(options) {
  this.requestOptions = options;
  return this;
};

/**
 * Adds options for HTTP requests (additional HTTP headers, for example) on top
 * of existing options, if any. To reset all request options and set new ones
 * without keeping the old ones, you can use withRequestOptions.
 *
 * Options can either be passed as an object or an array. If an object is
 * passed, the options will be used for each HTTP request. If an array is
 * passed, each element should be an options object and the first array element
 * will be used for the first request, the second element for the second request
 * and so on. null elements are allowed.
 *
 * When called after a call to withRequestOptions or when combining multiple
 * addRequestOptions calls, some with objects and some with arrays, a multitude
 * of interesting situations can occur:
 *
 * 1) The existing request options are an object and the new options passed into
 * this method are also an object. Outcome: Both objects are merged and all
 * options are applied to all requests.
 *
 * 2) The existing options are an array and the new options passed into this
 * method are also an array. Outcome: Each array element is merged individually.
 * The combined options from the n-th array element in the existing options
 * array and the n-th array element in the given array are applied to the n-th
 * request.
 *
 * 3) The existing options are an object and the new options passed into this
 * method are an array. Outcome: A new options array will be created. For each
 * element, a clone of the existing options object will be merged with an
 * element from the given options array.
 *
 * Note that if the given array has less elements than the number of steps in
 * the link traversal (usually the number of steps is derived from the number
 * of link relations given to the follow method), only the first n http
 * requests will use options at all, where n is the number of elements in the
 * given array. HTTP request n + 1 and all following HTTP requests will use an
 * empty options object. This is due to the fact, that at the time of creating
 * the new options array, we can not know with certainty how many steps the
 * link traversal will have.
 *
 * 4) The existing options are an array and the new options passed into this
 * method are an object. Outcome: A clone of the given options object will be
 * merged into into each array element of the existing options.
 */
Builder.prototype.addRequestOptions = function(options) {

  // case 2: both the present options and the new options are arrays.
  // => merge each array element individually
  if (util.isArray(this.requestOptions) && util.isArray(options)) {
    mergeArrayElements(this.requestOptions, options);

  // case 3: there is an options object the new options are an array.
  // => create a new array, each element is a merge of the existing base object
  // and the array element from the new options array.
  } else if (typeof this.requestOptions === 'object' &&
             util.isArray(options)) {
    this.requestOptions =
      mergeBaseObjectWithArrayElements(this.requestOptions, options);

  // case 4: there is an options array and the new options are an object.
  // => merge the new object into each array element.
  } else if (util.isArray(this.requestOptions) &&
             typeof options === 'object') {
    mergeOptionObjectIntoEachArrayElement(this.requestOptions, options);

  // case 1: both are objects
  // => merge both objects
  } else {
    mergeRecursive(this.requestOptions, options);
  }
  return this;
};

function mergeArrayElements(existingOptions, newOptions) {
  for (var i = 0;
       i < Math.max(existingOptions.length, newOptions.length);
       i++) {
    existingOptions[i] =
      mergeRecursive(existingOptions[i], newOptions[i]);
  }
}

function mergeBaseObjectWithArrayElements(existingOptions, newOptions) {
  var newOptArray = [];
  for (var i = 0;
       i < newOptions.length;
       i++) {
    newOptArray[i] =
      mergeRecursive(newOptions[i], existingOptions);
  }
  return newOptArray;
}

function mergeOptionObjectIntoEachArrayElement(existingOptions, newOptions) {
  for (var i = 0;
       i < existingOptions.length;
       i++) {
    mergeRecursive(existingOptions[i], newOptions);
  }
}

/**
 * Injects a custom request library. When using this method, you should not
 * call withRequestOptions or addRequestOptions but instead pre-configure the
 * injected request library instance before passing it to withRequestLibrary.
 */
Builder.prototype.withRequestLibrary = function(request) {
  this.requestModuleInstance = request;
  return this;
};

/**
 * Injects a custom JSON parser.
 */
Builder.prototype.parseResponseBodiesWith = function(parser) {
  this.jsonParser = parser;
  return this;
};

/**
 * With this option enabled, the body of the response at the end of the
 * traversal will be converted into a JavaScript object (for example by passing
 * it into JSON.parse) and passing the resulting object into the callback.
 * The default is false, which means the full response is handed to the
 * callback.
 *
 * When response body conversion is enabled, you will not get the full
 * response, so you won't have access to the HTTP status code or headers.
 * Instead only the converted object will be passed into the callback.
 *
 * Note that the body of any intermediary responses during the traversal is
 * always converted by Traverson (to find the next link).
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), response body conversion is switched on, otherwise the argument is
 * interpreted as a boolean flag. If it is a truthy value, response body
 * conversion is switched to on, if it is a falsy value (but not null or
 * undefined), response body conversion is switched off.
 */
Builder.prototype.convertResponseToObject = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.convertResponseToObjectFlag = !!flag;
  return this;
};

/**
 * Switches URL resolution to relative (default is absolute) or back to
 * absolute.
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), URL resolution is switched to relative, otherwise the argument is
 * interpreted as a boolean flag. If it is a truthy value, URL resolution is
 * switched to relative, if it is a falsy value, URL resolution is switched to
 * absolute.
 */
Builder.prototype.resolveRelative = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.resolveRelativeFlag = !!flag;
  return this;
};

/**
 * Makes Traverson prefer embedded resources over traversing a link or vice
 * versa. This only applies to media types which support embedded resources
 * (like HAL). It has no effect when using a media type that does not support
 * embedded resources.
 *
 * It also only takes effect when a resource contains both a link _and_ an
 * embedded resource with the name that is to be followed at this step in the
 * link traversal process.
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), embedded resources will be preferred over fetching linked resources
 * with an additional HTTP request. Otherwise the argument is interpreted as a
 * boolean flag. If it is a truthy value, embedded resources will be preferred,
 * if it is a falsy value, traversing the link relation will be preferred.
 */
Builder.prototype.preferEmbeddedResources = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.preferEmbedded = !!flag;
  return this;
};

/**
 * Returns the current media type. If no media type is enforced but content type
 * detection is used, the string `content-negotiation` is returned.
 */
Builder.prototype.getMediaType = function() {
  return this.mediaType;
};

/**
 * Returns the URL set by the from(url) method, that is, the root URL of the
 * API.
 */
Builder.prototype.getFrom = function() {
  return this.startUrl;
};

/**
 * Returns the template parameters set by the withTemplateParameters.
 */
Builder.prototype.getTemplateParameters = function() {
  return this.templateParameters;
};

/**
 * Returns the request options set by the withRequestOptions or
 * addRequestOptions.
 */
Builder.prototype.getRequestOptions = function() {
  return this.requestOptions;
};

/**
 * Returns the custom request library instance set by withRequestLibrary or the
 * standard request library instance, if a custom one has not been set.
 */
Builder.prototype.getRequestLibrary = function() {
  return this.requestModuleInstance;
};

/**
 * Returns the custom JSON parser function set by parseResponseBodiesWith or the
 * standard parser function, if a custom one has not been set.
 */
Builder.prototype.getJsonParser = function() {
  return this.jsonParser;
};

/**
 * Returns true if the body of the last response will be converted to a
 * JavaScript object before passing the result back to the callback.
 */
Builder.prototype.convertsResponseToObject = function() {
  return this.convertResponseToObjectFlag;
};

/**
 * Returns the flag controlling if URLs are resolved relative or absolute.
 * A return value of true means that URLs are resolved relative, false means
 * absolute.
 */
Builder.prototype.doesResolveRelative = function() {
  return this.resolveRelativeFlag;
};

/**
 * Returns the flag controlling if embedded resources are preferred over links.
 * A return value of true means that embedded resources are preferred, false
 * means that following links is preferred.
 */
Builder.prototype.doesPreferEmbeddedResources = function() {
  return this.preferEmbedded;
};

/**
 * Returns true if content negotiation is enabled and false if a particular
 * media type is forced.
 */
Builder.prototype.doesContentNegotiation = function() {
  return this.contentNegotiation;
};

/**
 * Starts the link traversal process and passes the last HTTP response to the
 * callback.
 */
Builder.prototype.get = function get(callback) {
  log.debug('initiating traversal (get)');
  var t = createInitialTraversalState(this);
  return actions.get(t, wrapForContinue(this, t, callback, 'get'));
};

/**
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 *
 * This is a shortcut for builder.convertResponseToObject().get(callback).
 */
Builder.prototype.getResource = function getResource(callback) {
  log.debug('initiating traversal (getResource)');
  this.convertResponseToObjectFlag = true;
  var t = createInitialTraversalState(this);
  return actions.get(t, wrapForContinue(this, t, callback,
      'getResource'));
};

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URL to the callback.
 */
Builder.prototype.getUrl = function getUrl(callback) {
  log.debug('initiating traversal (getUrl)');
  var t = createInitialTraversalState(this);
  return actions.getUrl(t, wrapForContinue(this, t, callback, 'getUrl'));
};

/**
 * Alias for getUrl.
 */
Builder.prototype.getUri = Builder.prototype.getUrl;


/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
Builder.prototype.post = function post(body, callback) {
  log.debug('initiating traversal (post)');
  var t = createInitialTraversalState(this, body);
  return actions.post(t, wrapForContinue(this, t, callback, 'post'));
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
Builder.prototype.put = function put(body, callback) {
  log.debug('initiating traversal (put)');
  var t = createInitialTraversalState(this, body);
  return actions.put(t, wrapForContinue(this, t, callback, 'put'));
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
Builder.prototype.patch = function patch(body, callback) {
  log.debug('initiating traversal (patch)');
  var t = createInitialTraversalState(this, body);
  return actions.patch(t, wrapForContinue(this, t, callback, 'patch'));
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
Builder.prototype.delete = function del(callback) {
  log.debug('initiating traversal (delete)');
  var t = createInitialTraversalState(this);
  return actions.delete(t, wrapForContinue(this, t, callback, 'delete'));
};

/**
 * Alias for delete.
 */
Builder.prototype.del = Builder.prototype.delete;

function createInitialTraversalState(self, body) {

  var traversalState = {
    aborted: false,
    adapter: self.adapter || null,
    body: body || null,
    callbackHasBeenCalledAfterAbort: false,
    contentNegotiation: self.doesContentNegotiation(),
    continuation: null,
    convertResponseToObject: self.convertsResponseToObject(),
    links: self.links,
    jsonParser: self.getJsonParser(),
    requestModuleInstance: self.getRequestLibrary(),
    requestOptions: self.getRequestOptions(),
    resolveRelative: self.doesResolveRelative(),
    preferEmbedded: self.doesPreferEmbeddedResources(),
    startUrl: self.startUrl,
    step : {
      url: self.startUrl,
      index: 0,
    },
    templateParameters: self.getTemplateParameters(),
  };
  traversalState.abortTraversal = abortTraversal.bind(traversalState);

  if (self.continuation) {
    traversalState.continuation = self.continuation;
    traversalState.step = self.continuation.step;
    self.continuation = null;
  }

  return traversalState;
}

function wrapForContinue(self, t, callback, firstTraversalAction) {
  return function(err, result) {
    if (err) { return callback(err); }
    return callback(null, result, {
      continue: function() {
        if (!t) {
          throw new Error('no traversal state to continue from.');
        }

        log.debug('> continuing finished traversal process');
        self.continuation = {
          step: t.step,
          action: firstTraversalAction,
        };
        self.continuation.step.index = 0;
        initFromTraversalState(self, t);
        return self;
      },
    });
  };
}

/*
 * Copy configuration from traversal state to builder instance to
 * prepare for next traversal process.
 */
function initFromTraversalState(self, t) {
  self.aborted = false;
  self.adapter = t.adapter;
  self.body = t.body;
  self.callbackHasBeenCalledAfterAbort = false;
  self.contentNegotiation = t.contentNegotiation;
  self.convertResponseToObjectFlag = t.convertResponseToObject;
  self.links = [];
  self.jsonParser =  t.jsonParser;
  self.requestModuleInstance = t.requestModuleInstance,
  self.requestOptions = t.requestOptions,
  self.resolveRelativeFlag = t.resolveRelative;
  self.preferEmbedded = t.preferEmbedded;
  self.startUrl = t.startUrl;
  self.templateParameters = t.templateParameters;
}

function cloneArrayOrObject(thing) {
  if (util.isArray(thing)) {
    return shallowCloneArray(thing);
  } else if (typeof thing === 'object') {
    return deepCloneObject(thing);
  } else {
    return thing;
  }
}

function deepCloneObject(object) {
  return mergeRecursive(null, object);
}

function shallowCloneArray(array) {
  if (!array) {
    return array;
  }
  return array.slice(0);
}

module.exports = Builder;

},{"./abort_traversal":17,"./actions":18,"./media_type_registry":23,"./media_types":24,"./merge_recursive":25,"minilog":12,"request":14,"util":13}],20:[function(require,module,exports){
(function (process){
'use strict';
var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , detectContentType = require('./transforms/detect_content_type')
  , getOptionsForStep = require('./transforms/get_options_for_step');

/**
 * Executes a HTTP GET request during the link traversal process.
 */
// This method is currently used for all intermediate GET requests during the
// link traversal process. Coincidentally, it is also used for the final request
// in a link traversal should this happen to be a GET request. Otherwise (POST/
// PUT/PATCH/DELETE), Traverson uses exectueHttpRequest.
exports.fetchResource = function fetchResource(t, callback) {
  log.debug('fetching resource for next step');
  if (t.step.url) {
    log.debug('fetching resource from ', t.step.url);
    return executeHttpGet(t, callback);
  } else if (t.step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('resource for next step has already been fetched, using ' +
        'embedded');
    return process.nextTick(function() {
      callback(null, t);
    });
  } else {
    return process.nextTick(function() {
      var error = new Error('Can not process step');
      error.step = t.step;
      callback(error);
    });
  }
};

function executeHttpGet(t, callback) {
  var options = getOptionsForStep(t);
  log.debug('HTTP GET request to ', t.step.url);
  log.debug('options ', options);
  t.currentRequest =
    t.requestModuleInstance.get(t.step.url, options,
        function(err, response, body) {
    log.debug('HTTP GET request to ' + t.step.url + ' returned');
    t.currentRequest = null;

    // workaround for cases where response body is empty but body comes in as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    t.step.response = response;

    if (err) {
     return callback(err, t);
    }
    log.debug('request to ' + t.step.url + ' finished without error (' +
      response.statusCode + ')');

    if (!detectContentType(t, callback)) return;

    return callback(null, t);
  });
  abortTraversal.registerAbortListener(t, callback);
}

/**
 * Executes an arbitrary HTTP request.
 */
// This method is currently used for POST/PUT/PATCH/DELETE at the end of a link
// traversal process. If the link traversal process requires a GET as the last
// request, Traverson uses exectueHttpGet.
exports.executeHttpRequest = function(t, request, method, callback) {
  var requestOptions = getOptionsForStep(t);
  if (t.body) {
    requestOptions.body = JSON.stringify(t.body);
  }

  log.debug('HTTP ' + method.name + ' request to ', t.step.url);
  log.debug('options ', requestOptions);
  t.currentRequest =
    method.call(request, t.step.url, requestOptions,
        function(err, response, body) {
    log.debug('HTTP ' + method.name + ' request to ' + t.step.url +
      ' returned');
    t.currentRequest = null;

    // workaround for cases where response body is empty but body comes in as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    t.step.response = response;

    if (err) {
      return callback(err);
    }

    return callback(null, response);
  });
  abortTraversal.registerAbortListener(t, callback);
};

}).call(this,require('_process'))

},{"./abort_traversal":17,"./transforms/detect_content_type":32,"./transforms/get_options_for_step":40,"_process":52,"minilog":12}],21:[function(require,module,exports){
'use strict';

module.exports = function isContinuation(t) {
  return t.continuation && t.step && t.step.response;
};

},{}],22:[function(require,module,exports){
'use strict';

var jsonpathLib = require('JSONPath')
  , minilog = require('minilog')
  , _s = require('underscore.string');

var jsonpath = jsonpathLib.eval;

function JsonAdapter(log) {
  this.log = log;
}

JsonAdapter.prototype.findNextStep = function(doc, link) {
  this.log.debug('extracting link from doc', link, doc);
  var url;
  if (this.testJSONPath(link)) {
    return { url: this.resolveJSONPath(link, doc) };
  } else if (doc[link]) {
    return { url : doc[link] };
  } else {
    throw new Error('Could not find property ' + link +
        ' in document:\n', doc);
  }
};

JsonAdapter.prototype.testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[');
};

JsonAdapter.prototype.resolveJSONPath = function(link, doc) {
  var matches = jsonpath(doc, link);
  if (matches.length === 1) {
    var url = matches[0];
    if (!url) {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc));
    }
    if (typeof url !== 'string') {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result is not a property of type string. ' +
        'Instead it has type "' + (typeof url) +
        '" in document:\n' + JSON.stringify(doc));
    }
    return url;
  } else if (matches.length > 1) {
    // ambigious match
    throw new Error('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc));
  } else {
    // no match at all
    throw new Error('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc));
  }
};

module.exports = JsonAdapter;

},{"JSONPath":48,"minilog":12,"underscore.string":15}],23:[function(require,module,exports){
'use strict';

var mediaTypes = require('./media_types');

var registry = {};

exports.register = function register(contentType, constructor) {
  registry[contentType] = constructor;
};

exports.get = function get(contentType) {
  return registry[contentType];
};

exports.register(mediaTypes.CONTENT_NEGOTIATION,
    require('./negotiation_adapter'));
exports.register(mediaTypes.JSON, require('./json_adapter'));

},{"./json_adapter":22,"./media_types":24,"./negotiation_adapter":26}],24:[function(require,module,exports){
'use strict';

module.exports = {
  CONTENT_NEGOTIATION: 'content-negotiation',
  JSON: 'application/json',
  JSON_HAL: 'application/hal+json',
};

},{}],25:[function(require,module,exports){
'use strict';

// TODO Maybe replace with https://github.com/Raynos/xtend
// check browser build size, though.
function mergeRecursive(obj1, obj2) {
  if (!obj1 && obj2) {
    obj1 = {};
  }
  for (var key in obj2) {
    if (!obj2.hasOwnProperty(key)) {
      continue;
    }
    merge(obj1, obj2, key);
  }
  return obj1;
}

function merge(obj1, obj2, key) {
  if (typeof obj2[key] === 'object') {
    // if it is an object (that is, a non-leave in the tree),
    // and it is not present in obj1
    if (!obj1[key] || typeof obj1[key] !== 'object') {
      // ... we create an empty object in obj1
      obj1[key] = {};
    }
    // and we recurse deeper into the structure
    mergeRecursive(obj1[key], obj2[key]);
  } else if (typeof obj2[key] !== 'function') {
    // if it is primitive (string, number, boolean), we overwrite/add it to
    // obj1
    obj1[key] = obj2[key];
  }
}

module.exports = mergeRecursive;

},{}],26:[function(require,module,exports){
'use strict';

function NegotiationAdapter(log) {}

NegotiationAdapter.prototype.findNextStep = function(doc, link) {
  throw new Error('Content negotiation did not happen');
};

module.exports = NegotiationAdapter;

},{}],27:[function(require,module,exports){
(function (process){
/* jshint loopfunc: true */
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * Applies async and sync transforms, one after another.
 */
function applyTransforms(transforms, t, callback) {
  log.debug('applying', transforms.length, 'transforms');
  for (var i = 0; i < transforms.length; i++) {
    var transform = transforms[i];
    log.debug('next transform', transform);
    if (transform.isAsync) {
      log.debug('transform is asynchronous');
      // asynchronous case
      return transform(t, function(t) {
        // this is only called when the async transform was successful,
        // otherwise t.callback has already been called with an error.
        log.debug('asynchronous transform finished successfully, applying ' +
          'remaining transforms.');
        applyTransforms(transforms.slice(i + 1), t, callback);
      });
    } else {
      log.debug('transform is synchronous');
      // synchronous case
      var result = transform(t);
      if (!result) {
        log.debug('transform has failed');
        // stop processing t.callback has already been called
        return;
      }
      log.debug('transform successful');
    }
  }
  log.debug('all transforms done');
  return process.nextTick(function() {
    callback(t);
  });
}

module.exports = applyTransforms;

}).call(this,require('_process'))

},{"_process":52,"minilog":12}],28:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , isContinuation = require('../is_continuation');

module.exports = function checkHttpStatus(t) {
  // this step is ommitted for continuations
  if (isContinuation(t)) {
    return true;
  }

  log.debug('checking http status');
  if (!t.step.response && t.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('found embedded document, assuming no HTTP request has been ' +
        'made');
    return true;
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = t.step.response.statusCode;
  if (httpStatus && (httpStatus < 200 || httpStatus >= 300)) {
    var error = httpError(t.step.url, httpStatus, t.step.response.body);
    log.error('unexpected http status code');
    log.error(error);
    t.callback(error);
    return false;
  }
  log.debug('http status code ok (' + httpStatus + ')');
  return true;
};

function httpError(url, httpStatus, body) {
  var error = new Error('HTTP GET for ' + url +
      ' resulted in HTTP status code ' + httpStatus + '.');
  error.name = 'HTTPError';
  error.url = url;
  error.httpStatus = httpStatus;
  error.body = body;
  try {
    error.doc = JSON.parse(body);
  } catch (e) {
    // ignore
  }
  return error;
}

},{"../is_continuation":21,"minilog":12}],29:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , isContinuation = require('../is_continuation');

/*
 * This transform covers the case of a follow() call *without any links* after
 * a continue(). Actually, there is nothing to do here since we should have
 * fetched everything last time.
 */
module.exports = function continuationToDoc(t) {
  if (isContinuation(t)) {
    log.debug('continuing from last traversal process (actions)');
    t.continuation = null;
    t.callback(null, t.step.doc);
    return false;
  }
  return true;
};

},{"../is_continuation":21,"minilog":12}],30:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , convertEmbeddedDocToResponse =
      require('./convert_embedded_doc_to_response')
  , isContinuation = require('../is_continuation');

/*
 * follow() call without links after continue(). Actually, there is nothing
 * to do here since we should have fetched everything last time.
 */
module.exports = function continuationToResponse(t) {
  if (isContinuation(t)) {
    log.debug('continuing from last traversal process (actions)');
    t.continuation = null;
    // Hm, a transform using another transform. This feels a bit fishy.
    convertEmbeddedDocToResponse(t);
    t.callback(null, t.step.response);
    return false;
  }
  return true;
};

},{"../is_continuation":21,"./convert_embedded_doc_to_response":31,"minilog":12}],31:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function convertEmbeddedDocToResponse(t) {
  if (!t.step.response && t.step.doc) {
    log.debug('faking HTTP response for embedded resource');
    t.step.response = {
      statusCode: 200,
      body: JSON.stringify(t.step.doc),
      remark: 'This is not an actual HTTP response. The resource you ' +
        'requested was an embedded resource, so no HTTP request was ' +
        'made to acquire it.'
    };
  }
  return true;
};

},{"minilog":12}],32:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

var mediaTypeRegistry = require('../media_type_registry');

module.exports = function detectContentType(t, callback) {
  if (t.contentNegotiation &&
      t.step.response &&
      t.step.response.headers &&
      t.step.response.headers['content-type']) {
    var contentType = t.step.response.headers['content-type'].split(/[; ]/)[0];
    var AdapterType = mediaTypeRegistry.get(contentType);
    if (!AdapterType) {
      callback(new Error('Unknown content type for content ' +
          'type detection: ' + contentType));
      return false;
    }
    // switch to new Adapter depending on Content-Type header of server
    t.adapter = new AdapterType(log);
  }
  return true;
};

},{"../media_type_registry":23,"minilog":12}],33:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , httpRequests = require('../http_requests');

/*
 * Execute the last HTTP request in a traversal that ends in
 * post/put/patch/delete, but do not call t.callback immediately
 * (because we still need to do response body to object conversion
 * afterwards, for example)
 */
// TODO Why is this different from when do a GET?
// Probably only because the HTTP method is configurable here (with
// t.lastMethod), we might be able to unify this with the
// fetch_resource/fetch_last_resource transform.
function executeLastHttpRequest(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  // only diff to execute_last_http_request: pass a new callback function
  // instead of t.callback.
  httpRequests.executeHttpRequest(
      t, t.requestModuleInstance, t.lastMethod, function(err, response) {
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    callback(t);
  });
}

executeLastHttpRequest.isAsync = true;

module.exports = executeLastHttpRequest;

},{"../abort_traversal":17,"../http_requests":20,"minilog":12}],34:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , httpRequests = require('../http_requests');

/*
 * Execute the last http request in a traversal that ends in
 * post/put/patch/delete.
 */
// TODO Why is this different from when do a GET at the end of the traversal?
// Probably only because the HTTP method is configurable here (with
// t.lastMethod), we might be able to unify this with the
// fetch_resource/fetch_last_resource transform.
function executeLastHttpRequest(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  httpRequests.executeHttpRequest(
      t, t.requestModuleInstance, t.lastMethod, t.callback);
}

executeLastHttpRequest.isAsync = true;

module.exports = executeLastHttpRequest;

},{"../abort_traversal":17,"../http_requests":20,"minilog":12}],35:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * This transform is meant to be run at the very end of a getResource call. It
 * just extracts the last doc from the step and calls t.callback with it.
 */
module.exports = function extractDoc(t) {
  log.debug('walker.walk has finished');
  /*
  TODO Breaks a lot of tests although it seems to make perfect sense?!?
  if (!t.doc) {
    t.callback(new Error('No document available'));
    return false;
  }
  */
  t.callback(null, t.step.doc);
};

},{"minilog":12}],36:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * This transform is meant to be run at the very end of a get/post/put/patch/
 * delete call. It just extracts the last response from the step and calls
 * t.callback with it.
 */
module.exports = function extractDoc(t) {
  log.debug('walker.walk has finished');
  /*
  TODO Breaks a lot of tests although it seems to make perfect sense?!?
  if (!t.response) {
    t.callback(new Error('No response available'));
    return false;
  }
  */
  t.callback(null, t.step.response);
};

},{"minilog":12}],37:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , url = require('url');

/*
 * This transform is meant to be run at the very end of a get/post/put/patch/
 * delete call. It just extracts the last accessed url from the step and calls
 * t.callback with it.
 */
module.exports = function extractDoc(t) {
  log.debug('walker.walk has finished');
  if (t.step.url) {
    return t.callback(null, t.step.url);
  } else if (t.step.doc &&
    // TODO actually this is very HAL specific :-/
    t.step.doc._links &&
    t.step.doc._links.self &&
    t.step.doc._links.self.href) {
    return t.callback(
        null, url.resolve(t.startUrl, t.step.doc._links.self.href));
  } else {
    return t.callback(new Error('You requested an URL but the last ' +
        'resource is an embedded resource and has no URL of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
};

},{"minilog":12,"url":16}],38:[function(require,module,exports){
'use strict';

// TODO Only difference to lib/transform/fetch_resource is the continuation
// checking, which is missing here. Maybe we can delete this transform and use
// fetch_resource in its place everywhere?

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , httpRequests = require('../http_requests');

/*
 * Execute the last step in a traversal that ends with an HTTP GET.
 */
// This is similar to lib/transforms/fetch_resource.js - refactoring potential?
function fetchLastResource(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  httpRequests.fetchResource(t, function(err, t) {
    log.debug('fetchResource returned (fetchLastResource).');
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    callback(t);
  });
}

fetchLastResource.isAsync = true;

module.exports = fetchLastResource;

},{"../abort_traversal":17,"../http_requests":20,"minilog":12}],39:[function(require,module,exports){
(function (process){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , isContinuation = require('../is_continuation')
  , httpRequests = require('../http_requests');

/*
 * Execute the next step in the traversal. In most cases that is an HTTP get to
 *the next URL.
 */

function fetchResource(t, callback) {
  if (isContinuation(t)) {
    convertContinuation(t, callback);
  } else {
    fetchViaHttp(t, callback);
  }
}

fetchResource.isAsync = true;

/*
 * This is a continuation of an earlier traversal process.
 * We need to shortcut to the next step (without executing the final HTTP
 * request of the last traversal again.
 */
function convertContinuation(t, callback) {
  log.debug('continuing from last traversal process (walker)');
  process.nextTick(function() { // de-zalgo continuations
    callback(t);
  });
}

function fetchViaHttp(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  httpRequests.fetchResource(t, function(err, t) {
    log.debug('fetchResource returned');
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    callback(t);
  });
}

module.exports = fetchResource;

}).call(this,require('_process'))

},{"../abort_traversal":17,"../http_requests":20,"../is_continuation":21,"_process":52,"minilog":12}],40:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , util = require('util');

module.exports = function getOptionsForStep(t) {
  var options = t.requestOptions;
  if (util.isArray(t.requestOptions)) {
    options = t.requestOptions[t.step.index] || {};
  }
  log.debug('options: ', options);
  return options;
};

},{"minilog":12,"util":13}],41:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , isContinuation = require('../is_continuation');

module.exports = function parse(t) {
  // TODO Duplicated in actions#afterGetResource etc.
  // this step is ommitted for continuations that parse at the end
  if (isContinuation(t)) {
    log.debug('continuing from last traversal process (transforms/parse)');
    // if last traversal did a parse at the end we do not need to parse again
    // (this condition will need to change with
    // https://github.com/basti1302/traverson/issues/44)
    if (t.continuation.action === 'getResource') {
      return true;
    }
  }
  if (t.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('no parsing necessary, probably an embedded document');
    return true;
  }

  try {
    log.debug('parsing response body');
    t.step.doc = t.jsonParser(t.step.response.body);
    return true;
  } catch (e) {
    var error = e;
    if (e.name === 'SyntaxError') {
      error = jsonError(t.step.url, t.step.response.body);
    }
    log.error('parsing failed');
    log.error(error);
    t.callback(error);
    return false;
  }
};

function jsonError(url, body) {
  var error = new Error('The document at ' + url +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.url = url;
  error.body = body;
  return error;
}

},{"../is_continuation":21,"minilog":12}],42:[function(require,module,exports){
'use strict';

var isContinuation = require('../is_continuation');

module.exports = function resetLastStep(t) {
  // this step is ommitted for continuations
  if (isContinuation(t)) {
    return true;
  }

  t.continuation = null;
  return true;
};

},{"../is_continuation":21}],43:[function(require,module,exports){
'use strict';

var isContinuation = require('../is_continuation');

module.exports = function resetLastStep(t) {
  // this step is ommitted for continuations
  if (isContinuation(t)) {
    return true;
  }

  t.lastStep = null;
  return true;
};

},{"../is_continuation":21}],44:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , url = require('url');

var protocolRegEx = /https?:\/\//i;

module.exports = function resolveNextUrl(t) {
  if (t.step.url) {
    if (t.step.url.search(protocolRegEx) !== 0) {
      log.debug('found non full qualified URL');
      if (t.resolveRelative && t.lastStep && t.lastStep.url) {
        // edge case: resolve URL relatively (only when requested by client)
        log.debug('resolving URL relative');
        if (_s.startsWith(t.step.url, '/') &&
          _s.endsWith(t.lastStep.url, '/')) {
          t.step.url = _s.splice(t.step.url, 0, 1);
        }
        t.step.url = t.lastStep.url + t.step.url;
      } else {
        // This is the default case and what happens most likely (not a full
        // qualified URL, not resolving relatively) and we simply use Node's url
        // module (or the appropriate shim) here.
        t.step.url = url.resolve(t.startUrl, t.step.url);
      }
    } // edge case: full qualified URL -> no URL resolving necessary
  } // no t.step.url -> no URL resolving (step might contain an embedded doc)
  return true;
};

},{"minilog":12,"underscore.string":15,"url":16}],45:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , uriTemplate = require('url-template')
  , util = require('util');

module.exports = function resolveUriTemplate(t) {
  if (t.step.url) {
    // next link found in last response, might be a URI template
    var templateParams = t.templateParameters;
    if (util.isArray(templateParams)) {
      // if template params were given as an array, only use the array element
      // for the current index for URI template resolving.
      templateParams = templateParams[t.step.index];
    }
    templateParams = templateParams || {};

    if (_s.contains(t.step.url, '{')) {
      log.debug('resolving URI template');
      var template = uriTemplate.parse(t.step.url);
      var resolved = template.expand(templateParams);
      log.debug('resolved to ', resolved);
      t.step.url = resolved;
    }
  }
  return true;
};



},{"minilog":12,"underscore.string":15,"url-template":50,"util":13}],46:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function switchToNextStep(t) {
  // extract next link to follow from last response
  var link = t.links[t.step.index];
  log.debug('next link: ' + link);

  // save last step before overwriting it with the next step (required for
  // relative URL resolution, where we need the last URL)
  t.lastStep = t.step;

  t.step = findNextStep(t, t.lastStep.doc, link, t.preferEmbedded);
  if (!t.step) return false;

  // backward compatibility fix for media type plug-ins using step.uri instead
  // of step.url (until 1.0.0)
  t.step.url = t.step.url || t.step.uri;

  t.step.index = t.lastStep.index + 1;
  return true;
};

function findNextStep(t, doc, link, preferEmbedded) {
  try {
    return t.adapter.findNextStep(doc, link, preferEmbedded);
  } catch (e) {
    log.error('could not find next step');
    log.error(e);
    t.callback(e);
    return null;
  }
}

},{"minilog":12}],47:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , applyTransforms = require('./transforms/apply_transforms')
  , isContinuation = require('./is_continuation')
  , resolveUriTemplate = require('./transforms/resolve_uri_template');

var transforms = [
  require('./transforms/fetch_resource'),
  require('./transforms/reset_last_step'),
  // check HTTP status code
  require('./transforms/check_http_status'),
  // parse JSON from last response
  require('./transforms/parse'),
  // retrieve next link and switch to next step
  require('./transforms/switch_to_next_step'),
  // URI template has to be resolved before post processing the URL,
  // because we do url.resolve with it (in json_hal) and this would URL-
  // encode curly braces.
  resolveUriTemplate,
  require('./transforms/resolve_next_url'),
  require('./transforms/reset_continuation'),
];

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URL. On reaching this, it calls
 * the given callback with the last resulting step.
 */
exports.walk = function(t, transformsAfterLastStep, callback) {
  // even the root URL might be a template, so we apply the resolveUriTemplate
  // once before starting the walk.
  if (!resolveUriTemplate(t)) return;

  // starts the link rel walking process
  log.debug('starting to follow links');
  transformsAfterLastStep = transformsAfterLastStep || [];
  t.callback = callback;
  processStep(t, transformsAfterLastStep);
};

function processStep(t, transformsAfterLastStep) {
  log.debug('processing next step');
  if (moreLinksToFollow(t) && !isAborted(t)) {
    applyTransforms(transforms, t, function(t) {
      log.debug('successfully processed step');
      // call processStep recursively again to follow next link
      processStep(t, transformsAfterLastStep);
    });
  } else if (isAborted(t)) {
    return abortTraversal.callCallbackOnAbort(t);
  } else {
    // link array is exhausted, we are done and return the last response
    // and URL to the callback the client passed into the walk method.
    log.debug('link array exhausted');

    applyTransforms(transformsAfterLastStep, t, function(t) {
      return t.callback();
    });
  }
}

function moreLinksToFollow(t) {
  return t.step.index < t.links.length;
}

function isAborted(t) {
  return t.aborted;
}

},{"./abort_traversal":17,"./is_continuation":21,"./transforms/apply_transforms":27,"./transforms/check_http_status":28,"./transforms/fetch_resource":39,"./transforms/parse":41,"./transforms/reset_continuation":42,"./transforms/reset_last_step":43,"./transforms/resolve_next_url":44,"./transforms/resolve_uri_template":45,"./transforms/switch_to_next_step":46,"minilog":12}],48:[function(require,module,exports){
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

var isNode = false;
(function(exports, require) {

// Keep compatibility with old browsers
if (!Array.isArray) {
  Array.isArray = function(vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// Make sure to know if we are in real node or not (the `require` variable
// could actually be require.js, for example.
var isNode = typeof module !== 'undefined' && !!module.exports;

var vm = isNode ?
    require('vm') : {
      runInNewContext: function(expr, context) { with (context) return eval(expr); }
    };
exports.eval = jsonPath;

var cache = {};

function push(arr, elem) { arr = arr.slice(); arr.push(elem); return arr; }
function unshift(elem, arr) { arr = arr.slice(); arr.unshift(elem); return arr; }

function jsonPath(obj, expr, arg) {
   var P = {
      resultType: arg && arg.resultType || "VALUE",
      flatten: arg && arg.flatten || false,
      wrap: (arg && arg.hasOwnProperty('wrap')) ? arg.wrap : true,
      sandbox: (arg && arg.sandbox) ? arg.sandbox : {},
      normalize: function(expr) {
         if (cache[expr]) return cache[expr];
         var subx = [];
         var normalized = expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
                     .replace(/'?\.'?|\['?/g, ";")
                     .replace(/(;)?(\^+)(;)?/g, function(_, front, ups, back) { return ';' + ups.split('').join(';') + ';'; })
                     .replace(/;;;|;;/g, ";..;")
                     .replace(/;$|'?\]|'$/g, "");
         var exprList = normalized.split(';').map(function(expr) {
            var match = expr.match(/#([0-9]+)/);
            return !match || !match[1] ? expr : subx[match[1]];
         })
         return cache[expr] = exprList;
      },
      asPath: function(path) {
         var x = path, p = "$";
         for (var i=1,n=x.length; i<n; i++)
            p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
         return p;
      },
      trace: function(expr, val, path) {
         // no expr to follow? return path and value as the result of this trace branch
         if (!expr.length) return [{path: path, value: val}];

         var loc = expr[0], x = expr.slice(1);
         // the parent sel computation is handled in the frame above using the
         // ancestor object of val
         if (loc === '^') return path.length ? [{path: path.slice(0,-1), expr: x, isParentSelector: true}] : [];

         // we need to gather the return value of recursive trace calls in order to
         // do the parent sel computation.
         var ret = [];
         function addRet(elems) { ret = ret.concat(elems); }

         if (val && val.hasOwnProperty(loc)) // simple case, directly follow property
            addRet(P.trace(x, val[loc], push(path, loc)));
         else if (loc === "*") { // any property
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               addRet(P.trace(unshift(m, x), v, p)); });
         }
         else if (loc === "..") { // all chid properties
            addRet(P.trace(x, val, path));
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               if (typeof v[m] === "object")
                  addRet(P.trace(unshift("..", x), v[m], push(p, m)));
            });
         }
         else if (loc[0] === '(') { // [(expr)]
            addRet(P.trace(unshift(P.eval(loc, val, path[path.length], path),x), val, path));
         }
         else if (loc.indexOf('?(') === 0) { // [?(expr)]
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"),v[m],m, path))
                  addRet(P.trace(unshift(m,x),v,p));
            });
         }
         else if (loc.indexOf(',') > -1) { // [name1,name2,...]
            for (var parts = loc.split(','), i = 0; i < parts.length; i++)
               addRet(P.trace(unshift(parts[i], x), val, path));
         }
         else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  python slice syntax
            addRet(P.slice(loc, x, val, path));
         }

         // we check the resulting values for parent selections. for parent
         // selections we discard the value object and continue the trace with the
         // current val object
         return ret.reduce(function(all, ea) {
            return all.concat(ea.isParentSelector ? P.trace(ea.expr, val, ea.path) : [ea]);
         }, []);
      },
      walk: function(loc, expr, val, path, f) {
         if (Array.isArray(val))
            for (var i = 0, n = val.length; i < n; i++)
               f(i, loc, expr, val, path);
         else if (typeof val === "object")
            for (var m in val)
               if (val.hasOwnProperty(m))
                  f(m, loc, expr, val, path);
      },
      slice: function(loc, expr, val, path) {
         if (!Array.isArray(val)) return;
         var len = val.length, parts = loc.split(':'),
             start = (parts[0] && parseInt(parts[0])) || 0,
             end = (parts[1] && parseInt(parts[1])) || len,
             step = (parts[2] && parseInt(parts[2])) || 1;
         start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
         end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
         var ret = [];
         for (var i = start; i < end; i += step)
            ret = ret.concat(P.trace(unshift(i,expr), val, path));
         return ret;
      },
      eval: function(code, _v, _vname, path) {
         if (!$ || !_v) return false;
         if (code.indexOf("@path") > -1) {
            P.sandbox["_path"] = P.asPath(path.concat([_vname]));
            code = code.replace(/@path/g, "_path");
         }
         if (code.indexOf("@") > -1) {
            P.sandbox["_v"] = _v;
            code = code.replace(/@/g, "_v");
         }
         try {
             return vm.runInNewContext(code, P.sandbox);
         }
         catch(e) {
             console.log(e);
             throw new Error("jsonPath: " + e.message + ": " + code);
         }
      }
   };

   var $ = obj;
   var resultType = P.resultType.toLowerCase();
   if (expr && obj && (resultType == "value" || resultType == "path")) {
      var exprList = P.normalize(expr);
      if (exprList[0] === "$" && exprList.length > 1) exprList.shift();
      var result = P.trace(exprList, obj, ["$"]);
      result = result.filter(function(ea) { return ea && !ea.isParentSelector; });
      if (!result.length) return P.wrap ? [] : false;
      if (result.length === 1 && !P.wrap && !Array.isArray(result[0].value)) return result[0][resultType] || false;
      return result.reduce(function(result, ea) {
         var valOrPath = ea[resultType];
         if (resultType === 'path') valOrPath = P.asPath(valOrPath);
         if (P.flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
         } else {
            result.push(valOrPath);
         }
         return result;
      }, []);
   }
}
})(typeof exports === 'undefined' ? this['jsonPath'] = {} : exports, typeof require == "undefined" ? null : require);

},{"vm":53}],49:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],50:[function(require,module,exports){
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.urltemplate = factory();
    }
}(this, function () {
  /**
   * @constructor
   */
  function UrlTemplate() {
  }

  /**
   * @private
   * @param {string} str
   * @return {string}
   */
  UrlTemplate.prototype.encodeReserved = function (str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
      if (!/%[0-9A-Fa-f]/.test(part)) {
        part = encodeURI(part);
      }
      return part;
    }).join('');
  };

  /**
   * @private
   * @param {string} operator
   * @param {string} value
   * @param {string} key
   * @return {string}
   */
  UrlTemplate.prototype.encodeValue = function (operator, value, key) {
    value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : encodeURIComponent(value);

    if (key) {
      return encodeURIComponent(key) + '=' + value;
    } else {
      return value;
    }
  };

  /**
   * @private
   * @param {*} value
   * @return {boolean}
   */
  UrlTemplate.prototype.isDefined = function (value) {
    return value !== undefined && value !== null;
  };

  /**
   * @private
   * @param {string}
   * @return {boolean}
   */
  UrlTemplate.prototype.isKeyOperator = function (operator) {
    return operator === ';' || operator === '&' || operator === '?';
  };

  /**
   * @private
   * @param {Object} context
   * @param {string} operator
   * @param {string} key
   * @param {string} modifier
   */
  UrlTemplate.prototype.getValues = function (context, operator, key, modifier) {
    var value = context[key],
        result = [];

    if (this.isDefined(value) && value !== '') {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        value = value.toString();

        if (modifier && modifier !== '*') {
          value = value.substring(0, parseInt(modifier, 10));
        }

        result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
      } else {
        if (modifier === '*') {
          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                result.push(this.encodeValue(operator, value[k], k));
              }
            }, this);
          }
        } else {
          var tmp = [];

          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              tmp.push(this.encodeValue(operator, value));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                tmp.push(encodeURIComponent(k));
                tmp.push(this.encodeValue(operator, value[k].toString()));
              }
            }, this);
          }

          if (this.isKeyOperator(operator)) {
            result.push(encodeURIComponent(key) + '=' + tmp.join(','));
          } else if (tmp.length !== 0) {
            result.push(tmp.join(','));
          }
        }
      }
    } else {
      if (operator === ';') {
        result.push(encodeURIComponent(key));
      } else if (value === '' && (operator === '&' || operator === '?')) {
        result.push(encodeURIComponent(key) + '=');
      } else if (value === '') {
        result.push('');
      }
    }
    return result;
  };

  /**
   * @param {string} template
   * @return {function(Object):string}
   */
  UrlTemplate.prototype.parse = function (template) {
    var that = this;
    var operators = ['+', '#', '.', '/', ';', '?', '&'];

    return {
      expand: function (context) {
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
          if (expression) {
            var operator = null,
                values = [];

            if (operators.indexOf(expression.charAt(0)) !== -1) {
              operator = expression.charAt(0);
              expression = expression.substr(1);
            }

            expression.split(/,/g).forEach(function (variable) {
              var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
              values.push.apply(values, that.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
            });

            if (operator && operator !== '+') {
              var separator = ',';

              if (operator === '?') {
                separator = '&';
              } else if (operator !== '#') {
                separator = operator;
              }
              return (values.length !== 0 ? operator : '') + values.join(separator);
            } else {
              return values.join(',');
            }
          } else {
            return that.encodeReserved(literal);
          }
        });
      }
    };
  };

  return new UrlTemplate();
}));

},{}],51:[function(require,module,exports){
(function (process){
'use strict';

var minilog = require('minilog')
  , mediaTypes = require('./lib/media_types')
  , Builder = require('./lib/builder')
  , mediaTypes = require('./lib/media_types')
  , mediaTypeRegistry = require('./lib/media_type_registry');

// activate this line to enable logging
if (process.env.TRAVERSON_LOGGING) {
  require('minilog').enable();
}

// export builder for traverson-angular
exports._Builder = Builder;

/**
 * Creates a new request builder instance.
 */
exports.newRequest = function newRequest() {
  return new Builder();
};

/**
 * Creates a new request builder instance with the given root URL.
 */
exports.from = function from(url) {
  var builder = new Builder();
  builder.from(url);
  return builder;
};

// Provided for backward compatibility with pre-1.0.0 versions.
// The preferred way is to use newRequest() or from() to create a request
// builder and either set the media type explicitly by calling json() on the
// request builder instance - or use content negotiation.
exports.json = {
  from: function(url) {
    var builder = new Builder();
    builder.from(url);
    builder.setMediaType(mediaTypes.JSON);
    return builder;
  }
},

// Provided for backward compatibility with pre-1.0.0 versions.
// The preferred way is to use newRequest() or from() to create a request
// builder and then either set the media type explicitly by calling jsonHal() on
// the request builder instance - or use content negotiation.
exports.jsonHal = {
  from: function(url) {
    if (!mediaTypeRegistry.get(mediaTypes.JSON_HAL)) {
      throw new Error('JSON HAL adapter is not registered. From version ' +
        '1.0.0 on, Traverson has no longer built-in support for ' +
        'application/hal+json. HAL support was moved to a separate, optional ' +
        'plug-in. See https://github.com/basti1302/traverson-hal');
    }
    var builder = new Builder();
    builder.from(url);
    builder.setMediaType(mediaTypes.JSON_HAL);
    return builder;
  }
};

// expose media type registry so that media type plug-ins can register
// themselves
exports.registerMediaType = mediaTypeRegistry.register;

// export media type constants
exports.mediaTypes = mediaTypes;

}).call(this,require('_process'))

},{"./lib/builder":19,"./lib/media_type_registry":23,"./lib/media_types":24,"_process":52,"minilog":12}],52:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],53:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":54}],54:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcnRzeS5qcyIsImpzL2NhdGVnb3JpZXMuanMiLCJtYWluLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi1oYWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uLWhhbC9ub2RlX21vZHVsZXMvaGFsZnJlZC9oYWxmcmVkLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi1oYWwvbm9kZV9tb2R1bGVzL2hhbGZyZWQvbGliL2ltbXV0YWJsZV9zdGFjay5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24taGFsL25vZGVfbW9kdWxlcy9oYWxmcmVkL2xpYi9wYXJzZXIuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uLWhhbC9ub2RlX21vZHVsZXMvaGFsZnJlZC9saWIvcmVzb3VyY2UuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2Jyb3dzZXIvbGliL3NoaW0vbG9nLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9icm93c2VyL2xpYi9zaGltL25vZGUtdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vYnJvd3Nlci9saWIvc2hpbS9yZXF1ZXN0LmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9icm93c2VyL2xpYi9zaGltL3VuZGVyc2NvcmUtc3RyaW5nLXJlZHVjZWQuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2Jyb3dzZXIvbGliL3NoaW0vdXJsLXJlc29sdmUuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9hYm9ydF90cmF2ZXJzYWwuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9hY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvYnVpbGRlci5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2h0dHBfcmVxdWVzdHMuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9pc19jb250aW51YXRpb24uanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9qc29uX2FkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9tZWRpYV90eXBlX3JlZ2lzdHJ5LmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvbWVkaWFfdHlwZXMuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9tZXJnZV9yZWN1cnNpdmUuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9uZWdvdGlhdGlvbl9hZGFwdGVyLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9hcHBseV90cmFuc2Zvcm1zLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9jaGVja19odHRwX3N0YXR1cy5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvY29udGludWF0aW9uX3RvX2RvYy5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvY29udGludWF0aW9uX3RvX3Jlc3BvbnNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9jb252ZXJ0X2VtYmVkZGVkX2RvY190b19yZXNwb25zZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZGV0ZWN0X2NvbnRlbnRfdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZXhlY3V0ZV9odHRwX3JlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2V4ZWN1dGVfbGFzdF9odHRwX3JlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2V4dHJhY3RfZG9jLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9leHRyYWN0X3Jlc3BvbnNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9leHRyYWN0X3VybC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZmV0Y2hfbGFzdF9yZXNvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZmV0Y2hfcmVzb3VyY2UuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2dldF9vcHRpb25zX2Zvcl9zdGVwLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9wYXJzZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvcmVzZXRfY29udGludWF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9yZXNldF9sYXN0X3N0ZXAuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3Jlc29sdmVfbmV4dF91cmwuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3Jlc29sdmVfdXJpX3RlbXBsYXRlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9zd2l0Y2hfdG9fbmV4dF9zdGVwLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvd2Fsa2VyLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvSlNPTlBhdGgvbGliL2pzb25wYXRoLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvcmVzb2x2ZS11cmwvcmVzb2x2ZS11cmwuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL25vZGVfbW9kdWxlcy91cmwtdGVtcGxhdGUvbGliL3VybC10ZW1wbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vdHJhdmVyc29uLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy92bS1icm93c2VyaWZ5L2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3ZtLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luZGV4b2YvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ptQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpXG52YXIgdHJhdmVyc29uID0gcmVxdWlyZSgndHJhdmVyc29uJylcbnZhciBKc29uSGFsQWRhcHRlciA9IHJlcXVpcmUoJ3RyYXZlcnNvbi1oYWwnKVxuXG52YXIgY2xpZW50SUQgPSAnMDA2NjVkNDZiYjRmNTZkNDJiOTgnLFxuICAgIGNsaWVudFNlY3JldCA9ICc4NmQ0ODM3MjBhYTZkZWRjOWM4NmQxMTI5YTk5NTc0OScsXG4gICAgYXBpVXJsID0gJ2h0dHBzOi8vYXBpLmFydHN5Lm5ldC9hcGkvdG9rZW5zL3hhcHBfdG9rZW4nXG5cbnZhciBhcnRpc3RBcnJheSA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHhhcHBUb2tlbjogJycsXG4gICAgYXJ0aXN0QXJ0d29ya3M6IFtdLFxuICAgIGFydHdvcmtBcnJheTogW10sXG4gICAgLy9hcnRpc3RBcnJheTogW10sICAgICAgICAvLyBUaGlzIHdhcyBvdXRzaWRlIG1vZHVsZS5leHBvcnRzIGJlZm9yZSB0ZXN0aW5nLlxuXG4gICAgcmVxdWVzdFRva2VuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAucG9zdChhcGlVcmwpXG4gICAgICAgICAgICAgICAgICAgIC5zZW5kKHsgY2xpZW50X2lkOiBjbGllbnRJRCwgY2xpZW50X3NlY3JldDogY2xpZW50U2VjcmV0IH0pXG4gICAgICAgICAgICAgICAgICAgIC5lbmQoZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJlcy5ib2R5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLmJvZHkudG9rZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9LFxuICAgIGdldEFydGlzdHM6IGZ1bmN0aW9uKFNUQVJULCBQQVRILCBDQVRFR09SWSwgVE9LRU4pIHtcbiAgICAgICAgdHJhdmVyc29uLnJlZ2lzdGVyTWVkaWFUeXBlKEpzb25IYWxBZGFwdGVyLm1lZGlhVHlwZSwgSnNvbkhhbEFkYXB0ZXIpXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IHRyYXZlcnNvblxuICAgICAgICAgICAgICAgICAgICAuZnJvbShTVEFSVClcbiAgICAgICAgICAgICAgICAgICAgLmpzb25IYWwoKVxuICAgICAgICAgICAgICAgICAgICAud2l0aFJlcXVlc3RPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWC1YYXBwLVRva2VuJzogVE9LRU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuYXJ0c3ktdjIranNvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIGFwaVxuICAgICAgICAgICAgICAgIC5uZXdSZXF1ZXN0KClcbiAgICAgICAgICAgICAgICAuZm9sbG93KFBBVEgpXG4gICAgICAgICAgICAgICAgLndpdGhUZW1wbGF0ZVBhcmFtZXRlcnMoeyBpZDogQ0FURUdPUlkgfSlcbiAgICAgICAgICAgICAgICAuZ2V0UmVzb3VyY2UoZnVuY3Rpb24oZXJyb3IsIHJlc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNob29zZW4gQ2F0ZWdvcnk6IFwiLCByZXNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpIDwgcmVzb3VyY2UuX2VtYmVkZGVkLmFydGlzdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGlzdEFycmF5LnB1c2gocmVzb3VyY2UuX2VtYmVkZGVkLmFydGlzdHNbaV0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShhcnRpc3RBcnJheSlcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhcnRpc3RBcnJheSlcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLmFydGlzdEFydHdvcmtzID0gYXJ0aXN0QXJyYXlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfSxcbiAgICBnZXRBcnR3b3JrOiBmdW5jdGlvbihBUlRJU1QsIFRPS0VOKSB7XG4gICAgICAgIHRyYXZlcnNvbi5yZWdpc3Rlck1lZGlhVHlwZShKc29uSGFsQWRhcHRlci5tZWRpYVR5cGUsIEpzb25IYWxBZGFwdGVyKVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB0cmF2ZXJzb25cbiAgICAgICAgICAgIC5mcm9tKEFSVElTVC5fbGlua3MuYXJ0d29ya3MuaHJlZilcbiAgICAgICAgICAgIC5qc29uSGFsKClcbiAgICAgICAgICAgIC53aXRoUmVxdWVzdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ1gtWGFwcC1Ub2tlbic6IFRPS0VOLFxuICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5hcnRzeS12Mitqc29uJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZ2V0UmVzb3VyY2UoZnVuY3Rpb24oZXJyb3IsIHJlc291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbm90aGVyIGVycm9yLi4nKVxuICAgICAgICAgICAgICAgICAgICByZWplY3QoKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzb3VyY2UuX2VtYmVkZGVkLmFydHdvcmtzKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxufSAvLyBFTkQgT0YgTU9EVUxFLkVYUE9SVFNcbiIsIlxuXG4vLyBUaGlzIHNob3VsZCBwcm9iYWJseSBnbyBpbnRvIGl0cyBvd24gZmlsZSBvbmNlIHRoZSBsaWIgZ2V0cyBiaWdnZXIuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIGxpYjogW1xuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnSW1wcmVzc2lvbmlzbScsXG4gICAgICAgICAgICBpZDogJzRkOTBkMTkxZGNkZDVmNDRhNTAwMDA0ZScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdFeHByZXNzaW9uaXNtJyxcbiAgICAgICAgICAgIGlkOiAnNTNjODAxMjc3MjYxNjk1ZWQ4YzcwMTAwJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0hpZ2ggUmVuYWlzc2FuY2UnLFxuICAgICAgICAgICAgaWQ6ICc0ZjI2ZjMyN2RjN2Y2NzAwMDEwMDAxMjYnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUm9tYW50aWNpc20nLFxuICAgICAgICAgICAgaWQ6ICc0ZDkwZDE5MmRjZGQ1ZjQ0YTUwMDAwNmInLFxuICAgICAgICB9LFxuICAgIF1cbn1cbi8qIFRoZXNlIGNhdGVnb3JpZXMgYXJlbid0IHB1bGxpbmcgdXAgYW55IGFydHdvcmtzXG57XG4gICAgbmFtZTogJ0ZhdXZpc20nLFxuICAgIGlkOiAnNGQ5MGQxOTBkY2RkNWY0NGE1MDAwMDQ0Jyxcbn0sXG57XG4gICAgbmFtZTogJ1BvcCBBcnQnLFxuICAgIGlkOiAnNGU1ZTQxNjcwZDJjNjcwMDAxMDMwMzUwJyxcbn0sXG57XG4gICAgbmFtZTogJ1N1cnJlYWxpc20nLFxuICAgIGlkOiAnNGQ5MGQxOTJkY2RkNWY0NGE1MDAwMDcxJyxcbn0sXG4vLyBDdWJpc20gaXMgb25seSBwdWxsaW5nIHVwIE9ORSBhcnR3b3JrIChQYWJsbyBQaWNhc3NvKVxue1xuICAgIG5hbWU6ICdDdWJpc20nLFxuICAgIGlkOiAnNGQ5MGQxOTBkY2RkNWY0NGE1MDAwMDNlJyxcbn0sXG4qL1xuIiwiKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnbWFpbicsIFtdKTtcbiAgICB2YXIgQXJ0c3kgPSByZXF1aXJlKCcuL2pzL2FydHN5LmpzJylcbiAgICB2YXIgQ2F0ZWdvcmllcyA9IHJlcXVpcmUoJy4vanMvY2F0ZWdvcmllcy5qcycpXG5cbiAgICBhcHAuY29udHJvbGxlcignR2FtZUNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAvL1BhbmVsIENvbnRyb2xsZXIgZ290IHN1Y2tlZCBpbiBieSBnYW1lIGNvbnRyb2xsZXIuLlxuICAgICAgICAkc2NvcGUucGFuZWxUYWIgPSAxXG4gICAgICAgICRzY29wZS5wYW5lbFNlbGVjdFRhYiA9IGZ1bmN0aW9uKHNldFRhYikge1xuICAgICAgICAgICAgJHNjb3BlLnBhbmVsVGFiID0gc2V0VGFiXG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLnBhbmVsSXNTZWxlY3RlZCA9IGZ1bmN0aW9uKGNoZWNrVGFiKSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnBhbmVsVGFiID09PSBjaGVja1RhYlxuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXNGb3JHYW1lU2Vzc2lvbiA9IFtdXG4gICAgICAgICRzY29wZS5kaXNwbGF5Um91bmROdW1iZXIgPSAwXG4gICAgICAgICRzY29wZS5kaXNwbGF5U2NvcmUgPSAwXG4gICAgICAgICRzY29wZS5kaXNwbGF5Q2F0ZWdvcmllc1NlbGVjdGVkID0gNFxuICAgICAgICAkc2NvcGUud2hlbkdhbWVJc1JlYWR5ID0gZmFsc2VcblxuICAgICAgICB2YXIgZGVmYXVsdENhdGVnb3J5TWVzc2FnZSA9ICdPb3BzLCBzb21ldGhpbmcgd2VudCB3cm9uZy4uJ1xuXG4gICAgICAgICRzY29wZS5zZWxlY3RDYXRlZ29yeSA9IGZ1bmN0aW9uKGNhdGVnb3J5TnVtKSB7XG4gICAgICAgICAgICAkc2NvcGUuY2F0ZWdvcmllc0ZvckdhbWVTZXNzaW9uLnB1c2goQ2F0ZWdvcmllcy5saWJbY2F0ZWdvcnlOdW1dKVxuICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlDYXRlZ29yaWVzU2VsZWN0ZWQtLVxuICAgICAgICAgICAgaWYgKCEkc2NvcGUuZGlzcGxheUNhdGVnb3JpZXNTZWxlY3RlZCkgJHNjb3BlLndoZW5HYW1lSXNSZWFkeSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubmV4dFJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUucGFuZWxTZWxlY3RUYWIoMykgIC8vUHV0dGluZyB0aGlzIGluIHRoZSBIVE1MIGFsb25nIHdpdGggbmV3Um91bmQoKSBjYXVzZXMgYSBidWcgd2hlcmUgdGhlIGdhbWUgc29tZXRpbWVzIHdvbid0IHJ1biAoZGl2L2J1dHRvbiBpc3N1ZSlcbiAgICAgICAgICAgICRzY29wZS5uZXdSb3VuZCA9IG5ldyBHYW1lU2Vzc2lvbigkc2NvcGUuY2F0ZWdvcmllc0ZvckdhbWVTZXNzaW9uKVxuICAgICAgICAgICAgdmFyIGNob29zZW5DYXRlZ29yeSA9IGdldFJhbmRvbUNhdGVnb3J5KCRzY29wZS5uZXdSb3VuZC5hbGxDYXRlZ29yaWVzKVxuICAgICAgICAgICAgZ2V0QXJ0c3lEYXRhKGNob29zZW5DYXRlZ29yeSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbk5ld1JvdW5kKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzcGxheVJvdW5kKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0QXJ0c3lEYXRhKGNob29zZW5DYXRlZ29yeSkge1xuICAgICAgICAgICAgdmFyIGZyb21Sb290ID0gJ2h0dHBzOi8vYXBpLmFydHN5Lm5ldC9hcGknXG4gICAgICAgICAgICB2YXIgdG9QYXRoID0gWydnZW5lJywgJ2FydGlzdHMnXVxuICAgICAgICAgICAgdmFyIGRhdGEgPSBbXVxuXG4gICAgICAgICAgICByZXR1cm4gQXJ0c3kucmVxdWVzdFRva2VuKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oeGFwcFRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXJ0c3kuZ2V0QXJ0aXN0cyhmcm9tUm9vdCwgdG9QYXRoLCBjaG9vc2VuQ2F0ZWdvcnkuaWQsIHhhcHBUb2tlbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihhcnJheU9mQXJ0aXN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goYXJyYXlPZkFydGlzdHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaW5kQXJ0d29ya0ZvckNob29zZW5BcnRpc3QoYXJyYXlPZkFydGlzdHMsIHhhcHBUb2tlbiwgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZmluZEFydHdvcmtGb3JDaG9vc2VuQXJ0aXN0KGFycmF5T2ZBcnRpc3RzLCB4YXBwVG9rZW4sIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBjaG9vc2VuQXJ0aXN0ID0gcmFuZG9taXplcihhcnJheU9mQXJ0aXN0cylcbiAgICAgICAgICAgIHJldHVybiBBcnRzeS5nZXRBcnR3b3JrKGNob29zZW5BcnRpc3QsIHhhcHBUb2tlbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oYXJ0d29yaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJ0d29yay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIQVogQVJUV09SS1ouIFNUT1AgREEgUkVDVVJTRVouXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGNob29zZW5BcnRpc3QsIGFydHdvcmspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGT1VORFogTk8gQVJUWiwgVFJZSU4gQUdBSU4uXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbmRBcnR3b3JrRm9yQ2hvb3NlbkFydGlzdChhcnJheU9mQXJ0aXN0cywgeGFwcFRva2VuLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXNzaWduTmV3Um91bmQoZGF0YSkge1xuICAgICAgICAgICAgLy8gZGF0YSBjb25zaXN0cyBvZiBbQXJyYXlPZkFydGlzdHMsIGNvcnJlY3RBcnRpc3QgT2JqZWN0LCBjb3JyZWN0QXJ0aXN0J3MgYXJ0d29ya09iamVjdF1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICAkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydGlzdCA9IGRhdGFbMV0ubmFtZVxuXG4gICAgICAgICAgICAkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydHdvcmtPYmplY3QgPSByYW5kb21pemVyKGRhdGFbMl0pXG4gICAgICAgICAgICAkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydHdvcmtUaXRsZSA9ICRzY29wZS5uZXdSb3VuZC5jb3JyZWN0QXJ0d29ya09iamVjdC50aXRsZVxuXG4gICAgICAgICAgICB2YXIgY29ycmVjdEFydHdvcmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ycmVjdEFydHdvcmsnKVxuICAgICAgICAgICAgY29ycmVjdEFydHdvcmsuc3JjID0gJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RBcnR3b3JrT2JqZWN0Ll9saW5rcy50aHVtYm5haWwuaHJlZi5yZXBsYWNlKC9tZWRpdW0vZywgJ2xhcmdlJylcbiAgICAgICAgICAgICRzY29wZS5uZXdSb3VuZC5jb3JyZWN0QXJ0d29ya0xpbmsgPSAkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydHdvcmtPYmplY3QuX2xpbmtzLnRodW1ibmFpbC5ocmVmXG5cbiAgICAgICAgICAgIHNldE11bHRpcGxlQ2hvaWNlKGRhdGFbMF0pXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGl0bGU6IFwiLCAkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydHdvcmtUaXRsZSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb3JyZWN0IGFydGlzdDogJywgJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RBcnRpc3QpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5ld1JvdW5kOiBcIiwgY29ycmVjdEFydHdvcmsuc3JjKVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBTEwgSVogRE9ORVwiKVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0TXVsdGlwbGVDaG9pY2UoYXJyYXlPZkFydGlzdHMpIHtcblxuICAgICAgICAgICAgdmFyIHJhbmRvbUFydGlzdHMgPSBbXVxuICAgICAgICAgICAgLy8gRmlyc3QgZmluZCB0aGUgY29ycmVjdCBhcnRpc3QgZm9yIHRoZSBhbnN3ZXIgYW5kIHB1c2ggdGhlbSB0byB0aGUgYXJyYXlcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlPZkFydGlzdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RBcnRpc3QgPT09IGFycmF5T2ZBcnRpc3RzW2ldLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFuZG9tQXJ0aXN0cy5wdXNoKGFycmF5T2ZBcnRpc3RzW2ldLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGFycmF5T2ZBcnRpc3RzLnNwbGljZShpLCAxKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoZW4gcmFuZG9tbHkgY2hvb3NlIDMgbW9yZSBhcnRpc3RzIGFuZCBwdXNoIHRoZW0gdG8gdGhlIGFycmF5XG4gICAgICAgICAgICBmb3IgKHZhciBjb3VudGVyID0gMTsgY291bnRlciA8IDQ7IGNvdW50ZXIrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbiA9IHJhbmRvbWl6ZXIoYXJyYXlPZkFydGlzdHMsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbUFydGlzdHMucHVzaChhcnJheU9mQXJ0aXN0c1tuXS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICBhcnJheU9mQXJ0aXN0cy5zcGxpY2UobiwgMSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZpbmFsbHkgYXNzaWduIG5ld1JvdW5kIGtleXMgdG8gdGhlIGl0ZW1zIGluIHRoZSBhcnJheSByYW5kb21seVxuICAgICAgICAgICAgdmFyIHJhbmRvbSA9IHNodWZmbGUocmFuZG9tQXJ0aXN0cylcbiAgICAgICAgICAgICRzY29wZS5uZXdSb3VuZC5hcnRpc3RPbmUgPSByYW5kb21bMF1cbiAgICAgICAgICAgICRzY29wZS5uZXdSb3VuZC5hcnRpc3RUd28gPSByYW5kb21bMV1cbiAgICAgICAgICAgICRzY29wZS5uZXdSb3VuZC5hcnRpc3RUaHJlZSA9IHJhbmRvbVsyXVxuICAgICAgICAgICAgJHNjb3BlLm5ld1JvdW5kLmFydGlzdEZvdXIgPSByYW5kb21bM11cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNodWZmbGUoYXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBhcnIgPSBbXVxuICAgICAgICAgICAgYXJyYXkucmV2ZXJzZSgpXG4gICAgICAgICAgICB2YXIgeCA9IGFycmF5LnNwbGljZShyYW5kb21pemVyKGFycmF5LCB0cnVlKSwgMSlcbiAgICAgICAgICAgIHZhciB5ID0gYXJyYXkuc3BsaWNlKHJhbmRvbWl6ZXIoYXJyYXksIHRydWUpLCAxKVxuICAgICAgICAgICAgYXJyID0gYXJyYXkuY29uY2F0KHgpLmNvbmNhdCh5KVxuICAgICAgICAgICAgcmV0dXJuIGFyclxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tQ2F0ZWdvcnkoY2F0ZWdvcmllcykge1xuICAgICAgICAgICAgdmFyIHJhbmRvbUNhdGVnb3J5ID0gcmFuZG9taXplcihjYXRlZ29yaWVzKVxuICAgICAgICAgICAgJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RDYXRlZ29yeSA9IHJhbmRvbUNhdGVnb3J5Lm5hbWVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb3JyZWN0IENhdGVnb3J5OiAnLCAkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5KVxuICAgICAgICAgICAgcmV0dXJuIHJhbmRvbUNhdGVnb3J5XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByYW5kb21pemVyKGFycmF5LCBuZWVkTnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgcmFuZG9tTnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGFycmF5Lmxlbmd0aCkpXG4gICAgICAgICAgICBpZiAobmVlZE51bWJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiByYW5kb21OdW1iZXJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5W3JhbmRvbU51bWJlcl1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5kaXNwbGF5Um91bmQgPSBmdW5jdGlvbihuZXdSb3VuZCkge1xuICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlSb3VuZE51bWJlcisrXG4gICAgICAgICAgICAkc2NvcGUuc2hvd1NlY29uZFNldE9mQ2hvaWNlcyA9IGZhbHNlXG5cbiAgICAgICAgICAgICRzY29wZS5kaXNwbGF5Q2F0ZWdvcnlPbmUgPSAkc2NvcGUubmV3Um91bmQuY2F0ZWdvcnlPbmVcbiAgICAgICAgICAgICRzY29wZS5kaXNwbGF5Q2F0ZWdvcnlUd28gPSAkc2NvcGUubmV3Um91bmQuY2F0ZWdvcnlUd29cbiAgICAgICAgICAgICRzY29wZS5kaXNwbGF5Q2F0ZWdvcnlUaHJlZSA9ICRzY29wZS5uZXdSb3VuZC5jYXRlZ29yeVRocmVlXG4gICAgICAgICAgICAkc2NvcGUuZGlzcGxheUNhdGVnb3J5Rm91ciA9ICRzY29wZS5uZXdSb3VuZC5jYXRlZ29yeUZvdXJcbiAgICAgICAgICAgICRzY29wZS5kaXNwbGF5QXJ0d29ya1RpdGxlID0gJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RBcnR3b3JrVGl0bGVcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZURpc3BsYXkoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGlzcGxheUFydGlzdE9uZSA9ICRzY29wZS5uZXdSb3VuZC5hcnRpc3RPbmVcbiAgICAgICAgICAgICRzY29wZS5kaXNwbGF5QXJ0aXN0VHdvID0gJHNjb3BlLm5ld1JvdW5kLmFydGlzdFR3b1xuICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlBcnRpc3RUaHJlZSA9ICRzY29wZS5uZXdSb3VuZC5hcnRpc3RUaHJlZVxuICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlBcnRpc3RGb3VyID0gJHNjb3BlLm5ld1JvdW5kLmFydGlzdEZvdXJcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5jaGVja0ZpcnN0U2V0ID0gZnVuY3Rpb24obnVtYmVyKSB7XG4gICAgICAgICAgICAvL1JlZmFjdG9yIE5vdGU6IEp1c3QgdXNlIHRoZSBpZi1jaGVjayB3aXRoIHRoZSBkaXNwbGF5IHBhc3NlZCBhcyBhbiBhcmd1bWVudC4gTm8gbmVlZCBmb3Igc3dpdGNoLlxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY2hvaWNlID09PSAkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5KVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY2hvaWNlKVxuICAgICAgICAgICAgLy8gaWYoY2hvaWNlID09PSAkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5KSB7XG4gICAgICAgICAgICAvLyAgICAgJHNjb3BlLmRpc3BsYXlTY29yZSsrXG4gICAgICAgICAgICAvLyAgICAgJHNjb3BlLnNob3dTZWNvbmRTZXRPZkNob2ljZXMgPSB0cnVlXG4gICAgICAgICAgICAvLyAgICAgdXBkYXRlRGlzcGxheSgkc2NvcGUubmV3Um91bmQpXG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAobnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5ID09PSAkc2NvcGUuZGlzcGxheUNhdGVnb3J5T25lKVxuICAgICAgICAgICAgICAgICAgICBpZigkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5ID09PSAkc2NvcGUuZGlzcGxheUNhdGVnb3J5T25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzcGxheVNjb3JlKytcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93U2Vjb25kU2V0T2ZDaG9pY2VzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlRGlzcGxheSgkc2NvcGUubmV3Um91bmQpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV1JPTkchJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrR2FtZVJvdW5kcygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5ID09PSAkc2NvcGUuZGlzcGxheUNhdGVnb3J5VHdvKVxuICAgICAgICAgICAgICAgICAgICBpZigkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5ID09PSAkc2NvcGUuZGlzcGxheUNhdGVnb3J5VHdvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzcGxheVNjb3JlKytcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93U2Vjb25kU2V0T2ZDaG9pY2VzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlRGlzcGxheSgkc2NvcGUubmV3Um91bmQpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV1JPTkchJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrR2FtZVJvdW5kcygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubmV3Um91bmQuY29ycmVjdENhdGVnb3J5ID09PSAkc2NvcGUuZGlzcGxheUNhdGVnb3J5VGhyZWUpXG4gICAgICAgICAgICAgICAgICAgIGlmKCRzY29wZS5uZXdSb3VuZC5jb3JyZWN0Q2F0ZWdvcnkgPT09ICRzY29wZS5kaXNwbGF5Q2F0ZWdvcnlUaHJlZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlTY29yZSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd1NlY29uZFNldE9mQ2hvaWNlcyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZURpc3BsYXkoJHNjb3BlLm5ld1JvdW5kKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dST05HIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0dhbWVSb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RDYXRlZ29yeSA9PT0gJHNjb3BlLmRpc3BsYXlDYXRlZ29yeUZvdXIpXG4gICAgICAgICAgICAgICAgICAgIGlmKCRzY29wZS5uZXdSb3VuZC5jb3JyZWN0Q2F0ZWdvcnkgPT09ICRzY29wZS5kaXNwbGF5Q2F0ZWdvcnlGb3VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGlzcGxheVNjb3JlKytcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93U2Vjb25kU2V0T2ZDaG9pY2VzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlRGlzcGxheSgkc2NvcGUubmV3Um91bmQpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV1JPTkchJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrR2FtZVJvdW5kcygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggY2hlY2tGaXJzdFNldCgpJylcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuY2hlY2tTZWNvbmRTZXQgPSBmdW5jdGlvbihudW1iZXIpIHtcbiAgICAgICAgICAgIHN3aXRjaCAobnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydGlzdCA9PT0gJHNjb3BlLmRpc3BsYXlBcnRpc3RPbmUpXG4gICAgICAgICAgICAgICAgICAgIGlmKCRzY29wZS5uZXdSb3VuZC5jb3JyZWN0QXJ0aXN0ID09PSAkc2NvcGUuZGlzcGxheUFydGlzdE9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlTY29yZSArPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0dhbWVSb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dST05HIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0dhbWVSb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RBcnRpc3QgPT09ICRzY29wZS5kaXNwbGF5QXJ0aXN0VHdvKVxuICAgICAgICAgICAgICAgICAgICBpZigkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydGlzdCA9PT0gJHNjb3BlLmRpc3BsYXlBcnRpc3RUd28pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kaXNwbGF5U2NvcmUgKz0gMlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tHYW1lUm91bmRzKClcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXUk9ORyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tHYW1lUm91bmRzKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5uZXdSb3VuZC5jb3JyZWN0QXJ0aXN0ID09PSAkc2NvcGUuZGlzcGxheUFydGlzdFRocmVlKVxuICAgICAgICAgICAgICAgICAgICBpZigkc2NvcGUubmV3Um91bmQuY29ycmVjdEFydGlzdCA9PT0gJHNjb3BlLmRpc3BsYXlBcnRpc3RUaHJlZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlTY29yZSArPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0dhbWVSb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dST05HIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0dhbWVSb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RBcnRpc3QgPT09ICRzY29wZS5kaXNwbGF5QXJ0aXN0Rm91cilcbiAgICAgICAgICAgICAgICAgICAgaWYoJHNjb3BlLm5ld1JvdW5kLmNvcnJlY3RBcnRpc3QgPT09ICRzY29wZS5kaXNwbGF5QXJ0aXN0Rm91cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlTY29yZSArPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0dhbWVSb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dST05HIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0dhbWVSb3VuZHMoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIGNoZWNrU2Vjb25kU2V0KCknKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrR2FtZVJvdW5kcygpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZGlzcGxheVJvdW5kTnVtYmVyID49IDEwKSB7XG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNYWtlIG5ldyByb3VuZD8nKVxuICAgICAgICAgICAgICAgICRzY29wZS5uZXh0Um91bmQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcbiAgICAgICAgICAgICRzY29wZS5wYW5lbFRhYiA9IDRcbiAgICAgICAgfVxuXG4gICAgfV0pIC8vIEVORCBPRiBHQU1FIENPTlRST0xMRVJcblxuICAgIGZ1bmN0aW9uIEdhbWVTZXNzaW9uIChjYXRlZ29yaWVzKSB7XG4gICAgICAgIHRoaXMuYWxsQ2F0ZWdvcmllcyA9IGNhdGVnb3JpZXNcbiAgICAgICAgdGhpcy5jYXRlZ29yeU9uZSA9IGNhdGVnb3JpZXNbMF0ubmFtZVxuICAgICAgICB0aGlzLmNhdGVnb3J5VHdvID0gY2F0ZWdvcmllc1sxXS5uYW1lXG4gICAgICAgIHRoaXMuY2F0ZWdvcnlUaHJlZSA9IGNhdGVnb3JpZXNbMl0ubmFtZVxuICAgICAgICB0aGlzLmNhdGVnb3J5Rm91ciA9IGNhdGVnb3JpZXNbM10ubmFtZVxuXG4gICAgICAgIHRoaXMuY29ycmVjdEFydHdvcmtPYmplY3Q7XG4gICAgICAgIHRoaXMuY29ycmVjdEFydHdvcmtUaXRsZTtcbiAgICAgICAgdGhpcy5jb3JyZWN0QXJ0d29ya0xpbms7XG4gICAgICAgIHRoaXMuY29ycmVjdEFydGlzdDtcbiAgICAgICAgdGhpcy5jb3JyZWN0Q2F0ZWdvcnk7XG5cbiAgICAgICAgdGhpcy5hcnRpc3RPbmU7XG4gICAgICAgIHRoaXMuYXJ0aXN0VHdvO1xuICAgICAgICB0aGlzLmFydGlzdFRocmVlO1xuICAgICAgICB0aGlzLmFydGlzdEZvdXI7XG4gICAgfVxuXG59KSgpOyAvL0VORCBPRiBJSUZFXG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gKHRoaXMgfHwgc2VsZilcbiAgOiB3aW5kb3c7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBUT0RPOiBmdXR1cmUgcHJvb2YsIG1vdmUgdG8gY29tcG9lbnQgbGFuZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0hvc3Qob2JqKSB7XG4gIHZhciBzdHIgPSB7fS50b1N0cmluZy5jYWxsKG9iaik7XG5cbiAgc3dpdGNoIChzdHIpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZpbGVdJzpcbiAgICBjYXNlICdbb2JqZWN0IEJsb2JdJzpcbiAgICBjYXNlICdbb2JqZWN0IEZvcm1EYXRhXSc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5yZXF1ZXN0LmdldFhIUiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAgICYmICghcm9vdC5sb2NhdGlvbiB8fCAnZmlsZTonICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2xcbiAgICAgICAgICB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHRyaW0gPSAnJy50cmltXG4gID8gZnVuY3Rpb24ocykgeyByZXR1cm4gcy50cmltKCk7IH1cbiAgOiBmdW5jdGlvbihzKSB7IHJldHVybiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpOyB9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBwYWlycyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG51bGwgIT0gb2JqW2tleV0pIHtcbiAgICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tleV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFydHM7XG4gIHZhciBwYWlyO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwYXJ0cyA9IHBhaXIuc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ2FwcGxpY2F0aW9uL3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogc2VyaWFsaXplLFxuICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeVxuIH07XG5cbiAvKipcbiAgKiBEZWZhdWx0IHBhcnNlcnMuXG4gICpcbiAgKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAgKiAgICAgfTtcbiAgKlxuICAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgdmFyIGZpZWxkcyA9IHt9O1xuICB2YXIgaW5kZXg7XG4gIHZhciBsaW5lO1xuICB2YXIgZmllbGQ7XG4gIHZhciB2YWw7XG5cbiAgbGluZXMucG9wKCk7IC8vIHRyYWlsaW5nIENSTEZcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9ICgodGhpcy5yZXEubWV0aG9kICE9J0hFQUQnICYmICh0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICcnIHx8IHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnKSkgfHwgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgIDogbnVsbDtcbiAgdGhpcy5zdGF0dXNUZXh0ID0gdGhpcy5yZXEueGhyLnN0YXR1c1RleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgKHN0ci5sZW5ndGggfHwgc3RyIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuXG4gICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaiB8fCBpc0hvc3QoZGF0YSkpIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IHJlcXVlc3QuZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIHZhciBzdGF0dXM7XG4gICAgdHJ5IHsgc3RhdHVzID0geGhyLnN0YXR1cyB9IGNhdGNoKGUpIHsgc3RhdHVzID0gMDsgfVxuXG4gICAgaWYgKDAgPT0gc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgdmFyIGhhbmRsZVByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfTtcbiAgaWYgKHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSBoYW5kbGVQcm9ncmVzcztcbiAgfVxuICB0cnkge1xuICAgIGlmICh4aHIudXBsb2FkICYmIHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBoYW5kbGVQcm9ncmVzcztcbiAgICB9XG4gIH0gY2F0Y2goZSkge1xuICAgIC8vIEFjY2Vzc2luZyB4aHIudXBsb2FkIGZhaWxzIGluIElFIGZyb20gYSB3ZWIgd29ya2VyLCBzbyBqdXN0IHByZXRlbmQgaXQgZG9lc24ndCBleGlzdC5cbiAgICAvLyBSZXBvcnRlZCBoZXJlOlxuICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLnRpbWVkb3V0ID0gdHJ1ZTtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBjb250ZW50VHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZhdXggcHJvbWlzZSBzdXBwb3J0XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAoZnVsZmlsbCwgcmVqZWN0KSB7XG4gIHJldHVybiB0aGlzLmVuZChmdW5jdGlvbihlcnIsIHJlcykge1xuICAgIGVyciA/IHJlamVjdChlcnIpIDogZnVsZmlsbChyZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYWxmcmVkID0gcmVxdWlyZSgnaGFsZnJlZCcpO1xuXG5mdW5jdGlvbiBKc29uSGFsQWRhcHRlcihsb2cpIHtcbiAgdGhpcy5sb2cgPSBsb2c7XG59XG5cbkpzb25IYWxBZGFwdGVyLm1lZGlhVHlwZSA9ICdhcHBsaWNhdGlvbi9oYWwranNvbic7XG5cbi8vIFRPRE8gUGFzcyB0aGUgdHJhdmVyc2FsIHN0YXRlIGludG8gdGhlIGFkYXB0ZXIuLi4gYW5kIHBvc3NpYmx5IGFsc28gb25seVxuLy8gbW9kaWZ5IGl0LCBkbyBub3QgcmV0dXJuIGFueXRoaW5nLlxuSnNvbkhhbEFkYXB0ZXIucHJvdG90eXBlLmZpbmROZXh0U3RlcCA9IGZ1bmN0aW9uKGRvYywga2V5LCBwcmVmZXJFbWJlZGRlZCkge1xuICB0aGlzLmxvZy5kZWJ1ZygncGFyc2luZyBoYWwnKTtcbiAgdmFyIGN0eCA9IHtcbiAgICBkb2M6IGRvYyxcbiAgICBoYWxSZXNvdXJjZTogaGFsZnJlZC5wYXJzZShkb2MpLFxuICAgIHBhcnNlZEtleTogcGFyc2VLZXkoa2V5KSxcbiAgICBsaW5rU3RlcDogbnVsbCxcbiAgICBlbWJlZGRlZFN0ZXA6IG51bGwsXG4gIH07XG4gIHJlc29sdmVDdXJpZShjdHgpO1xuICBmaW5kTGluayhjdHgsIHRoaXMubG9nKTtcbiAgZmluZEVtYmVkZGVkKGN0eCwgdGhpcy5sb2cpO1xuICByZXR1cm4gcHJlcGFyZVJlc3VsdChjdHgsIGtleSwgcHJlZmVyRW1iZWRkZWQpO1xufTtcblxuZnVuY3Rpb24gcHJlcGFyZVJlc3VsdChjdHgsIGtleSwgcHJlZmVyRW1iZWRkZWQpIHtcbiAgdmFyIHN0ZXA7XG4gIGlmIChwcmVmZXJFbWJlZGRlZCB8fCBjdHgucGFyc2VkS2V5Lm1vZGUgPT09ICdhbGwnKSB7XG4gICAgc3RlcCA9IGN0eC5lbWJlZGRlZFN0ZXAgfHwgY3R4LmxpbmtTdGVwO1xuICB9IGVsc2Uge1xuICAgIHN0ZXAgPSBjdHgubGlua1N0ZXAgfHwgY3R4LmVtYmVkZGVkU3RlcDtcbiAgfVxuXG4gIGlmIChzdGVwKSB7XG4gICAgcmV0dXJuIHN0ZXA7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1lc3NhZ2UgPSAnQ291bGQgbm90IGZpbmQgYSBtYXRjaGluZyBsaW5rIG5vciBhbiBlbWJlZGRlZCBkb2N1bWVudCAnK1xuICAgICAgJ2ZvciAnICsga2V5ICsgJy4nO1xuICAgIGlmIChjdHgubGlua0Vycm9yKSB7XG4gICAgICBtZXNzYWdlICs9ICcgRXJyb3Igd2hpbGUgcmVzb2x2aW5nIGxpbmtlZCBkb2N1bWVudHM6ICcgKyBjdHgubGlua0Vycm9yO1xuICAgIH1cbiAgICBpZiAoY3R4LmVtYmVkZGVkRXJyb3IpIHtcbiAgICAgIG1lc3NhZ2UgKz0gJyBFcnJvciB3aGlsZSByZXNvbHZpbmcgZW1iZWRkZWQgZG9jdW1lbnRzOiAnICtcbiAgICAgICAgY3R4LmVtYmVkZGVkRXJyb3I7XG4gICAgfVxuICAgIG1lc3NhZ2UgKz0gJyBEb2N1bWVudDogJyArIEpTT04uc3RyaW5naWZ5KGN0eC5kb2MpO1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlS2V5KGtleSkge1xuICB2YXIgbWF0Y2ggPSBrZXkubWF0Y2goLyguKilcXFsoLiopOiguKilcXF0vKTtcbiAgLy8gZWE6YWRtaW5bdGl0bGU6S2F0ZV0gPT4gYWNjZXNzIGJ5IHNlY29uZGFyeSBrZXlcbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGU6ICdzZWNvbmRhcnknLFxuICAgICAga2V5OiBtYXRjaFsxXSxcbiAgICAgIHNlY29uZGFyeUtleTogbWF0Y2hbMl0sXG4gICAgICBzZWNvbmRhcnlWYWx1ZTogbWF0Y2hbM10sXG4gICAgICBpbmRleDogbnVsbCxcbiAgICB9O1xuICB9XG4gIC8vIGVhOm9yZGVyWzNdID0+IGluZGV4IGFjY2VzcyBpbnRvIGVtYmVkZGVkIGFycmF5XG4gIG1hdGNoID0ga2V5Lm1hdGNoKC8oLiopXFxbKFxcZCspXFxdLyk7XG4gIGlmIChtYXRjaCkge1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlOiAnaW5kZXgnLFxuICAgICAga2V5OiBtYXRjaFsxXSxcbiAgICAgIHNlY29uZGFyeUtleTogbnVsbCxcbiAgICAgIHNlY29uZGFyeVZhbHVlOiBudWxsLFxuICAgICAgaW5kZXg6IG1hdGNoWzJdLFxuICAgIH07XG4gIH1cbiAgLy8gZWE6b3JkZXJbJGFsbF0gPT4gbWV0YS1rZXksIHJldHVybiBmdWxsIGFycmF5XG4gIG1hdGNoID0ga2V5Lm1hdGNoKC8oLiopXFxbXFwkYWxsXFxdLyk7XG4gIGlmIChtYXRjaCkge1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlOiAnYWxsJyxcbiAgICAgIGtleTogbWF0Y2hbMV0sXG4gICAgICBzZWNvbmRhcnlLZXk6IG51bGwsXG4gICAgICBzZWNvbmRhcnlWYWx1ZTogbnVsbCxcbiAgICAgIGluZGV4OiBudWxsLFxuICAgIH07XG4gIH1cbiAgLy8gZWE6b3JkZXIgPT4gc2ltcGxlIGxpbmsgcmVsYXRpb25cbiAgcmV0dXJuIHtcbiAgICBtb2RlOiAnZmlyc3QnLFxuICAgIGtleToga2V5LFxuICAgIHNlY29uZGFyeUtleTogbnVsbCxcbiAgICBzZWNvbmRhcnlWYWx1ZTogbnVsbCxcbiAgICBpbmRleDogbnVsbCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUN1cmllKGN0eCkge1xuICBpZiAoY3R4LmhhbFJlc291cmNlLmhhc0N1cmllcygpKSB7XG4gICAgY3R4LnBhcnNlZEtleS5jdXJpZSA9XG4gICAgICBjdHguaGFsUmVzb3VyY2UucmV2ZXJzZVJlc29sdmVDdXJpZShjdHgucGFyc2VkS2V5LmtleSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZExpbmsoY3R4LCBsb2cpIHtcbiAgdmFyIGxpbmtBcnJheSA9IGN0eC5oYWxSZXNvdXJjZS5saW5rQXJyYXkoY3R4LnBhcnNlZEtleS5rZXkpO1xuICBpZiAoIWxpbmtBcnJheSkge1xuICAgIGxpbmtBcnJheSA9IGN0eC5oYWxSZXNvdXJjZS5saW5rQXJyYXkoY3R4LnBhcnNlZEtleS5jdXJpZSk7XG4gIH1cbiAgaWYgKCFsaW5rQXJyYXkgfHwgbGlua0FycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHN3aXRjaCAoY3R4LnBhcnNlZEtleS5tb2RlKSB7XG4gICAgY2FzZSAnc2Vjb25kYXJ5JzpcbiAgICAgIGZpbmRMaW5rQnlTZWNvbmRhcnlLZXkoY3R4LCBsaW5rQXJyYXksIGxvZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbmRleCc6XG4gICAgICBmaW5kTGlua0J5SW5kZXgoY3R4LCBsaW5rQXJyYXksIGxvZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmaXJzdCc6XG4gICAgICBmaW5kTGlua1dpdGhvdXRJbmRleChjdHgsIGxpbmtBcnJheSwgbG9nKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lsbGVnYWwgbW9kZTogJyArIGN0eC5wYXJzZWRLZXkubW9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZExpbmtCeVNlY29uZGFyeUtleShjdHgsIGxpbmtBcnJheSwgbG9nKSB7XG4gIC8vIGNsaWVudCBzZWxlY3RlZCBhIHNwZWNpZmljIGxpbmsgYnkgYW4gZXhwbGljaXQgc2Vjb25kYXJ5IGtleSBsaWtlICduYW1lJyxcbiAgLy8gc28gdXNlIGl0IG9yIGZhaWxcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IGxpbmtBcnJheS5sZW5ndGg7IGkrKykge1xuICAgIHZhciB2YWwgPSBsaW5rQXJyYXlbaV1bY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlLZXldO1xuICAgIC8qIGpzaGludCAtVzExNiAqL1xuICAgIGlmICh2YWwgIT0gbnVsbCAmJiB2YWwgPT0gY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlWYWx1ZSkge1xuICAgICAgaWYgKCFsaW5rQXJyYXlbaV0uaHJlZikge1xuICAgICAgICBjdHgubGlua0Vycm9yID0gJ1RoZSBsaW5rICcgKyBjdHgucGFyc2VkS2V5LmtleSArICdbJyArXG4gICAgICAgICAgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlLZXkgKyAnOicgKyBjdHgucGFyc2VkS2V5LnNlY29uZGFyeVZhbHVlICtcbiAgICAgICAgICAgICddIGV4aXN0cywgYnV0IGl0IGhhcyBubyBocmVmIGF0dHJpYnV0ZS4nO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2cuZGVidWcoJ2ZvdW5kIGhhbCBsaW5rOiAnICsgbGlua0FycmF5W2ldLmhyZWYpO1xuICAgICAgY3R4LmxpbmtTdGVwID0geyB1cmw6IGxpbmtBcnJheVtpXS5ocmVmIH07XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8qIGpzaGludCArVzExNiAqL1xuICB9XG4gIGN0eC5saW5rRXJyb3IgPSBjdHgucGFyc2VkS2V5LmtleSArICdbJyArIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5S2V5ICsgJzonICtcbiAgICAgIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5VmFsdWUgK1xuICAgICAnXSByZXF1ZXN0ZWQsIGJ1dCB0aGVyZSBpcyBubyBzdWNoIGxpbmsuJztcbn1cblxuZnVuY3Rpb24gZmluZExpbmtCeUluZGV4KGN0eCwgbGlua0FycmF5LCBsb2cpIHtcbiAgLy8gY2xpZW50IHNwZWNpZmllZCBhbiBleHBsaWNpdCBhcnJheSBpbmRleCBmb3IgdGhpcyBsaW5rLCBzbyB1c2UgaXQgb3IgZmFpbFxuICBpZiAoIWxpbmtBcnJheVtjdHgucGFyc2VkS2V5LmluZGV4XSkge1xuICAgIGN0eC5saW5rRXJyb3IgPSAnVGhlIGxpbmsgYXJyYXkgJyArIGN0eC5wYXJzZWRLZXkua2V5ICtcbiAgICAgICAgJyBleGlzdHMsIGJ1dCBoYXMgbm8gZWxlbWVudCBhdCBpbmRleCAnICsgY3R4LnBhcnNlZEtleS5pbmRleCArICcuJztcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCFsaW5rQXJyYXlbY3R4LnBhcnNlZEtleS5pbmRleF0uaHJlZikge1xuICAgIGN0eC5saW5rRXJyb3IgPSAnVGhlIGxpbmsgJyArIGN0eC5wYXJzZWRLZXkua2V5ICsgJ1snICtcbiAgICAgIGN0eC5wYXJzZWRLZXkuaW5kZXggKyAnXSBleGlzdHMsIGJ1dCBpdCBoYXMgbm8gaHJlZiBhdHRyaWJ1dGUuJztcbiAgICByZXR1cm47XG4gIH1cbiAgbG9nLmRlYnVnKCdmb3VuZCBoYWwgbGluazogJyArIGxpbmtBcnJheVtjdHgucGFyc2VkS2V5LmluZGV4XS5ocmVmKTtcbiAgY3R4LmxpbmtTdGVwID0geyB1cmw6IGxpbmtBcnJheVtjdHgucGFyc2VkS2V5LmluZGV4XS5ocmVmIH07XG59XG5cbmZ1bmN0aW9uIGZpbmRMaW5rV2l0aG91dEluZGV4KGN0eCwgbGlua0FycmF5LCBsb2cpIHtcbiAgLy8gY2xpZW50IGRpZCBub3Qgc3BlY2lmeSBhbiBhcnJheSBpbmRleCBmb3IgdGhpcyBsaW5rLCBhcmJpdHJhcmlseSBjaG9vc2VcbiAgLy8gdGhlIGZpcnN0IHRoYXQgaGFzIGEgaHJlZiBhdHRyaWJ1dGVcbiAgdmFyIGxpbms7XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsaW5rQXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgaWYgKGxpbmtBcnJheVtpbmRleF0uaHJlZikge1xuICAgICAgbGluayA9IGxpbmtBcnJheVtpbmRleF07XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGxpbmspIHtcbiAgICBpZiAobGlua0FycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICAgIGxvZy53YXJuKCdGb3VuZCBIQUwgbGluayBhcnJheSB3aXRoIG1vcmUgdGhhbiBvbmUgZWxlbWVudCBmb3IgJyArXG4gICAgICAgICAgJ2tleSAnICsgY3R4LnBhcnNlZEtleS5rZXkgKyAnLCBhcmJpdHJhcmlseSBjaG9vc2luZyBpbmRleCAnICsgaW5kZXggK1xuICAgICAgICAgICcsIGJlY2F1c2UgaXQgd2FzIHRoZSBmaXJzdCB0aGF0IGhhZCBhIGhyZWYgYXR0cmlidXRlLicpO1xuICAgIH1cbiAgICBsb2cuZGVidWcoJ2ZvdW5kIGhhbCBsaW5rOiAnICsgbGluay5ocmVmKTtcbiAgICBjdHgubGlua1N0ZXAgPSB7IHVybDogbGluay5ocmVmIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZEVtYmVkZGVkKGN0eCwgbG9nKSB7XG4gIGxvZy5kZWJ1ZygnY2hlY2tpbmcgZm9yIGVtYmVkZGVkOiAnICsgY3R4LnBhcnNlZEtleS5rZXkgK1xuICAgICAgKGN0eC5wYXJzZWRLZXkuaW5kZXggPyBjdHgucGFyc2VkS2V5LmluZGV4IDogJycpKTtcblxuICB2YXIgcmVzb3VyY2VBcnJheSA9IGN0eC5oYWxSZXNvdXJjZS5lbWJlZGRlZEFycmF5KGN0eC5wYXJzZWRLZXkua2V5KTtcbiAgaWYgKCFyZXNvdXJjZUFycmF5IHx8IHJlc291cmNlQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgbG9nLmRlYnVnKCdGb3VuZCBhbiBhcnJheSBvZiBlbWJlZGRlZCByZXNvdXJjZSBmb3I6ICcgKyBjdHgucGFyc2VkS2V5LmtleSk7XG5cbiAgc3dpdGNoIChjdHgucGFyc2VkS2V5Lm1vZGUpIHtcbiAgICBjYXNlICdzZWNvbmRhcnknOlxuICAgICAgZmluZEVtYmVkZGVkQnlTZWNvbmRhcnlLZXkoY3R4LCByZXNvdXJjZUFycmF5LCBsb2cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW5kZXgnOlxuICAgICAgZmluZEVtYmVkZGVkQnlJbmRleChjdHgsIHJlc291cmNlQXJyYXksIGxvZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhbGwnOlxuICAgICAgZmluZEVtYmVkZGVkQWxsKGN0eCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmaXJzdCc6XG4gICAgICBmaW5kRW1iZWRkZWRXaXRob3V0SW5kZXgoY3R4LCByZXNvdXJjZUFycmF5LCBsb2cpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBtb2RlOiAnICsgY3R4LnBhcnNlZEtleS5tb2RlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kRW1iZWRkZWRCeVNlY29uZGFyeUtleShjdHgsIGVtYmVkZGVkQXJyYXksIGxvZykge1xuICAvLyBjbGllbnQgc2VsZWN0ZWQgYSBzcGVjaWZpYyBlbWJlZCBieSBhbiBleHBsaWNpdCBzZWNvbmRhcnkga2V5LFxuICAvLyBzbyB1c2UgaXQgb3IgZmFpbFxuICB2YXIgaSA9IDA7XG4gIGZvciAoOyBpIDwgZW1iZWRkZWRBcnJheS5sZW5ndGg7IGkrKykge1xuICAgIHZhciB2YWwgPSBlbWJlZGRlZEFycmF5W2ldW2N0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5S2V5XTtcbiAgICAvKiBqc2hpbnQgLVcxMTYgKi9cbiAgICBpZiAodmFsICE9IG51bGwgJiYgdmFsID09IGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5VmFsdWUpIHtcbiAgICAgIGxvZy5kZWJ1ZygnRm91bmQgYW4gZW1iZWRkZWQgcmVzb3VyY2UgZm9yOiAnICsgY3R4LnBhcnNlZEtleS5rZXkgKyAnWycgK1xuICAgICAgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlLZXkgKyAnOicgKyBjdHgucGFyc2VkS2V5LnNlY29uZGFyeVZhbHVlICsgJ10nKTtcbiAgICAgIGN0eC5lbWJlZGRlZFN0ZXAgPSB7IGRvYzogZW1iZWRkZWRBcnJheVtpXS5vcmlnaW5hbCgpIH07XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8qIGpzaGludCArVzExNiAqL1xuICB9XG4gIGN0eC5lbWJlZGRlZEVycm9yID0gY3R4LnBhcnNlZEtleS5rZXkgKyAnWycgKyBjdHgucGFyc2VkS2V5LnNlY29uZGFyeUtleSArXG4gICAgJzonICsgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlWYWx1ZSArXG4gICAgJ10gcmVxdWVzdGVkLCBidXQgdGhlIGVtYmVkZGVkIGFycmF5ICcgKyBjdHgucGFyc2VkS2V5LmtleSArXG4gICAgJyBoYXMgbm8gc3VjaCBlbGVtZW50Lic7XG59XG5cbmZ1bmN0aW9uIGZpbmRFbWJlZGRlZEJ5SW5kZXgoY3R4LCByZXNvdXJjZUFycmF5LCBsb2cpIHtcbiAgLy8gY2xpZW50IHNwZWNpZmllZCBhbiBleHBsaWNpdCBhcnJheSBpbmRleCwgc28gdXNlIGl0IG9yIGZhaWxcbiAgaWYgKCFyZXNvdXJjZUFycmF5W2N0eC5wYXJzZWRLZXkuaW5kZXhdKSB7XG4gICAgY3R4LmVtYmVkZGVkRXJyb3IgPSAnVGhlIGVtYmVkZGVkIGFycmF5ICcgKyBjdHgucGFyc2VkS2V5LmtleSArXG4gICAgICAnIGV4aXN0cywgYnV0IGhhcyBubyBlbGVtZW50IGF0IGluZGV4ICcgKyBjdHgucGFyc2VkS2V5LmluZGV4ICsgJy4nO1xuICAgIHJldHVybjtcbiAgfVxuICBsb2cuZGVidWcoJ0ZvdW5kIGFuIGVtYmVkZGVkIHJlc291cmNlIGZvcjogJyArIGN0eC5wYXJzZWRLZXkua2V5ICsgJ1snICtcbiAgICAgIGN0eC5wYXJzZWRLZXkuaW5kZXggKyAnXScpO1xuICBjdHguZW1iZWRkZWRTdGVwID0ge1xuICAgIGRvYzogcmVzb3VyY2VBcnJheVtjdHgucGFyc2VkS2V5LmluZGV4XS5vcmlnaW5hbCgpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpbmRFbWJlZGRlZEFsbChjdHgpIHtcbiAgY3R4LmVtYmVkZGVkU3RlcCA9IHtcbiAgICBkb2M6IGN0eC5oYWxSZXNvdXJjZS5vcmlnaW5hbCgpLl9lbWJlZGRlZFtjdHgucGFyc2VkS2V5LmtleV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZmluZEVtYmVkZGVkV2l0aG91dEluZGV4KGN0eCwgcmVzb3VyY2VBcnJheSwgbG9nKSB7XG4gIC8vIGNsaWVudCBkaWQgbm90IHNwZWNpZnkgYW4gYXJyYXkgaW5kZXgsIGFyYml0cmFyaWx5IGNob29zZSBmaXJzdFxuICBpZiAocmVzb3VyY2VBcnJheS5sZW5ndGggPiAxKSB7XG4gICAgbG9nLndhcm4oJ0ZvdW5kIEhBTCBlbWJlZGRlZCByZXNvdXJjZSBhcnJheSB3aXRoIG1vcmUgdGhhbiBvbmUgZWxlbWVudCAnICtcbiAgICAgICcgZm9yIGtleSAnICsgY3R4LnBhcnNlZEtleS5rZXkgK1xuICAgICAgJywgYXJiaXRyYXJpbHkgY2hvb3NpbmcgZmlyc3QgZWxlbWVudC4nKTtcbiAgfVxuICBjdHguZW1iZWRkZWRTdGVwID0geyBkb2M6IHJlc291cmNlQXJyYXlbMF0ub3JpZ2luYWwoKSB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpzb25IYWxBZGFwdGVyO1xuIiwidmFyIFBhcnNlciA9IHJlcXVpcmUoJy4vbGliL3BhcnNlcicpXG4gICwgdmFsaWRhdGlvbkZsYWcgPSBmYWxzZTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgcGFyc2U6IGZ1bmN0aW9uKHVucGFyc2VkKSB7XG4gICAgcmV0dXJuIG5ldyBQYXJzZXIoKS5wYXJzZSh1bnBhcnNlZCwgdmFsaWRhdGlvbkZsYWcpO1xuICB9LFxuXG4gIGVuYWJsZVZhbGlkYXRpb246IGZ1bmN0aW9uKGZsYWcpIHtcbiAgICB2YWxpZGF0aW9uRmxhZyA9IChmbGFnICE9IG51bGwpID8gZmxhZyA6IHRydWU7XG4gIH0sXG5cbiAgZGlzYWJsZVZhbGlkYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhbGlkYXRpb25GbGFnID0gZmFsc2U7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qXG4gKiBBIHZlcnkgbmFpdmUgY29weS1vbi13cml0ZSBpbW11dGFibGUgc3RhY2suIFNpbmNlIHRoZSBzaXplIG9mIHRoZSBzdGFja1xuICogaXMgZXF1YWwgdG8gdGhlIGRlcHRoIG9mIHRoZSBlbWJlZGRlZCByZXNvdXJjZXMgZm9yIG9uZSBIQUwgcmVzb3VyY2UsIHRoZSBiYWRcbiAqIHBlcmZvcm1hbmNlIGZvciB0aGUgY29weS1vbi13cml0ZSBhcHByb2FjaCBpcyBwcm9iYWJseSBub3QgYSBwcm9ibGVtIGF0IGFsbC5cbiAqIE1pZ2h0IGJlIHJlcGxhY2VkIGJ5IGEgc21hcnRlciBzb2x1dGlvbiBsYXRlci4gT3Igbm90LiBXaGF0ZXZlci5cbiAqL1xuZnVuY3Rpb24gSW1tdXRhYmxlU3RhY2soKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDEpIHtcbiAgICB0aGlzLl9hcnJheSA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9hcnJheSA9IFtdO1xuICB9XG59XG5cbkltbXV0YWJsZVN0YWNrLnByb3RvdHlwZS5hcnJheSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fYXJyYXk7XG59O1xuXG5JbW11dGFibGVTdGFjay5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gIHJldHVybiB0aGlzLl9hcnJheS5sZW5ndGggPT09IDA7XG59O1xuXG5JbW11dGFibGVTdGFjay5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGFycmF5ID0gdGhpcy5fYXJyYXkuc2xpY2UoMCk7XG4gIGFycmF5LnB1c2goZWxlbWVudCk7XG4gIHJldHVybiBuZXcgSW1tdXRhYmxlU3RhY2soYXJyYXkpO1xufTtcblxuSW1tdXRhYmxlU3RhY2sucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheS5zbGljZSgwLCB0aGlzLl9hcnJheS5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIG5ldyBJbW11dGFibGVTdGFjayhhcnJheSk7XG59O1xuXG5JbW11dGFibGVTdGFjay5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5pc0VtcHR5KCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhblxcJ3QgcGVlayBvbiBlbXB0eSBzdGFjaycpO1xuICB9XG4gIHJldHVybiB0aGlzLl9hcnJheVt0aGlzLl9hcnJheS5sZW5ndGggLSAxXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW1tdXRhYmxlU3RhY2s7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZXNvdXJjZSA9IHJlcXVpcmUoJy4vcmVzb3VyY2UnKVxuICAsIFN0YWNrID0gcmVxdWlyZSgnLi9pbW11dGFibGVfc3RhY2snKTtcblxudmFyIGxpbmtTcGVjID0ge1xuICBocmVmOiB7IHJlcXVpcmVkOiB0cnVlLCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgdGVtcGxhdGVkOiB7IHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9LFxuICB0eXBlOiB7IHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdFZhbHVlOiBudWxsIH0sXG4gIGRlcHJlY2F0aW9uOiB7IHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdFZhbHVlOiBudWxsIH0sXG4gIG5hbWU6IHsgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgcHJvZmlsZTogeyByZXF1aXJlZDogZmFsc2UsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICB0aXRsZTogeyByZXF1aXJlZDogZmFsc2UsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICBocmVmbGFuZzogeyByZXF1aXJlZDogZmFsc2UsIGRlZmF1bHRWYWx1ZTogbnVsbCB9XG59O1xuXG5mdW5jdGlvbiBQYXJzZXIoKSB7XG59XG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiBwYXJzZSh1bnBhcnNlZCwgdmFsaWRhdGlvbkZsYWcpIHtcbiAgdmFyIHZhbGlkYXRpb24gPSB2YWxpZGF0aW9uRmxhZyA/IFtdIDogbnVsbDtcbiAgcmV0dXJuIF9wYXJzZSh1bnBhcnNlZCwgdmFsaWRhdGlvbiwgbmV3IFN0YWNrKCkpO1xufTtcblxuZnVuY3Rpb24gX3BhcnNlKHVucGFyc2VkLCB2YWxpZGF0aW9uLCBwYXRoKSB7XG4gIGlmICh1bnBhcnNlZCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHVucGFyc2VkO1xuICB9XG4gIHZhciBhbGxMaW5rQXJyYXlzID0gcGFyc2VMaW5rcyh1bnBhcnNlZC5fbGlua3MsIHZhbGlkYXRpb24sXG4gICAgICBwYXRoLnB1c2goJ19saW5rcycpKTtcbiAgdmFyIGN1cmllcyA9IHBhcnNlQ3VyaWVzKGFsbExpbmtBcnJheXMpO1xuICB2YXIgYWxsRW1iZWRkZWRBcnJheXMgPSBwYXJzZUVtYmVkZGVkUmVzb3VyY2Vzcyh1bnBhcnNlZC5fZW1iZWRkZWQsXG4gICAgICB2YWxpZGF0aW9uLCBwYXRoLnB1c2goJ19lbWJlZGRlZCcpKTtcbiAgdmFyIHJlc291cmNlID0gbmV3IFJlc291cmNlKGFsbExpbmtBcnJheXMsIGN1cmllcywgYWxsRW1iZWRkZWRBcnJheXMsXG4gICAgICB2YWxpZGF0aW9uKTtcbiAgY29weU5vbkhhbFByb3BlcnRpZXModW5wYXJzZWQsIHJlc291cmNlKTtcbiAgcmVzb3VyY2UuX29yaWdpbmFsID0gdW5wYXJzZWQ7XG4gIHJldHVybiByZXNvdXJjZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMaW5rcyhsaW5rcywgdmFsaWRhdGlvbiwgcGF0aCkge1xuICBsaW5rcyA9IHBhcnNlSGFsUHJvcGVydHkobGlua3MsIHBhcnNlTGluaywgdmFsaWRhdGlvbiwgcGF0aCk7XG4gIGlmIChsaW5rcyA9PSBudWxsIHx8IGxpbmtzLnNlbGYgPT0gbnVsbCkge1xuICAgIC8vIE5vIGxpbmtzIGF0IGFsbD8gVGhlbiBpdCBpbXBsaWN0bHkgbWlzc2VzIHRoZSBzZWxmIGxpbmsgd2hpY2ggaXQgU0hPVUxEXG4gICAgLy8gaGF2ZSBhY2NvcmRpbmcgdG8gc3BlY1xuICAgIHJlcG9ydFZhbGlkYXRpb25Jc3N1ZSgnUmVzb3VyY2UgZG9lcyBub3QgaGF2ZSBhIHNlbGYgbGluaycsIHZhbGlkYXRpb24sXG4gICAgICAgIHBhdGgpO1xuICB9XG4gIHJldHVybiBsaW5rcztcbn1cblxuZnVuY3Rpb24gcGFyc2VDdXJpZXMobGlua0FycmF5cykge1xuICBpZiAobGlua0FycmF5cykge1xuICAgIHJldHVybiBsaW5rQXJyYXlzLmN1cmllcztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VFbWJlZGRlZFJlc291cmNlc3Mob3JpZ2luYWwsIHBhcmVudFZhbGlkYXRpb24sIHBhdGgpIHtcbiAgdmFyIGVtYmVkZGVkID0gcGFyc2VIYWxQcm9wZXJ0eShvcmlnaW5hbCwgaWRlbnRpdHksIHBhcmVudFZhbGlkYXRpb24sIHBhdGgpO1xuICBpZiAoZW1iZWRkZWQgPT0gbnVsbCkge1xuICAgIHJldHVybiBlbWJlZGRlZDtcbiAgfVxuICBPYmplY3Qua2V5cyhlbWJlZGRlZCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBlbWJlZGRlZFtrZXldID0gZW1iZWRkZWRba2V5XS5tYXAoZnVuY3Rpb24oZW1iZWRkZWRFbGVtZW50KSB7XG4gICAgICB2YXIgY2hpbGRWYWxpZGF0aW9uID0gcGFyZW50VmFsaWRhdGlvbiAhPSBudWxsID8gW10gOiBudWxsO1xuICAgICAgdmFyIGVtYmVkZGVkUmVzb3VyY2UgPSBfcGFyc2UoZW1iZWRkZWRFbGVtZW50LCBjaGlsZFZhbGlkYXRpb24sXG4gICAgICAgICAgcGF0aC5wdXNoKGtleSkpO1xuICAgICAgZW1iZWRkZWRSZXNvdXJjZS5fb3JpZ2luYWwgPSBlbWJlZGRlZEVsZW1lbnQ7XG4gICAgICByZXR1cm4gZW1iZWRkZWRSZXNvdXJjZTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBlbWJlZGRlZDtcbn1cblxuLypcbiAqIENvcHkgb3ZlciBub24taGFsIHByb3BlcnRpZXMgKGV2ZXJ5dGhpbmcgdGhhdCBpcyBub3QgX2xpbmtzIG9yIF9lbWJlZGRlZClcbiAqIHRvIHRoZSBwYXJzZWQgcmVzb3VyY2UuXG4gKi9cbmZ1bmN0aW9uIGNvcHlOb25IYWxQcm9wZXJ0aWVzKHVucGFyc2VkLCByZXNvdXJjZSkge1xuICBPYmplY3Qua2V5cyh1bnBhcnNlZCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoa2V5ICE9PSAnX2xpbmtzJyAmJiBrZXkgIT09ICdfZW1iZWRkZWQnKSB7XG4gICAgICByZXNvdXJjZVtrZXldID0gdW5wYXJzZWRba2V5XTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKlxuICogUHJvY2Vzc2VzIG9uZSBvZiB0aGUgdHdvIG1haW4gaGFsIHByb3BlcnRpZXMsIHRoYXQgaXMgX2xpbmtzIG9yIF9lbWJlZGRlZC5cbiAqIEVhY2ggc3ViLXByb3BlcnR5IGlzIHR1cm5lZCBpbnRvIGEgc2luZ2xlIGVsZW1lbnQgYXJyYXkgaWYgaXQgaXNuJ3QgYWxyZWFkeVxuICogYW4gYXJyYXkuIHByb2Nlc3NpbmdGdW5jdGlvbiBpcyBhcHBsaWVkIHRvIGVhY2ggYXJyYXkgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VIYWxQcm9wZXJ0eShwcm9wZXJ0eSwgcHJvY2Vzc2luZ0Z1bmN0aW9uLCB2YWxpZGF0aW9uLCBwYXRoKSB7XG4gIGlmIChwcm9wZXJ0eSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHByb3BlcnR5O1xuICB9XG5cbiAgLy8gY3JlYXRlIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBfbGlua3MvX2VtYmVkZGVkIG9iamVjdFxuICB2YXIgY29weSA9IHt9O1xuXG4gIC8vIG5vcm1hbGl6ZSBlYWNoIGxpbmsvZWFjaCBlbWJlZGRlZCBvYmplY3QgYW5kIHB1dCBpdCBpbnRvIG91ciBjb3B5XG4gIE9iamVjdC5rZXlzKHByb3BlcnR5KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGNvcHlba2V5XSA9IGFycmF5Znkoa2V5LCBwcm9wZXJ0eVtrZXldLCBwcm9jZXNzaW5nRnVuY3Rpb24sXG4gICAgICAgIHZhbGlkYXRpb24sIHBhdGgpO1xuICB9KTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIGFycmF5Znkoa2V5LCBvYmplY3QsIGZuLCB2YWxpZGF0aW9uLCBwYXRoKSB7XG4gIGlmIChpc0FycmF5KG9iamVjdCkpIHtcbiAgICByZXR1cm4gb2JqZWN0Lm1hcChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICByZXR1cm4gZm4oa2V5LCBlbGVtZW50LCB2YWxpZGF0aW9uLCBwYXRoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW2ZuKGtleSwgb2JqZWN0LCB2YWxpZGF0aW9uLCBwYXRoKV07XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBwYXJzZUxpbmsobGlua0tleSwgbGluaywgdmFsaWRhdGlvbiwgcGF0aCkge1xuICBpZiAoIWlzT2JqZWN0KGxpbmspKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdMaW5rIG9iamVjdCBpcyBub3QgYW4gYWN0dWFsIG9iamVjdDogJyArIGxpbmsgK1xuICAgICAgJyBbJyArIHR5cGVvZiBsaW5rICsgJ10nKTtcbiAgfVxuXG4gIC8vIGNyZWF0ZSBhIHNoYWxsb3cgY29weSBvZiB0aGUgbGluayBvYmplY3RcbiAgdmFyIGNvcHkgPSBzaGFsbG93Q29weShsaW5rKTtcblxuICAvLyBhZGQgbWlzc2luZyBwcm9wZXJ0aWVzIG1hbmRhdGVkIGJ5IHNwZWMgYW5kIGRvIGdlbmVyaWMgdmFsaWRhdGlvblxuICBPYmplY3Qua2V5cyhsaW5rU3BlYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoY29weVtrZXldID09IG51bGwpIHtcbiAgICAgIGlmIChsaW5rU3BlY1trZXldLnJlcXVpcmVkKSB7XG4gICAgICAgIHJlcG9ydFZhbGlkYXRpb25Jc3N1ZSgnTGluayBtaXNzZXMgcmVxdWlyZWQgcHJvcGVydHkgJyArIGtleSArICcuJyxcbiAgICAgICAgICAgIHZhbGlkYXRpb24sIHBhdGgucHVzaChsaW5rS2V5KSk7XG4gICAgICB9XG4gICAgICBpZiAobGlua1NwZWNba2V5XS5kZWZhdWx0VmFsdWUgIT0gbnVsbCkge1xuICAgICAgICBjb3B5W2tleV0gPSBsaW5rU3BlY1trZXldLmRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIGNoZWNrIG1vcmUgaW50ZXItcHJvcGVydHkgcmVsYXRpb25zIG1hbmRhdGVkIGJ5IHNwZWNcbiAgaWYgKGNvcHkuZGVwcmVjYXRpb24pIHtcbiAgICBsb2coJ1dhcm5pbmc6IExpbmsgJyArIHBhdGhUb1N0cmluZyhwYXRoLnB1c2gobGlua0tleSkpICtcbiAgICAgICAgJyBpcyBkZXByZWNhdGVkLCBzZWUgJyArIGNvcHkuZGVwcmVjYXRpb24pO1xuICB9XG4gIGlmIChjb3B5LnRlbXBsYXRlZCAhPT0gdHJ1ZSAmJiBjb3B5LnRlbXBsYXRlZCAhPT0gZmFsc2UpIHtcbiAgICBjb3B5LnRlbXBsYXRlZCA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKCF2YWxpZGF0aW9uKSB7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH1cbiAgaWYgKGNvcHkuaHJlZiAmJiBjb3B5LmhyZWYuaW5kZXhPZigneycpID49IDAgJiYgIWNvcHkudGVtcGxhdGVkKSB7XG4gICAgcmVwb3J0VmFsaWRhdGlvbklzc3VlKCdMaW5rIHNlZW1zIHRvIGJlIGFuIFVSSSB0ZW1wbGF0ZSAnICtcbiAgICAgICAgJ2J1dCBpdHMgXCJ0ZW1wbGF0ZWRcIiBwcm9wZXJ0eSBpcyBub3Qgc2V0IHRvIHRydWUuJywgdmFsaWRhdGlvbixcbiAgICAgICAgcGF0aC5wdXNoKGxpbmtLZXkpKTtcbiAgfVxuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gaXNBcnJheShvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkoa2V5LCBvYmplY3QpIHtcbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuZnVuY3Rpb24gcmVwb3J0VmFsaWRhdGlvbklzc3VlKG1lc3NhZ2UsIHZhbGlkYXRpb24sIHBhdGgpIHtcbiAgaWYgKHZhbGlkYXRpb24pIHtcbiAgICB2YWxpZGF0aW9uLnB1c2goe1xuICAgICAgcGF0aDogcGF0aFRvU3RyaW5nKHBhdGgpLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgIH0pO1xuICB9XG59XG5cbi8vIFRPRE8gZml4IHRoaXMgYWQgaG9jIG1lc3MgLSBkb2VzIGllIHN1cHBvcnQgY29uc29sZS5sb2cgYXMgb2YgaWU5P1xuZnVuY3Rpb24gbG9nKG1lc3NhZ2UpIHtcbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzaGFsbG93Q29weShzb3VyY2UpIHtcbiAgdmFyIGNvcHkgPSB7fTtcbiAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGNvcHlba2V5XSA9IHNvdXJjZVtrZXldO1xuICB9KTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHBhdGhUb1N0cmluZyhwYXRoKSB7XG4gIHZhciBzID0gJyQuJztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmFycmF5KCkubGVuZ3RoOyBpKyspIHtcbiAgICBzICs9IHBhdGguYXJyYXkoKVtpXSArICcuJztcbiAgfVxuICBzID0gcy5zdWJzdHJpbmcoMCwgcy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBSZXNvdXJjZShsaW5rcywgY3VyaWVzLCBlbWJlZGRlZCwgdmFsaWRhdGlvbklzc3Vlcykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2xpbmtzID0gbGlua3MgfHwge307XG4gIHRoaXMuX2luaXRDdXJpZXMoY3VyaWVzKTtcbiAgdGhpcy5fZW1iZWRkZWQgPSBlbWJlZGRlZCB8fCB7fTtcbiAgdGhpcy5fdmFsaWRhdGlvbiA9IHZhbGlkYXRpb25Jc3N1ZXMgfHwgW107XG59XG5cblJlc291cmNlLnByb3RvdHlwZS5faW5pdEN1cmllcyA9IGZ1bmN0aW9uKGN1cmllcykge1xuICB0aGlzLl9jdXJpZXNNYXAgPSB7fTtcbiAgaWYgKCFjdXJpZXMpIHtcbiAgICB0aGlzLl9jdXJpZXMgPSBbXTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9jdXJpZXMgPSBjdXJpZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jdXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXJpZSA9IHRoaXMuX2N1cmllc1tpXTtcbiAgICAgIHRoaXMuX2N1cmllc01hcFtjdXJpZS5uYW1lXSA9IGN1cmllO1xuICAgIH1cbiAgfVxuICB0aGlzLl9wcmVSZXNvbHZlQ3VyaWVzKCk7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuX3ByZVJlc29sdmVDdXJpZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fcmVzb2x2ZWRDdXJpZXNNYXAgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jdXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY3VyaWUgPSB0aGlzLl9jdXJpZXNbaV07XG4gICAgaWYgKCFjdXJpZS5uYW1lKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9yICh2YXIgcmVsIGluIHRoaXMuX2xpbmtzKSB7XG4gICAgICBpZiAocmVsICE9PSAnY3VyaWVzJykge1xuICAgICAgICB0aGlzLl9wcmVSZXNvbHZlQ3VyaWUoY3VyaWUsIHJlbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuX3ByZVJlc29sdmVDdXJpZSA9IGZ1bmN0aW9uKGN1cmllLCByZWwpIHtcbiAgdmFyIGxpbmsgPSB0aGlzLl9saW5rc1tyZWxdO1xuICB2YXIgcHJlZml4QW5kUmVmZXJlbmNlID0gcmVsLnNwbGl0KC86KC4rKS8pO1xuICB2YXIgY2FuZGlkYXRlID0gcHJlZml4QW5kUmVmZXJlbmNlWzBdO1xuICBpZiAoY3VyaWUubmFtZSA9PT0gY2FuZGlkYXRlKSB7XG4gICAgaWYgKGN1cmllLnRlbXBsYXRlZCAmJiBwcmVmaXhBbmRSZWZlcmVuY2UubGVuZ3RoID49IDEpIHtcbiAgICAgIC8vIFRPRE8gcmVzb2x2aW5nIHRlbXBsYXRlZCBDVVJJRVMgc2hvdWxkIHVzZSBhIHNtYWxsIHVyaSB0ZW1wbGF0ZVxuICAgICAgLy8gbGliLCBub3QgY29kZWQgaGVyZSBhZCBob2NcbiAgICAgIHZhciBocmVmID0gY3VyaWUuaHJlZi5yZXBsYWNlKC8oLiopeyguKil9KC4qKS8sICckMScgK1xuICAgICAgICAgIHByZWZpeEFuZFJlZmVyZW5jZVsxXSArICckMycpO1xuICAgICAgdGhpcy5fcmVzb2x2ZWRDdXJpZXNNYXBbaHJlZl0gPSByZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jlc29sdmVkQ3VyaWVzTWFwW2N1cmllLmhyZWZdID0gcmVsO1xuICAgIH1cbiAgfVxufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmFsbExpbmtBcnJheXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2xpbmtzO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmxpbmtBcnJheSA9IGZ1bmN0aW9uKGtleSkge1xuICByZXR1cm4gcHJvcGVydHlBcnJheSh0aGlzLl9saW5rcywga2V5KTtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5saW5rID0gZnVuY3Rpb24oa2V5LCBpbmRleCkge1xuICByZXR1cm4gZWxlbWVudE9mUHJvcGVydHlBcnJheSh0aGlzLl9saW5rcywga2V5LCBpbmRleCk7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuaGFzQ3VyaWVzID0gZnVuY3Rpb24oa2V5KSB7XG4gIHJldHVybiB0aGlzLl9jdXJpZXMubGVuZ3RoID4gMDtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5jdXJpZUFycmF5ID0gZnVuY3Rpb24oa2V5KSB7XG4gIHJldHVybiB0aGlzLl9jdXJpZXM7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuY3VyaWUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiB0aGlzLl9jdXJpZXNNYXBbbmFtZV07XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUucmV2ZXJzZVJlc29sdmVDdXJpZSA9IGZ1bmN0aW9uKGZ1bGxVcmwpIHtcbiAgcmV0dXJuIHRoaXMuX3Jlc29sdmVkQ3VyaWVzTWFwW2Z1bGxVcmxdO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmFsbEVtYmVkZGVkUmVzb3VyY2VBcnJheXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl9lbWJlZGRlZDtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5lbWJlZGRlZFJlc291cmNlQXJyYXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgcmV0dXJuIHByb3BlcnR5QXJyYXkodGhpcy5fZW1iZWRkZWQsIGtleSk7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuZW1iZWRkZWRSZXNvdXJjZSA9IGZ1bmN0aW9uKGtleSwgaW5kZXgpIHtcbiAgcmV0dXJuIGVsZW1lbnRPZlByb3BlcnR5QXJyYXkodGhpcy5fZW1iZWRkZWQsIGtleSwgaW5kZXgpO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLm9yaWdpbmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9vcmlnaW5hbDtcbn07XG5cbmZ1bmN0aW9uIHByb3BlcnR5QXJyYXkob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCAhPSBudWxsID8gb2JqZWN0W2tleV0gOiBudWxsO1xufVxuXG5mdW5jdGlvbiBlbGVtZW50T2ZQcm9wZXJ0eUFycmF5KG9iamVjdCwga2V5LCBpbmRleCkge1xuICBpbmRleCA9IGluZGV4IHx8IDA7XG4gIHZhciBhcnJheSA9IHByb3BlcnR5QXJyYXkob2JqZWN0LCBrZXkpO1xuICBpZiAoYXJyYXkgIT0gbnVsbCAmJiBhcnJheS5sZW5ndGggPj0gMSkge1xuICAgIHJldHVybiBhcnJheVtpbmRleF07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cblJlc291cmNlLnByb3RvdHlwZS52YWxpZGF0aW9uSXNzdWVzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl92YWxpZGF0aW9uO1xufTtcblxuLy8gYWxpYXMgZGVmaW5pdGlvbnNcblJlc291cmNlLnByb3RvdHlwZS5hbGxMaW5rcyA9IFJlc291cmNlLnByb3RvdHlwZS5hbGxMaW5rQXJyYXlzO1xuUmVzb3VyY2UucHJvdG90eXBlLmFsbEVtYmVkZGVkQXJyYXlzID1cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuYWxsRW1iZWRkZWRSZXNvdXJjZXMgPVxuICAgIFJlc291cmNlLnByb3RvdHlwZS5hbGxFbWJlZGRlZFJlc291cmNlQXJyYXlzO1xuUmVzb3VyY2UucHJvdG90eXBlLmVtYmVkZGVkQXJyYXkgPSBSZXNvdXJjZS5wcm90b3R5cGUuZW1iZWRkZWRSZXNvdXJjZUFycmF5O1xuUmVzb3VyY2UucHJvdG90eXBlLmVtYmVkZGVkID0gUmVzb3VyY2UucHJvdG90eXBlLmVtYmVkZGVkUmVzb3VyY2U7XG5SZXNvdXJjZS5wcm90b3R5cGUudmFsaWRhdGlvbiA9IFJlc291cmNlLnByb3RvdHlwZS52YWxpZGF0aW9uSXNzdWVzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc291cmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBUT0RPIFJlcGxhY2UgYnkgYSBwcm9wZXIgbGlnaHR3ZWlnaHQgbG9nZ2luZyBtb2R1bGUsIHN1aXRlZCBmb3IgdGhlIGJyb3dzZXJcblxudmFyIGVuYWJsZWQgPSBmYWxzZTtcbmZ1bmN0aW9uIExvZ2dlcihpZCkge1xuICBpZiAoaWQgPT0gbnVsbCkge1xuICAgIGlkID0gJyc7XG4gIH1cbiAgdGhpcy5pZCA9IGlkO1xufVxuXG5Mb2dnZXIucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xufTtcblxuTG9nZ2VyLnByb3RvdHlwZS5kZWJ1ZyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgaWYgKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkICsgJy9kZWJ1ZzogJyArIG1lc3NhZ2UpO1xuICB9XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLmluZm8gPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIGlmIChlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5pZCArICcvaW5mbzogJyArIG1lc3NhZ2UpO1xuICB9XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLndhcm4gPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIGlmIChlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5pZCArICcvd2FybjogJyArIG1lc3NhZ2UpO1xuICB9XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBpZiAoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuaWQgKyAnL2Vycm9yOiAnICsgbWVzc2FnZSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1pbmlsb2coaWQpIHtcbiAgcmV0dXJuIG5ldyBMb2dnZXIoaWQpO1xufVxuXG5taW5pbG9nLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICBlbmFibGVkID0gdHJ1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWluaWxvZztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAobyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdXBlcmFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuXG5mdW5jdGlvbiBSZXF1ZXN0KCkge31cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24odXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICByZXR1cm4gbWFwUmVxdWVzdChzdXBlcmFnZW50LmdldCh1cmkpLCBvcHRpb25zKVxuICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UoY2FsbGJhY2spKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBtYXBSZXF1ZXN0KHN1cGVyYWdlbnQucG9zdCh1cmkpLCBvcHRpb25zKVxuICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UoY2FsbGJhY2spKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIG1hcFJlcXVlc3Qoc3VwZXJhZ2VudC5wdXQodXJpKSwgb3B0aW9ucylcbiAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKGNhbGxiYWNrKSk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5wYXRjaCA9IGZ1bmN0aW9uKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIG1hcFJlcXVlc3Qoc3VwZXJhZ2VudC5wYXRjaCh1cmkpLCBvcHRpb25zKVxuICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UoY2FsbGJhY2spKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIG1hcFJlcXVlc3Qoc3VwZXJhZ2VudC5kZWwodXJpKSwgb3B0aW9ucylcbiAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKGNhbGxiYWNrKSk7XG59O1xuXG5mdW5jdGlvbiBtYXBSZXF1ZXN0KHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBtYXBRdWVyeShzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucyk7XG4gIG1hcEhlYWRlcnMoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpO1xuICBtYXBBdXRoKHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKTtcbiAgbWFwQm9keShzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucyk7XG4gIG1hcEZvcm0oc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gc3VwZXJhZ2VudFJlcXVlc3Q7XG59XG5cbmZ1bmN0aW9uIG1hcFF1ZXJ5KHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKSB7XG4gIHZhciBxcyA9IG9wdGlvbnMucXM7XG4gIGlmIChxcyAhPSBudWxsKSB7XG4gICAgc3VwZXJhZ2VudFJlcXVlc3QgPSBzdXBlcmFnZW50UmVxdWVzdC5xdWVyeShxcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFwSGVhZGVycyhzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucykge1xuICB2YXIgaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycztcbiAgaWYgKGhlYWRlcnMgIT0gbnVsbCkge1xuICAgIHN1cGVyYWdlbnRSZXF1ZXN0ID0gc3VwZXJhZ2VudFJlcXVlc3Quc2V0KGhlYWRlcnMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcEF1dGgoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGF1dGggPSBvcHRpb25zLmF1dGg7XG4gIGlmIChhdXRoICE9IG51bGwpIHtcbiAgICBzdXBlcmFnZW50UmVxdWVzdCA9IHN1cGVyYWdlbnRSZXF1ZXN0LmF1dGgoXG4gICAgICBhdXRoLnVzZXIgfHwgYXV0aC51c2VybmFtZSxcbiAgICAgIGF1dGgucGFzcyB8fCBhdXRoLnBhc3N3b3JkXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXBCb2R5KHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zICE9IG51bGwpIHtcbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keTtcbiAgICBpZiAoYm9keSAhPSBudWxsKSB7XG4gICAgICBzdXBlcmFnZW50UmVxdWVzdCA9IHN1cGVyYWdlbnRSZXF1ZXN0LnNlbmQoYm9keSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1hcEZvcm0oc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgIHZhciBmb3JtID0gb3B0aW9ucy5mb3JtO1xuICAgIGlmIChmb3JtICE9IG51bGwpIHtcbiAgICAgIHN1cGVyYWdlbnRSZXF1ZXN0ID0gc3VwZXJhZ2VudFJlcXVlc3Quc2VuZChmb3JtKTtcbiAgICAgIHN1cGVyYWdlbnRSZXF1ZXN0ID0gc3VwZXJhZ2VudFJlcXVlc3Quc2V0KCdDb250ZW50LVR5cGUnLFxuICAgICAgICAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gbWFwIFhIUiByZXNwb25zZSBvYmplY3QgcHJvcGVydGllcyB0byBOb2RlLmpzIHJlcXVlc3QgbGliJ3MgcmVzcG9uc2Ugb2JqZWN0XG4vLyBwcm9wZXJ0aWVzXG5mdW5jdGlvbiBtYXBSZXNwb25zZShyZXNwb25zZSkge1xuICByZXNwb25zZS5ib2R5ID0gcmVzcG9uc2UudGV4dDtcbiAgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cztcbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVSZXNwb25zZShjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXNwb25zZSkge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgICAgLy8gbmV0d29yayBlcnJvciBvciB0aW1lb3V0LCBubyByZXNwb25zZVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNpbmNlIDEuMC4wIHN1cGVyYWdlbnQgY2FsbHMgdGhlIGNhbGxiYWNrIHdpdGggYW4gZXJyb3IgaWYgdGhlIHN0YXR1c1xuICAgICAgICAvLyBjb2RlIG9mIHRoZSByZXNwb25zZSBpcyBub3QgaW4gdGhlIDJ4eCByYW5nZS4gSW4gdGhpcyBjYXNlcywgaXQgYWxzb1xuICAgICAgICAvLyBwYXNzZXMgaW4gdGhlIHJlc3BvbnNlLiBUbyBhbGlnbiB0aGluZ3Mgd2l0aCByZXF1ZXN0LCBjYWxsIHRoZVxuICAgICAgICAvLyBjYWxsYmFjayB3aXRob3V0IHRoZSBlcnJvciBidXQganVzdCB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgbWFwUmVzcG9uc2UocmVzcG9uc2UpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2sobnVsbCwgbWFwUmVzcG9uc2UocmVzcG9uc2UpKTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFJlcXVlc3QoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIENvcGllZCBmcm9tIHVuZGVyc2NvcmUuc3RyaW5nIG1vZHVsZS4gSnVzdCB0aGUgZnVuY3Rpb25zIHdlIG5lZWQsIHRvIHJlZHVjZVxuICogdGhlIGJyb3dzZXJpZmllZCBzaXplLlxuICovXG5cbnZhciBfcyA9IHtcbiAgc3RhcnRzV2l0aDogZnVuY3Rpb24oc3RyLCBzdGFydHMpIHtcbiAgICBpZiAoc3RhcnRzID09PSAnJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKHN0ciA9PSBudWxsIHx8IHN0YXJ0cyA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgc3RyID0gU3RyaW5nKHN0cik7IHN0YXJ0cyA9IFN0cmluZyhzdGFydHMpO1xuICAgIHJldHVybiBzdHIubGVuZ3RoID49IHN0YXJ0cy5sZW5ndGggJiYgc3RyLnNsaWNlKDAsIHN0YXJ0cy5sZW5ndGgpID09PSBzdGFydHM7XG4gIH0sXG5cbiAgZW5kc1dpdGg6IGZ1bmN0aW9uKHN0ciwgZW5kcyl7XG4gICAgaWYgKGVuZHMgPT09ICcnKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoc3RyID09IG51bGwgfHwgZW5kcyA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgc3RyID0gU3RyaW5nKHN0cik7IGVuZHMgPSBTdHJpbmcoZW5kcyk7XG4gICAgcmV0dXJuIHN0ci5sZW5ndGggPj0gZW5kcy5sZW5ndGggJiZcbiAgICAgIHN0ci5zbGljZShzdHIubGVuZ3RoIC0gZW5kcy5sZW5ndGgpID09PSBlbmRzO1xuICB9LFxuXG4gIHNwbGljZTogZnVuY3Rpb24oc3RyLCBpLCBob3dtYW55LCBzdWJzdHIpe1xuICAgIHZhciBhcnIgPSBfcy5jaGFycyhzdHIpO1xuICAgIGFyci5zcGxpY2Uofn5pLCB+fmhvd21hbnksIHN1YnN0cik7XG4gICAgcmV0dXJuIGFyci5qb2luKCcnKTtcbiAgfSxcblxuICBjb250YWluczogZnVuY3Rpb24oc3RyLCBuZWVkbGUpe1xuICAgIGlmIChuZWVkbGUgPT09ICcnKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoc3RyID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gU3RyaW5nKHN0cikuaW5kZXhPZihuZWVkbGUpICE9PSAtMTtcbiAgfSxcblxuICBjaGFyczogZnVuY3Rpb24oc3RyKSB7XG4gICAgaWYgKHN0ciA9PSBudWxsKSByZXR1cm4gW107XG4gICAgcmV0dXJuIFN0cmluZyhzdHIpLnNwbGl0KCcnKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBfcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlc29sdmVVcmwgPSByZXF1aXJlKCdyZXNvbHZlLXVybCcpO1xuXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICByZXR1cm4gcmVzb2x2ZVVybChmcm9tLCB0byk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG5leHBvcnRzLmFib3J0VHJhdmVyc2FsID0gZnVuY3Rpb24gYWJvcnRUcmF2ZXJzYWwoKSB7XG4gIGxvZy5kZWJ1ZygnYWJvcnRpbmcgbGluayB0cmF2ZXJzYWwnKTtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgaWYgKHRoaXMuY3VycmVudFJlcXVlc3QpIHtcbiAgICBsb2cuZGVidWcoJ3JlcXVlc3QgaW4gcHJvZ3Jlc3MuIHRyeWluZyB0byBhYm9ydCBpdCwgdG9vLicpO1xuICAgIHRoaXMuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgfVxufTtcblxuZXhwb3J0cy5yZWdpc3RlckFib3J0TGlzdGVuZXIgPSBmdW5jdGlvbiByZWdpc3RlckFib3J0TGlzdGVuZXIodCwgY2FsbGJhY2spIHtcbiAgaWYgKHQuY3VycmVudFJlcXVlc3QpIHtcbiAgICB0LmN1cnJlbnRSZXF1ZXN0Lm9uKCdhYm9ydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwb3J0cy5jYWxsQ2FsbGJhY2tPbkFib3J0KHQpO1xuICAgIH0pO1xuICB9XG59O1xuXG5leHBvcnRzLmNhbGxDYWxsYmFja09uQWJvcnQgPSBmdW5jdGlvbiBjYWxsQ2FsbGJhY2tPbkFib3J0KHQpIHtcbiAgbG9nLmRlYnVnKCdsaW5rIHRyYXZlcnNhbCBhYm9ydGVkJyk7XG4gIGlmICghdC5jYWxsYmFja0hhc0JlZW5DYWxsZWRBZnRlckFib3J0KSB7XG4gICAgdC5jYWxsYmFja0hhc0JlZW5DYWxsZWRBZnRlckFib3J0ID0gdHJ1ZTtcbiAgICB0LmNhbGxiYWNrKGV4cG9ydHMuYWJvcnRFcnJvcigpLCB0KTtcbiAgfVxufTtcblxuZXhwb3J0cy5hYm9ydEVycm9yID0gZnVuY3Rpb24gYWJvcnRFcnJvcigpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdMaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGhhcyBiZWVuIGFib3J0ZWQuJyk7XG4gIGVycm9yLm5hbWUgPSAnQWJvcnRFcnJvcic7XG4gIGVycm9yLmFib3J0ZWQgPSB0cnVlO1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuL2Fib3J0X3RyYXZlcnNhbCcpXG4gICwgYXBwbHlUcmFuc2Zvcm1zID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2FwcGx5X3RyYW5zZm9ybXMnKVxuICAsIGh0dHBSZXF1ZXN0cyA9IHJlcXVpcmUoJy4vaHR0cF9yZXF1ZXN0cycpXG4gICwgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuL2lzX2NvbnRpbnVhdGlvbicpXG4gICwgd2Fsa2VyID0gcmVxdWlyZSgnLi93YWxrZXInKTtcblxudmFyIGNoZWNrSHR0cFN0YXR1cyA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9jaGVja19odHRwX3N0YXR1cycpXG4gICwgY29udGludWF0aW9uVG9Eb2MgPVxuICAgICAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2NvbnRpbnVhdGlvbl90b19kb2MnKVxuICAsIGNvbnRpbnVhdGlvblRvUmVzcG9uc2UgPVxuICAgICAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2NvbnRpbnVhdGlvbl90b19yZXNwb25zZScpXG4gICwgY29udmVydEVtYmVkZGVkRG9jVG9SZXNwb25zZSA9XG4gICAgICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvY29udmVydF9lbWJlZGRlZF9kb2NfdG9fcmVzcG9uc2UnKVxuICAsIGV4dHJhY3REb2MgPSAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2V4dHJhY3RfZG9jJylcbiAgLCBleHRyYWN0UmVzcG9uc2UgPSAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2V4dHJhY3RfcmVzcG9uc2UnKVxuICAsIGV4dHJhY3RVcmwgPSAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2V4dHJhY3RfdXJsJylcbiAgLCBmZXRjaExhc3RSZXNvdXJjZSA9ICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZmV0Y2hfbGFzdF9yZXNvdXJjZScpXG4gICwgZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdCA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9leGVjdXRlX2xhc3RfaHR0cF9yZXF1ZXN0JylcbiAgLCBleGVjdXRlSHR0cFJlcXVlc3QgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZXhlY3V0ZV9odHRwX3JlcXVlc3QnKVxuICAsIHBhcnNlID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL3BhcnNlJyk7XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBlbmQgaXQgd2l0aCBhbiBIVFRQIGdldC5cbiAqL1xuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbih0LCBjYWxsYmFjaykge1xuICB2YXIgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXA7XG4gIGlmICh0LmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0KSB7XG4gICAgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAgPSBbXG4gICAgICBjb250aW51YXRpb25Ub0RvYyxcbiAgICAgIGZldGNoTGFzdFJlc291cmNlLFxuICAgICAgY2hlY2tIdHRwU3RhdHVzLFxuICAgICAgcGFyc2UsXG4gICAgICBleHRyYWN0RG9jLFxuICAgIF07XG4gIH0gZWxzZSB7XG4gICAgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAgPSBbXG4gICAgICBjb250aW51YXRpb25Ub1Jlc3BvbnNlLFxuICAgICAgZmV0Y2hMYXN0UmVzb3VyY2UsXG4gICAgICBjb252ZXJ0RW1iZWRkZWREb2NUb1Jlc3BvbnNlLFxuICAgICAgZXh0cmFjdFJlc3BvbnNlLFxuICAgIF07XG4gIH1cbiAgd2Fsa2VyLndhbGsodCwgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAsIGNhbGxiYWNrKTtcbiAgcmV0dXJuIGNyZWF0ZVRyYXZlcnNhbEhhbmRsZSh0KTtcbn07XG5cbi8qKlxuICogU3BlY2lhbCB2YXJpYW50IG9mIGdldCgpIHRoYXQgZG9lcyBub3QgZXhlY3V0ZSB0aGUgbGFzdCByZXF1ZXN0IGJ1dCBpbnN0ZWFkXG4gKiB5aWVsZHMgdGhlIGxhc3QgVVJMIHRvIHRoZSBjYWxsYmFjay5cbiAqL1xuZXhwb3J0cy5nZXRVcmwgPSBmdW5jdGlvbih0LCBjYWxsYmFjaykge1xuICB3YWxrZXIud2Fsayh0LCBbIGV4dHJhY3RVcmwgXSwgY2FsbGJhY2spO1xuICByZXR1cm4gY3JlYXRlVHJhdmVyc2FsSGFuZGxlKHQpO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgUE9TVCByZXF1ZXN0IHdpdGggdGhlXG4gKiBnaXZlbiBib2R5IHRvIHRoZSBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBQT1NUIHJlcXVlc3QgdG9cbiAqIHRoZSBjYWxsYmFjay5cbiAqL1xuZXhwb3J0cy5wb3N0ID0gZnVuY3Rpb24odCwgY2FsbGJhY2spIHtcbiAgd2Fsa0FuZEV4ZWN1dGUodCxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UucG9zdCxcbiAgICAgIGNhbGxiYWNrKTtcbiAgcmV0dXJuIGNyZWF0ZVRyYXZlcnNhbEhhbmRsZSh0KTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIFBVVCByZXF1ZXN0IHdpdGggdGhlXG4gKiBnaXZlbiBib2R5IHRvIHRoZSBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBQVVQgcmVxdWVzdCB0b1xuICogdGhlIGNhbGxiYWNrLlxuICovXG5leHBvcnRzLnB1dCA9IGZ1bmN0aW9uKHQsIGNhbGxiYWNrKSB7XG4gIHdhbGtBbmRFeGVjdXRlKHQsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZSxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLnB1dCxcbiAgICAgIGNhbGxiYWNrKTtcbiAgcmV0dXJuIGNyZWF0ZVRyYXZlcnNhbEhhbmRsZSh0KTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIFBBVENIIHJlcXVlc3Qgd2l0aCB0aGVcbiAqIGdpdmVuIGJvZHkgdG8gdGhlIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIFBBVENIIHJlcXVlc3QgdG9cbiAqIHRoZSBjYWxsYmFjay5cbiAqL1xuZXhwb3J0cy5wYXRjaCA9IGZ1bmN0aW9uKHQsIGNhbGxiYWNrKSB7XG4gIHdhbGtBbmRFeGVjdXRlKHQsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZSxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLnBhdGNoLFxuICAgICAgY2FsbGJhY2spO1xuICByZXR1cm4gY3JlYXRlVHJhdmVyc2FsSGFuZGxlKHQpO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgREVMRVRFIHJlcXVlc3QgdG8gdGhlXG4gKiBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBERUxFVEUgcmVxdWVzdCB0byB0aGUgY2FsbGJhY2suXG4gKi9cbmV4cG9ydHMuZGVsZXRlID0gZnVuY3Rpb24odCwgY2FsbGJhY2spIHtcbiAgd2Fsa0FuZEV4ZWN1dGUodCxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UuZGVsLFxuICAgICAgY2FsbGJhY2spO1xuICByZXR1cm4gY3JlYXRlVHJhdmVyc2FsSGFuZGxlKHQpO1xufTtcblxuZnVuY3Rpb24gd2Fsa0FuZEV4ZWN1dGUodCwgcmVxdWVzdCwgbWV0aG9kLCBjYWxsYmFjaykge1xuICB2YXIgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXA7XG4gIGlmICh0LmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0KSB7XG4gICAgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAgPSBbXG4gICAgICBleGVjdXRlSHR0cFJlcXVlc3QsXG4gICAgICBjaGVja0h0dHBTdGF0dXMsXG4gICAgICBwYXJzZSxcbiAgICAgIGV4dHJhY3REb2MsXG4gICAgXTtcbiAgfSBlbHNlIHtcbiAgICB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCA9IFtcbiAgICAgIGV4ZWN1dGVMYXN0SHR0cFJlcXVlc3QsXG4gICAgXTtcbiAgfVxuXG4gIHQubGFzdE1ldGhvZCA9IG1ldGhvZDtcbiAgd2Fsa2VyLndhbGsodCwgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAsIGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVHJhdmVyc2FsSGFuZGxlKHQpIHtcbiAgcmV0dXJuIHtcbiAgICBhYm9ydDogdC5hYm9ydFRyYXZlcnNhbFxuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIHN0YW5kYXJkUmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKVxuICAsIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi9hY3Rpb25zJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4vYWJvcnRfdHJhdmVyc2FsJykuYWJvcnRUcmF2ZXJzYWxcbiAgLCBtZWRpYVR5cGVSZWdpc3RyeSA9IHJlcXVpcmUoJy4vbWVkaWFfdHlwZV9yZWdpc3RyeScpXG4gICwgbWVkaWFUeXBlcyA9IHJlcXVpcmUoJy4vbWVkaWFfdHlwZXMnKVxuICAsIG1lcmdlUmVjdXJzaXZlID0gcmVxdWlyZSgnLi9tZXJnZV9yZWN1cnNpdmUnKTtcblxudmFyIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG4vLyBNYWludGVuYW5jZSBub3RpY2U6IFRoZSBjb25zdHJ1Y3RvciBpcyB1c3VhbGx5IGNhbGxlZCB3aXRob3V0IGFyZ3VtZW50cywgdGhlXG4vLyBtZWRpYVR5cGUgcGFyYW1ldGVyIGlzIG9ubHkgdXNlZCB3aGVuIGNsb25pbmcgdGhlIHJlcXVlc3QgYnVpbGRlciBpblxuLy8gbmV3UmVxdWVzdCgpLlxuZnVuY3Rpb24gQnVpbGRlcihtZWRpYVR5cGUpIHtcbiAgdGhpcy5tZWRpYVR5cGUgPSBtZWRpYVR5cGUgfHwgbWVkaWFUeXBlcy5DT05URU5UX05FR09USUFUSU9OO1xuICB0aGlzLmFkYXB0ZXIgPSB0aGlzLl9jcmVhdGVBZGFwdGVyKHRoaXMubWVkaWFUeXBlKTtcbiAgdGhpcy5jb250ZW50TmVnb3RpYXRpb24gPSB0cnVlO1xuICB0aGlzLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0RmxhZyA9IGZhbHNlO1xuICB0aGlzLmxpbmtzID0gW107XG4gIHRoaXMuanNvblBhcnNlciA9IEpTT04ucGFyc2U7XG4gIHRoaXMucmVxdWVzdE1vZHVsZUluc3RhbmNlID0gc3RhbmRhcmRSZXF1ZXN0O1xuICB0aGlzLnJlcXVlc3RPcHRpb25zID0ge307XG4gIHRoaXMucmVzb2x2ZVJlbGF0aXZlRmxhZyA9IGZhbHNlO1xuICB0aGlzLnByZWZlckVtYmVkZGVkID0gZmFsc2U7XG4gIHRoaXMubGFzdFRyYXZlcnNhbFN0YXRlID0gbnVsbDtcbiAgdGhpcy5jb250aW51YXRpb24gPSBudWxsO1xuICAvLyBNYWludGVuYW5jZSBub3RpY2U6IHdoZW4gZXh0ZW5kaW5nIHRoZSBsaXN0IG9mIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyxcbiAgLy8gYWxzbyBleHRlbmQgdGhpcy5uZXdSZXF1ZXN0IGFuZCBpbml0RnJvbVRyYXZlcnNhbFN0YXRlXG59XG5cbkJ1aWxkZXIucHJvdG90eXBlLl9jcmVhdGVBZGFwdGVyID0gZnVuY3Rpb24obWVkaWFUeXBlKSB7XG4gIHZhciBBZGFwdGVyVHlwZSA9IG1lZGlhVHlwZVJlZ2lzdHJ5LmdldChtZWRpYVR5cGUpO1xuICBpZiAoIUFkYXB0ZXJUeXBlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG9yIHVuc3VwcG9ydGVkIG1lZGlhIHR5cGU6ICcgKyBtZWRpYVR5cGUpO1xuICB9XG4gIGxvZy5kZWJ1ZygnY3JlYXRpbmcgbmV3ICcgKyBBZGFwdGVyVHlwZS5uYW1lKTtcbiAgcmV0dXJuIG5ldyBBZGFwdGVyVHlwZShsb2cpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IGJ1aWxkZXIgaW5zdGFuY2Ugd2hpY2ggaXMgYmFzaWNhbGx5IGEgY2xvbmUgb2YgdGhpcyBidWlsZGVyXG4gKiBpbnN0YW5jZS4gVGhpcyBhbGxvd3MgeW91IHRvIGluaXRpYXRlIGEgbmV3IHJlcXVlc3QgYnV0IGtlZXBpbmcgYWxsIHRoZSBzZXR1cFxuICogKHN0YXJ0IFVSTCwgdGVtcGxhdGUgcGFyYW1ldGVycywgcmVxdWVzdCBvcHRpb25zLCBib2R5IHBhcnNlciwgLi4uKS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUubmV3UmVxdWVzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY2xvbmVkUmVxdWVzdEJ1aWxkZXIgPSBuZXcgQnVpbGRlcih0aGlzLmdldE1lZGlhVHlwZSgpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIuY29udGVudE5lZ290aWF0aW9uID1cbiAgICB0aGlzLmRvZXNDb250ZW50TmVnb3RpYXRpb24oKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIuY29udmVydFJlc3BvbnNlVG9PYmplY3QodGhpcy5jb252ZXJ0c1Jlc3BvbnNlVG9PYmplY3QoKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLmZyb20oc2hhbGxvd0Nsb25lQXJyYXkodGhpcy5nZXRGcm9tKCkpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIud2l0aFRlbXBsYXRlUGFyYW1ldGVycyhcbiAgICBjbG9uZUFycmF5T3JPYmplY3QodGhpcy5nZXRUZW1wbGF0ZVBhcmFtZXRlcnMoKSkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci53aXRoUmVxdWVzdE9wdGlvbnMoXG4gICAgY2xvbmVBcnJheU9yT2JqZWN0KHRoaXMuZ2V0UmVxdWVzdE9wdGlvbnMoKSkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci53aXRoUmVxdWVzdExpYnJhcnkodGhpcy5nZXRSZXF1ZXN0TGlicmFyeSgpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIucGFyc2VSZXNwb25zZUJvZGllc1dpdGgodGhpcy5nZXRKc29uUGFyc2VyKCkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci5yZXNvbHZlUmVsYXRpdmUodGhpcy5kb2VzUmVzb2x2ZVJlbGF0aXZlKCkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci5wcmVmZXJFbWJlZGRlZFJlc291cmNlcyhcbiAgICAgIHRoaXMuZG9lc1ByZWZlckVtYmVkZGVkUmVzb3VyY2VzKCkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci5jb250aW51YXRpb24gPSB0aGlzLmNvbnRpbnVhdGlvbjtcbiAgLy8gTWFpbnRlbmFuY2Ugbm90aWNlOiB3aGVuIGV4dGVuZGluZyB0aGUgbGlzdCBvZiBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMsXG4gIC8vIGFsc28gZXh0ZW5kIGluaXRGcm9tVHJhdmVyc2FsU3RhdGVcbiAgcmV0dXJuIGNsb25lZFJlcXVlc3RCdWlsZGVyO1xufTtcblxuLyoqXG4gKiBEaXNhYmxlcyBjb250ZW50IG5lZ290aWF0aW9uIGFuZCBmb3JjZXMgdGhlIHVzZSBvZiBhIGdpdmVuIG1lZGlhIHR5cGUuXG4gKiBUaGUgbWVkaWEgdHlwZSBoYXMgdG8gYmUgcmVnaXN0ZXJlZCBhdCBUcmF2ZXJzb24ncyBtZWRpYSB0eXBlIHJlZ2lzdHJ5XG4gKiBiZWZvcmUgdmlhIHRyYXZlcnNvbi5yZWdpc3Rlck1lZGlhVHlwZSAoZXhjZXB0IGZvciBtZWRpYSB0eXBlXG4gKiBhcHBsaWNhdGlvbi9qc29uLCB3aGljaCBpcyB0cmF2ZXJzb24ubWVkaWFUeXBlcy5KU09OKS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuc2V0TWVkaWFUeXBlID0gZnVuY3Rpb24obWVkaWFUeXBlKSB7XG4gIHRoaXMubWVkaWFUeXBlID0gbWVkaWFUeXBlIHx8IG1lZGlhVHlwZXMuQ09OVEVOVF9ORUdPVElBVElPTjtcbiAgdGhpcy5hZGFwdGVyID0gdGhpcy5fY3JlYXRlQWRhcHRlcihtZWRpYVR5cGUpO1xuICB0aGlzLmNvbnRlbnROZWdvdGlhdGlvbiA9XG4gICAgKG1lZGlhVHlwZSA9PT0gbWVkaWFUeXBlcy5DT05URU5UX05FR09USUFUSU9OKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNob3J0Y3V0IGZvclxuICogc2V0TWVkaWFUeXBlKHRyYXZlcnNvbi5tZWRpYVR5cGVzLkpTT04pO1xuICovXG5CdWlsZGVyLnByb3RvdHlwZS5qc29uID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2V0TWVkaWFUeXBlKG1lZGlhVHlwZXMuSlNPTik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTaG9ydGN1dCBmb3JcbiAqIHNldE1lZGlhVHlwZSh0cmF2ZXJzb24ubWVkaWFUeXBlcy5KU09OX0hBTCk7XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmpzb25IYWwgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zZXRNZWRpYVR5cGUobWVkaWFUeXBlcy5KU09OX0hBTCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbmFibGVzIGNvbnRlbnQgbmVnb3RpYXRpb24gKGNvbnRlbnQgbmVnb3RpYXRpb24gaXMgZW5hYmxlZCBieSBkZWZhdWx0LCB0aGlzXG4gKiBtZXRob2QgY2FuIGJlIHVzZWQgdG8gZW5hYmxlIGl0IGFmdGVyIGEgY2FsbCB0byBzZXRNZWRpYVR5cGUgZGlzYWJsZWQgaXQpLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS51c2VDb250ZW50TmVnb3RpYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zZXRNZWRpYVR5cGUobWVkaWFUeXBlcy5DT05URU5UX05FR09USUFUSU9OKTtcbiAgdGhpcy5jb250ZW50TmVnb3RpYXRpb24gPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSByb290IFVSTCBvZiB0aGUgQVBJLCB0aGF0IGlzLCB3aGVyZSB0aGUgbGluayB0cmF2ZXJzYWwgYmVnaW5zLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24odXJsKSB7XG4gIHRoaXMuc3RhcnRVcmwgPSB1cmw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgbGlzdCBvZiBsaW5rIHJlbGF0aW9ucyB0byBmb2xsb3dcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZm9sbG93ID0gZnVuY3Rpb24oKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHV0aWwuaXNBcnJheShhcmd1bWVudHNbMF0pKSB7XG4gICAgdGhpcy5saW5rcyA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmxpbmtzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciBmb2xsb3cuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLndhbGsgPSBCdWlsZGVyLnByb3RvdHlwZS5mb2xsb3c7XG5cbi8qKlxuICogUHJvdmlkZSB0ZW1wbGF0ZSBwYXJhbWV0ZXJzIGZvciBVUkkgdGVtcGxhdGUgc3Vic3RpdHV0aW9uLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1ldGVycykge1xuICB0aGlzLnRlbXBsYXRlUGFyYW1ldGVycyA9IHBhcmFtZXRlcnM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcm92aWRlIG9wdGlvbnMgZm9yIEhUVFAgcmVxdWVzdHMgKGFkZGl0aW9uYWwgSFRUUCBoZWFkZXJzLCBmb3IgZXhhbXBsZSkuXG4gKiBUaGlzIGZ1bmN0aW9uIHJlc2V0cyBhbnkgcmVxdWVzdCBvcHRpb25zLCB0aGF0IGhhZCBiZWVuIHNldCBwcmV2aW91c2x5LCB0aGF0XG4gKiBpcywgbXVsdGlwbGUgY2FsbHMgdG8gd2l0aFJlcXVlc3RPcHRpb25zIGFyZSBub3QgY3VtdWxhdGl2ZS4gVXNlXG4gKiBhZGRSZXF1ZXN0T3B0aW9ucyB0byBhZGQgcmVxdWVzdCBvcHRpb25zIGluIGEgY3VtdWxhdGl2ZSB3YXkuXG4gKlxuICogT3B0aW9ucyBjYW4gZWl0aGVyIGJlIHBhc3NlZCBhcyBhbiBvYmplY3Qgb3IgYW4gYXJyYXkuIElmIGFuIG9iamVjdCBpc1xuICogcGFzc2VkLCB0aGUgb3B0aW9ucyB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggSFRUUCByZXF1ZXN0LiBJZiBhbiBhcnJheSBpc1xuICogcGFzc2VkLCBlYWNoIGVsZW1lbnQgc2hvdWxkIGJlIGFuIG9wdGlvbnMgb2JqZWN0IGFuZCB0aGUgZmlyc3QgYXJyYXkgZWxlbWVudFxuICogd2lsbCBiZSB1c2VkIGZvciB0aGUgZmlyc3QgcmVxdWVzdCwgdGhlIHNlY29uZCBlbGVtZW50IGZvciB0aGUgc2Vjb25kIHJlcXVlc3RcbiAqIGFuZCBzbyBvbi4gbnVsbCBlbGVtZW50cyBhcmUgYWxsb3dlZC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUud2l0aFJlcXVlc3RPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB0aGlzLnJlcXVlc3RPcHRpb25zID0gb3B0aW9ucztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgb3B0aW9ucyBmb3IgSFRUUCByZXF1ZXN0cyAoYWRkaXRpb25hbCBIVFRQIGhlYWRlcnMsIGZvciBleGFtcGxlKSBvbiB0b3BcbiAqIG9mIGV4aXN0aW5nIG9wdGlvbnMsIGlmIGFueS4gVG8gcmVzZXQgYWxsIHJlcXVlc3Qgb3B0aW9ucyBhbmQgc2V0IG5ldyBvbmVzXG4gKiB3aXRob3V0IGtlZXBpbmcgdGhlIG9sZCBvbmVzLCB5b3UgY2FuIHVzZSB3aXRoUmVxdWVzdE9wdGlvbnMuXG4gKlxuICogT3B0aW9ucyBjYW4gZWl0aGVyIGJlIHBhc3NlZCBhcyBhbiBvYmplY3Qgb3IgYW4gYXJyYXkuIElmIGFuIG9iamVjdCBpc1xuICogcGFzc2VkLCB0aGUgb3B0aW9ucyB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggSFRUUCByZXF1ZXN0LiBJZiBhbiBhcnJheSBpc1xuICogcGFzc2VkLCBlYWNoIGVsZW1lbnQgc2hvdWxkIGJlIGFuIG9wdGlvbnMgb2JqZWN0IGFuZCB0aGUgZmlyc3QgYXJyYXkgZWxlbWVudFxuICogd2lsbCBiZSB1c2VkIGZvciB0aGUgZmlyc3QgcmVxdWVzdCwgdGhlIHNlY29uZCBlbGVtZW50IGZvciB0aGUgc2Vjb25kIHJlcXVlc3RcbiAqIGFuZCBzbyBvbi4gbnVsbCBlbGVtZW50cyBhcmUgYWxsb3dlZC5cbiAqXG4gKiBXaGVuIGNhbGxlZCBhZnRlciBhIGNhbGwgdG8gd2l0aFJlcXVlc3RPcHRpb25zIG9yIHdoZW4gY29tYmluaW5nIG11bHRpcGxlXG4gKiBhZGRSZXF1ZXN0T3B0aW9ucyBjYWxscywgc29tZSB3aXRoIG9iamVjdHMgYW5kIHNvbWUgd2l0aCBhcnJheXMsIGEgbXVsdGl0dWRlXG4gKiBvZiBpbnRlcmVzdGluZyBzaXR1YXRpb25zIGNhbiBvY2N1cjpcbiAqXG4gKiAxKSBUaGUgZXhpc3RpbmcgcmVxdWVzdCBvcHRpb25zIGFyZSBhbiBvYmplY3QgYW5kIHRoZSBuZXcgb3B0aW9ucyBwYXNzZWQgaW50b1xuICogdGhpcyBtZXRob2QgYXJlIGFsc28gYW4gb2JqZWN0LiBPdXRjb21lOiBCb3RoIG9iamVjdHMgYXJlIG1lcmdlZCBhbmQgYWxsXG4gKiBvcHRpb25zIGFyZSBhcHBsaWVkIHRvIGFsbCByZXF1ZXN0cy5cbiAqXG4gKiAyKSBUaGUgZXhpc3Rpbmcgb3B0aW9ucyBhcmUgYW4gYXJyYXkgYW5kIHRoZSBuZXcgb3B0aW9ucyBwYXNzZWQgaW50byB0aGlzXG4gKiBtZXRob2QgYXJlIGFsc28gYW4gYXJyYXkuIE91dGNvbWU6IEVhY2ggYXJyYXkgZWxlbWVudCBpcyBtZXJnZWQgaW5kaXZpZHVhbGx5LlxuICogVGhlIGNvbWJpbmVkIG9wdGlvbnMgZnJvbSB0aGUgbi10aCBhcnJheSBlbGVtZW50IGluIHRoZSBleGlzdGluZyBvcHRpb25zXG4gKiBhcnJheSBhbmQgdGhlIG4tdGggYXJyYXkgZWxlbWVudCBpbiB0aGUgZ2l2ZW4gYXJyYXkgYXJlIGFwcGxpZWQgdG8gdGhlIG4tdGhcbiAqIHJlcXVlc3QuXG4gKlxuICogMykgVGhlIGV4aXN0aW5nIG9wdGlvbnMgYXJlIGFuIG9iamVjdCBhbmQgdGhlIG5ldyBvcHRpb25zIHBhc3NlZCBpbnRvIHRoaXNcbiAqIG1ldGhvZCBhcmUgYW4gYXJyYXkuIE91dGNvbWU6IEEgbmV3IG9wdGlvbnMgYXJyYXkgd2lsbCBiZSBjcmVhdGVkLiBGb3IgZWFjaFxuICogZWxlbWVudCwgYSBjbG9uZSBvZiB0aGUgZXhpc3Rpbmcgb3B0aW9ucyBvYmplY3Qgd2lsbCBiZSBtZXJnZWQgd2l0aCBhblxuICogZWxlbWVudCBmcm9tIHRoZSBnaXZlbiBvcHRpb25zIGFycmF5LlxuICpcbiAqIE5vdGUgdGhhdCBpZiB0aGUgZ2l2ZW4gYXJyYXkgaGFzIGxlc3MgZWxlbWVudHMgdGhhbiB0aGUgbnVtYmVyIG9mIHN0ZXBzIGluXG4gKiB0aGUgbGluayB0cmF2ZXJzYWwgKHVzdWFsbHkgdGhlIG51bWJlciBvZiBzdGVwcyBpcyBkZXJpdmVkIGZyb20gdGhlIG51bWJlclxuICogb2YgbGluayByZWxhdGlvbnMgZ2l2ZW4gdG8gdGhlIGZvbGxvdyBtZXRob2QpLCBvbmx5IHRoZSBmaXJzdCBuIGh0dHBcbiAqIHJlcXVlc3RzIHdpbGwgdXNlIG9wdGlvbnMgYXQgYWxsLCB3aGVyZSBuIGlzIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlXG4gKiBnaXZlbiBhcnJheS4gSFRUUCByZXF1ZXN0IG4gKyAxIGFuZCBhbGwgZm9sbG93aW5nIEhUVFAgcmVxdWVzdHMgd2lsbCB1c2UgYW5cbiAqIGVtcHR5IG9wdGlvbnMgb2JqZWN0LiBUaGlzIGlzIGR1ZSB0byB0aGUgZmFjdCwgdGhhdCBhdCB0aGUgdGltZSBvZiBjcmVhdGluZ1xuICogdGhlIG5ldyBvcHRpb25zIGFycmF5LCB3ZSBjYW4gbm90IGtub3cgd2l0aCBjZXJ0YWludHkgaG93IG1hbnkgc3RlcHMgdGhlXG4gKiBsaW5rIHRyYXZlcnNhbCB3aWxsIGhhdmUuXG4gKlxuICogNCkgVGhlIGV4aXN0aW5nIG9wdGlvbnMgYXJlIGFuIGFycmF5IGFuZCB0aGUgbmV3IG9wdGlvbnMgcGFzc2VkIGludG8gdGhpc1xuICogbWV0aG9kIGFyZSBhbiBvYmplY3QuIE91dGNvbWU6IEEgY2xvbmUgb2YgdGhlIGdpdmVuIG9wdGlvbnMgb2JqZWN0IHdpbGwgYmVcbiAqIG1lcmdlZCBpbnRvIGludG8gZWFjaCBhcnJheSBlbGVtZW50IG9mIHRoZSBleGlzdGluZyBvcHRpb25zLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5hZGRSZXF1ZXN0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAvLyBjYXNlIDI6IGJvdGggdGhlIHByZXNlbnQgb3B0aW9ucyBhbmQgdGhlIG5ldyBvcHRpb25zIGFyZSBhcnJheXMuXG4gIC8vID0+IG1lcmdlIGVhY2ggYXJyYXkgZWxlbWVudCBpbmRpdmlkdWFsbHlcbiAgaWYgKHV0aWwuaXNBcnJheSh0aGlzLnJlcXVlc3RPcHRpb25zKSAmJiB1dGlsLmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICBtZXJnZUFycmF5RWxlbWVudHModGhpcy5yZXF1ZXN0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgLy8gY2FzZSAzOiB0aGVyZSBpcyBhbiBvcHRpb25zIG9iamVjdCB0aGUgbmV3IG9wdGlvbnMgYXJlIGFuIGFycmF5LlxuICAvLyA9PiBjcmVhdGUgYSBuZXcgYXJyYXksIGVhY2ggZWxlbWVudCBpcyBhIG1lcmdlIG9mIHRoZSBleGlzdGluZyBiYXNlIG9iamVjdFxuICAvLyBhbmQgdGhlIGFycmF5IGVsZW1lbnQgZnJvbSB0aGUgbmV3IG9wdGlvbnMgYXJyYXkuXG4gIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVxdWVzdE9wdGlvbnMgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgdXRpbC5pc0FycmF5KG9wdGlvbnMpKSB7XG4gICAgdGhpcy5yZXF1ZXN0T3B0aW9ucyA9XG4gICAgICBtZXJnZUJhc2VPYmplY3RXaXRoQXJyYXlFbGVtZW50cyh0aGlzLnJlcXVlc3RPcHRpb25zLCBvcHRpb25zKTtcblxuICAvLyBjYXNlIDQ6IHRoZXJlIGlzIGFuIG9wdGlvbnMgYXJyYXkgYW5kIHRoZSBuZXcgb3B0aW9ucyBhcmUgYW4gb2JqZWN0LlxuICAvLyA9PiBtZXJnZSB0aGUgbmV3IG9iamVjdCBpbnRvIGVhY2ggYXJyYXkgZWxlbWVudC5cbiAgfSBlbHNlIGlmICh1dGlsLmlzQXJyYXkodGhpcy5yZXF1ZXN0T3B0aW9ucykgJiZcbiAgICAgICAgICAgICB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICBtZXJnZU9wdGlvbk9iamVjdEludG9FYWNoQXJyYXlFbGVtZW50KHRoaXMucmVxdWVzdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gIC8vIGNhc2UgMTogYm90aCBhcmUgb2JqZWN0c1xuICAvLyA9PiBtZXJnZSBib3RoIG9iamVjdHNcbiAgfSBlbHNlIHtcbiAgICBtZXJnZVJlY3Vyc2l2ZSh0aGlzLnJlcXVlc3RPcHRpb25zLCBvcHRpb25zKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIG1lcmdlQXJyYXlFbGVtZW50cyhleGlzdGluZ09wdGlvbnMsIG5ld09wdGlvbnMpIHtcbiAgZm9yICh2YXIgaSA9IDA7XG4gICAgICAgaSA8IE1hdGgubWF4KGV4aXN0aW5nT3B0aW9ucy5sZW5ndGgsIG5ld09wdGlvbnMubGVuZ3RoKTtcbiAgICAgICBpKyspIHtcbiAgICBleGlzdGluZ09wdGlvbnNbaV0gPVxuICAgICAgbWVyZ2VSZWN1cnNpdmUoZXhpc3RpbmdPcHRpb25zW2ldLCBuZXdPcHRpb25zW2ldKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZUJhc2VPYmplY3RXaXRoQXJyYXlFbGVtZW50cyhleGlzdGluZ09wdGlvbnMsIG5ld09wdGlvbnMpIHtcbiAgdmFyIG5ld09wdEFycmF5ID0gW107XG4gIGZvciAodmFyIGkgPSAwO1xuICAgICAgIGkgPCBuZXdPcHRpb25zLmxlbmd0aDtcbiAgICAgICBpKyspIHtcbiAgICBuZXdPcHRBcnJheVtpXSA9XG4gICAgICBtZXJnZVJlY3Vyc2l2ZShuZXdPcHRpb25zW2ldLCBleGlzdGluZ09wdGlvbnMpO1xuICB9XG4gIHJldHVybiBuZXdPcHRBcnJheTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VPcHRpb25PYmplY3RJbnRvRWFjaEFycmF5RWxlbWVudChleGlzdGluZ09wdGlvbnMsIG5ld09wdGlvbnMpIHtcbiAgZm9yICh2YXIgaSA9IDA7XG4gICAgICAgaSA8IGV4aXN0aW5nT3B0aW9ucy5sZW5ndGg7XG4gICAgICAgaSsrKSB7XG4gICAgbWVyZ2VSZWN1cnNpdmUoZXhpc3RpbmdPcHRpb25zW2ldLCBuZXdPcHRpb25zKTtcbiAgfVxufVxuXG4vKipcbiAqIEluamVjdHMgYSBjdXN0b20gcmVxdWVzdCBsaWJyYXJ5LiBXaGVuIHVzaW5nIHRoaXMgbWV0aG9kLCB5b3Ugc2hvdWxkIG5vdFxuICogY2FsbCB3aXRoUmVxdWVzdE9wdGlvbnMgb3IgYWRkUmVxdWVzdE9wdGlvbnMgYnV0IGluc3RlYWQgcHJlLWNvbmZpZ3VyZSB0aGVcbiAqIGluamVjdGVkIHJlcXVlc3QgbGlicmFyeSBpbnN0YW5jZSBiZWZvcmUgcGFzc2luZyBpdCB0byB3aXRoUmVxdWVzdExpYnJhcnkuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLndpdGhSZXF1ZXN0TGlicmFyeSA9IGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgdGhpcy5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UgPSByZXF1ZXN0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5qZWN0cyBhIGN1c3RvbSBKU09OIHBhcnNlci5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucGFyc2VSZXNwb25zZUJvZGllc1dpdGggPSBmdW5jdGlvbihwYXJzZXIpIHtcbiAgdGhpcy5qc29uUGFyc2VyID0gcGFyc2VyO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV2l0aCB0aGlzIG9wdGlvbiBlbmFibGVkLCB0aGUgYm9keSBvZiB0aGUgcmVzcG9uc2UgYXQgdGhlIGVuZCBvZiB0aGVcbiAqIHRyYXZlcnNhbCB3aWxsIGJlIGNvbnZlcnRlZCBpbnRvIGEgSmF2YVNjcmlwdCBvYmplY3QgKGZvciBleGFtcGxlIGJ5IHBhc3NpbmdcbiAqIGl0IGludG8gSlNPTi5wYXJzZSkgYW5kIHBhc3NpbmcgdGhlIHJlc3VsdGluZyBvYmplY3QgaW50byB0aGUgY2FsbGJhY2suXG4gKiBUaGUgZGVmYXVsdCBpcyBmYWxzZSwgd2hpY2ggbWVhbnMgdGhlIGZ1bGwgcmVzcG9uc2UgaXMgaGFuZGVkIHRvIHRoZVxuICogY2FsbGJhY2suXG4gKlxuICogV2hlbiByZXNwb25zZSBib2R5IGNvbnZlcnNpb24gaXMgZW5hYmxlZCwgeW91IHdpbGwgbm90IGdldCB0aGUgZnVsbFxuICogcmVzcG9uc2UsIHNvIHlvdSB3b24ndCBoYXZlIGFjY2VzcyB0byB0aGUgSFRUUCBzdGF0dXMgY29kZSBvciBoZWFkZXJzLlxuICogSW5zdGVhZCBvbmx5IHRoZSBjb252ZXJ0ZWQgb2JqZWN0IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGNhbGxiYWNrLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgYm9keSBvZiBhbnkgaW50ZXJtZWRpYXJ5IHJlc3BvbnNlcyBkdXJpbmcgdGhlIHRyYXZlcnNhbCBpc1xuICogYWx3YXlzIGNvbnZlcnRlZCBieSBUcmF2ZXJzb24gKHRvIGZpbmQgdGhlIG5leHQgbGluaykuXG4gKlxuICogSWYgdGhlIG1ldGhvZCBpcyBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMgKG9yIHRoZSBmaXJzdCBhcmd1bWVudCBpcyB1bmRlZmluZWRcbiAqIG9yIG51bGwpLCByZXNwb25zZSBib2R5IGNvbnZlcnNpb24gaXMgc3dpdGNoZWQgb24sIG90aGVyd2lzZSB0aGUgYXJndW1lbnQgaXNcbiAqIGludGVycHJldGVkIGFzIGEgYm9vbGVhbiBmbGFnLiBJZiBpdCBpcyBhIHRydXRoeSB2YWx1ZSwgcmVzcG9uc2UgYm9keVxuICogY29udmVyc2lvbiBpcyBzd2l0Y2hlZCB0byBvbiwgaWYgaXQgaXMgYSBmYWxzeSB2YWx1ZSAoYnV0IG5vdCBudWxsIG9yXG4gKiB1bmRlZmluZWQpLCByZXNwb25zZSBib2R5IGNvbnZlcnNpb24gaXMgc3dpdGNoZWQgb2ZmLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5jb252ZXJ0UmVzcG9uc2VUb09iamVjdCA9IGZ1bmN0aW9uKGZsYWcpIHtcbiAgaWYgKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyB8fCBmbGFnID09PSBudWxsKSB7XG4gICAgZmxhZyA9IHRydWU7XG4gIH1cbiAgdGhpcy5jb252ZXJ0UmVzcG9uc2VUb09iamVjdEZsYWcgPSAhIWZsYWc7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTd2l0Y2hlcyBVUkwgcmVzb2x1dGlvbiB0byByZWxhdGl2ZSAoZGVmYXVsdCBpcyBhYnNvbHV0ZSkgb3IgYmFjayB0b1xuICogYWJzb2x1dGUuXG4gKlxuICogSWYgdGhlIG1ldGhvZCBpcyBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMgKG9yIHRoZSBmaXJzdCBhcmd1bWVudCBpcyB1bmRlZmluZWRcbiAqIG9yIG51bGwpLCBVUkwgcmVzb2x1dGlvbiBpcyBzd2l0Y2hlZCB0byByZWxhdGl2ZSwgb3RoZXJ3aXNlIHRoZSBhcmd1bWVudCBpc1xuICogaW50ZXJwcmV0ZWQgYXMgYSBib29sZWFuIGZsYWcuIElmIGl0IGlzIGEgdHJ1dGh5IHZhbHVlLCBVUkwgcmVzb2x1dGlvbiBpc1xuICogc3dpdGNoZWQgdG8gcmVsYXRpdmUsIGlmIGl0IGlzIGEgZmFsc3kgdmFsdWUsIFVSTCByZXNvbHV0aW9uIGlzIHN3aXRjaGVkIHRvXG4gKiBhYnNvbHV0ZS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucmVzb2x2ZVJlbGF0aXZlID0gZnVuY3Rpb24oZmxhZykge1xuICBpZiAodHlwZW9mIGZsYWcgPT09ICd1bmRlZmluZWQnIHx8IGZsYWcgPT09IG51bGwpIHtcbiAgICBmbGFnID0gdHJ1ZTtcbiAgfVxuICB0aGlzLnJlc29sdmVSZWxhdGl2ZUZsYWcgPSAhIWZsYWc7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNYWtlcyBUcmF2ZXJzb24gcHJlZmVyIGVtYmVkZGVkIHJlc291cmNlcyBvdmVyIHRyYXZlcnNpbmcgYSBsaW5rIG9yIHZpY2VcbiAqIHZlcnNhLiBUaGlzIG9ubHkgYXBwbGllcyB0byBtZWRpYSB0eXBlcyB3aGljaCBzdXBwb3J0IGVtYmVkZGVkIHJlc291cmNlc1xuICogKGxpa2UgSEFMKS4gSXQgaGFzIG5vIGVmZmVjdCB3aGVuIHVzaW5nIGEgbWVkaWEgdHlwZSB0aGF0IGRvZXMgbm90IHN1cHBvcnRcbiAqIGVtYmVkZGVkIHJlc291cmNlcy5cbiAqXG4gKiBJdCBhbHNvIG9ubHkgdGFrZXMgZWZmZWN0IHdoZW4gYSByZXNvdXJjZSBjb250YWlucyBib3RoIGEgbGluayBfYW5kXyBhblxuICogZW1iZWRkZWQgcmVzb3VyY2Ugd2l0aCB0aGUgbmFtZSB0aGF0IGlzIHRvIGJlIGZvbGxvd2VkIGF0IHRoaXMgc3RlcCBpbiB0aGVcbiAqIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MuXG4gKlxuICogSWYgdGhlIG1ldGhvZCBpcyBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMgKG9yIHRoZSBmaXJzdCBhcmd1bWVudCBpcyB1bmRlZmluZWRcbiAqIG9yIG51bGwpLCBlbWJlZGRlZCByZXNvdXJjZXMgd2lsbCBiZSBwcmVmZXJyZWQgb3ZlciBmZXRjaGluZyBsaW5rZWQgcmVzb3VyY2VzXG4gKiB3aXRoIGFuIGFkZGl0aW9uYWwgSFRUUCByZXF1ZXN0LiBPdGhlcndpc2UgdGhlIGFyZ3VtZW50IGlzIGludGVycHJldGVkIGFzIGFcbiAqIGJvb2xlYW4gZmxhZy4gSWYgaXQgaXMgYSB0cnV0aHkgdmFsdWUsIGVtYmVkZGVkIHJlc291cmNlcyB3aWxsIGJlIHByZWZlcnJlZCxcbiAqIGlmIGl0IGlzIGEgZmFsc3kgdmFsdWUsIHRyYXZlcnNpbmcgdGhlIGxpbmsgcmVsYXRpb24gd2lsbCBiZSBwcmVmZXJyZWQuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnByZWZlckVtYmVkZGVkUmVzb3VyY2VzID0gZnVuY3Rpb24oZmxhZykge1xuICBpZiAodHlwZW9mIGZsYWcgPT09ICd1bmRlZmluZWQnIHx8IGZsYWcgPT09IG51bGwpIHtcbiAgICBmbGFnID0gdHJ1ZTtcbiAgfVxuICB0aGlzLnByZWZlckVtYmVkZGVkID0gISFmbGFnO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCBtZWRpYSB0eXBlLiBJZiBubyBtZWRpYSB0eXBlIGlzIGVuZm9yY2VkIGJ1dCBjb250ZW50IHR5cGVcbiAqIGRldGVjdGlvbiBpcyB1c2VkLCB0aGUgc3RyaW5nIGBjb250ZW50LW5lZ290aWF0aW9uYCBpcyByZXR1cm5lZC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0TWVkaWFUeXBlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm1lZGlhVHlwZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgVVJMIHNldCBieSB0aGUgZnJvbSh1cmwpIG1ldGhvZCwgdGhhdCBpcywgdGhlIHJvb3QgVVJMIG9mIHRoZVxuICogQVBJLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRGcm9tID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0YXJ0VXJsO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0ZW1wbGF0ZSBwYXJhbWV0ZXJzIHNldCBieSB0aGUgd2l0aFRlbXBsYXRlUGFyYW1ldGVycy5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0VGVtcGxhdGVQYXJhbWV0ZXJzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRlbXBsYXRlUGFyYW1ldGVycztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmVxdWVzdCBvcHRpb25zIHNldCBieSB0aGUgd2l0aFJlcXVlc3RPcHRpb25zIG9yXG4gKiBhZGRSZXF1ZXN0T3B0aW9ucy5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0UmVxdWVzdE9wdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmVxdWVzdE9wdGlvbnM7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1c3RvbSByZXF1ZXN0IGxpYnJhcnkgaW5zdGFuY2Ugc2V0IGJ5IHdpdGhSZXF1ZXN0TGlicmFyeSBvciB0aGVcbiAqIHN0YW5kYXJkIHJlcXVlc3QgbGlicmFyeSBpbnN0YW5jZSwgaWYgYSBjdXN0b20gb25lIGhhcyBub3QgYmVlbiBzZXQuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldFJlcXVlc3RMaWJyYXJ5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnJlcXVlc3RNb2R1bGVJbnN0YW5jZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VzdG9tIEpTT04gcGFyc2VyIGZ1bmN0aW9uIHNldCBieSBwYXJzZVJlc3BvbnNlQm9kaWVzV2l0aCBvciB0aGVcbiAqIHN0YW5kYXJkIHBhcnNlciBmdW5jdGlvbiwgaWYgYSBjdXN0b20gb25lIGhhcyBub3QgYmVlbiBzZXQuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldEpzb25QYXJzZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuanNvblBhcnNlcjtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBib2R5IG9mIHRoZSBsYXN0IHJlc3BvbnNlIHdpbGwgYmUgY29udmVydGVkIHRvIGFcbiAqIEphdmFTY3JpcHQgb2JqZWN0IGJlZm9yZSBwYXNzaW5nIHRoZSByZXN1bHQgYmFjayB0byB0aGUgY2FsbGJhY2suXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmNvbnZlcnRzUmVzcG9uc2VUb09iamVjdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jb252ZXJ0UmVzcG9uc2VUb09iamVjdEZsYWc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZsYWcgY29udHJvbGxpbmcgaWYgVVJMcyBhcmUgcmVzb2x2ZWQgcmVsYXRpdmUgb3IgYWJzb2x1dGUuXG4gKiBBIHJldHVybiB2YWx1ZSBvZiB0cnVlIG1lYW5zIHRoYXQgVVJMcyBhcmUgcmVzb2x2ZWQgcmVsYXRpdmUsIGZhbHNlIG1lYW5zXG4gKiBhYnNvbHV0ZS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZG9lc1Jlc29sdmVSZWxhdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlUmVsYXRpdmVGbGFnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmbGFnIGNvbnRyb2xsaW5nIGlmIGVtYmVkZGVkIHJlc291cmNlcyBhcmUgcHJlZmVycmVkIG92ZXIgbGlua3MuXG4gKiBBIHJldHVybiB2YWx1ZSBvZiB0cnVlIG1lYW5zIHRoYXQgZW1iZWRkZWQgcmVzb3VyY2VzIGFyZSBwcmVmZXJyZWQsIGZhbHNlXG4gKiBtZWFucyB0aGF0IGZvbGxvd2luZyBsaW5rcyBpcyBwcmVmZXJyZWQuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmRvZXNQcmVmZXJFbWJlZGRlZFJlc291cmNlcyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5wcmVmZXJFbWJlZGRlZDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGNvbnRlbnQgbmVnb3RpYXRpb24gaXMgZW5hYmxlZCBhbmQgZmFsc2UgaWYgYSBwYXJ0aWN1bGFyXG4gKiBtZWRpYSB0eXBlIGlzIGZvcmNlZC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZG9lc0NvbnRlbnROZWdvdGlhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jb250ZW50TmVnb3RpYXRpb247XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgcGFzc2VzIHRoZSBsYXN0IEhUVFAgcmVzcG9uc2UgdG8gdGhlXG4gKiBjYWxsYmFjay5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnaW5pdGlhdGluZyB0cmF2ZXJzYWwgKGdldCknKTtcbiAgdmFyIHQgPSBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUodGhpcyk7XG4gIHJldHVybiBhY3Rpb25zLmdldCh0LCB3cmFwRm9yQ29udGludWUodGhpcywgdCwgY2FsbGJhY2ssICdnZXQnKSk7XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgdmFyaWFudCBvZiBnZXQoKSB0aGF0IGRvZXMgbm90IHlpZWxkIHRoZSBmdWxsIGh0dHAgcmVzcG9uc2UgdG8gdGhlXG4gKiBjYWxsYmFjayBidXQgaW5zdGVhZCB0aGUgYWxyZWFkeSBwYXJzZWQgSlNPTiBhcyBhbiBvYmplY3QuXG4gKlxuICogVGhpcyBpcyBhIHNob3J0Y3V0IGZvciBidWlsZGVyLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0KCkuZ2V0KGNhbGxiYWNrKS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0UmVzb3VyY2UgPSBmdW5jdGlvbiBnZXRSZXNvdXJjZShjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2luaXRpYXRpbmcgdHJhdmVyc2FsIChnZXRSZXNvdXJjZSknKTtcbiAgdGhpcy5jb252ZXJ0UmVzcG9uc2VUb09iamVjdEZsYWcgPSB0cnVlO1xuICB2YXIgdCA9IGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZSh0aGlzKTtcbiAgcmV0dXJuIGFjdGlvbnMuZ2V0KHQsIHdyYXBGb3JDb250aW51ZSh0aGlzLCB0LCBjYWxsYmFjayxcbiAgICAgICdnZXRSZXNvdXJjZScpKTtcbn07XG5cbi8qKlxuICogU3BlY2lhbCB2YXJpYW50IG9mIGdldCgpIHRoYXQgZG9lcyBub3QgZXhlY3V0ZSB0aGUgbGFzdCByZXF1ZXN0IGJ1dCBpbnN0ZWFkXG4gKiB5aWVsZHMgdGhlIGxhc3QgVVJMIHRvIHRoZSBjYWxsYmFjay5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0VXJsID0gZnVuY3Rpb24gZ2V0VXJsKGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnaW5pdGlhdGluZyB0cmF2ZXJzYWwgKGdldFVybCknKTtcbiAgdmFyIHQgPSBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUodGhpcyk7XG4gIHJldHVybiBhY3Rpb25zLmdldFVybCh0LCB3cmFwRm9yQ29udGludWUodGhpcywgdCwgY2FsbGJhY2ssICdnZXRVcmwnKSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciBnZXRVcmwuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldFVyaSA9IEJ1aWxkZXIucHJvdG90eXBlLmdldFVybDtcblxuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBQT1NUIHJlcXVlc3Qgd2l0aCB0aGVcbiAqIGdpdmVuIGJvZHkgdG8gdGhlIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIFBPU1QgcmVxdWVzdCB0b1xuICogdGhlIGNhbGxiYWNrLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gcG9zdChib2R5LCBjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2luaXRpYXRpbmcgdHJhdmVyc2FsIChwb3N0KScpO1xuICB2YXIgdCA9IGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZSh0aGlzLCBib2R5KTtcbiAgcmV0dXJuIGFjdGlvbnMucG9zdCh0LCB3cmFwRm9yQ29udGludWUodGhpcywgdCwgY2FsbGJhY2ssICdwb3N0JykpO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgUFVUIHJlcXVlc3Qgd2l0aCB0aGVcbiAqIGdpdmVuIGJvZHkgdG8gdGhlIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIFBVVCByZXF1ZXN0IHRvXG4gKiB0aGUgY2FsbGJhY2suXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uIHB1dChib2R5LCBjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2luaXRpYXRpbmcgdHJhdmVyc2FsIChwdXQpJyk7XG4gIHZhciB0ID0gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHRoaXMsIGJvZHkpO1xuICByZXR1cm4gYWN0aW9ucy5wdXQodCwgd3JhcEZvckNvbnRpbnVlKHRoaXMsIHQsIGNhbGxiYWNrLCAncHV0JykpO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgUEFUQ0ggcmVxdWVzdCB3aXRoIHRoZVxuICogZ2l2ZW4gYm9keSB0byB0aGUgbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgUEFUQ0ggcmVxdWVzdCB0b1xuICogdGhlIGNhbGxiYWNrLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wYXRjaCA9IGZ1bmN0aW9uIHBhdGNoKGJvZHksIGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnaW5pdGlhdGluZyB0cmF2ZXJzYWwgKHBhdGNoKScpO1xuICB2YXIgdCA9IGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZSh0aGlzLCBib2R5KTtcbiAgcmV0dXJuIGFjdGlvbnMucGF0Y2godCwgd3JhcEZvckNvbnRpbnVlKHRoaXMsIHQsIGNhbGxiYWNrLCAncGF0Y2gnKSk7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBERUxFVEUgcmVxdWVzdCB0byB0aGVcbiAqIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIERFTEVURSByZXF1ZXN0IHRvIHRoZSBjYWxsYmFjay5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gZGVsKGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnaW5pdGlhdGluZyB0cmF2ZXJzYWwgKGRlbGV0ZSknKTtcbiAgdmFyIHQgPSBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUodGhpcyk7XG4gIHJldHVybiBhY3Rpb25zLmRlbGV0ZSh0LCB3cmFwRm9yQ29udGludWUodGhpcywgdCwgY2FsbGJhY2ssICdkZWxldGUnKSk7XG59O1xuXG4vKipcbiAqIEFsaWFzIGZvciBkZWxldGUuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmRlbCA9IEJ1aWxkZXIucHJvdG90eXBlLmRlbGV0ZTtcblxuZnVuY3Rpb24gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHNlbGYsIGJvZHkpIHtcblxuICB2YXIgdHJhdmVyc2FsU3RhdGUgPSB7XG4gICAgYWJvcnRlZDogZmFsc2UsXG4gICAgYWRhcHRlcjogc2VsZi5hZGFwdGVyIHx8IG51bGwsXG4gICAgYm9keTogYm9keSB8fCBudWxsLFxuICAgIGNhbGxiYWNrSGFzQmVlbkNhbGxlZEFmdGVyQWJvcnQ6IGZhbHNlLFxuICAgIGNvbnRlbnROZWdvdGlhdGlvbjogc2VsZi5kb2VzQ29udGVudE5lZ290aWF0aW9uKCksXG4gICAgY29udGludWF0aW9uOiBudWxsLFxuICAgIGNvbnZlcnRSZXNwb25zZVRvT2JqZWN0OiBzZWxmLmNvbnZlcnRzUmVzcG9uc2VUb09iamVjdCgpLFxuICAgIGxpbmtzOiBzZWxmLmxpbmtzLFxuICAgIGpzb25QYXJzZXI6IHNlbGYuZ2V0SnNvblBhcnNlcigpLFxuICAgIHJlcXVlc3RNb2R1bGVJbnN0YW5jZTogc2VsZi5nZXRSZXF1ZXN0TGlicmFyeSgpLFxuICAgIHJlcXVlc3RPcHRpb25zOiBzZWxmLmdldFJlcXVlc3RPcHRpb25zKCksXG4gICAgcmVzb2x2ZVJlbGF0aXZlOiBzZWxmLmRvZXNSZXNvbHZlUmVsYXRpdmUoKSxcbiAgICBwcmVmZXJFbWJlZGRlZDogc2VsZi5kb2VzUHJlZmVyRW1iZWRkZWRSZXNvdXJjZXMoKSxcbiAgICBzdGFydFVybDogc2VsZi5zdGFydFVybCxcbiAgICBzdGVwIDoge1xuICAgICAgdXJsOiBzZWxmLnN0YXJ0VXJsLFxuICAgICAgaW5kZXg6IDAsXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVBhcmFtZXRlcnM6IHNlbGYuZ2V0VGVtcGxhdGVQYXJhbWV0ZXJzKCksXG4gIH07XG4gIHRyYXZlcnNhbFN0YXRlLmFib3J0VHJhdmVyc2FsID0gYWJvcnRUcmF2ZXJzYWwuYmluZCh0cmF2ZXJzYWxTdGF0ZSk7XG5cbiAgaWYgKHNlbGYuY29udGludWF0aW9uKSB7XG4gICAgdHJhdmVyc2FsU3RhdGUuY29udGludWF0aW9uID0gc2VsZi5jb250aW51YXRpb247XG4gICAgdHJhdmVyc2FsU3RhdGUuc3RlcCA9IHNlbGYuY29udGludWF0aW9uLnN0ZXA7XG4gICAgc2VsZi5jb250aW51YXRpb24gPSBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHRyYXZlcnNhbFN0YXRlO1xufVxuXG5mdW5jdGlvbiB3cmFwRm9yQ29udGludWUoc2VsZiwgdCwgY2FsbGJhY2ssIGZpcnN0VHJhdmVyc2FsQWN0aW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgIGlmIChlcnIpIHsgcmV0dXJuIGNhbGxiYWNrKGVycik7IH1cbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcmVzdWx0LCB7XG4gICAgICBjb250aW51ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gdHJhdmVyc2FsIHN0YXRlIHRvIGNvbnRpbnVlIGZyb20uJyk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cuZGVidWcoJz4gY29udGludWluZyBmaW5pc2hlZCB0cmF2ZXJzYWwgcHJvY2VzcycpO1xuICAgICAgICBzZWxmLmNvbnRpbnVhdGlvbiA9IHtcbiAgICAgICAgICBzdGVwOiB0LnN0ZXAsXG4gICAgICAgICAgYWN0aW9uOiBmaXJzdFRyYXZlcnNhbEFjdGlvbixcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5jb250aW51YXRpb24uc3RlcC5pbmRleCA9IDA7XG4gICAgICAgIGluaXRGcm9tVHJhdmVyc2FsU3RhdGUoc2VsZiwgdCk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcbn1cblxuLypcbiAqIENvcHkgY29uZmlndXJhdGlvbiBmcm9tIHRyYXZlcnNhbCBzdGF0ZSB0byBidWlsZGVyIGluc3RhbmNlIHRvXG4gKiBwcmVwYXJlIGZvciBuZXh0IHRyYXZlcnNhbCBwcm9jZXNzLlxuICovXG5mdW5jdGlvbiBpbml0RnJvbVRyYXZlcnNhbFN0YXRlKHNlbGYsIHQpIHtcbiAgc2VsZi5hYm9ydGVkID0gZmFsc2U7XG4gIHNlbGYuYWRhcHRlciA9IHQuYWRhcHRlcjtcbiAgc2VsZi5ib2R5ID0gdC5ib2R5O1xuICBzZWxmLmNhbGxiYWNrSGFzQmVlbkNhbGxlZEFmdGVyQWJvcnQgPSBmYWxzZTtcbiAgc2VsZi5jb250ZW50TmVnb3RpYXRpb24gPSB0LmNvbnRlbnROZWdvdGlhdGlvbjtcbiAgc2VsZi5jb252ZXJ0UmVzcG9uc2VUb09iamVjdEZsYWcgPSB0LmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0O1xuICBzZWxmLmxpbmtzID0gW107XG4gIHNlbGYuanNvblBhcnNlciA9ICB0Lmpzb25QYXJzZXI7XG4gIHNlbGYucmVxdWVzdE1vZHVsZUluc3RhbmNlID0gdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UsXG4gIHNlbGYucmVxdWVzdE9wdGlvbnMgPSB0LnJlcXVlc3RPcHRpb25zLFxuICBzZWxmLnJlc29sdmVSZWxhdGl2ZUZsYWcgPSB0LnJlc29sdmVSZWxhdGl2ZTtcbiAgc2VsZi5wcmVmZXJFbWJlZGRlZCA9IHQucHJlZmVyRW1iZWRkZWQ7XG4gIHNlbGYuc3RhcnRVcmwgPSB0LnN0YXJ0VXJsO1xuICBzZWxmLnRlbXBsYXRlUGFyYW1ldGVycyA9IHQudGVtcGxhdGVQYXJhbWV0ZXJzO1xufVxuXG5mdW5jdGlvbiBjbG9uZUFycmF5T3JPYmplY3QodGhpbmcpIHtcbiAgaWYgKHV0aWwuaXNBcnJheSh0aGluZykpIHtcbiAgICByZXR1cm4gc2hhbGxvd0Nsb25lQXJyYXkodGhpbmcpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB0aGluZyA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZGVlcENsb25lT2JqZWN0KHRoaW5nKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpbmc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVlcENsb25lT2JqZWN0KG9iamVjdCkge1xuICByZXR1cm4gbWVyZ2VSZWN1cnNpdmUobnVsbCwgb2JqZWN0KTtcbn1cblxuZnVuY3Rpb24gc2hhbGxvd0Nsb25lQXJyYXkoYXJyYXkpIHtcbiAgaWYgKCFhcnJheSkge1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuICByZXR1cm4gYXJyYXkuc2xpY2UoMCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnVpbGRlcjtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4vYWJvcnRfdHJhdmVyc2FsJylcbiAgLCBkZXRlY3RDb250ZW50VHlwZSA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9kZXRlY3RfY29udGVudF90eXBlJylcbiAgLCBnZXRPcHRpb25zRm9yU3RlcCA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9nZXRfb3B0aW9uc19mb3Jfc3RlcCcpO1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgSFRUUCBHRVQgcmVxdWVzdCBkdXJpbmcgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MuXG4gKi9cbi8vIFRoaXMgbWV0aG9kIGlzIGN1cnJlbnRseSB1c2VkIGZvciBhbGwgaW50ZXJtZWRpYXRlIEdFVCByZXF1ZXN0cyBkdXJpbmcgdGhlXG4vLyBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzLiBDb2luY2lkZW50YWxseSwgaXQgaXMgYWxzbyB1c2VkIGZvciB0aGUgZmluYWwgcmVxdWVzdFxuLy8gaW4gYSBsaW5rIHRyYXZlcnNhbCBzaG91bGQgdGhpcyBoYXBwZW4gdG8gYmUgYSBHRVQgcmVxdWVzdC4gT3RoZXJ3aXNlIChQT1NUL1xuLy8gUFVUL1BBVENIL0RFTEVURSksIFRyYXZlcnNvbiB1c2VzIGV4ZWN0dWVIdHRwUmVxdWVzdC5cbmV4cG9ydHMuZmV0Y2hSZXNvdXJjZSA9IGZ1bmN0aW9uIGZldGNoUmVzb3VyY2UodCwgY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdmZXRjaGluZyByZXNvdXJjZSBmb3IgbmV4dCBzdGVwJyk7XG4gIGlmICh0LnN0ZXAudXJsKSB7XG4gICAgbG9nLmRlYnVnKCdmZXRjaGluZyByZXNvdXJjZSBmcm9tICcsIHQuc3RlcC51cmwpO1xuICAgIHJldHVybiBleGVjdXRlSHR0cEdldCh0LCBjYWxsYmFjayk7XG4gIH0gZWxzZSBpZiAodC5zdGVwLmRvYykge1xuICAgIC8vIFRoZSBzdGVwIGFscmVhZHkgaGFzIGFuIGF0dGFjaGVkIHJlc3VsdCBkb2N1bWVudCwgc28gYWxsIGlzIGZpbmUgYW5kIHdlXG4gICAgLy8gY2FuIGNhbGwgdGhlIGNhbGxiYWNrIGltbWVkaWF0ZWx5XG4gICAgbG9nLmRlYnVnKCdyZXNvdXJjZSBmb3IgbmV4dCBzdGVwIGhhcyBhbHJlYWR5IGJlZW4gZmV0Y2hlZCwgdXNpbmcgJyArXG4gICAgICAgICdlbWJlZGRlZCcpO1xuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgdCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ0NhbiBub3QgcHJvY2VzcyBzdGVwJyk7XG4gICAgICBlcnJvci5zdGVwID0gdC5zdGVwO1xuICAgICAgY2FsbGJhY2soZXJyb3IpO1xuICAgIH0pO1xuICB9XG59O1xuXG5mdW5jdGlvbiBleGVjdXRlSHR0cEdldCh0LCBjYWxsYmFjaykge1xuICB2YXIgb3B0aW9ucyA9IGdldE9wdGlvbnNGb3JTdGVwKHQpO1xuICBsb2cuZGVidWcoJ0hUVFAgR0VUIHJlcXVlc3QgdG8gJywgdC5zdGVwLnVybCk7XG4gIGxvZy5kZWJ1Zygnb3B0aW9ucyAnLCBvcHRpb25zKTtcbiAgdC5jdXJyZW50UmVxdWVzdCA9XG4gICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UuZ2V0KHQuc3RlcC51cmwsIG9wdGlvbnMsXG4gICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICBsb2cuZGVidWcoJ0hUVFAgR0VUIHJlcXVlc3QgdG8gJyArIHQuc3RlcC51cmwgKyAnIHJldHVybmVkJyk7XG4gICAgdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG5cbiAgICAvLyB3b3JrYXJvdW5kIGZvciBjYXNlcyB3aGVyZSByZXNwb25zZSBib2R5IGlzIGVtcHR5IGJ1dCBib2R5IGNvbWVzIGluIGFzXG4gICAgLy8gdGhlIHRoaXJkIGFyZ3VtZW50XG4gICAgaWYgKGJvZHkgJiYgIXJlc3BvbnNlLmJvZHkpIHtcbiAgICAgIHJlc3BvbnNlLmJvZHkgPSBib2R5O1xuICAgIH1cbiAgICB0LnN0ZXAucmVzcG9uc2UgPSByZXNwb25zZTtcblxuICAgIGlmIChlcnIpIHtcbiAgICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgdCk7XG4gICAgfVxuICAgIGxvZy5kZWJ1ZygncmVxdWVzdCB0byAnICsgdC5zdGVwLnVybCArICcgZmluaXNoZWQgd2l0aG91dCBlcnJvciAoJyArXG4gICAgICByZXNwb25zZS5zdGF0dXNDb2RlICsgJyknKTtcblxuICAgIGlmICghZGV0ZWN0Q29udGVudFR5cGUodCwgY2FsbGJhY2spKSByZXR1cm47XG5cbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgdCk7XG4gIH0pO1xuICBhYm9ydFRyYXZlcnNhbC5yZWdpc3RlckFib3J0TGlzdGVuZXIodCwgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGFuIGFyYml0cmFyeSBIVFRQIHJlcXVlc3QuXG4gKi9cbi8vIFRoaXMgbWV0aG9kIGlzIGN1cnJlbnRseSB1c2VkIGZvciBQT1NUL1BVVC9QQVRDSC9ERUxFVEUgYXQgdGhlIGVuZCBvZiBhIGxpbmtcbi8vIHRyYXZlcnNhbCBwcm9jZXNzLiBJZiB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyByZXF1aXJlcyBhIEdFVCBhcyB0aGUgbGFzdFxuLy8gcmVxdWVzdCwgVHJhdmVyc29uIHVzZXMgZXhlY3R1ZUh0dHBHZXQuXG5leHBvcnRzLmV4ZWN1dGVIdHRwUmVxdWVzdCA9IGZ1bmN0aW9uKHQsIHJlcXVlc3QsIG1ldGhvZCwgY2FsbGJhY2spIHtcbiAgdmFyIHJlcXVlc3RPcHRpb25zID0gZ2V0T3B0aW9uc0ZvclN0ZXAodCk7XG4gIGlmICh0LmJvZHkpIHtcbiAgICByZXF1ZXN0T3B0aW9ucy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkodC5ib2R5KTtcbiAgfVxuXG4gIGxvZy5kZWJ1ZygnSFRUUCAnICsgbWV0aG9kLm5hbWUgKyAnIHJlcXVlc3QgdG8gJywgdC5zdGVwLnVybCk7XG4gIGxvZy5kZWJ1Zygnb3B0aW9ucyAnLCByZXF1ZXN0T3B0aW9ucyk7XG4gIHQuY3VycmVudFJlcXVlc3QgPVxuICAgIG1ldGhvZC5jYWxsKHJlcXVlc3QsIHQuc3RlcC51cmwsIHJlcXVlc3RPcHRpb25zLFxuICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgbG9nLmRlYnVnKCdIVFRQICcgKyBtZXRob2QubmFtZSArICcgcmVxdWVzdCB0byAnICsgdC5zdGVwLnVybCArXG4gICAgICAnIHJldHVybmVkJyk7XG4gICAgdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG5cbiAgICAvLyB3b3JrYXJvdW5kIGZvciBjYXNlcyB3aGVyZSByZXNwb25zZSBib2R5IGlzIGVtcHR5IGJ1dCBib2R5IGNvbWVzIGluIGFzXG4gICAgLy8gdGhlIHRoaXJkIGFyZ3VtZW50XG4gICAgaWYgKGJvZHkgJiYgIXJlc3BvbnNlLmJvZHkpIHtcbiAgICAgIHJlc3BvbnNlLmJvZHkgPSBib2R5O1xuICAgIH1cbiAgICB0LnN0ZXAucmVzcG9uc2UgPSByZXNwb25zZTtcblxuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgIH1cblxuICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG4gIH0pO1xuICBhYm9ydFRyYXZlcnNhbC5yZWdpc3RlckFib3J0TGlzdGVuZXIodCwgY2FsbGJhY2spO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NvbnRpbnVhdGlvbih0KSB7XG4gIHJldHVybiB0LmNvbnRpbnVhdGlvbiAmJiB0LnN0ZXAgJiYgdC5zdGVwLnJlc3BvbnNlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGpzb25wYXRoTGliID0gcmVxdWlyZSgnSlNPTlBhdGgnKVxuICAsIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBfcyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUuc3RyaW5nJyk7XG5cbnZhciBqc29ucGF0aCA9IGpzb25wYXRoTGliLmV2YWw7XG5cbmZ1bmN0aW9uIEpzb25BZGFwdGVyKGxvZykge1xuICB0aGlzLmxvZyA9IGxvZztcbn1cblxuSnNvbkFkYXB0ZXIucHJvdG90eXBlLmZpbmROZXh0U3RlcCA9IGZ1bmN0aW9uKGRvYywgbGluaykge1xuICB0aGlzLmxvZy5kZWJ1ZygnZXh0cmFjdGluZyBsaW5rIGZyb20gZG9jJywgbGluaywgZG9jKTtcbiAgdmFyIHVybDtcbiAgaWYgKHRoaXMudGVzdEpTT05QYXRoKGxpbmspKSB7XG4gICAgcmV0dXJuIHsgdXJsOiB0aGlzLnJlc29sdmVKU09OUGF0aChsaW5rLCBkb2MpIH07XG4gIH0gZWxzZSBpZiAoZG9jW2xpbmtdKSB7XG4gICAgcmV0dXJuIHsgdXJsIDogZG9jW2xpbmtdIH07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBwcm9wZXJ0eSAnICsgbGluayArXG4gICAgICAgICcgaW4gZG9jdW1lbnQ6XFxuJywgZG9jKTtcbiAgfVxufTtcblxuSnNvbkFkYXB0ZXIucHJvdG90eXBlLnRlc3RKU09OUGF0aCA9IGZ1bmN0aW9uKGxpbmspIHtcbiAgcmV0dXJuIF9zLnN0YXJ0c1dpdGgobGluaywgJyQuJykgfHwgX3Muc3RhcnRzV2l0aChsaW5rLCAnJFsnKTtcbn07XG5cbkpzb25BZGFwdGVyLnByb3RvdHlwZS5yZXNvbHZlSlNPTlBhdGggPSBmdW5jdGlvbihsaW5rLCBkb2MpIHtcbiAgdmFyIG1hdGNoZXMgPSBqc29ucGF0aChkb2MsIGxpbmspO1xuICBpZiAobWF0Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgdXJsID0gbWF0Y2hlc1swXTtcbiAgICBpZiAoIXVybCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OUGF0aCBleHByZXNzaW9uICcgKyBsaW5rICtcbiAgICAgICAgJyB3YXMgcmVzb2x2ZWQgYnV0IHRoZSByZXN1bHQgd2FzIG51bGwsIHVuZGVmaW5lZCBvciBhbiBlbXB0eScgK1xuICAgICAgICAnIHN0cmluZyBpbiBkb2N1bWVudDpcXG4nICsgSlNPTi5zdHJpbmdpZnkoZG9jKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OUGF0aCBleHByZXNzaW9uICcgKyBsaW5rICtcbiAgICAgICAgJyB3YXMgcmVzb2x2ZWQgYnV0IHRoZSByZXN1bHQgaXMgbm90IGEgcHJvcGVydHkgb2YgdHlwZSBzdHJpbmcuICcgK1xuICAgICAgICAnSW5zdGVhZCBpdCBoYXMgdHlwZSBcIicgKyAodHlwZW9mIHVybCkgK1xuICAgICAgICAnXCIgaW4gZG9jdW1lbnQ6XFxuJyArIEpTT04uc3RyaW5naWZ5KGRvYykpO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xuICB9IGVsc2UgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgIC8vIGFtYmlnaW91cyBtYXRjaFxuICAgIHRocm93IG5ldyBFcnJvcignSlNPTlBhdGggZXhwcmVzc2lvbiAnICsgbGluayArXG4gICAgICAnIHJldHVybmVkIG1vcmUgdGhhbiBvbmUgbWF0Y2ggaW4gZG9jdW1lbnQ6XFxuJyArXG4gICAgICBKU09OLnN0cmluZ2lmeShkb2MpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBubyBtYXRjaCBhdCBhbGxcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT05QYXRoIGV4cHJlc3Npb24gJyArIGxpbmsgK1xuICAgICAgJyByZXR1cm5lZCBubyBtYXRjaCBpbiBkb2N1bWVudDpcXG4nICsgSlNPTi5zdHJpbmdpZnkoZG9jKSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSnNvbkFkYXB0ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZWRpYVR5cGVzID0gcmVxdWlyZSgnLi9tZWRpYV90eXBlcycpO1xuXG52YXIgcmVnaXN0cnkgPSB7fTtcblxuZXhwb3J0cy5yZWdpc3RlciA9IGZ1bmN0aW9uIHJlZ2lzdGVyKGNvbnRlbnRUeXBlLCBjb25zdHJ1Y3Rvcikge1xuICByZWdpc3RyeVtjb250ZW50VHlwZV0gPSBjb25zdHJ1Y3Rvcjtcbn07XG5cbmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24gZ2V0KGNvbnRlbnRUeXBlKSB7XG4gIHJldHVybiByZWdpc3RyeVtjb250ZW50VHlwZV07XG59O1xuXG5leHBvcnRzLnJlZ2lzdGVyKG1lZGlhVHlwZXMuQ09OVEVOVF9ORUdPVElBVElPTixcbiAgICByZXF1aXJlKCcuL25lZ290aWF0aW9uX2FkYXB0ZXInKSk7XG5leHBvcnRzLnJlZ2lzdGVyKG1lZGlhVHlwZXMuSlNPTiwgcmVxdWlyZSgnLi9qc29uX2FkYXB0ZXInKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDT05URU5UX05FR09USUFUSU9OOiAnY29udGVudC1uZWdvdGlhdGlvbicsXG4gIEpTT046ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgSlNPTl9IQUw6ICdhcHBsaWNhdGlvbi9oYWwranNvbicsXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBUT0RPIE1heWJlIHJlcGxhY2Ugd2l0aCBodHRwczovL2dpdGh1Yi5jb20vUmF5bm9zL3h0ZW5kXG4vLyBjaGVjayBicm93c2VyIGJ1aWxkIHNpemUsIHRob3VnaC5cbmZ1bmN0aW9uIG1lcmdlUmVjdXJzaXZlKG9iajEsIG9iajIpIHtcbiAgaWYgKCFvYmoxICYmIG9iajIpIHtcbiAgICBvYmoxID0ge307XG4gIH1cbiAgZm9yICh2YXIga2V5IGluIG9iajIpIHtcbiAgICBpZiAoIW9iajIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIG1lcmdlKG9iajEsIG9iajIsIGtleSk7XG4gIH1cbiAgcmV0dXJuIG9iajE7XG59XG5cbmZ1bmN0aW9uIG1lcmdlKG9iajEsIG9iajIsIGtleSkge1xuICBpZiAodHlwZW9mIG9iajJba2V5XSA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBpZiBpdCBpcyBhbiBvYmplY3QgKHRoYXQgaXMsIGEgbm9uLWxlYXZlIGluIHRoZSB0cmVlKSxcbiAgICAvLyBhbmQgaXQgaXMgbm90IHByZXNlbnQgaW4gb2JqMVxuICAgIGlmICghb2JqMVtrZXldIHx8IHR5cGVvZiBvYmoxW2tleV0gIT09ICdvYmplY3QnKSB7XG4gICAgICAvLyAuLi4gd2UgY3JlYXRlIGFuIGVtcHR5IG9iamVjdCBpbiBvYmoxXG4gICAgICBvYmoxW2tleV0gPSB7fTtcbiAgICB9XG4gICAgLy8gYW5kIHdlIHJlY3Vyc2UgZGVlcGVyIGludG8gdGhlIHN0cnVjdHVyZVxuICAgIG1lcmdlUmVjdXJzaXZlKG9iajFba2V5XSwgb2JqMltrZXldKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqMltrZXldICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gaWYgaXQgaXMgcHJpbWl0aXZlIChzdHJpbmcsIG51bWJlciwgYm9vbGVhbiksIHdlIG92ZXJ3cml0ZS9hZGQgaXQgdG9cbiAgICAvLyBvYmoxXG4gICAgb2JqMVtrZXldID0gb2JqMltrZXldO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWVyZ2VSZWN1cnNpdmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE5lZ290aWF0aW9uQWRhcHRlcihsb2cpIHt9XG5cbk5lZ290aWF0aW9uQWRhcHRlci5wcm90b3R5cGUuZmluZE5leHRTdGVwID0gZnVuY3Rpb24oZG9jLCBsaW5rKSB7XG4gIHRocm93IG5ldyBFcnJvcignQ29udGVudCBuZWdvdGlhdGlvbiBkaWQgbm90IGhhcHBlbicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOZWdvdGlhdGlvbkFkYXB0ZXI7XG4iLCIvKiBqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxuLypcbiAqIEFwcGxpZXMgYXN5bmMgYW5kIHN5bmMgdHJhbnNmb3Jtcywgb25lIGFmdGVyIGFub3RoZXIuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5VHJhbnNmb3Jtcyh0cmFuc2Zvcm1zLCB0LCBjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2FwcGx5aW5nJywgdHJhbnNmb3Jtcy5sZW5ndGgsICd0cmFuc2Zvcm1zJyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhbnNmb3Jtcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm1zW2ldO1xuICAgIGxvZy5kZWJ1ZygnbmV4dCB0cmFuc2Zvcm0nLCB0cmFuc2Zvcm0pO1xuICAgIGlmICh0cmFuc2Zvcm0uaXNBc3luYykge1xuICAgICAgbG9nLmRlYnVnKCd0cmFuc2Zvcm0gaXMgYXN5bmNocm9ub3VzJyk7XG4gICAgICAvLyBhc3luY2hyb25vdXMgY2FzZVxuICAgICAgcmV0dXJuIHRyYW5zZm9ybSh0LCBmdW5jdGlvbih0KSB7XG4gICAgICAgIC8vIHRoaXMgaXMgb25seSBjYWxsZWQgd2hlbiB0aGUgYXN5bmMgdHJhbnNmb3JtIHdhcyBzdWNjZXNzZnVsLFxuICAgICAgICAvLyBvdGhlcndpc2UgdC5jYWxsYmFjayBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZCB3aXRoIGFuIGVycm9yLlxuICAgICAgICBsb2cuZGVidWcoJ2FzeW5jaHJvbm91cyB0cmFuc2Zvcm0gZmluaXNoZWQgc3VjY2Vzc2Z1bGx5LCBhcHBseWluZyAnICtcbiAgICAgICAgICAncmVtYWluaW5nIHRyYW5zZm9ybXMuJyk7XG4gICAgICAgIGFwcGx5VHJhbnNmb3Jtcyh0cmFuc2Zvcm1zLnNsaWNlKGkgKyAxKSwgdCwgY2FsbGJhY2spO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZy5kZWJ1ZygndHJhbnNmb3JtIGlzIHN5bmNocm9ub3VzJyk7XG4gICAgICAvLyBzeW5jaHJvbm91cyBjYXNlXG4gICAgICB2YXIgcmVzdWx0ID0gdHJhbnNmb3JtKHQpO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgbG9nLmRlYnVnKCd0cmFuc2Zvcm0gaGFzIGZhaWxlZCcpO1xuICAgICAgICAvLyBzdG9wIHByb2Nlc3NpbmcgdC5jYWxsYmFjayBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZFxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2cuZGVidWcoJ3RyYW5zZm9ybSBzdWNjZXNzZnVsJyk7XG4gICAgfVxuICB9XG4gIGxvZy5kZWJ1ZygnYWxsIHRyYW5zZm9ybXMgZG9uZScpO1xuICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICBjYWxsYmFjayh0KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHlUcmFuc2Zvcm1zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuLi9pc19jb250aW51YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjaGVja0h0dHBTdGF0dXModCkge1xuICAvLyB0aGlzIHN0ZXAgaXMgb21taXR0ZWQgZm9yIGNvbnRpbnVhdGlvbnNcbiAgaWYgKGlzQ29udGludWF0aW9uKHQpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsb2cuZGVidWcoJ2NoZWNraW5nIGh0dHAgc3RhdHVzJyk7XG4gIGlmICghdC5zdGVwLnJlc3BvbnNlICYmIHQuc3RlcC5kb2MpIHtcbiAgICAvLyBMYXN0IHN0ZXAgcHJvYmFibHkgZGlkIG5vdCBleGVjdXRlIGEgSFRUUCByZXF1ZXN0IGJ1dCB1c2VkIGFuIGVtYmVkZGVkXG4gICAgLy8gZG9jdW1lbnQuXG4gICAgbG9nLmRlYnVnKCdmb3VuZCBlbWJlZGRlZCBkb2N1bWVudCwgYXNzdW1pbmcgbm8gSFRUUCByZXF1ZXN0IGhhcyBiZWVuICcgK1xuICAgICAgICAnbWFkZScpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gT25seSBwcm9jZXNzIHJlc3BvbnNlIGlmIGh0dHAgc3RhdHVzIHdhcyBpbiAyMDAgLSAyOTkgcmFuZ2UuXG4gIC8vIFRoZSByZXF1ZXN0IG1vZHVsZSBmb2xsb3dzIHJlZGlyZWN0cyBmb3IgR0VUIHJlcXVlc3RzIGFsbCBieSBpdHNlbGYsIHNvXG4gIC8vIHdlIHNob3VsZCBub3QgaGF2ZSB0byBoYW5kbGUgdGhlbSBoZXJlLiBJZiBhIDN4eCBodHRwIHN0YXR1cyBnZXQncyBoZXJlXG4gIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nLiA0eHggYW5kIDV4eCBvZiBjb3Vyc2UgYWxzbyBpbmRpY2F0ZSBhbiBlcnJvclxuICAvLyBjb25kaXRpb24uIDF4eCBzaG91bGQgbm90IG9jY3VyLlxuICB2YXIgaHR0cFN0YXR1cyA9IHQuc3RlcC5yZXNwb25zZS5zdGF0dXNDb2RlO1xuICBpZiAoaHR0cFN0YXR1cyAmJiAoaHR0cFN0YXR1cyA8IDIwMCB8fCBodHRwU3RhdHVzID49IDMwMCkpIHtcbiAgICB2YXIgZXJyb3IgPSBodHRwRXJyb3IodC5zdGVwLnVybCwgaHR0cFN0YXR1cywgdC5zdGVwLnJlc3BvbnNlLmJvZHkpO1xuICAgIGxvZy5lcnJvcigndW5leHBlY3RlZCBodHRwIHN0YXR1cyBjb2RlJyk7XG4gICAgbG9nLmVycm9yKGVycm9yKTtcbiAgICB0LmNhbGxiYWNrKGVycm9yKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgbG9nLmRlYnVnKCdodHRwIHN0YXR1cyBjb2RlIG9rICgnICsgaHR0cFN0YXR1cyArICcpJyk7XG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gaHR0cEVycm9yKHVybCwgaHR0cFN0YXR1cywgYm9keSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ0hUVFAgR0VUIGZvciAnICsgdXJsICtcbiAgICAgICcgcmVzdWx0ZWQgaW4gSFRUUCBzdGF0dXMgY29kZSAnICsgaHR0cFN0YXR1cyArICcuJyk7XG4gIGVycm9yLm5hbWUgPSAnSFRUUEVycm9yJztcbiAgZXJyb3IudXJsID0gdXJsO1xuICBlcnJvci5odHRwU3RhdHVzID0gaHR0cFN0YXR1cztcbiAgZXJyb3IuYm9keSA9IGJvZHk7XG4gIHRyeSB7XG4gICAgZXJyb3IuZG9jID0gSlNPTi5wYXJzZShib2R5KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIGlnbm9yZVxuICB9XG4gIHJldHVybiBlcnJvcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi4vaXNfY29udGludWF0aW9uJyk7XG5cbi8qXG4gKiBUaGlzIHRyYW5zZm9ybSBjb3ZlcnMgdGhlIGNhc2Ugb2YgYSBmb2xsb3coKSBjYWxsICp3aXRob3V0IGFueSBsaW5rcyogYWZ0ZXJcbiAqIGEgY29udGludWUoKS4gQWN0dWFsbHksIHRoZXJlIGlzIG5vdGhpbmcgdG8gZG8gaGVyZSBzaW5jZSB3ZSBzaG91bGQgaGF2ZVxuICogZmV0Y2hlZCBldmVyeXRoaW5nIGxhc3QgdGltZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb250aW51YXRpb25Ub0RvYyh0KSB7XG4gIGlmIChpc0NvbnRpbnVhdGlvbih0KSkge1xuICAgIGxvZy5kZWJ1ZygnY29udGludWluZyBmcm9tIGxhc3QgdHJhdmVyc2FsIHByb2Nlc3MgKGFjdGlvbnMpJyk7XG4gICAgdC5jb250aW51YXRpb24gPSBudWxsO1xuICAgIHQuY2FsbGJhY2sobnVsbCwgdC5zdGVwLmRvYyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGNvbnZlcnRFbWJlZGRlZERvY1RvUmVzcG9uc2UgPVxuICAgICAgcmVxdWlyZSgnLi9jb252ZXJ0X2VtYmVkZGVkX2RvY190b19yZXNwb25zZScpXG4gICwgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuLi9pc19jb250aW51YXRpb24nKTtcblxuLypcbiAqIGZvbGxvdygpIGNhbGwgd2l0aG91dCBsaW5rcyBhZnRlciBjb250aW51ZSgpLiBBY3R1YWxseSwgdGhlcmUgaXMgbm90aGluZ1xuICogdG8gZG8gaGVyZSBzaW5jZSB3ZSBzaG91bGQgaGF2ZSBmZXRjaGVkIGV2ZXJ5dGhpbmcgbGFzdCB0aW1lLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbnRpbnVhdGlvblRvUmVzcG9uc2UodCkge1xuICBpZiAoaXNDb250aW51YXRpb24odCkpIHtcbiAgICBsb2cuZGVidWcoJ2NvbnRpbnVpbmcgZnJvbSBsYXN0IHRyYXZlcnNhbCBwcm9jZXNzIChhY3Rpb25zKScpO1xuICAgIHQuY29udGludWF0aW9uID0gbnVsbDtcbiAgICAvLyBIbSwgYSB0cmFuc2Zvcm0gdXNpbmcgYW5vdGhlciB0cmFuc2Zvcm0uIFRoaXMgZmVlbHMgYSBiaXQgZmlzaHkuXG4gICAgY29udmVydEVtYmVkZGVkRG9jVG9SZXNwb25zZSh0KTtcbiAgICB0LmNhbGxiYWNrKG51bGwsIHQuc3RlcC5yZXNwb25zZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb252ZXJ0RW1iZWRkZWREb2NUb1Jlc3BvbnNlKHQpIHtcbiAgaWYgKCF0LnN0ZXAucmVzcG9uc2UgJiYgdC5zdGVwLmRvYykge1xuICAgIGxvZy5kZWJ1ZygnZmFraW5nIEhUVFAgcmVzcG9uc2UgZm9yIGVtYmVkZGVkIHJlc291cmNlJyk7XG4gICAgdC5zdGVwLnJlc3BvbnNlID0ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkodC5zdGVwLmRvYyksXG4gICAgICByZW1hcms6ICdUaGlzIGlzIG5vdCBhbiBhY3R1YWwgSFRUUCByZXNwb25zZS4gVGhlIHJlc291cmNlIHlvdSAnICtcbiAgICAgICAgJ3JlcXVlc3RlZCB3YXMgYW4gZW1iZWRkZWQgcmVzb3VyY2UsIHNvIG5vIEhUVFAgcmVxdWVzdCB3YXMgJyArXG4gICAgICAgICdtYWRlIHRvIGFjcXVpcmUgaXQuJ1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG52YXIgbWVkaWFUeXBlUmVnaXN0cnkgPSByZXF1aXJlKCcuLi9tZWRpYV90eXBlX3JlZ2lzdHJ5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGV0ZWN0Q29udGVudFR5cGUodCwgY2FsbGJhY2spIHtcbiAgaWYgKHQuY29udGVudE5lZ290aWF0aW9uICYmXG4gICAgICB0LnN0ZXAucmVzcG9uc2UgJiZcbiAgICAgIHQuc3RlcC5yZXNwb25zZS5oZWFkZXJzICYmXG4gICAgICB0LnN0ZXAucmVzcG9uc2UuaGVhZGVyc1snY29udGVudC10eXBlJ10pIHtcbiAgICB2YXIgY29udGVudFR5cGUgPSB0LnN0ZXAucmVzcG9uc2UuaGVhZGVyc1snY29udGVudC10eXBlJ10uc3BsaXQoL1s7IF0vKVswXTtcbiAgICB2YXIgQWRhcHRlclR5cGUgPSBtZWRpYVR5cGVSZWdpc3RyeS5nZXQoY29udGVudFR5cGUpO1xuICAgIGlmICghQWRhcHRlclR5cGUpIHtcbiAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignVW5rbm93biBjb250ZW50IHR5cGUgZm9yIGNvbnRlbnQgJyArXG4gICAgICAgICAgJ3R5cGUgZGV0ZWN0aW9uOiAnICsgY29udGVudFR5cGUpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gc3dpdGNoIHRvIG5ldyBBZGFwdGVyIGRlcGVuZGluZyBvbiBDb250ZW50LVR5cGUgaGVhZGVyIG9mIHNlcnZlclxuICAgIHQuYWRhcHRlciA9IG5ldyBBZGFwdGVyVHlwZShsb2cpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi4vYWJvcnRfdHJhdmVyc2FsJylcbiAgLCBodHRwUmVxdWVzdHMgPSByZXF1aXJlKCcuLi9odHRwX3JlcXVlc3RzJyk7XG5cbi8qXG4gKiBFeGVjdXRlIHRoZSBsYXN0IEhUVFAgcmVxdWVzdCBpbiBhIHRyYXZlcnNhbCB0aGF0IGVuZHMgaW5cbiAqIHBvc3QvcHV0L3BhdGNoL2RlbGV0ZSwgYnV0IGRvIG5vdCBjYWxsIHQuY2FsbGJhY2sgaW1tZWRpYXRlbHlcbiAqIChiZWNhdXNlIHdlIHN0aWxsIG5lZWQgdG8gZG8gcmVzcG9uc2UgYm9keSB0byBvYmplY3QgY29udmVyc2lvblxuICogYWZ0ZXJ3YXJkcywgZm9yIGV4YW1wbGUpXG4gKi9cbi8vIFRPRE8gV2h5IGlzIHRoaXMgZGlmZmVyZW50IGZyb20gd2hlbiBkbyBhIEdFVD9cbi8vIFByb2JhYmx5IG9ubHkgYmVjYXVzZSB0aGUgSFRUUCBtZXRob2QgaXMgY29uZmlndXJhYmxlIGhlcmUgKHdpdGhcbi8vIHQubGFzdE1ldGhvZCksIHdlIG1pZ2h0IGJlIGFibGUgdG8gdW5pZnkgdGhpcyB3aXRoIHRoZVxuLy8gZmV0Y2hfcmVzb3VyY2UvZmV0Y2hfbGFzdF9yZXNvdXJjZSB0cmFuc2Zvcm0uXG5mdW5jdGlvbiBleGVjdXRlTGFzdEh0dHBSZXF1ZXN0KHQsIGNhbGxiYWNrKSB7XG4gIC8vIGFsd2F5cyBjaGVjayBmb3IgYWJvcnRlZCBiZWZvcmUgZG9pbmcgYW4gSFRUUCByZXF1ZXN0XG4gIGlmICh0LmFib3J0ZWQpIHtcbiAgICByZXR1cm4gYWJvcnRUcmF2ZXJzYWwuY2FsbENhbGxiYWNrT25BYm9ydCh0KTtcbiAgfVxuICAvLyBvbmx5IGRpZmYgdG8gZXhlY3V0ZV9sYXN0X2h0dHBfcmVxdWVzdDogcGFzcyBhIG5ldyBjYWxsYmFjayBmdW5jdGlvblxuICAvLyBpbnN0ZWFkIG9mIHQuY2FsbGJhY2suXG4gIGh0dHBSZXF1ZXN0cy5leGVjdXRlSHR0cFJlcXVlc3QoXG4gICAgICB0LCB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZSwgdC5sYXN0TWV0aG9kLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgaWYgKCFlcnIuYWJvcnRlZCkge1xuICAgICAgICBsb2cuZGVidWcoJ2Vycm9yIHdoaWxlIHByb2Nlc3Npbmcgc3RlcCAnLCB0LnN0ZXApO1xuICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0LmNhbGxiYWNrKGVycik7XG4gICAgfVxuICAgIGNhbGxiYWNrKHQpO1xuICB9KTtcbn1cblxuZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdC5pc0FzeW5jID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBleGVjdXRlTGFzdEh0dHBSZXF1ZXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuLi9hYm9ydF90cmF2ZXJzYWwnKVxuICAsIGh0dHBSZXF1ZXN0cyA9IHJlcXVpcmUoJy4uL2h0dHBfcmVxdWVzdHMnKTtcblxuLypcbiAqIEV4ZWN1dGUgdGhlIGxhc3QgaHR0cCByZXF1ZXN0IGluIGEgdHJhdmVyc2FsIHRoYXQgZW5kcyBpblxuICogcG9zdC9wdXQvcGF0Y2gvZGVsZXRlLlxuICovXG4vLyBUT0RPIFdoeSBpcyB0aGlzIGRpZmZlcmVudCBmcm9tIHdoZW4gZG8gYSBHRVQgYXQgdGhlIGVuZCBvZiB0aGUgdHJhdmVyc2FsP1xuLy8gUHJvYmFibHkgb25seSBiZWNhdXNlIHRoZSBIVFRQIG1ldGhvZCBpcyBjb25maWd1cmFibGUgaGVyZSAod2l0aFxuLy8gdC5sYXN0TWV0aG9kKSwgd2UgbWlnaHQgYmUgYWJsZSB0byB1bmlmeSB0aGlzIHdpdGggdGhlXG4vLyBmZXRjaF9yZXNvdXJjZS9mZXRjaF9sYXN0X3Jlc291cmNlIHRyYW5zZm9ybS5cbmZ1bmN0aW9uIGV4ZWN1dGVMYXN0SHR0cFJlcXVlc3QodCwgY2FsbGJhY2spIHtcbiAgLy8gYWx3YXlzIGNoZWNrIGZvciBhYm9ydGVkIGJlZm9yZSBkb2luZyBhbiBIVFRQIHJlcXVlc3RcbiAgaWYgKHQuYWJvcnRlZCkge1xuICAgIHJldHVybiBhYm9ydFRyYXZlcnNhbC5jYWxsQ2FsbGJhY2tPbkFib3J0KHQpO1xuICB9XG4gIGh0dHBSZXF1ZXN0cy5leGVjdXRlSHR0cFJlcXVlc3QoXG4gICAgICB0LCB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZSwgdC5sYXN0TWV0aG9kLCB0LmNhbGxiYWNrKTtcbn1cblxuZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdC5pc0FzeW5jID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBleGVjdXRlTGFzdEh0dHBSZXF1ZXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG4vKlxuICogVGhpcyB0cmFuc2Zvcm0gaXMgbWVhbnQgdG8gYmUgcnVuIGF0IHRoZSB2ZXJ5IGVuZCBvZiBhIGdldFJlc291cmNlIGNhbGwuIEl0XG4gKiBqdXN0IGV4dHJhY3RzIHRoZSBsYXN0IGRvYyBmcm9tIHRoZSBzdGVwIGFuZCBjYWxscyB0LmNhbGxiYWNrIHdpdGggaXQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0cmFjdERvYyh0KSB7XG4gIGxvZy5kZWJ1Zygnd2Fsa2VyLndhbGsgaGFzIGZpbmlzaGVkJyk7XG4gIC8qXG4gIFRPRE8gQnJlYWtzIGEgbG90IG9mIHRlc3RzIGFsdGhvdWdoIGl0IHNlZW1zIHRvIG1ha2UgcGVyZmVjdCBzZW5zZT8hP1xuICBpZiAoIXQuZG9jKSB7XG4gICAgdC5jYWxsYmFjayhuZXcgRXJyb3IoJ05vIGRvY3VtZW50IGF2YWlsYWJsZScpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgKi9cbiAgdC5jYWxsYmFjayhudWxsLCB0LnN0ZXAuZG9jKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbi8qXG4gKiBUaGlzIHRyYW5zZm9ybSBpcyBtZWFudCB0byBiZSBydW4gYXQgdGhlIHZlcnkgZW5kIG9mIGEgZ2V0L3Bvc3QvcHV0L3BhdGNoL1xuICogZGVsZXRlIGNhbGwuIEl0IGp1c3QgZXh0cmFjdHMgdGhlIGxhc3QgcmVzcG9uc2UgZnJvbSB0aGUgc3RlcCBhbmQgY2FsbHNcbiAqIHQuY2FsbGJhY2sgd2l0aCBpdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRyYWN0RG9jKHQpIHtcbiAgbG9nLmRlYnVnKCd3YWxrZXIud2FsayBoYXMgZmluaXNoZWQnKTtcbiAgLypcbiAgVE9ETyBCcmVha3MgYSBsb3Qgb2YgdGVzdHMgYWx0aG91Z2ggaXQgc2VlbXMgdG8gbWFrZSBwZXJmZWN0IHNlbnNlPyE/XG4gIGlmICghdC5yZXNwb25zZSkge1xuICAgIHQuY2FsbGJhY2sobmV3IEVycm9yKCdObyByZXNwb25zZSBhdmFpbGFibGUnKSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gICovXG4gIHQuY2FsbGJhY2sobnVsbCwgdC5zdGVwLnJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCB1cmwgPSByZXF1aXJlKCd1cmwnKTtcblxuLypcbiAqIFRoaXMgdHJhbnNmb3JtIGlzIG1lYW50IHRvIGJlIHJ1biBhdCB0aGUgdmVyeSBlbmQgb2YgYSBnZXQvcG9zdC9wdXQvcGF0Y2gvXG4gKiBkZWxldGUgY2FsbC4gSXQganVzdCBleHRyYWN0cyB0aGUgbGFzdCBhY2Nlc3NlZCB1cmwgZnJvbSB0aGUgc3RlcCBhbmQgY2FsbHNcbiAqIHQuY2FsbGJhY2sgd2l0aCBpdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRyYWN0RG9jKHQpIHtcbiAgbG9nLmRlYnVnKCd3YWxrZXIud2FsayBoYXMgZmluaXNoZWQnKTtcbiAgaWYgKHQuc3RlcC51cmwpIHtcbiAgICByZXR1cm4gdC5jYWxsYmFjayhudWxsLCB0LnN0ZXAudXJsKTtcbiAgfSBlbHNlIGlmICh0LnN0ZXAuZG9jICYmXG4gICAgLy8gVE9ETyBhY3R1YWxseSB0aGlzIGlzIHZlcnkgSEFMIHNwZWNpZmljIDotL1xuICAgIHQuc3RlcC5kb2MuX2xpbmtzICYmXG4gICAgdC5zdGVwLmRvYy5fbGlua3Muc2VsZiAmJlxuICAgIHQuc3RlcC5kb2MuX2xpbmtzLnNlbGYuaHJlZikge1xuICAgIHJldHVybiB0LmNhbGxiYWNrKFxuICAgICAgICBudWxsLCB1cmwucmVzb2x2ZSh0LnN0YXJ0VXJsLCB0LnN0ZXAuZG9jLl9saW5rcy5zZWxmLmhyZWYpKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdC5jYWxsYmFjayhuZXcgRXJyb3IoJ1lvdSByZXF1ZXN0ZWQgYW4gVVJMIGJ1dCB0aGUgbGFzdCAnICtcbiAgICAgICAgJ3Jlc291cmNlIGlzIGFuIGVtYmVkZGVkIHJlc291cmNlIGFuZCBoYXMgbm8gVVJMIG9mIGl0cyBvd24gJyArXG4gICAgICAgICcodGhhdCBpcywgaXQgaGFzIG5vIGxpbmsgd2l0aCByZWw9XFxcInNlbGZcXFwiJykpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBUT0RPIE9ubHkgZGlmZmVyZW5jZSB0byBsaWIvdHJhbnNmb3JtL2ZldGNoX3Jlc291cmNlIGlzIHRoZSBjb250aW51YXRpb25cbi8vIGNoZWNraW5nLCB3aGljaCBpcyBtaXNzaW5nIGhlcmUuIE1heWJlIHdlIGNhbiBkZWxldGUgdGhpcyB0cmFuc2Zvcm0gYW5kIHVzZVxuLy8gZmV0Y2hfcmVzb3VyY2UgaW4gaXRzIHBsYWNlIGV2ZXJ5d2hlcmU/XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4uL2Fib3J0X3RyYXZlcnNhbCcpXG4gICwgaHR0cFJlcXVlc3RzID0gcmVxdWlyZSgnLi4vaHR0cF9yZXF1ZXN0cycpO1xuXG4vKlxuICogRXhlY3V0ZSB0aGUgbGFzdCBzdGVwIGluIGEgdHJhdmVyc2FsIHRoYXQgZW5kcyB3aXRoIGFuIEhUVFAgR0VULlxuICovXG4vLyBUaGlzIGlzIHNpbWlsYXIgdG8gbGliL3RyYW5zZm9ybXMvZmV0Y2hfcmVzb3VyY2UuanMgLSByZWZhY3RvcmluZyBwb3RlbnRpYWw/XG5mdW5jdGlvbiBmZXRjaExhc3RSZXNvdXJjZSh0LCBjYWxsYmFjaykge1xuICAvLyBhbHdheXMgY2hlY2sgZm9yIGFib3J0ZWQgYmVmb3JlIGRvaW5nIGFuIEhUVFAgcmVxdWVzdFxuICBpZiAodC5hYm9ydGVkKSB7XG4gICAgcmV0dXJuIGFib3J0VHJhdmVyc2FsLmNhbGxDYWxsYmFja09uQWJvcnQodCk7XG4gIH1cbiAgaHR0cFJlcXVlc3RzLmZldGNoUmVzb3VyY2UodCwgZnVuY3Rpb24oZXJyLCB0KSB7XG4gICAgbG9nLmRlYnVnKCdmZXRjaFJlc291cmNlIHJldHVybmVkIChmZXRjaExhc3RSZXNvdXJjZSkuJyk7XG4gICAgaWYgKGVycikge1xuICAgICAgaWYgKCFlcnIuYWJvcnRlZCkge1xuICAgICAgICBsb2cuZGVidWcoJ2Vycm9yIHdoaWxlIHByb2Nlc3Npbmcgc3RlcCAnLCB0LnN0ZXApO1xuICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0LmNhbGxiYWNrKGVycik7XG4gICAgfVxuICAgIGNhbGxiYWNrKHQpO1xuICB9KTtcbn1cblxuZmV0Y2hMYXN0UmVzb3VyY2UuaXNBc3luYyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hMYXN0UmVzb3VyY2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4uL2Fib3J0X3RyYXZlcnNhbCcpXG4gICwgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuLi9pc19jb250aW51YXRpb24nKVxuICAsIGh0dHBSZXF1ZXN0cyA9IHJlcXVpcmUoJy4uL2h0dHBfcmVxdWVzdHMnKTtcblxuLypcbiAqIEV4ZWN1dGUgdGhlIG5leHQgc3RlcCBpbiB0aGUgdHJhdmVyc2FsLiBJbiBtb3N0IGNhc2VzIHRoYXQgaXMgYW4gSFRUUCBnZXQgdG9cbiAqdGhlIG5leHQgVVJMLlxuICovXG5cbmZ1bmN0aW9uIGZldGNoUmVzb3VyY2UodCwgY2FsbGJhY2spIHtcbiAgaWYgKGlzQ29udGludWF0aW9uKHQpKSB7XG4gICAgY29udmVydENvbnRpbnVhdGlvbih0LCBjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgZmV0Y2hWaWFIdHRwKHQsIGNhbGxiYWNrKTtcbiAgfVxufVxuXG5mZXRjaFJlc291cmNlLmlzQXN5bmMgPSB0cnVlO1xuXG4vKlxuICogVGhpcyBpcyBhIGNvbnRpbnVhdGlvbiBvZiBhbiBlYXJsaWVyIHRyYXZlcnNhbCBwcm9jZXNzLlxuICogV2UgbmVlZCB0byBzaG9ydGN1dCB0byB0aGUgbmV4dCBzdGVwICh3aXRob3V0IGV4ZWN1dGluZyB0aGUgZmluYWwgSFRUUFxuICogcmVxdWVzdCBvZiB0aGUgbGFzdCB0cmF2ZXJzYWwgYWdhaW4uXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRDb250aW51YXRpb24odCwgY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdjb250aW51aW5nIGZyb20gbGFzdCB0cmF2ZXJzYWwgcHJvY2VzcyAod2Fsa2VyKScpO1xuICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkgeyAvLyBkZS16YWxnbyBjb250aW51YXRpb25zXG4gICAgY2FsbGJhY2sodCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmZXRjaFZpYUh0dHAodCwgY2FsbGJhY2spIHtcbiAgLy8gYWx3YXlzIGNoZWNrIGZvciBhYm9ydGVkIGJlZm9yZSBkb2luZyBhbiBIVFRQIHJlcXVlc3RcbiAgaWYgKHQuYWJvcnRlZCkge1xuICAgIHJldHVybiBhYm9ydFRyYXZlcnNhbC5jYWxsQ2FsbGJhY2tPbkFib3J0KHQpO1xuICB9XG4gIGh0dHBSZXF1ZXN0cy5mZXRjaFJlc291cmNlKHQsIGZ1bmN0aW9uKGVyciwgdCkge1xuICAgIGxvZy5kZWJ1ZygnZmV0Y2hSZXNvdXJjZSByZXR1cm5lZCcpO1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGlmICghZXJyLmFib3J0ZWQpIHtcbiAgICAgICAgbG9nLmRlYnVnKCdlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHN0ZXAgJywgdC5zdGVwKTtcbiAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdC5jYWxsYmFjayhlcnIpO1xuICAgIH1cbiAgICBjYWxsYmFjayh0KTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmV0Y2hSZXNvdXJjZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3B0aW9uc0ZvclN0ZXAodCkge1xuICB2YXIgb3B0aW9ucyA9IHQucmVxdWVzdE9wdGlvbnM7XG4gIGlmICh1dGlsLmlzQXJyYXkodC5yZXF1ZXN0T3B0aW9ucykpIHtcbiAgICBvcHRpb25zID0gdC5yZXF1ZXN0T3B0aW9uc1t0LnN0ZXAuaW5kZXhdIHx8IHt9O1xuICB9XG4gIGxvZy5kZWJ1Zygnb3B0aW9uczogJywgb3B0aW9ucyk7XG4gIHJldHVybiBvcHRpb25zO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi4vaXNfY29udGludWF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2UodCkge1xuICAvLyBUT0RPIER1cGxpY2F0ZWQgaW4gYWN0aW9ucyNhZnRlckdldFJlc291cmNlIGV0Yy5cbiAgLy8gdGhpcyBzdGVwIGlzIG9tbWl0dGVkIGZvciBjb250aW51YXRpb25zIHRoYXQgcGFyc2UgYXQgdGhlIGVuZFxuICBpZiAoaXNDb250aW51YXRpb24odCkpIHtcbiAgICBsb2cuZGVidWcoJ2NvbnRpbnVpbmcgZnJvbSBsYXN0IHRyYXZlcnNhbCBwcm9jZXNzICh0cmFuc2Zvcm1zL3BhcnNlKScpO1xuICAgIC8vIGlmIGxhc3QgdHJhdmVyc2FsIGRpZCBhIHBhcnNlIGF0IHRoZSBlbmQgd2UgZG8gbm90IG5lZWQgdG8gcGFyc2UgYWdhaW5cbiAgICAvLyAodGhpcyBjb25kaXRpb24gd2lsbCBuZWVkIHRvIGNoYW5nZSB3aXRoXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jhc3RpMTMwMi90cmF2ZXJzb24vaXNzdWVzLzQ0KVxuICAgIGlmICh0LmNvbnRpbnVhdGlvbi5hY3Rpb24gPT09ICdnZXRSZXNvdXJjZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICBpZiAodC5zdGVwLmRvYykge1xuICAgIC8vIExhc3Qgc3RlcCBwcm9iYWJseSBkaWQgbm90IGV4ZWN1dGUgYSBIVFRQIHJlcXVlc3QgYnV0IHVzZWQgYW4gZW1iZWRkZWRcbiAgICAvLyBkb2N1bWVudC5cbiAgICBsb2cuZGVidWcoJ25vIHBhcnNpbmcgbmVjZXNzYXJ5LCBwcm9iYWJseSBhbiBlbWJlZGRlZCBkb2N1bWVudCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBsb2cuZGVidWcoJ3BhcnNpbmcgcmVzcG9uc2UgYm9keScpO1xuICAgIHQuc3RlcC5kb2MgPSB0Lmpzb25QYXJzZXIodC5zdGVwLnJlc3BvbnNlLmJvZHkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIGVycm9yID0gZTtcbiAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICBlcnJvciA9IGpzb25FcnJvcih0LnN0ZXAudXJsLCB0LnN0ZXAucmVzcG9uc2UuYm9keSk7XG4gICAgfVxuICAgIGxvZy5lcnJvcigncGFyc2luZyBmYWlsZWQnKTtcbiAgICBsb2cuZXJyb3IoZXJyb3IpO1xuICAgIHQuY2FsbGJhY2soZXJyb3IpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuZnVuY3Rpb24ganNvbkVycm9yKHVybCwgYm9keSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ1RoZSBkb2N1bWVudCBhdCAnICsgdXJsICtcbiAgICAgICcgY291bGQgbm90IGJlIHBhcnNlZCBhcyBKU09OOiAnICsgYm9keSk7XG4gIGVycm9yLm5hbWUgPSAnSlNPTkVycm9yJztcbiAgZXJyb3IudXJsID0gdXJsO1xuICBlcnJvci5ib2R5ID0gYm9keTtcbiAgcmV0dXJuIGVycm9yO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuLi9pc19jb250aW51YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXNldExhc3RTdGVwKHQpIHtcbiAgLy8gdGhpcyBzdGVwIGlzIG9tbWl0dGVkIGZvciBjb250aW51YXRpb25zXG4gIGlmIChpc0NvbnRpbnVhdGlvbih0KSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdC5jb250aW51YXRpb24gPSBudWxsO1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4uL2lzX2NvbnRpbnVhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlc2V0TGFzdFN0ZXAodCkge1xuICAvLyB0aGlzIHN0ZXAgaXMgb21taXR0ZWQgZm9yIGNvbnRpbnVhdGlvbnNcbiAgaWYgKGlzQ29udGludWF0aW9uKHQpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB0Lmxhc3RTdGVwID0gbnVsbDtcbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgX3MgPSByZXF1aXJlKCd1bmRlcnNjb3JlLnN0cmluZycpXG4gICwgdXJsID0gcmVxdWlyZSgndXJsJyk7XG5cbnZhciBwcm90b2NvbFJlZ0V4ID0gL2h0dHBzPzpcXC9cXC8vaTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXNvbHZlTmV4dFVybCh0KSB7XG4gIGlmICh0LnN0ZXAudXJsKSB7XG4gICAgaWYgKHQuc3RlcC51cmwuc2VhcmNoKHByb3RvY29sUmVnRXgpICE9PSAwKSB7XG4gICAgICBsb2cuZGVidWcoJ2ZvdW5kIG5vbiBmdWxsIHF1YWxpZmllZCBVUkwnKTtcbiAgICAgIGlmICh0LnJlc29sdmVSZWxhdGl2ZSAmJiB0Lmxhc3RTdGVwICYmIHQubGFzdFN0ZXAudXJsKSB7XG4gICAgICAgIC8vIGVkZ2UgY2FzZTogcmVzb2x2ZSBVUkwgcmVsYXRpdmVseSAob25seSB3aGVuIHJlcXVlc3RlZCBieSBjbGllbnQpXG4gICAgICAgIGxvZy5kZWJ1ZygncmVzb2x2aW5nIFVSTCByZWxhdGl2ZScpO1xuICAgICAgICBpZiAoX3Muc3RhcnRzV2l0aCh0LnN0ZXAudXJsLCAnLycpICYmXG4gICAgICAgICAgX3MuZW5kc1dpdGgodC5sYXN0U3RlcC51cmwsICcvJykpIHtcbiAgICAgICAgICB0LnN0ZXAudXJsID0gX3Muc3BsaWNlKHQuc3RlcC51cmwsIDAsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHQuc3RlcC51cmwgPSB0Lmxhc3RTdGVwLnVybCArIHQuc3RlcC51cmw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZWZhdWx0IGNhc2UgYW5kIHdoYXQgaGFwcGVucyBtb3N0IGxpa2VseSAobm90IGEgZnVsbFxuICAgICAgICAvLyBxdWFsaWZpZWQgVVJMLCBub3QgcmVzb2x2aW5nIHJlbGF0aXZlbHkpIGFuZCB3ZSBzaW1wbHkgdXNlIE5vZGUncyB1cmxcbiAgICAgICAgLy8gbW9kdWxlIChvciB0aGUgYXBwcm9wcmlhdGUgc2hpbSkgaGVyZS5cbiAgICAgICAgdC5zdGVwLnVybCA9IHVybC5yZXNvbHZlKHQuc3RhcnRVcmwsIHQuc3RlcC51cmwpO1xuICAgICAgfVxuICAgIH0gLy8gZWRnZSBjYXNlOiBmdWxsIHF1YWxpZmllZCBVUkwgLT4gbm8gVVJMIHJlc29sdmluZyBuZWNlc3NhcnlcbiAgfSAvLyBubyB0LnN0ZXAudXJsIC0+IG5vIFVSTCByZXNvbHZpbmcgKHN0ZXAgbWlnaHQgY29udGFpbiBhbiBlbWJlZGRlZCBkb2MpXG4gIHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIF9zID0gcmVxdWlyZSgndW5kZXJzY29yZS5zdHJpbmcnKVxuICAsIHVyaVRlbXBsYXRlID0gcmVxdWlyZSgndXJsLXRlbXBsYXRlJylcbiAgLCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlc29sdmVVcmlUZW1wbGF0ZSh0KSB7XG4gIGlmICh0LnN0ZXAudXJsKSB7XG4gICAgLy8gbmV4dCBsaW5rIGZvdW5kIGluIGxhc3QgcmVzcG9uc2UsIG1pZ2h0IGJlIGEgVVJJIHRlbXBsYXRlXG4gICAgdmFyIHRlbXBsYXRlUGFyYW1zID0gdC50ZW1wbGF0ZVBhcmFtZXRlcnM7XG4gICAgaWYgKHV0aWwuaXNBcnJheSh0ZW1wbGF0ZVBhcmFtcykpIHtcbiAgICAgIC8vIGlmIHRlbXBsYXRlIHBhcmFtcyB3ZXJlIGdpdmVuIGFzIGFuIGFycmF5LCBvbmx5IHVzZSB0aGUgYXJyYXkgZWxlbWVudFxuICAgICAgLy8gZm9yIHRoZSBjdXJyZW50IGluZGV4IGZvciBVUkkgdGVtcGxhdGUgcmVzb2x2aW5nLlxuICAgICAgdGVtcGxhdGVQYXJhbXMgPSB0ZW1wbGF0ZVBhcmFtc1t0LnN0ZXAuaW5kZXhdO1xuICAgIH1cbiAgICB0ZW1wbGF0ZVBhcmFtcyA9IHRlbXBsYXRlUGFyYW1zIHx8IHt9O1xuXG4gICAgaWYgKF9zLmNvbnRhaW5zKHQuc3RlcC51cmwsICd7JykpIHtcbiAgICAgIGxvZy5kZWJ1ZygncmVzb2x2aW5nIFVSSSB0ZW1wbGF0ZScpO1xuICAgICAgdmFyIHRlbXBsYXRlID0gdXJpVGVtcGxhdGUucGFyc2UodC5zdGVwLnVybCk7XG4gICAgICB2YXIgcmVzb2x2ZWQgPSB0ZW1wbGF0ZS5leHBhbmQodGVtcGxhdGVQYXJhbXMpO1xuICAgICAgbG9nLmRlYnVnKCdyZXNvbHZlZCB0byAnLCByZXNvbHZlZCk7XG4gICAgICB0LnN0ZXAudXJsID0gcmVzb2x2ZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3dpdGNoVG9OZXh0U3RlcCh0KSB7XG4gIC8vIGV4dHJhY3QgbmV4dCBsaW5rIHRvIGZvbGxvdyBmcm9tIGxhc3QgcmVzcG9uc2VcbiAgdmFyIGxpbmsgPSB0LmxpbmtzW3Quc3RlcC5pbmRleF07XG4gIGxvZy5kZWJ1ZygnbmV4dCBsaW5rOiAnICsgbGluayk7XG5cbiAgLy8gc2F2ZSBsYXN0IHN0ZXAgYmVmb3JlIG92ZXJ3cml0aW5nIGl0IHdpdGggdGhlIG5leHQgc3RlcCAocmVxdWlyZWQgZm9yXG4gIC8vIHJlbGF0aXZlIFVSTCByZXNvbHV0aW9uLCB3aGVyZSB3ZSBuZWVkIHRoZSBsYXN0IFVSTClcbiAgdC5sYXN0U3RlcCA9IHQuc3RlcDtcblxuICB0LnN0ZXAgPSBmaW5kTmV4dFN0ZXAodCwgdC5sYXN0U3RlcC5kb2MsIGxpbmssIHQucHJlZmVyRW1iZWRkZWQpO1xuICBpZiAoIXQuc3RlcCkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgZml4IGZvciBtZWRpYSB0eXBlIHBsdWctaW5zIHVzaW5nIHN0ZXAudXJpIGluc3RlYWRcbiAgLy8gb2Ygc3RlcC51cmwgKHVudGlsIDEuMC4wKVxuICB0LnN0ZXAudXJsID0gdC5zdGVwLnVybCB8fCB0LnN0ZXAudXJpO1xuXG4gIHQuc3RlcC5pbmRleCA9IHQubGFzdFN0ZXAuaW5kZXggKyAxO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIGZpbmROZXh0U3RlcCh0LCBkb2MsIGxpbmssIHByZWZlckVtYmVkZGVkKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHQuYWRhcHRlci5maW5kTmV4dFN0ZXAoZG9jLCBsaW5rLCBwcmVmZXJFbWJlZGRlZCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2cuZXJyb3IoJ2NvdWxkIG5vdCBmaW5kIG5leHQgc3RlcCcpO1xuICAgIGxvZy5lcnJvcihlKTtcbiAgICB0LmNhbGxiYWNrKGUpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4vYWJvcnRfdHJhdmVyc2FsJylcbiAgLCBhcHBseVRyYW5zZm9ybXMgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvYXBwbHlfdHJhbnNmb3JtcycpXG4gICwgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuL2lzX2NvbnRpbnVhdGlvbicpXG4gICwgcmVzb2x2ZVVyaVRlbXBsYXRlID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL3Jlc29sdmVfdXJpX3RlbXBsYXRlJyk7XG5cbnZhciB0cmFuc2Zvcm1zID0gW1xuICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZmV0Y2hfcmVzb3VyY2UnKSxcbiAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL3Jlc2V0X2xhc3Rfc3RlcCcpLFxuICAvLyBjaGVjayBIVFRQIHN0YXR1cyBjb2RlXG4gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9jaGVja19odHRwX3N0YXR1cycpLFxuICAvLyBwYXJzZSBKU09OIGZyb20gbGFzdCByZXNwb25zZVxuICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvcGFyc2UnKSxcbiAgLy8gcmV0cmlldmUgbmV4dCBsaW5rIGFuZCBzd2l0Y2ggdG8gbmV4dCBzdGVwXG4gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9zd2l0Y2hfdG9fbmV4dF9zdGVwJyksXG4gIC8vIFVSSSB0ZW1wbGF0ZSBoYXMgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIHBvc3QgcHJvY2Vzc2luZyB0aGUgVVJMLFxuICAvLyBiZWNhdXNlIHdlIGRvIHVybC5yZXNvbHZlIHdpdGggaXQgKGluIGpzb25faGFsKSBhbmQgdGhpcyB3b3VsZCBVUkwtXG4gIC8vIGVuY29kZSBjdXJseSBicmFjZXMuXG4gIHJlc29sdmVVcmlUZW1wbGF0ZSxcbiAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL3Jlc29sdmVfbmV4dF91cmwnKSxcbiAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL3Jlc2V0X2NvbnRpbnVhdGlvbicpLFxuXTtcblxuLyoqXG4gKiBXYWxrcyBmcm9tIHJlc291cmNlIHRvIHJlc291cmNlIGFsb25nIHRoZSBwYXRoIGdpdmVuIGJ5IHRoZSBsaW5rIHJlbGF0aW9uc1xuICogZnJvbSB0aGlzLmxpbmtzIHVudGlsIGl0IGhhcyByZWFjaGVkIHRoZSBsYXN0IFVSTC4gT24gcmVhY2hpbmcgdGhpcywgaXQgY2FsbHNcbiAqIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoIHRoZSBsYXN0IHJlc3VsdGluZyBzdGVwLlxuICovXG5leHBvcnRzLndhbGsgPSBmdW5jdGlvbih0LCB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCwgY2FsbGJhY2spIHtcbiAgLy8gZXZlbiB0aGUgcm9vdCBVUkwgbWlnaHQgYmUgYSB0ZW1wbGF0ZSwgc28gd2UgYXBwbHkgdGhlIHJlc29sdmVVcmlUZW1wbGF0ZVxuICAvLyBvbmNlIGJlZm9yZSBzdGFydGluZyB0aGUgd2Fsay5cbiAgaWYgKCFyZXNvbHZlVXJpVGVtcGxhdGUodCkpIHJldHVybjtcblxuICAvLyBzdGFydHMgdGhlIGxpbmsgcmVsIHdhbGtpbmcgcHJvY2Vzc1xuICBsb2cuZGVidWcoJ3N0YXJ0aW5nIHRvIGZvbGxvdyBsaW5rcycpO1xuICB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCA9IHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwIHx8IFtdO1xuICB0LmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gIHByb2Nlc3NTdGVwKHQsIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwKTtcbn07XG5cbmZ1bmN0aW9uIHByb2Nlc3NTdGVwKHQsIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwKSB7XG4gIGxvZy5kZWJ1ZygncHJvY2Vzc2luZyBuZXh0IHN0ZXAnKTtcbiAgaWYgKG1vcmVMaW5rc1RvRm9sbG93KHQpICYmICFpc0Fib3J0ZWQodCkpIHtcbiAgICBhcHBseVRyYW5zZm9ybXModHJhbnNmb3JtcywgdCwgZnVuY3Rpb24odCkge1xuICAgICAgbG9nLmRlYnVnKCdzdWNjZXNzZnVsbHkgcHJvY2Vzc2VkIHN0ZXAnKTtcbiAgICAgIC8vIGNhbGwgcHJvY2Vzc1N0ZXAgcmVjdXJzaXZlbHkgYWdhaW4gdG8gZm9sbG93IG5leHQgbGlua1xuICAgICAgcHJvY2Vzc1N0ZXAodCwgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGlzQWJvcnRlZCh0KSkge1xuICAgIHJldHVybiBhYm9ydFRyYXZlcnNhbC5jYWxsQ2FsbGJhY2tPbkFib3J0KHQpO1xuICB9IGVsc2Uge1xuICAgIC8vIGxpbmsgYXJyYXkgaXMgZXhoYXVzdGVkLCB3ZSBhcmUgZG9uZSBhbmQgcmV0dXJuIHRoZSBsYXN0IHJlc3BvbnNlXG4gICAgLy8gYW5kIFVSTCB0byB0aGUgY2FsbGJhY2sgdGhlIGNsaWVudCBwYXNzZWQgaW50byB0aGUgd2FsayBtZXRob2QuXG4gICAgbG9nLmRlYnVnKCdsaW5rIGFycmF5IGV4aGF1c3RlZCcpO1xuXG4gICAgYXBwbHlUcmFuc2Zvcm1zKHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwLCB0LCBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gdC5jYWxsYmFjaygpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1vcmVMaW5rc1RvRm9sbG93KHQpIHtcbiAgcmV0dXJuIHQuc3RlcC5pbmRleCA8IHQubGlua3MubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBpc0Fib3J0ZWQodCkge1xuICByZXR1cm4gdC5hYm9ydGVkO1xufVxuIiwiLyogSlNPTlBhdGggMC44LjAgLSBYUGF0aCBmb3IgSlNPTlxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDcgU3RlZmFuIEdvZXNzbmVyIChnb2Vzc25lci5uZXQpXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgKE1JVC1MSUNFTlNFLnR4dCkgbGljZW5jZS5cclxuICovXHJcblxyXG52YXIgaXNOb2RlID0gZmFsc2U7XHJcbihmdW5jdGlvbihleHBvcnRzLCByZXF1aXJlKSB7XHJcblxyXG4vLyBLZWVwIGNvbXBhdGliaWxpdHkgd2l0aCBvbGQgYnJvd3NlcnNcclxuaWYgKCFBcnJheS5pc0FycmF5KSB7XHJcbiAgQXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uKHZBcmcpIHtcclxuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodkFyZykgPT09IFwiW29iamVjdCBBcnJheV1cIjtcclxuICB9O1xyXG59XHJcblxyXG4vLyBNYWtlIHN1cmUgdG8ga25vdyBpZiB3ZSBhcmUgaW4gcmVhbCBub2RlIG9yIG5vdCAodGhlIGByZXF1aXJlYCB2YXJpYWJsZVxyXG4vLyBjb3VsZCBhY3R1YWxseSBiZSByZXF1aXJlLmpzLCBmb3IgZXhhbXBsZS5cclxudmFyIGlzTm9kZSA9IHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmICEhbW9kdWxlLmV4cG9ydHM7XHJcblxyXG52YXIgdm0gPSBpc05vZGUgP1xyXG4gICAgcmVxdWlyZSgndm0nKSA6IHtcclxuICAgICAgcnVuSW5OZXdDb250ZXh0OiBmdW5jdGlvbihleHByLCBjb250ZXh0KSB7IHdpdGggKGNvbnRleHQpIHJldHVybiBldmFsKGV4cHIpOyB9XHJcbiAgICB9O1xyXG5leHBvcnRzLmV2YWwgPSBqc29uUGF0aDtcclxuXHJcbnZhciBjYWNoZSA9IHt9O1xyXG5cclxuZnVuY3Rpb24gcHVzaChhcnIsIGVsZW0pIHsgYXJyID0gYXJyLnNsaWNlKCk7IGFyci5wdXNoKGVsZW0pOyByZXR1cm4gYXJyOyB9XHJcbmZ1bmN0aW9uIHVuc2hpZnQoZWxlbSwgYXJyKSB7IGFyciA9IGFyci5zbGljZSgpOyBhcnIudW5zaGlmdChlbGVtKTsgcmV0dXJuIGFycjsgfVxyXG5cclxuZnVuY3Rpb24ganNvblBhdGgob2JqLCBleHByLCBhcmcpIHtcclxuICAgdmFyIFAgPSB7XHJcbiAgICAgIHJlc3VsdFR5cGU6IGFyZyAmJiBhcmcucmVzdWx0VHlwZSB8fCBcIlZBTFVFXCIsXHJcbiAgICAgIGZsYXR0ZW46IGFyZyAmJiBhcmcuZmxhdHRlbiB8fCBmYWxzZSxcclxuICAgICAgd3JhcDogKGFyZyAmJiBhcmcuaGFzT3duUHJvcGVydHkoJ3dyYXAnKSkgPyBhcmcud3JhcCA6IHRydWUsXHJcbiAgICAgIHNhbmRib3g6IChhcmcgJiYgYXJnLnNhbmRib3gpID8gYXJnLnNhbmRib3ggOiB7fSxcclxuICAgICAgbm9ybWFsaXplOiBmdW5jdGlvbihleHByKSB7XHJcbiAgICAgICAgIGlmIChjYWNoZVtleHByXSkgcmV0dXJuIGNhY2hlW2V4cHJdO1xyXG4gICAgICAgICB2YXIgc3VieCA9IFtdO1xyXG4gICAgICAgICB2YXIgbm9ybWFsaXplZCA9IGV4cHIucmVwbGFjZSgvW1xcWyddKFxcPz9cXCguKj9cXCkpW1xcXSddL2csIGZ1bmN0aW9uKCQwLCQxKXtyZXR1cm4gXCJbI1wiKyhzdWJ4LnB1c2goJDEpLTEpK1wiXVwiO30pXHJcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nP1xcLic/fFxcWyc/L2csIFwiO1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKDspPyhcXF4rKSg7KT8vZywgZnVuY3Rpb24oXywgZnJvbnQsIHVwcywgYmFjaykgeyByZXR1cm4gJzsnICsgdXBzLnNwbGl0KCcnKS5qb2luKCc7JykgKyAnOyc7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC87Ozt8OzsvZywgXCI7Li47XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC87JHwnP1xcXXwnJC9nLCBcIlwiKTtcclxuICAgICAgICAgdmFyIGV4cHJMaXN0ID0gbm9ybWFsaXplZC5zcGxpdCgnOycpLm1hcChmdW5jdGlvbihleHByKSB7XHJcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IGV4cHIubWF0Y2goLyMoWzAtOV0rKS8pO1xyXG4gICAgICAgICAgICByZXR1cm4gIW1hdGNoIHx8ICFtYXRjaFsxXSA/IGV4cHIgOiBzdWJ4W21hdGNoWzFdXTtcclxuICAgICAgICAgfSlcclxuICAgICAgICAgcmV0dXJuIGNhY2hlW2V4cHJdID0gZXhwckxpc3Q7XHJcbiAgICAgIH0sXHJcbiAgICAgIGFzUGF0aDogZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgICB2YXIgeCA9IHBhdGgsIHAgPSBcIiRcIjtcclxuICAgICAgICAgZm9yICh2YXIgaT0xLG49eC5sZW5ndGg7IGk8bjsgaSsrKVxyXG4gICAgICAgICAgICBwICs9IC9eWzAtOSpdKyQvLnRlc3QoeFtpXSkgPyAoXCJbXCIreFtpXStcIl1cIikgOiAoXCJbJ1wiK3hbaV0rXCInXVwiKTtcclxuICAgICAgICAgcmV0dXJuIHA7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRyYWNlOiBmdW5jdGlvbihleHByLCB2YWwsIHBhdGgpIHtcclxuICAgICAgICAgLy8gbm8gZXhwciB0byBmb2xsb3c/IHJldHVybiBwYXRoIGFuZCB2YWx1ZSBhcyB0aGUgcmVzdWx0IG9mIHRoaXMgdHJhY2UgYnJhbmNoXHJcbiAgICAgICAgIGlmICghZXhwci5sZW5ndGgpIHJldHVybiBbe3BhdGg6IHBhdGgsIHZhbHVlOiB2YWx9XTtcclxuXHJcbiAgICAgICAgIHZhciBsb2MgPSBleHByWzBdLCB4ID0gZXhwci5zbGljZSgxKTtcclxuICAgICAgICAgLy8gdGhlIHBhcmVudCBzZWwgY29tcHV0YXRpb24gaXMgaGFuZGxlZCBpbiB0aGUgZnJhbWUgYWJvdmUgdXNpbmcgdGhlXHJcbiAgICAgICAgIC8vIGFuY2VzdG9yIG9iamVjdCBvZiB2YWxcclxuICAgICAgICAgaWYgKGxvYyA9PT0gJ14nKSByZXR1cm4gcGF0aC5sZW5ndGggPyBbe3BhdGg6IHBhdGguc2xpY2UoMCwtMSksIGV4cHI6IHgsIGlzUGFyZW50U2VsZWN0b3I6IHRydWV9XSA6IFtdO1xyXG5cclxuICAgICAgICAgLy8gd2UgbmVlZCB0byBnYXRoZXIgdGhlIHJldHVybiB2YWx1ZSBvZiByZWN1cnNpdmUgdHJhY2UgY2FsbHMgaW4gb3JkZXIgdG9cclxuICAgICAgICAgLy8gZG8gdGhlIHBhcmVudCBzZWwgY29tcHV0YXRpb24uXHJcbiAgICAgICAgIHZhciByZXQgPSBbXTtcclxuICAgICAgICAgZnVuY3Rpb24gYWRkUmV0KGVsZW1zKSB7IHJldCA9IHJldC5jb25jYXQoZWxlbXMpOyB9XHJcblxyXG4gICAgICAgICBpZiAodmFsICYmIHZhbC5oYXNPd25Qcm9wZXJ0eShsb2MpKSAvLyBzaW1wbGUgY2FzZSwgZGlyZWN0bHkgZm9sbG93IHByb3BlcnR5XHJcbiAgICAgICAgICAgIGFkZFJldChQLnRyYWNlKHgsIHZhbFtsb2NdLCBwdXNoKHBhdGgsIGxvYykpKTtcclxuICAgICAgICAgZWxzZSBpZiAobG9jID09PSBcIipcIikgeyAvLyBhbnkgcHJvcGVydHlcclxuICAgICAgICAgICAgUC53YWxrKGxvYywgeCwgdmFsLCBwYXRoLCBmdW5jdGlvbihtLGwseCx2LHApIHtcclxuICAgICAgICAgICAgICAgYWRkUmV0KFAudHJhY2UodW5zaGlmdChtLCB4KSwgdiwgcCkpOyB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBlbHNlIGlmIChsb2MgPT09IFwiLi5cIikgeyAvLyBhbGwgY2hpZCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIGFkZFJldChQLnRyYWNlKHgsIHZhbCwgcGF0aCkpO1xyXG4gICAgICAgICAgICBQLndhbGsobG9jLCB4LCB2YWwsIHBhdGgsIGZ1bmN0aW9uKG0sbCx4LHYscCkge1xyXG4gICAgICAgICAgICAgICBpZiAodHlwZW9mIHZbbV0gPT09IFwib2JqZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAgIGFkZFJldChQLnRyYWNlKHVuc2hpZnQoXCIuLlwiLCB4KSwgdlttXSwgcHVzaChwLCBtKSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBlbHNlIGlmIChsb2NbMF0gPT09ICcoJykgeyAvLyBbKGV4cHIpXVxyXG4gICAgICAgICAgICBhZGRSZXQoUC50cmFjZSh1bnNoaWZ0KFAuZXZhbChsb2MsIHZhbCwgcGF0aFtwYXRoLmxlbmd0aF0sIHBhdGgpLHgpLCB2YWwsIHBhdGgpKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBlbHNlIGlmIChsb2MuaW5kZXhPZignPygnKSA9PT0gMCkgeyAvLyBbPyhleHByKV1cclxuICAgICAgICAgICAgUC53YWxrKGxvYywgeCwgdmFsLCBwYXRoLCBmdW5jdGlvbihtLGwseCx2LHApIHtcclxuICAgICAgICAgICAgICAgaWYgKFAuZXZhbChsLnJlcGxhY2UoL15cXD9cXCgoLio/KVxcKSQvLFwiJDFcIiksdlttXSxtLCBwYXRoKSlcclxuICAgICAgICAgICAgICAgICAgYWRkUmV0KFAudHJhY2UodW5zaGlmdChtLHgpLHYscCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBlbHNlIGlmIChsb2MuaW5kZXhPZignLCcpID4gLTEpIHsgLy8gW25hbWUxLG5hbWUyLC4uLl1cclxuICAgICAgICAgICAgZm9yICh2YXIgcGFydHMgPSBsb2Muc3BsaXQoJywnKSwgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgYWRkUmV0KFAudHJhY2UodW5zaGlmdChwYXJ0c1tpXSwgeCksIHZhbCwgcGF0aCkpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGVsc2UgaWYgKC9eKC0/WzAtOV0qKTooLT9bMC05XSopOj8oWzAtOV0qKSQvLnRlc3QobG9jKSkgeyAvLyBbc3RhcnQ6ZW5kOnN0ZXBdICBweXRob24gc2xpY2Ugc3ludGF4XHJcbiAgICAgICAgICAgIGFkZFJldChQLnNsaWNlKGxvYywgeCwgdmFsLCBwYXRoKSk7XHJcbiAgICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8vIHdlIGNoZWNrIHRoZSByZXN1bHRpbmcgdmFsdWVzIGZvciBwYXJlbnQgc2VsZWN0aW9ucy4gZm9yIHBhcmVudFxyXG4gICAgICAgICAvLyBzZWxlY3Rpb25zIHdlIGRpc2NhcmQgdGhlIHZhbHVlIG9iamVjdCBhbmQgY29udGludWUgdGhlIHRyYWNlIHdpdGggdGhlXHJcbiAgICAgICAgIC8vIGN1cnJlbnQgdmFsIG9iamVjdFxyXG4gICAgICAgICByZXR1cm4gcmV0LnJlZHVjZShmdW5jdGlvbihhbGwsIGVhKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhbGwuY29uY2F0KGVhLmlzUGFyZW50U2VsZWN0b3IgPyBQLnRyYWNlKGVhLmV4cHIsIHZhbCwgZWEucGF0aCkgOiBbZWFdKTtcclxuICAgICAgICAgfSwgW10pO1xyXG4gICAgICB9LFxyXG4gICAgICB3YWxrOiBmdW5jdGlvbihsb2MsIGV4cHIsIHZhbCwgcGF0aCwgZikge1xyXG4gICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKVxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHZhbC5sZW5ndGg7IGkgPCBuOyBpKyspXHJcbiAgICAgICAgICAgICAgIGYoaSwgbG9jLCBleHByLCB2YWwsIHBhdGgpO1xyXG4gICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiKVxyXG4gICAgICAgICAgICBmb3IgKHZhciBtIGluIHZhbClcclxuICAgICAgICAgICAgICAgaWYgKHZhbC5oYXNPd25Qcm9wZXJ0eShtKSlcclxuICAgICAgICAgICAgICAgICAgZihtLCBsb2MsIGV4cHIsIHZhbCwgcGF0aCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHNsaWNlOiBmdW5jdGlvbihsb2MsIGV4cHIsIHZhbCwgcGF0aCkge1xyXG4gICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsKSkgcmV0dXJuO1xyXG4gICAgICAgICB2YXIgbGVuID0gdmFsLmxlbmd0aCwgcGFydHMgPSBsb2Muc3BsaXQoJzonKSxcclxuICAgICAgICAgICAgIHN0YXJ0ID0gKHBhcnRzWzBdICYmIHBhcnNlSW50KHBhcnRzWzBdKSkgfHwgMCxcclxuICAgICAgICAgICAgIGVuZCA9IChwYXJ0c1sxXSAmJiBwYXJzZUludChwYXJ0c1sxXSkpIHx8IGxlbixcclxuICAgICAgICAgICAgIHN0ZXAgPSAocGFydHNbMl0gJiYgcGFyc2VJbnQocGFydHNbMl0pKSB8fCAxO1xyXG4gICAgICAgICBzdGFydCA9IChzdGFydCA8IDApID8gTWF0aC5tYXgoMCxzdGFydCtsZW4pIDogTWF0aC5taW4obGVuLHN0YXJ0KTtcclxuICAgICAgICAgZW5kICAgPSAoZW5kIDwgMCkgICA/IE1hdGgubWF4KDAsZW5kK2xlbikgICA6IE1hdGgubWluKGxlbixlbmQpO1xyXG4gICAgICAgICB2YXIgcmV0ID0gW107XHJcbiAgICAgICAgIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSBzdGVwKVxyXG4gICAgICAgICAgICByZXQgPSByZXQuY29uY2F0KFAudHJhY2UodW5zaGlmdChpLGV4cHIpLCB2YWwsIHBhdGgpKTtcclxuICAgICAgICAgcmV0dXJuIHJldDtcclxuICAgICAgfSxcclxuICAgICAgZXZhbDogZnVuY3Rpb24oY29kZSwgX3YsIF92bmFtZSwgcGF0aCkge1xyXG4gICAgICAgICBpZiAoISQgfHwgIV92KSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgIGlmIChjb2RlLmluZGV4T2YoXCJAcGF0aFwiKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIFAuc2FuZGJveFtcIl9wYXRoXCJdID0gUC5hc1BhdGgocGF0aC5jb25jYXQoW192bmFtZV0pKTtcclxuICAgICAgICAgICAgY29kZSA9IGNvZGUucmVwbGFjZSgvQHBhdGgvZywgXCJfcGF0aFwiKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBpZiAoY29kZS5pbmRleE9mKFwiQFwiKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIFAuc2FuZGJveFtcIl92XCJdID0gX3Y7XHJcbiAgICAgICAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL0AvZywgXCJfdlwiKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgcmV0dXJuIHZtLnJ1bkluTmV3Q29udGV4dChjb2RlLCBQLnNhbmRib3gpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwianNvblBhdGg6IFwiICsgZS5tZXNzYWdlICsgXCI6IFwiICsgY29kZSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgfVxyXG4gICB9O1xyXG5cclxuICAgdmFyICQgPSBvYmo7XHJcbiAgIHZhciByZXN1bHRUeXBlID0gUC5yZXN1bHRUeXBlLnRvTG93ZXJDYXNlKCk7XHJcbiAgIGlmIChleHByICYmIG9iaiAmJiAocmVzdWx0VHlwZSA9PSBcInZhbHVlXCIgfHwgcmVzdWx0VHlwZSA9PSBcInBhdGhcIikpIHtcclxuICAgICAgdmFyIGV4cHJMaXN0ID0gUC5ub3JtYWxpemUoZXhwcik7XHJcbiAgICAgIGlmIChleHByTGlzdFswXSA9PT0gXCIkXCIgJiYgZXhwckxpc3QubGVuZ3RoID4gMSkgZXhwckxpc3Quc2hpZnQoKTtcclxuICAgICAgdmFyIHJlc3VsdCA9IFAudHJhY2UoZXhwckxpc3QsIG9iaiwgW1wiJFwiXSk7XHJcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoZnVuY3Rpb24oZWEpIHsgcmV0dXJuIGVhICYmICFlYS5pc1BhcmVudFNlbGVjdG9yOyB9KTtcclxuICAgICAgaWYgKCFyZXN1bHQubGVuZ3RoKSByZXR1cm4gUC53cmFwID8gW10gOiBmYWxzZTtcclxuICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDEgJiYgIVAud3JhcCAmJiAhQXJyYXkuaXNBcnJheShyZXN1bHRbMF0udmFsdWUpKSByZXR1cm4gcmVzdWx0WzBdW3Jlc3VsdFR5cGVdIHx8IGZhbHNlO1xyXG4gICAgICByZXR1cm4gcmVzdWx0LnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVhKSB7XHJcbiAgICAgICAgIHZhciB2YWxPclBhdGggPSBlYVtyZXN1bHRUeXBlXTtcclxuICAgICAgICAgaWYgKHJlc3VsdFR5cGUgPT09ICdwYXRoJykgdmFsT3JQYXRoID0gUC5hc1BhdGgodmFsT3JQYXRoKTtcclxuICAgICAgICAgaWYgKFAuZmxhdHRlbiAmJiBBcnJheS5pc0FycmF5KHZhbE9yUGF0aCkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh2YWxPclBhdGgpO1xyXG4gICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaCh2YWxPclBhdGgpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH0sIFtdKTtcclxuICAgfVxyXG59XHJcbn0pKHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/IHRoaXNbJ2pzb25QYXRoJ10gPSB7fSA6IGV4cG9ydHMsIHR5cGVvZiByZXF1aXJlID09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogcmVxdWlyZSk7XHJcbiIsIi8vIENvcHlyaWdodCAyMDE0IFNpbW9uIEx5ZGVsbFxyXG4vLyBYMTEgKOKAnE1JVOKAnSkgTGljZW5zZWQuIChTZWUgTElDRU5TRS4pXHJcblxyXG52b2lkIChmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICBkZWZpbmUoZmFjdG9yeSlcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxyXG4gIH0gZWxzZSB7XHJcbiAgICByb290LnJlc29sdmVVcmwgPSBmYWN0b3J5KClcclxuICB9XHJcbn0odGhpcywgZnVuY3Rpb24oKSB7XHJcblxyXG4gIGZ1bmN0aW9uIHJlc29sdmVVcmwoLyogLi4udXJscyAqLykge1xyXG4gICAgdmFyIG51bVVybHMgPSBhcmd1bWVudHMubGVuZ3RoXHJcblxyXG4gICAgaWYgKG51bVVybHMgPT09IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwicmVzb2x2ZVVybCByZXF1aXJlcyBhdCBsZWFzdCBvbmUgYXJndW1lbnQ7IGdvdCBub25lLlwiKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBiYXNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJhc2VcIilcclxuICAgIGJhc2UuaHJlZiA9IGFyZ3VtZW50c1swXVxyXG5cclxuICAgIGlmIChudW1VcmxzID09PSAxKSB7XHJcbiAgICAgIHJldHVybiBiYXNlLmhyZWZcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXVxyXG4gICAgaGVhZC5pbnNlcnRCZWZvcmUoYmFzZSwgaGVhZC5maXJzdENoaWxkKVxyXG5cclxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcclxuICAgIHZhciByZXNvbHZlZFxyXG5cclxuICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBudW1VcmxzOyBpbmRleCsrKSB7XHJcbiAgICAgIGEuaHJlZiA9IGFyZ3VtZW50c1tpbmRleF1cclxuICAgICAgcmVzb2x2ZWQgPSBhLmhyZWZcclxuICAgICAgYmFzZS5ocmVmID0gcmVzb2x2ZWRcclxuICAgIH1cclxuXHJcbiAgICBoZWFkLnJlbW92ZUNoaWxkKGJhc2UpXHJcblxyXG4gICAgcmV0dXJuIHJlc29sdmVkXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzb2x2ZVVybFxyXG5cclxufSkpO1xyXG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC51cmx0ZW1wbGF0ZSA9IGZhY3RvcnkoKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gVXJsVGVtcGxhdGUoKSB7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBVcmxUZW1wbGF0ZS5wcm90b3R5cGUuZW5jb2RlUmVzZXJ2ZWQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKCVbMC05QS1GYS1mXXsyfSkvZykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICBpZiAoIS8lWzAtOUEtRmEtZl0vLnRlc3QocGFydCkpIHtcbiAgICAgICAgcGFydCA9IGVuY29kZVVSSShwYXJ0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJ0O1xuICAgIH0pLmpvaW4oJycpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3BlcmF0b3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgVXJsVGVtcGxhdGUucHJvdG90eXBlLmVuY29kZVZhbHVlID0gZnVuY3Rpb24gKG9wZXJhdG9yLCB2YWx1ZSwga2V5KSB7XG4gICAgdmFsdWUgPSAob3BlcmF0b3IgPT09ICcrJyB8fCBvcGVyYXRvciA9PT0gJyMnKSA/IHRoaXMuZW5jb2RlUmVzZXJ2ZWQodmFsdWUpIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBVcmxUZW1wbGF0ZS5wcm90b3R5cGUuaXNEZWZpbmVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgVXJsVGVtcGxhdGUucHJvdG90eXBlLmlzS2V5T3BlcmF0b3IgPSBmdW5jdGlvbiAob3BlcmF0b3IpIHtcbiAgICByZXR1cm4gb3BlcmF0b3IgPT09ICc7JyB8fCBvcGVyYXRvciA9PT0gJyYnIHx8IG9wZXJhdG9yID09PSAnPyc7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcGVyYXRvclxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RpZmllclxuICAgKi9cbiAgVXJsVGVtcGxhdGUucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBvcGVyYXRvciwga2V5LCBtb2RpZmllcikge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHRba2V5XSxcbiAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICBpZiAodGhpcy5pc0RlZmluZWQodmFsdWUpICYmIHZhbHVlICE9PSAnJykge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgaWYgKG1vZGlmaWVyICYmIG1vZGlmaWVyICE9PSAnKicpIHtcbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCBwYXJzZUludChtb2RpZmllciwgMTApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlLCB0aGlzLmlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpID8ga2V5IDogbnVsbCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG1vZGlmaWVyID09PSAnKicpIHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlLmZpbHRlcih0aGlzLmlzRGVmaW5lZCkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUsIHRoaXMuaXNLZXlPcGVyYXRvcihvcGVyYXRvcikgPyBrZXkgOiBudWxsKSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmtleXModmFsdWUpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaXNEZWZpbmVkKHZhbHVlW2tdKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlW2tdLCBrKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdG1wID0gW107XG5cbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlLmZpbHRlcih0aGlzLmlzRGVmaW5lZCkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgdG1wLnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZSkuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICBpZiAodGhpcy5pc0RlZmluZWQodmFsdWVba10pKSB7XG4gICAgICAgICAgICAgICAgdG1wLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGspKTtcbiAgICAgICAgICAgICAgICB0bXAucHVzaCh0aGlzLmVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZVtrXS50b1N0cmluZygpKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLmlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIHRtcC5qb2luKCcsJykpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodG1wLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godG1wLmpvaW4oJywnKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvcGVyYXRvciA9PT0gJzsnKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnICYmIChvcGVyYXRvciA9PT0gJyYnIHx8IG9wZXJhdG9yID09PSAnPycpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKCcnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRlbXBsYXRlXG4gICAqIEByZXR1cm4ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nfVxuICAgKi9cbiAgVXJsVGVtcGxhdGUucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHRlbXBsYXRlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBvcGVyYXRvcnMgPSBbJysnLCAnIycsICcuJywgJy8nLCAnOycsICc/JywgJyYnXTtcblxuICAgIHJldHVybiB7XG4gICAgICBleHBhbmQ6IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKC9cXHsoW15cXHtcXH1dKylcXH18KFteXFx7XFx9XSspL2csIGZ1bmN0aW9uIChfLCBleHByZXNzaW9uLCBsaXRlcmFsKSB7XG4gICAgICAgICAgaWYgKGV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgIHZhciBvcGVyYXRvciA9IG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gW107XG5cbiAgICAgICAgICAgIGlmIChvcGVyYXRvcnMuaW5kZXhPZihleHByZXNzaW9uLmNoYXJBdCgwKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgIG9wZXJhdG9yID0gZXhwcmVzc2lvbi5jaGFyQXQoMCk7XG4gICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnN1YnN0cigxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXhwcmVzc2lvbi5zcGxpdCgvLC9nKS5mb3JFYWNoKGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICAgICAgICAgICAgICB2YXIgdG1wID0gLyhbXjpcXCpdKikoPzo6KFxcZCspfChcXCopKT8vLmV4ZWModmFyaWFibGUpO1xuICAgICAgICAgICAgICB2YWx1ZXMucHVzaC5hcHBseSh2YWx1ZXMsIHRoYXQuZ2V0VmFsdWVzKGNvbnRleHQsIG9wZXJhdG9yLCB0bXBbMV0sIHRtcFsyXSB8fCB0bXBbM10pKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAob3BlcmF0b3IgJiYgb3BlcmF0b3IgIT09ICcrJykge1xuICAgICAgICAgICAgICB2YXIgc2VwYXJhdG9yID0gJywnO1xuXG4gICAgICAgICAgICAgIGlmIChvcGVyYXRvciA9PT0gJz8nKSB7XG4gICAgICAgICAgICAgICAgc2VwYXJhdG9yID0gJyYnO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wZXJhdG9yICE9PSAnIycpIHtcbiAgICAgICAgICAgICAgICBzZXBhcmF0b3IgPSBvcGVyYXRvcjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlcy5sZW5ndGggIT09IDAgPyBvcGVyYXRvciA6ICcnKSArIHZhbHVlcy5qb2luKHNlcGFyYXRvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzLmpvaW4oJywnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoYXQuZW5jb2RlUmVzZXJ2ZWQobGl0ZXJhbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIHJldHVybiBuZXcgVXJsVGVtcGxhdGUoKTtcbn0pKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBtZWRpYVR5cGVzID0gcmVxdWlyZSgnLi9saWIvbWVkaWFfdHlwZXMnKVxuICAsIEJ1aWxkZXIgPSByZXF1aXJlKCcuL2xpYi9idWlsZGVyJylcbiAgLCBtZWRpYVR5cGVzID0gcmVxdWlyZSgnLi9saWIvbWVkaWFfdHlwZXMnKVxuICAsIG1lZGlhVHlwZVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9saWIvbWVkaWFfdHlwZV9yZWdpc3RyeScpO1xuXG4vLyBhY3RpdmF0ZSB0aGlzIGxpbmUgdG8gZW5hYmxlIGxvZ2dpbmdcbmlmIChwcm9jZXNzLmVudi5UUkFWRVJTT05fTE9HR0lORykge1xuICByZXF1aXJlKCdtaW5pbG9nJykuZW5hYmxlKCk7XG59XG5cbi8vIGV4cG9ydCBidWlsZGVyIGZvciB0cmF2ZXJzb24tYW5ndWxhclxuZXhwb3J0cy5fQnVpbGRlciA9IEJ1aWxkZXI7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyByZXF1ZXN0IGJ1aWxkZXIgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydHMubmV3UmVxdWVzdCA9IGZ1bmN0aW9uIG5ld1JlcXVlc3QoKSB7XG4gIHJldHVybiBuZXcgQnVpbGRlcigpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHJlcXVlc3QgYnVpbGRlciBpbnN0YW5jZSB3aXRoIHRoZSBnaXZlbiByb290IFVSTC5cbiAqL1xuZXhwb3J0cy5mcm9tID0gZnVuY3Rpb24gZnJvbSh1cmwpIHtcbiAgdmFyIGJ1aWxkZXIgPSBuZXcgQnVpbGRlcigpO1xuICBidWlsZGVyLmZyb20odXJsKTtcbiAgcmV0dXJuIGJ1aWxkZXI7XG59O1xuXG4vLyBQcm92aWRlZCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3aXRoIHByZS0xLjAuMCB2ZXJzaW9ucy5cbi8vIFRoZSBwcmVmZXJyZWQgd2F5IGlzIHRvIHVzZSBuZXdSZXF1ZXN0KCkgb3IgZnJvbSgpIHRvIGNyZWF0ZSBhIHJlcXVlc3Rcbi8vIGJ1aWxkZXIgYW5kIGVpdGhlciBzZXQgdGhlIG1lZGlhIHR5cGUgZXhwbGljaXRseSBieSBjYWxsaW5nIGpzb24oKSBvbiB0aGVcbi8vIHJlcXVlc3QgYnVpbGRlciBpbnN0YW5jZSAtIG9yIHVzZSBjb250ZW50IG5lZ290aWF0aW9uLlxuZXhwb3J0cy5qc29uID0ge1xuICBmcm9tOiBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gICAgYnVpbGRlci5mcm9tKHVybCk7XG4gICAgYnVpbGRlci5zZXRNZWRpYVR5cGUobWVkaWFUeXBlcy5KU09OKTtcbiAgICByZXR1cm4gYnVpbGRlcjtcbiAgfVxufSxcblxuLy8gUHJvdmlkZWQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBwcmUtMS4wLjAgdmVyc2lvbnMuXG4vLyBUaGUgcHJlZmVycmVkIHdheSBpcyB0byB1c2UgbmV3UmVxdWVzdCgpIG9yIGZyb20oKSB0byBjcmVhdGUgYSByZXF1ZXN0XG4vLyBidWlsZGVyIGFuZCB0aGVuIGVpdGhlciBzZXQgdGhlIG1lZGlhIHR5cGUgZXhwbGljaXRseSBieSBjYWxsaW5nIGpzb25IYWwoKSBvblxuLy8gdGhlIHJlcXVlc3QgYnVpbGRlciBpbnN0YW5jZSAtIG9yIHVzZSBjb250ZW50IG5lZ290aWF0aW9uLlxuZXhwb3J0cy5qc29uSGFsID0ge1xuICBmcm9tOiBmdW5jdGlvbih1cmwpIHtcbiAgICBpZiAoIW1lZGlhVHlwZVJlZ2lzdHJ5LmdldChtZWRpYVR5cGVzLkpTT05fSEFMKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OIEhBTCBhZGFwdGVyIGlzIG5vdCByZWdpc3RlcmVkLiBGcm9tIHZlcnNpb24gJyArXG4gICAgICAgICcxLjAuMCBvbiwgVHJhdmVyc29uIGhhcyBubyBsb25nZXIgYnVpbHQtaW4gc3VwcG9ydCBmb3IgJyArXG4gICAgICAgICdhcHBsaWNhdGlvbi9oYWwranNvbi4gSEFMIHN1cHBvcnQgd2FzIG1vdmVkIHRvIGEgc2VwYXJhdGUsIG9wdGlvbmFsICcgK1xuICAgICAgICAncGx1Zy1pbi4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXN0aTEzMDIvdHJhdmVyc29uLWhhbCcpO1xuICAgIH1cbiAgICB2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gICAgYnVpbGRlci5mcm9tKHVybCk7XG4gICAgYnVpbGRlci5zZXRNZWRpYVR5cGUobWVkaWFUeXBlcy5KU09OX0hBTCk7XG4gICAgcmV0dXJuIGJ1aWxkZXI7XG4gIH1cbn07XG5cbi8vIGV4cG9zZSBtZWRpYSB0eXBlIHJlZ2lzdHJ5IHNvIHRoYXQgbWVkaWEgdHlwZSBwbHVnLWlucyBjYW4gcmVnaXN0ZXJcbi8vIHRoZW1zZWx2ZXNcbmV4cG9ydHMucmVnaXN0ZXJNZWRpYVR5cGUgPSBtZWRpYVR5cGVSZWdpc3RyeS5yZWdpc3RlcjtcblxuLy8gZXhwb3J0IG1lZGlhIHR5cGUgY29uc3RhbnRzXG5leHBvcnRzLm1lZGlhVHlwZXMgPSBtZWRpYVR5cGVzO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJ2YXIgaW5kZXhPZiA9IHJlcXVpcmUoJ2luZGV4b2YnKTtcblxudmFyIE9iamVjdF9rZXlzID0gZnVuY3Rpb24gKG9iaikge1xuICAgIGlmIChPYmplY3Qua2V5cykgcmV0dXJuIE9iamVjdC5rZXlzKG9iailcbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHJlcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSByZXMucHVzaChrZXkpXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxufTtcblxudmFyIGZvckVhY2ggPSBmdW5jdGlvbiAoeHMsIGZuKSB7XG4gICAgaWYgKHhzLmZvckVhY2gpIHJldHVybiB4cy5mb3JFYWNoKGZuKVxuICAgIGVsc2UgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmbih4c1tpXSwgaSwgeHMpO1xuICAgIH1cbn07XG5cbnZhciBkZWZpbmVQcm9wID0gKGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ18nLCB7fSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihvYmosIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIG9ialtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cbn0oKSk7XG5cbnZhciBnbG9iYWxzID0gWydBcnJheScsICdCb29sZWFuJywgJ0RhdGUnLCAnRXJyb3InLCAnRXZhbEVycm9yJywgJ0Z1bmN0aW9uJyxcbidJbmZpbml0eScsICdKU09OJywgJ01hdGgnLCAnTmFOJywgJ051bWJlcicsICdPYmplY3QnLCAnUmFuZ2VFcnJvcicsXG4nUmVmZXJlbmNlRXJyb3InLCAnUmVnRXhwJywgJ1N0cmluZycsICdTeW50YXhFcnJvcicsICdUeXBlRXJyb3InLCAnVVJJRXJyb3InLFxuJ2RlY29kZVVSSScsICdkZWNvZGVVUklDb21wb25lbnQnLCAnZW5jb2RlVVJJJywgJ2VuY29kZVVSSUNvbXBvbmVudCcsICdlc2NhcGUnLFxuJ2V2YWwnLCAnaXNGaW5pdGUnLCAnaXNOYU4nLCAncGFyc2VGbG9hdCcsICdwYXJzZUludCcsICd1bmRlZmluZWQnLCAndW5lc2NhcGUnXTtcblxuZnVuY3Rpb24gQ29udGV4dCgpIHt9XG5Db250ZXh0LnByb3RvdHlwZSA9IHt9O1xuXG52YXIgU2NyaXB0ID0gZXhwb3J0cy5TY3JpcHQgPSBmdW5jdGlvbiBOb2RlU2NyaXB0IChjb2RlKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNjcmlwdCkpIHJldHVybiBuZXcgU2NyaXB0KGNvZGUpO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG59O1xuXG5TY3JpcHQucHJvdG90eXBlLnJ1bkluQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgaWYgKCEoY29udGV4dCBpbnN0YW5jZW9mIENvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJuZWVkcyBhICdjb250ZXh0JyBhcmd1bWVudC5cIik7XG4gICAgfVxuICAgIFxuICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICBpZiAoIWlmcmFtZS5zdHlsZSkgaWZyYW1lLnN0eWxlID0ge307XG4gICAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgIFxuICAgIHZhciB3aW4gPSBpZnJhbWUuY29udGVudFdpbmRvdztcbiAgICB2YXIgd0V2YWwgPSB3aW4uZXZhbCwgd0V4ZWNTY3JpcHQgPSB3aW4uZXhlY1NjcmlwdDtcblxuICAgIGlmICghd0V2YWwgJiYgd0V4ZWNTY3JpcHQpIHtcbiAgICAgICAgLy8gd2luLmV2YWwoKSBtYWdpY2FsbHkgYXBwZWFycyB3aGVuIHRoaXMgaXMgY2FsbGVkIGluIElFOlxuICAgICAgICB3RXhlY1NjcmlwdC5jYWxsKHdpbiwgJ251bGwnKTtcbiAgICAgICAgd0V2YWwgPSB3aW4uZXZhbDtcbiAgICB9XG4gICAgXG4gICAgZm9yRWFjaChPYmplY3Rfa2V5cyhjb250ZXh0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB3aW5ba2V5XSA9IGNvbnRleHRba2V5XTtcbiAgICB9KTtcbiAgICBmb3JFYWNoKGdsb2JhbHMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKGNvbnRleHRba2V5XSkge1xuICAgICAgICAgICAgd2luW2tleV0gPSBjb250ZXh0W2tleV07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICB2YXIgd2luS2V5cyA9IE9iamVjdF9rZXlzKHdpbik7XG5cbiAgICB2YXIgcmVzID0gd0V2YWwuY2FsbCh3aW4sIHRoaXMuY29kZSk7XG4gICAgXG4gICAgZm9yRWFjaChPYmplY3Rfa2V5cyh3aW4pLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIC8vIEF2b2lkIGNvcHlpbmcgY2lyY3VsYXIgb2JqZWN0cyBsaWtlIGB0b3BgIGFuZCBgd2luZG93YCBieSBvbmx5XG4gICAgICAgIC8vIHVwZGF0aW5nIGV4aXN0aW5nIGNvbnRleHQgcHJvcGVydGllcyBvciBuZXcgcHJvcGVydGllcyBpbiB0aGUgYHdpbmBcbiAgICAgICAgLy8gdGhhdCB3YXMgb25seSBpbnRyb2R1Y2VkIGFmdGVyIHRoZSBldmFsLlxuICAgICAgICBpZiAoa2V5IGluIGNvbnRleHQgfHwgaW5kZXhPZih3aW5LZXlzLCBrZXkpID09PSAtMSkge1xuICAgICAgICAgICAgY29udGV4dFtrZXldID0gd2luW2tleV07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZvckVhY2goZ2xvYmFscywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoIShrZXkgaW4gY29udGV4dCkpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3AoY29udGV4dCwga2V5LCB3aW5ba2V5XSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gICAgXG4gICAgcmV0dXJuIHJlcztcbn07XG5cblNjcmlwdC5wcm90b3R5cGUucnVuSW5UaGlzQ29udGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZXZhbCh0aGlzLmNvZGUpOyAvLyBtYXliZS4uLlxufTtcblxuU2NyaXB0LnByb3RvdHlwZS5ydW5Jbk5ld0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHZhciBjdHggPSBTY3JpcHQuY3JlYXRlQ29udGV4dChjb250ZXh0KTtcbiAgICB2YXIgcmVzID0gdGhpcy5ydW5JbkNvbnRleHQoY3R4KTtcblxuICAgIGZvckVhY2goT2JqZWN0X2tleXMoY3R4KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb250ZXh0W2tleV0gPSBjdHhba2V5XTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXM7XG59O1xuXG5mb3JFYWNoKE9iamVjdF9rZXlzKFNjcmlwdC5wcm90b3R5cGUpLCBmdW5jdGlvbiAobmFtZSkge1xuICAgIGV4cG9ydHNbbmFtZV0gPSBTY3JpcHRbbmFtZV0gPSBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICB2YXIgcyA9IFNjcmlwdChjb2RlKTtcbiAgICAgICAgcmV0dXJuIHNbbmFtZV0uYXBwbHkocywgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICB9O1xufSk7XG5cbmV4cG9ydHMuY3JlYXRlU2NyaXB0ID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5TY3JpcHQoY29kZSk7XG59O1xuXG5leHBvcnRzLmNyZWF0ZUNvbnRleHQgPSBTY3JpcHQuY3JlYXRlQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgdmFyIGNvcHkgPSBuZXcgQ29udGV4dCgpO1xuICAgIGlmKHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3JFYWNoKE9iamVjdF9rZXlzKGNvbnRleHQpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBjb3B5W2tleV0gPSBjb250ZXh0W2tleV07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbn07XG4iLCJcbnZhciBpbmRleE9mID0gW10uaW5kZXhPZjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIG9iail7XG4gIGlmIChpbmRleE9mKSByZXR1cm4gYXJyLmluZGV4T2Yob2JqKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn07Il19
