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
    queryForCategory: function(START, PATH, CATEGORY) {
        traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

        var api = traverson
            .from(START)
            .jsonHal()
            .withRequestOptions({
                headers: {
                    'X-Xapp-Token': this.xappToken,
                    'Accept': 'application/vnd.artsy-v2+json'
                }
            })

        api
        .newRequest()
        .follow(PATH)
        .withTemplateParameters({ id: CATEGORY })
        .getResource(function(error, resource) {
            if (error) {
                console.log('Error with the Query!')
            }
            for (var i=0; i<4; i++) {
                artistArray.push(resource._embedded.artists[i])
            }
            console.log(artistArray)
            this.artistArtworks = artistArray
        })
    },
    getArtwork: function(artistArtworks) {
        return new Promise (function(resolve, reject) {
            traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)
            console.log(artistArtworks.length)
            for(var i=0; i < artistArtworks.length; i++) {

                console.log(artistArtworks.length)
                traverson
                .from(artistArtworks[i]._links.artworks.href)
                .jsonHal()
                .withRequestOptions({
                    headers: {
                        'X-Xapp-Token': this.xappToken,
                        'Accept': 'application/vnd.artsy-v2+json'
                    }
                })
                .getResource(function(error, artworks) {
                    if (error) {
                        console.log('another error..')
                        reject()
                    } else {
                        if(artworks._embedded.artworks.length > 0) {
                            console.log(artworks)
                            this.artworkArray.push(artworks._embedded.artworks[0]._links.thumbnail.href)
                        }
                        if(this.artworkArray.length >= 2) {
                            //getDegas()
                            resolve(this.artworkArray)
                        }
                    }
                })
            }
        })
    }
} // END OF ARTSY OBJECT

},{"superagent":3,"traverson":50,"traverson-hal":6}],2:[function(require,module,exports){
'use strict';

var Artsy = require('./artsy.js');

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

},{"./artsy.js":1}],3:[function(require,module,exports){
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

},{"emitter":4,"reduce":5}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){

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
},{}],6:[function(require,module,exports){
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

},{"halfred":7}],7:[function(require,module,exports){
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

},{"./lib/parser":9}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./immutable_stack":8,"./resource":10}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

module.exports = {
  isArray: function(o) {
    if (o == null) {
      return false;
    }
    return Object.prototype.toString.call(o) === '[object Array]';
  }
};

},{}],13:[function(require,module,exports){
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

},{"superagent":3}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
'use strict';

var resolveUrl = require('resolve-url');

exports.resolve = function(from, to) {
  return resolveUrl(from, to);
};

},{"resolve-url":48}],16:[function(require,module,exports){
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

},{"minilog":11}],17:[function(require,module,exports){
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

},{"./abort_traversal":16,"./http_requests":19,"./is_continuation":20,"./transforms/apply_transforms":26,"./transforms/check_http_status":27,"./transforms/continuation_to_doc":28,"./transforms/continuation_to_response":29,"./transforms/convert_embedded_doc_to_response":30,"./transforms/execute_http_request":32,"./transforms/execute_last_http_request":33,"./transforms/extract_doc":34,"./transforms/extract_response":35,"./transforms/extract_url":36,"./transforms/fetch_last_resource":37,"./transforms/parse":40,"./walker":46,"minilog":11}],18:[function(require,module,exports){
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

},{"./abort_traversal":16,"./actions":17,"./media_type_registry":22,"./media_types":23,"./merge_recursive":24,"minilog":11,"request":13,"util":12}],19:[function(require,module,exports){
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

},{"./abort_traversal":16,"./transforms/detect_content_type":31,"./transforms/get_options_for_step":39,"_process":51,"minilog":11}],20:[function(require,module,exports){
'use strict';

module.exports = function isContinuation(t) {
  return t.continuation && t.step && t.step.response;
};

},{}],21:[function(require,module,exports){
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

},{"JSONPath":47,"minilog":11,"underscore.string":14}],22:[function(require,module,exports){
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

},{"./json_adapter":21,"./media_types":23,"./negotiation_adapter":25}],23:[function(require,module,exports){
'use strict';

module.exports = {
  CONTENT_NEGOTIATION: 'content-negotiation',
  JSON: 'application/json',
  JSON_HAL: 'application/hal+json',
};

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
'use strict';

function NegotiationAdapter(log) {}

NegotiationAdapter.prototype.findNextStep = function(doc, link) {
  throw new Error('Content negotiation did not happen');
};

module.exports = NegotiationAdapter;

},{}],26:[function(require,module,exports){
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

},{"_process":51,"minilog":11}],27:[function(require,module,exports){
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

},{"../is_continuation":20,"minilog":11}],28:[function(require,module,exports){
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

},{"../is_continuation":20,"minilog":11}],29:[function(require,module,exports){
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

},{"../is_continuation":20,"./convert_embedded_doc_to_response":30,"minilog":11}],30:[function(require,module,exports){
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

},{"minilog":11}],31:[function(require,module,exports){
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

},{"../media_type_registry":22,"minilog":11}],32:[function(require,module,exports){
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

},{"../abort_traversal":16,"../http_requests":19,"minilog":11}],33:[function(require,module,exports){
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

},{"../abort_traversal":16,"../http_requests":19,"minilog":11}],34:[function(require,module,exports){
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

},{"minilog":11}],35:[function(require,module,exports){
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

},{"minilog":11}],36:[function(require,module,exports){
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

},{"minilog":11,"url":15}],37:[function(require,module,exports){
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

},{"../abort_traversal":16,"../http_requests":19,"minilog":11}],38:[function(require,module,exports){
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

},{"../abort_traversal":16,"../http_requests":19,"../is_continuation":20,"_process":51,"minilog":11}],39:[function(require,module,exports){
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

},{"minilog":11,"util":12}],40:[function(require,module,exports){
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

},{"../is_continuation":20,"minilog":11}],41:[function(require,module,exports){
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

},{"../is_continuation":20}],42:[function(require,module,exports){
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

},{"../is_continuation":20}],43:[function(require,module,exports){
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

},{"minilog":11,"underscore.string":14,"url":15}],44:[function(require,module,exports){
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



},{"minilog":11,"underscore.string":14,"url-template":49,"util":12}],45:[function(require,module,exports){
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

},{"minilog":11}],46:[function(require,module,exports){
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

},{"./abort_traversal":16,"./is_continuation":20,"./transforms/apply_transforms":26,"./transforms/check_http_status":27,"./transforms/fetch_resource":38,"./transforms/parse":40,"./transforms/reset_continuation":41,"./transforms/reset_last_step":42,"./transforms/resolve_next_url":43,"./transforms/resolve_uri_template":44,"./transforms/switch_to_next_step":45,"minilog":11}],47:[function(require,module,exports){
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

},{"vm":52}],48:[function(require,module,exports){
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

},{}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
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

},{"./lib/builder":18,"./lib/media_type_registry":22,"./lib/media_types":23,"_process":51,"minilog":11}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{"indexof":53}],53:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcnRzeS5qcyIsIm1haW4uanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uLWhhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24taGFsL25vZGVfbW9kdWxlcy9oYWxmcmVkL2hhbGZyZWQuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uLWhhbC9ub2RlX21vZHVsZXMvaGFsZnJlZC9saWIvaW1tdXRhYmxlX3N0YWNrLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi1oYWwvbm9kZV9tb2R1bGVzL2hhbGZyZWQvbGliL3BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24taGFsL25vZGVfbW9kdWxlcy9oYWxmcmVkL2xpYi9yZXNvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vYnJvd3Nlci9saWIvc2hpbS9sb2cuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2Jyb3dzZXIvbGliL3NoaW0vbm9kZS11dGlsLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9icm93c2VyL2xpYi9zaGltL3JlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2Jyb3dzZXIvbGliL3NoaW0vdW5kZXJzY29yZS1zdHJpbmctcmVkdWNlZC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vYnJvd3Nlci9saWIvc2hpbS91cmwtcmVzb2x2ZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2Fib3J0X3RyYXZlcnNhbC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2FjdGlvbnMuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9idWlsZGVyLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvaHR0cF9yZXF1ZXN0cy5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2lzX2NvbnRpbnVhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2pzb25fYWRhcHRlci5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL21lZGlhX3R5cGVfcmVnaXN0cnkuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9tZWRpYV90eXBlcy5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL21lcmdlX3JlY3Vyc2l2ZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL25lZ290aWF0aW9uX2FkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2FwcGx5X3RyYW5zZm9ybXMuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2NoZWNrX2h0dHBfc3RhdHVzLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9jb250aW51YXRpb25fdG9fZG9jLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9jb250aW51YXRpb25fdG9fcmVzcG9uc2UuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2NvbnZlcnRfZW1iZWRkZWRfZG9jX3RvX3Jlc3BvbnNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9kZXRlY3RfY29udGVudF90eXBlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9leGVjdXRlX2h0dHBfcmVxdWVzdC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZXhlY3V0ZV9sYXN0X2h0dHBfcmVxdWVzdC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZXh0cmFjdF9kb2MuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2V4dHJhY3RfcmVzcG9uc2UuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2V4dHJhY3RfdXJsLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9mZXRjaF9sYXN0X3Jlc291cmNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9mZXRjaF9yZXNvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZ2V0X29wdGlvbnNfZm9yX3N0ZXAuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9yZXNldF9jb250aW51YXRpb24uanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3Jlc2V0X2xhc3Rfc3RlcC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvcmVzb2x2ZV9uZXh0X3VybC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvcmVzb2x2ZV91cmlfdGVtcGxhdGUuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3N3aXRjaF90b19uZXh0X3N0ZXAuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi93YWxrZXIuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9KU09OUGF0aC9saWIvanNvbnBhdGguanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9yZXNvbHZlLXVybC9yZXNvbHZlLXVybC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3VybC10ZW1wbGF0ZS9saWIvdXJsLXRlbXBsYXRlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi90cmF2ZXJzb24uanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3ZtLWJyb3dzZXJpZnkvaW5kZXguanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdm0tYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5kZXhvZi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6bUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKVxudmFyIHRyYXZlcnNvbiA9IHJlcXVpcmUoJ3RyYXZlcnNvbicpXG52YXIgSnNvbkhhbEFkYXB0ZXIgPSByZXF1aXJlKCd0cmF2ZXJzb24taGFsJylcblxudmFyIGNsaWVudElEID0gJzAwNjY1ZDQ2YmI0ZjU2ZDQyYjk4JyxcbiAgICBjbGllbnRTZWNyZXQgPSAnODZkNDgzNzIwYWE2ZGVkYzljODZkMTEyOWE5OTU3NDknLFxuICAgIGFwaVVybCA9ICdodHRwczovL2FwaS5hcnRzeS5uZXQvYXBpL3Rva2Vucy94YXBwX3Rva2VuJ1xuXG52YXIgYXJ0aXN0QXJyYXkgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB4YXBwVG9rZW46ICcnLFxuICAgIGFydGlzdEFydHdvcmtzOiBbXSxcbiAgICBhcnR3b3JrQXJyYXk6IFtdLFxuXG5cbiAgICByZXF1ZXN0VG9rZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIC5wb3N0KGFwaVVybClcbiAgICAgICAgICAgICAgICAgICAgLnNlbmQoeyBjbGllbnRfaWQ6IGNsaWVudElELCBjbGllbnRfc2VjcmV0OiBjbGllbnRTZWNyZXQgfSlcbiAgICAgICAgICAgICAgICAgICAgLmVuZChmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzLmJvZHkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMuYm9keS50b2tlbilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0sXG4gICAgcXVlcnlGb3JDYXRlZ29yeTogZnVuY3Rpb24oU1RBUlQsIFBBVEgsIENBVEVHT1JZKSB7XG4gICAgICAgIHRyYXZlcnNvbi5yZWdpc3Rlck1lZGlhVHlwZShKc29uSGFsQWRhcHRlci5tZWRpYVR5cGUsIEpzb25IYWxBZGFwdGVyKVxuXG4gICAgICAgIHZhciBhcGkgPSB0cmF2ZXJzb25cbiAgICAgICAgICAgIC5mcm9tKFNUQVJUKVxuICAgICAgICAgICAgLmpzb25IYWwoKVxuICAgICAgICAgICAgLndpdGhSZXF1ZXN0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnWC1YYXBwLVRva2VuJzogdGhpcy54YXBwVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmFydHN5LXYyK2pzb24nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBhcGlcbiAgICAgICAgLm5ld1JlcXVlc3QoKVxuICAgICAgICAuZm9sbG93KFBBVEgpXG4gICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgaWQ6IENBVEVHT1JZIH0pXG4gICAgICAgIC5nZXRSZXNvdXJjZShmdW5jdGlvbihlcnJvciwgcmVzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aXRoIHRoZSBRdWVyeSEnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPDQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGFydGlzdEFycmF5LnB1c2gocmVzb3VyY2UuX2VtYmVkZGVkLmFydGlzdHNbaV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhcnRpc3RBcnJheSlcbiAgICAgICAgICAgIHRoaXMuYXJ0aXN0QXJ0d29ya3MgPSBhcnRpc3RBcnJheVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgZ2V0QXJ0d29yazogZnVuY3Rpb24oYXJ0aXN0QXJ0d29ya3MpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlIChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHRyYXZlcnNvbi5yZWdpc3Rlck1lZGlhVHlwZShKc29uSGFsQWRhcHRlci5tZWRpYVR5cGUsIEpzb25IYWxBZGFwdGVyKVxuICAgICAgICAgICAgY29uc29sZS5sb2coYXJ0aXN0QXJ0d29ya3MubGVuZ3RoKVxuICAgICAgICAgICAgZm9yKHZhciBpPTA7IGkgPCBhcnRpc3RBcnR3b3Jrcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXJ0aXN0QXJ0d29ya3MubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRyYXZlcnNvblxuICAgICAgICAgICAgICAgIC5mcm9tKGFydGlzdEFydHdvcmtzW2ldLl9saW5rcy5hcnR3b3Jrcy5ocmVmKVxuICAgICAgICAgICAgICAgIC5qc29uSGFsKClcbiAgICAgICAgICAgICAgICAud2l0aFJlcXVlc3RPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1gtWGFwcC1Ub2tlbic6IHRoaXMueGFwcFRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuYXJ0c3ktdjIranNvbidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmdldFJlc291cmNlKGZ1bmN0aW9uKGVycm9yLCBhcnR3b3Jrcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbm90aGVyIGVycm9yLi4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KClcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFydHdvcmtzLl9lbWJlZGRlZC5hcnR3b3Jrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXJ0d29ya3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcnR3b3JrQXJyYXkucHVzaChhcnR3b3Jrcy5fZW1iZWRkZWQuYXJ0d29ya3NbMF0uX2xpbmtzLnRodW1ibmFpbC5ocmVmKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5hcnR3b3JrQXJyYXkubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2dldERlZ2FzKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuYXJ0d29ya0FycmF5KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59IC8vIEVORCBPRiBBUlRTWSBPQkpFQ1RcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFydHN5ID0gcmVxdWlyZSgnLi9hcnRzeS5qcycpO1xuXG52YXIgZGVnYXMsIGRlZ2FzQXJ0d29yaztcbnZhciBkZWdhc1RoZURhbmNlTGVzc29uO1xudmFyIGVsRGVnYXNCaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXJ0aXN0QmlvJyk7XG52YXIgZWxEZWdhc0xpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXJ0aXN0TGluaycpO1xudmFyIGVsRGVnYXNBcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXJ0aXN0SW1hZ2UnKTtcblxudmFyIGVsZmlyc3RBcnRpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlyc3RBcnRpc3QnKTtcbnZhciBlbGZpcnN0SW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlyc3RJbWFnZScpO1xudmFyIGZpcnN0QXJ0aXN0QXJ0d29yaztcblxudmFyIGVsc2Vjb25kQXJ0aXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlY29uZEFydGlzdCcpO1xudmFyIGVsc2Vjb25kSW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Vjb25kSW1hZ2UnKTtcblxudmFyIGVsdGhpcmRBcnRpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhpcmRBcnRpc3QnKTtcbnZhciBlbHRoaXJkSW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhpcmRJbWFnZScpO1xuXG52YXIgZWxmb3VydGhBcnRpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm91cnRoQXJ0aXN0Jyk7XG52YXIgZWxmb3VydGhJbWFnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3VydGhJbWFnZScpO1xuXG52YXIgaW1wcmVzc2lvbmlzbSA9ICc0ZDkwZDE5MWRjZGQ1ZjQ0YTUwMDAwNGUnO1xuXG52YXIgZnJvbVJvb3QgPSAnaHR0cHM6Ly9hcGkuYXJ0c3kubmV0L2FwaSdcbnZhciB0b1BhdGggPSBbJ2dlbmUnLCAnYXJ0aXN0cyddXG5cbnZhciBpbXByZXNzaW9uaXNtRGVzY3JpcHRpb247XG5cbnZhciBhcnR3b3JrQXJyYXkgPSBbXVxuLy92YXIgYXJ0aXN0QXJyYXkgPSBbXVxuLy92YXIgeGFwcFRva2VuO1xuXG5BcnRzeS5yZXF1ZXN0VG9rZW4oKVxuICAgIC50aGVuKGZ1bmN0aW9uKHhhcHBUb2tlbikge1xuICAgICAgICBjb25zb2xlLmxvZyh4YXBwVG9rZW4pXG4gICAgICAgIEFydHN5LnhhcHBUb2tlbiA9IHhhcHBUb2tlblxuICAgICAgICBBcnRzeS5xdWVyeUZvckNhdGVnb3J5KGZyb21Sb290LCB0b1BhdGgsIGltcHJlc3Npb25pc20pXG4gICAgICAgIGdldEFydHdvcmtzRnJvbUFydGlzdHMoKVxuICAgIH0pXG5cbnZhciBnZXRBcnR3b3Jrc0Zyb21BcnRpc3RzID0gZnVuY3Rpb24oKSB7XG4gICAgQXJ0c3kuZ2V0QXJ0d29yayhBcnRzeS5hcnRpc3RBcnR3b3JrcylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oYXJ0d29yaykge1xuICAgICAgICAgICAgYXJ0d29ya0FycmF5ID0gYXJ0d29ya1xuICAgICAgICB9KVxufVxuXG5cblxuLy8gdmFyIGdldERlZ2FzID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgdHJhdmVyc29uLnJlZ2lzdGVyTWVkaWFUeXBlKEpzb25IYWxBZGFwdGVyLm1lZGlhVHlwZSwgSnNvbkhhbEFkYXB0ZXIpXG4vL1xuLy8gICAgIHZhciBhcGkgPSB0cmF2ZXJzb25cbi8vICAgICAuZnJvbSgnaHR0cHM6Ly9hcGkuYXJ0c3kubmV0L2FwaScpXG4vLyAgICAgLmpzb25IYWwoKVxuLy8gICAgIC53aXRoUmVxdWVzdE9wdGlvbnMoe1xuLy8gICAgICAgICBoZWFkZXJzOiB7XG4vLyAgICAgICAgICAgICAnWC1YYXBwLVRva2VuJzogeGFwcFRva2VuLFxuLy8gICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuYXJ0c3ktdjIranNvbidcbi8vICAgICAgICAgfVxuLy8gICAgIH0pXG4vL1xuLy8gICAgIGFwaVxuLy8gICAgIC5uZXdSZXF1ZXN0KClcbi8vICAgICAuZm9sbG93KCdhcnRpc3QnKVxuLy8gICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgaWQ6ICc0ZGFkZDIxNzcxMjlmMDU5MjQwMDBjNjgnIH0pXG4vLyAgICAgLmdldFJlc291cmNlKGZ1bmN0aW9uKGVycm9yLCBlZGdhckRlZ2FzKSB7XG4vLyAgICAgICAgIGlmIChlcnJvcikge1xuLy8gICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yIScpXG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgY29uc29sZS5sb2coZWRnYXJEZWdhcylcbi8vICAgICAgICAgZGVnYXMgPSBlZGdhckRlZ2FzLm5hbWUgKyAnIHwgJyArICdCaXJ0aGRheTogJyArIGVkZ2FyRGVnYXMuYmlydGhkYXkgKyAnIHwgJyArICdIb21ldG93bjogJyArIGVkZ2FyRGVnYXMuaG9tZXRvd24gKyAnIHwgJyArICdOYXRpb25hbGl0eTogJyArIGVkZ2FyRGVnYXMubmF0aW9uYWxpdHk7XG4vLyAgICAgICAgIHZhciBhcnR3b3JrID0gZWRnYXJEZWdhcy5fbGlua3MuYXJ0d29ya3MuaHJlZlxuLy8gICAgICAgICBnZXREZWdhc0FydHdvcmsoYXJ0d29yaylcbi8vICAgICB9KTtcbi8vIH1cbi8vXG4vLyB2YXIgZ2V0RGVnYXNBcnR3b3JrID0gZnVuY3Rpb24oYXJ0d29yaykge1xuLy8gICAgIHRyYXZlcnNvbi5yZWdpc3Rlck1lZGlhVHlwZShKc29uSGFsQWRhcHRlci5tZWRpYVR5cGUsIEpzb25IYWxBZGFwdGVyKVxuLy9cbi8vICAgICB0cmF2ZXJzb25cbi8vICAgICAuZnJvbShhcnR3b3JrKVxuLy8gICAgIC5qc29uSGFsKClcbi8vICAgICAud2l0aFJlcXVlc3RPcHRpb25zKHtcbi8vICAgICAgICAgaGVhZGVyczoge1xuLy8gICAgICAgICAgICAgJ1gtWGFwcC1Ub2tlbic6IHhhcHBUb2tlbixcbi8vICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmFydHN5LXYyK2pzb24nXG4vLyAgICAgICAgIH1cbi8vICAgICB9KVxuLy8gICAgIC5nZXRSZXNvdXJjZShmdW5jdGlvbihlcnJvciwgYWxsQXJ0d29yaykge1xuLy8gICAgICAgICBpZiAoZXJyb3IpIHtcbi8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbm90aGVyIGVycm9yLi4nKVxuLy8gICAgICAgICB9XG4vLyAgICAgICAgIC8vY29uc29sZS5sb2coYWxsQXJ0d29yaylcbi8vICAgICAgICAgY29uc29sZS5sb2coYWxsQXJ0d29yay5fZW1iZWRkZWQuYXJ0d29ya3NbM10udGl0bGUpXG4vLyAgICAgICAgIGRlZ2FzQXJ0d29yayA9IGFsbEFydHdvcmsuX2VtYmVkZGVkLmFydHdvcmtzWzNdLnRpdGxlO1xuLy8gICAgICAgICBkZWdhc1RoZURhbmNlTGVzc29uID0gYWxsQXJ0d29yay5fZW1iZWRkZWQuYXJ0d29ya3NbM10uX2xpbmtzLnRodW1ibmFpbC5ocmVmXG4vLyAgICAgICAgIGRpc3BsYXlEZWdhcygpXG4vLyAgICAgfSlcbi8vIH1cbi8vXG4vLyB2YXIgZGlzcGxheURlZ2FzID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgZWxEZWdhc0Jpby5pbm5lckhUTUwgPSBkZWdhc1xuLy8gICAgIGVsRGVnYXNMaW5rLmlubmVySFRNTCA9IGRlZ2FzQXJ0d29ya1xuLy8gICAgIGVsRGVnYXNBcnQuc3JjPWRlZ2FzVGhlRGFuY2VMZXNzb25cbi8vXG4vLyAgICAgZWxmaXJzdEFydGlzdC5pbm5lckhUTUwgPSBhcnRpc3RBcnJheVswXS5uYW1lXG4vLyAgICAgZWxmaXJzdEltYWdlLnNyYz1hcnR3b3JrQXJyYXlbMF1cbi8vXG4vLyAgICAgZWxzZWNvbmRBcnRpc3QuaW5uZXJIVE1MID0gYXJ0aXN0QXJyYXlbMV0ubmFtZVxuLy8gICAgIGVsc2Vjb25kSW1hZ2Uuc3JjPWFydHdvcmtBcnJheVsxXVxuLy9cbi8vICAgICBlbHRoaXJkQXJ0aXN0LmlubmVySFRNTCA9IGFydGlzdEFycmF5WzJdLm5hbWVcbi8vICAgICAvL2VsdGhpcmRJbWFnZS5zcmM9YXJ0d29ya0FycmF5WzJdICAvLyBUaGlzIGFydGlzdCBkb2VzIG5vdCBoYXZlIGFydHdvcmtcbi8vXG4vLyAgICAgZWxmb3VydGhBcnRpc3QuaW5uZXJIVE1MID0gYXJ0aXN0QXJyYXlbM10ubmFtZVxuLy8gICAgIC8vZWxmb3VydGhJbWFnZS5zcmM9YXJ0d29ya0FycmF5WzNdICAvL1RoaXMgYXJ0aXN0IGRvZXMgbm90IGhhdmUgYXJ0d29ya1xuLy8gfVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290ID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvd1xuICA/ICh0aGlzIHx8IHNlbGYpXG4gIDogd2luZG93O1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAmJiAoIXJvb3QubG9jYXRpb24gfHwgJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgncmVzcG9uc2UnLCByZXMpO1xuXG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICAgIH1cblxuICAgIGlmIChyZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgdmFyIG5ld19lcnIgPSBuZXcgRXJyb3IocmVzLnN0YXR1c1RleHQgfHwgJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJyk7XG4gICAgbmV3X2Vyci5vcmlnaW5hbCA9IGVycjtcbiAgICBuZXdfZXJyLnJlc3BvbnNlID0gcmVzO1xuICAgIG5ld19lcnIuc3RhdHVzID0gcmVzLnN0YXR1cztcblxuICAgIHNlbGYuY2FsbGJhY2sobmV3X2VyciwgcmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51bnNldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgZmlsZW5hbWVgLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaChuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbihmaWVsZCwgZmlsZSwgZmlsZW5hbWUpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChmaWVsZCwgZmlsZSwgZmlsZW5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAsIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gcXVlcnlzdHJpbmdcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtdWx0aXBsZSBkYXRhIFwid3JpdGVzXCJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLnNlbmQoeyBzZWFyY2g6ICdxdWVyeScgfSlcbiAqICAgICAgICAgLnNlbmQoeyByYW5nZTogJzEuLjUnIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgb3JkZXI6ICdkZXNjJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAgKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAgKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSl7XG4gIHZhciBvYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKG9iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmogfHwgaXNIb3N0KGRhdGEpKSByZXR1cm4gdGhpcztcbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCByZXMpe1xuICB2YXIgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgZm4oZXJyLCByZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICgwID09IHN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gIH07XG4gIGlmICh0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgIHhoci5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAoeGhyLnVwbG9hZCAmJiB0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICAvLyBBY2Nlc3NpbmcgeGhyLnVwbG9hZCBmYWlscyBpbiBJRSBmcm9tIGEgd2ViIHdvcmtlciwgc28ganVzdCBwcmV0ZW5kIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzgzNzI0NS94bWxodHRwcmVxdWVzdC11cGxvYWQtdGhyb3dzLWludmFsaWQtYXJndW1lbnQtd2hlbi11c2VkLWZyb20td2ViLXdvcmtlci1jb250ZXh0XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi50aW1lZG91dCA9IHRydWU7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgY29udGVudFR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgdmFyIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplW2NvbnRlbnRUeXBlID8gY29udGVudFR5cGUuc3BsaXQoJzsnKVswXSA6ICcnXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGYXV4IHByb21pc2Ugc3VwcG9ydFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdFxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGwsIHJlamVjdCkge1xuICByZXR1cm4gdGhpcy5lbmQoZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICBlcnIgPyByZWplY3QoZXJyKSA6IGZ1bGZpbGwocmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZGVsID0gZnVuY3Rpb24odXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIlxuLyoqXG4gKiBSZWR1Y2UgYGFycmAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxcbiAqXG4gKiBUT0RPOiBjb21iYXRpYmxlIGVycm9yIGhhbmRsaW5nP1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbiwgaW5pdGlhbCl7ICBcbiAgdmFyIGlkeCA9IDA7XG4gIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICB2YXIgY3VyciA9IGFyZ3VtZW50cy5sZW5ndGggPT0gM1xuICAgID8gaW5pdGlhbFxuICAgIDogYXJyW2lkeCsrXTtcblxuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgY3VyciA9IGZuLmNhbGwobnVsbCwgY3VyciwgYXJyW2lkeF0sICsraWR4LCBhcnIpO1xuICB9XG4gIFxuICByZXR1cm4gY3Vycjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFsZnJlZCA9IHJlcXVpcmUoJ2hhbGZyZWQnKTtcblxuZnVuY3Rpb24gSnNvbkhhbEFkYXB0ZXIobG9nKSB7XG4gIHRoaXMubG9nID0gbG9nO1xufVxuXG5Kc29uSGFsQWRhcHRlci5tZWRpYVR5cGUgPSAnYXBwbGljYXRpb24vaGFsK2pzb24nO1xuXG4vLyBUT0RPIFBhc3MgdGhlIHRyYXZlcnNhbCBzdGF0ZSBpbnRvIHRoZSBhZGFwdGVyLi4uIGFuZCBwb3NzaWJseSBhbHNvIG9ubHlcbi8vIG1vZGlmeSBpdCwgZG8gbm90IHJldHVybiBhbnl0aGluZy5cbkpzb25IYWxBZGFwdGVyLnByb3RvdHlwZS5maW5kTmV4dFN0ZXAgPSBmdW5jdGlvbihkb2MsIGtleSwgcHJlZmVyRW1iZWRkZWQpIHtcbiAgdGhpcy5sb2cuZGVidWcoJ3BhcnNpbmcgaGFsJyk7XG4gIHZhciBjdHggPSB7XG4gICAgZG9jOiBkb2MsXG4gICAgaGFsUmVzb3VyY2U6IGhhbGZyZWQucGFyc2UoZG9jKSxcbiAgICBwYXJzZWRLZXk6IHBhcnNlS2V5KGtleSksXG4gICAgbGlua1N0ZXA6IG51bGwsXG4gICAgZW1iZWRkZWRTdGVwOiBudWxsLFxuICB9O1xuICByZXNvbHZlQ3VyaWUoY3R4KTtcbiAgZmluZExpbmsoY3R4LCB0aGlzLmxvZyk7XG4gIGZpbmRFbWJlZGRlZChjdHgsIHRoaXMubG9nKTtcbiAgcmV0dXJuIHByZXBhcmVSZXN1bHQoY3R4LCBrZXksIHByZWZlckVtYmVkZGVkKTtcbn07XG5cbmZ1bmN0aW9uIHByZXBhcmVSZXN1bHQoY3R4LCBrZXksIHByZWZlckVtYmVkZGVkKSB7XG4gIHZhciBzdGVwO1xuICBpZiAocHJlZmVyRW1iZWRkZWQgfHwgY3R4LnBhcnNlZEtleS5tb2RlID09PSAnYWxsJykge1xuICAgIHN0ZXAgPSBjdHguZW1iZWRkZWRTdGVwIHx8IGN0eC5saW5rU3RlcDtcbiAgfSBlbHNlIHtcbiAgICBzdGVwID0gY3R4LmxpbmtTdGVwIHx8IGN0eC5lbWJlZGRlZFN0ZXA7XG4gIH1cblxuICBpZiAoc3RlcCkge1xuICAgIHJldHVybiBzdGVwO1xuICB9IGVsc2Uge1xuICAgIHZhciBtZXNzYWdlID0gJ0NvdWxkIG5vdCBmaW5kIGEgbWF0Y2hpbmcgbGluayBub3IgYW4gZW1iZWRkZWQgZG9jdW1lbnQgJytcbiAgICAgICdmb3IgJyArIGtleSArICcuJztcbiAgICBpZiAoY3R4LmxpbmtFcnJvcikge1xuICAgICAgbWVzc2FnZSArPSAnIEVycm9yIHdoaWxlIHJlc29sdmluZyBsaW5rZWQgZG9jdW1lbnRzOiAnICsgY3R4LmxpbmtFcnJvcjtcbiAgICB9XG4gICAgaWYgKGN0eC5lbWJlZGRlZEVycm9yKSB7XG4gICAgICBtZXNzYWdlICs9ICcgRXJyb3Igd2hpbGUgcmVzb2x2aW5nIGVtYmVkZGVkIGRvY3VtZW50czogJyArXG4gICAgICAgIGN0eC5lbWJlZGRlZEVycm9yO1xuICAgIH1cbiAgICBtZXNzYWdlICs9ICcgRG9jdW1lbnQ6ICcgKyBKU09OLnN0cmluZ2lmeShjdHguZG9jKTtcblxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUtleShrZXkpIHtcbiAgdmFyIG1hdGNoID0ga2V5Lm1hdGNoKC8oLiopXFxbKC4qKTooLiopXFxdLyk7XG4gIC8vIGVhOmFkbWluW3RpdGxlOkthdGVdID0+IGFjY2VzcyBieSBzZWNvbmRhcnkga2V5XG4gIGlmIChtYXRjaCkge1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlOiAnc2Vjb25kYXJ5JyxcbiAgICAgIGtleTogbWF0Y2hbMV0sXG4gICAgICBzZWNvbmRhcnlLZXk6IG1hdGNoWzJdLFxuICAgICAgc2Vjb25kYXJ5VmFsdWU6IG1hdGNoWzNdLFxuICAgICAgaW5kZXg6IG51bGwsXG4gICAgfTtcbiAgfVxuICAvLyBlYTpvcmRlclszXSA9PiBpbmRleCBhY2Nlc3MgaW50byBlbWJlZGRlZCBhcnJheVxuICBtYXRjaCA9IGtleS5tYXRjaCgvKC4qKVxcWyhcXGQrKVxcXS8pO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kZTogJ2luZGV4JyxcbiAgICAgIGtleTogbWF0Y2hbMV0sXG4gICAgICBzZWNvbmRhcnlLZXk6IG51bGwsXG4gICAgICBzZWNvbmRhcnlWYWx1ZTogbnVsbCxcbiAgICAgIGluZGV4OiBtYXRjaFsyXSxcbiAgICB9O1xuICB9XG4gIC8vIGVhOm9yZGVyWyRhbGxdID0+IG1ldGEta2V5LCByZXR1cm4gZnVsbCBhcnJheVxuICBtYXRjaCA9IGtleS5tYXRjaCgvKC4qKVxcW1xcJGFsbFxcXS8pO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kZTogJ2FsbCcsXG4gICAgICBrZXk6IG1hdGNoWzFdLFxuICAgICAgc2Vjb25kYXJ5S2V5OiBudWxsLFxuICAgICAgc2Vjb25kYXJ5VmFsdWU6IG51bGwsXG4gICAgICBpbmRleDogbnVsbCxcbiAgICB9O1xuICB9XG4gIC8vIGVhOm9yZGVyID0+IHNpbXBsZSBsaW5rIHJlbGF0aW9uXG4gIHJldHVybiB7XG4gICAgbW9kZTogJ2ZpcnN0JyxcbiAgICBrZXk6IGtleSxcbiAgICBzZWNvbmRhcnlLZXk6IG51bGwsXG4gICAgc2Vjb25kYXJ5VmFsdWU6IG51bGwsXG4gICAgaW5kZXg6IG51bGwsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDdXJpZShjdHgpIHtcbiAgaWYgKGN0eC5oYWxSZXNvdXJjZS5oYXNDdXJpZXMoKSkge1xuICAgIGN0eC5wYXJzZWRLZXkuY3VyaWUgPVxuICAgICAgY3R4LmhhbFJlc291cmNlLnJldmVyc2VSZXNvbHZlQ3VyaWUoY3R4LnBhcnNlZEtleS5rZXkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRMaW5rKGN0eCwgbG9nKSB7XG4gIHZhciBsaW5rQXJyYXkgPSBjdHguaGFsUmVzb3VyY2UubGlua0FycmF5KGN0eC5wYXJzZWRLZXkua2V5KTtcbiAgaWYgKCFsaW5rQXJyYXkpIHtcbiAgICBsaW5rQXJyYXkgPSBjdHguaGFsUmVzb3VyY2UubGlua0FycmF5KGN0eC5wYXJzZWRLZXkuY3VyaWUpO1xuICB9XG4gIGlmICghbGlua0FycmF5IHx8IGxpbmtBcnJheS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzd2l0Y2ggKGN0eC5wYXJzZWRLZXkubW9kZSkge1xuICAgIGNhc2UgJ3NlY29uZGFyeSc6XG4gICAgICBmaW5kTGlua0J5U2Vjb25kYXJ5S2V5KGN0eCwgbGlua0FycmF5LCBsb2cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW5kZXgnOlxuICAgICAgZmluZExpbmtCeUluZGV4KGN0eCwgbGlua0FycmF5LCBsb2cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmlyc3QnOlxuICAgICAgZmluZExpbmtXaXRob3V0SW5kZXgoY3R4LCBsaW5rQXJyYXksIGxvZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIG1vZGU6ICcgKyBjdHgucGFyc2VkS2V5Lm1vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRMaW5rQnlTZWNvbmRhcnlLZXkoY3R4LCBsaW5rQXJyYXksIGxvZykge1xuICAvLyBjbGllbnQgc2VsZWN0ZWQgYSBzcGVjaWZpYyBsaW5rIGJ5IGFuIGV4cGxpY2l0IHNlY29uZGFyeSBrZXkgbGlrZSAnbmFtZScsXG4gIC8vIHNvIHVzZSBpdCBvciBmYWlsXG4gIHZhciBpID0gMDtcbiAgZm9yICg7IGkgPCBsaW5rQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdmFsID0gbGlua0FycmF5W2ldW2N0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5S2V5XTtcbiAgICAvKiBqc2hpbnQgLVcxMTYgKi9cbiAgICBpZiAodmFsICE9IG51bGwgJiYgdmFsID09IGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5VmFsdWUpIHtcbiAgICAgIGlmICghbGlua0FycmF5W2ldLmhyZWYpIHtcbiAgICAgICAgY3R4LmxpbmtFcnJvciA9ICdUaGUgbGluayAnICsgY3R4LnBhcnNlZEtleS5rZXkgKyAnWycgK1xuICAgICAgICAgIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5S2V5ICsgJzonICsgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlWYWx1ZSArXG4gICAgICAgICAgICAnXSBleGlzdHMsIGJ1dCBpdCBoYXMgbm8gaHJlZiBhdHRyaWJ1dGUuJztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nLmRlYnVnKCdmb3VuZCBoYWwgbGluazogJyArIGxpbmtBcnJheVtpXS5ocmVmKTtcbiAgICAgIGN0eC5saW5rU3RlcCA9IHsgdXJsOiBsaW5rQXJyYXlbaV0uaHJlZiB9O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvKiBqc2hpbnQgK1cxMTYgKi9cbiAgfVxuICBjdHgubGlua0Vycm9yID0gY3R4LnBhcnNlZEtleS5rZXkgKyAnWycgKyBjdHgucGFyc2VkS2V5LnNlY29uZGFyeUtleSArICc6JyArXG4gICAgICBjdHgucGFyc2VkS2V5LnNlY29uZGFyeVZhbHVlICtcbiAgICAgJ10gcmVxdWVzdGVkLCBidXQgdGhlcmUgaXMgbm8gc3VjaCBsaW5rLic7XG59XG5cbmZ1bmN0aW9uIGZpbmRMaW5rQnlJbmRleChjdHgsIGxpbmtBcnJheSwgbG9nKSB7XG4gIC8vIGNsaWVudCBzcGVjaWZpZWQgYW4gZXhwbGljaXQgYXJyYXkgaW5kZXggZm9yIHRoaXMgbGluaywgc28gdXNlIGl0IG9yIGZhaWxcbiAgaWYgKCFsaW5rQXJyYXlbY3R4LnBhcnNlZEtleS5pbmRleF0pIHtcbiAgICBjdHgubGlua0Vycm9yID0gJ1RoZSBsaW5rIGFycmF5ICcgKyBjdHgucGFyc2VkS2V5LmtleSArXG4gICAgICAgICcgZXhpc3RzLCBidXQgaGFzIG5vIGVsZW1lbnQgYXQgaW5kZXggJyArIGN0eC5wYXJzZWRLZXkuaW5kZXggKyAnLic7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghbGlua0FycmF5W2N0eC5wYXJzZWRLZXkuaW5kZXhdLmhyZWYpIHtcbiAgICBjdHgubGlua0Vycm9yID0gJ1RoZSBsaW5rICcgKyBjdHgucGFyc2VkS2V5LmtleSArICdbJyArXG4gICAgICBjdHgucGFyc2VkS2V5LmluZGV4ICsgJ10gZXhpc3RzLCBidXQgaXQgaGFzIG5vIGhyZWYgYXR0cmlidXRlLic7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxvZy5kZWJ1ZygnZm91bmQgaGFsIGxpbms6ICcgKyBsaW5rQXJyYXlbY3R4LnBhcnNlZEtleS5pbmRleF0uaHJlZik7XG4gIGN0eC5saW5rU3RlcCA9IHsgdXJsOiBsaW5rQXJyYXlbY3R4LnBhcnNlZEtleS5pbmRleF0uaHJlZiB9O1xufVxuXG5mdW5jdGlvbiBmaW5kTGlua1dpdGhvdXRJbmRleChjdHgsIGxpbmtBcnJheSwgbG9nKSB7XG4gIC8vIGNsaWVudCBkaWQgbm90IHNwZWNpZnkgYW4gYXJyYXkgaW5kZXggZm9yIHRoaXMgbGluaywgYXJiaXRyYXJpbHkgY2hvb3NlXG4gIC8vIHRoZSBmaXJzdCB0aGF0IGhhcyBhIGhyZWYgYXR0cmlidXRlXG4gIHZhciBsaW5rO1xuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGlua0FycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGlmIChsaW5rQXJyYXlbaW5kZXhdLmhyZWYpIHtcbiAgICAgIGxpbmsgPSBsaW5rQXJyYXlbaW5kZXhdO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChsaW5rKSB7XG4gICAgaWYgKGxpbmtBcnJheS5sZW5ndGggPiAxKSB7XG4gICAgICBsb2cud2FybignRm91bmQgSEFMIGxpbmsgYXJyYXkgd2l0aCBtb3JlIHRoYW4gb25lIGVsZW1lbnQgZm9yICcgK1xuICAgICAgICAgICdrZXkgJyArIGN0eC5wYXJzZWRLZXkua2V5ICsgJywgYXJiaXRyYXJpbHkgY2hvb3NpbmcgaW5kZXggJyArIGluZGV4ICtcbiAgICAgICAgICAnLCBiZWNhdXNlIGl0IHdhcyB0aGUgZmlyc3QgdGhhdCBoYWQgYSBocmVmIGF0dHJpYnV0ZS4nKTtcbiAgICB9XG4gICAgbG9nLmRlYnVnKCdmb3VuZCBoYWwgbGluazogJyArIGxpbmsuaHJlZik7XG4gICAgY3R4LmxpbmtTdGVwID0geyB1cmw6IGxpbmsuaHJlZiB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRFbWJlZGRlZChjdHgsIGxvZykge1xuICBsb2cuZGVidWcoJ2NoZWNraW5nIGZvciBlbWJlZGRlZDogJyArIGN0eC5wYXJzZWRLZXkua2V5ICtcbiAgICAgIChjdHgucGFyc2VkS2V5LmluZGV4ID8gY3R4LnBhcnNlZEtleS5pbmRleCA6ICcnKSk7XG5cbiAgdmFyIHJlc291cmNlQXJyYXkgPSBjdHguaGFsUmVzb3VyY2UuZW1iZWRkZWRBcnJheShjdHgucGFyc2VkS2V5LmtleSk7XG4gIGlmICghcmVzb3VyY2VBcnJheSB8fCByZXNvdXJjZUFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxvZy5kZWJ1ZygnRm91bmQgYW4gYXJyYXkgb2YgZW1iZWRkZWQgcmVzb3VyY2UgZm9yOiAnICsgY3R4LnBhcnNlZEtleS5rZXkpO1xuXG4gIHN3aXRjaCAoY3R4LnBhcnNlZEtleS5tb2RlKSB7XG4gICAgY2FzZSAnc2Vjb25kYXJ5JzpcbiAgICAgIGZpbmRFbWJlZGRlZEJ5U2Vjb25kYXJ5S2V5KGN0eCwgcmVzb3VyY2VBcnJheSwgbG9nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgIGZpbmRFbWJlZGRlZEJ5SW5kZXgoY3R4LCByZXNvdXJjZUFycmF5LCBsb2cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIGZpbmRFbWJlZGRlZEFsbChjdHgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmlyc3QnOlxuICAgICAgZmluZEVtYmVkZGVkV2l0aG91dEluZGV4KGN0eCwgcmVzb3VyY2VBcnJheSwgbG9nKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lsbGVnYWwgbW9kZTogJyArIGN0eC5wYXJzZWRLZXkubW9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmluZEVtYmVkZGVkQnlTZWNvbmRhcnlLZXkoY3R4LCBlbWJlZGRlZEFycmF5LCBsb2cpIHtcbiAgLy8gY2xpZW50IHNlbGVjdGVkIGEgc3BlY2lmaWMgZW1iZWQgYnkgYW4gZXhwbGljaXQgc2Vjb25kYXJ5IGtleSxcbiAgLy8gc28gdXNlIGl0IG9yIGZhaWxcbiAgdmFyIGkgPSAwO1xuICBmb3IgKDsgaSA8IGVtYmVkZGVkQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdmFsID0gZW1iZWRkZWRBcnJheVtpXVtjdHgucGFyc2VkS2V5LnNlY29uZGFyeUtleV07XG4gICAgLyoganNoaW50IC1XMTE2ICovXG4gICAgaWYgKHZhbCAhPSBudWxsICYmIHZhbCA9PSBjdHgucGFyc2VkS2V5LnNlY29uZGFyeVZhbHVlKSB7XG4gICAgICBsb2cuZGVidWcoJ0ZvdW5kIGFuIGVtYmVkZGVkIHJlc291cmNlIGZvcjogJyArIGN0eC5wYXJzZWRLZXkua2V5ICsgJ1snICtcbiAgICAgIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5S2V5ICsgJzonICsgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlWYWx1ZSArICddJyk7XG4gICAgICBjdHguZW1iZWRkZWRTdGVwID0geyBkb2M6IGVtYmVkZGVkQXJyYXlbaV0ub3JpZ2luYWwoKSB9O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvKiBqc2hpbnQgK1cxMTYgKi9cbiAgfVxuICBjdHguZW1iZWRkZWRFcnJvciA9IGN0eC5wYXJzZWRLZXkua2V5ICsgJ1snICsgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlLZXkgK1xuICAgICc6JyArIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5VmFsdWUgK1xuICAgICddIHJlcXVlc3RlZCwgYnV0IHRoZSBlbWJlZGRlZCBhcnJheSAnICsgY3R4LnBhcnNlZEtleS5rZXkgK1xuICAgICcgaGFzIG5vIHN1Y2ggZWxlbWVudC4nO1xufVxuXG5mdW5jdGlvbiBmaW5kRW1iZWRkZWRCeUluZGV4KGN0eCwgcmVzb3VyY2VBcnJheSwgbG9nKSB7XG4gIC8vIGNsaWVudCBzcGVjaWZpZWQgYW4gZXhwbGljaXQgYXJyYXkgaW5kZXgsIHNvIHVzZSBpdCBvciBmYWlsXG4gIGlmICghcmVzb3VyY2VBcnJheVtjdHgucGFyc2VkS2V5LmluZGV4XSkge1xuICAgIGN0eC5lbWJlZGRlZEVycm9yID0gJ1RoZSBlbWJlZGRlZCBhcnJheSAnICsgY3R4LnBhcnNlZEtleS5rZXkgK1xuICAgICAgJyBleGlzdHMsIGJ1dCBoYXMgbm8gZWxlbWVudCBhdCBpbmRleCAnICsgY3R4LnBhcnNlZEtleS5pbmRleCArICcuJztcbiAgICByZXR1cm47XG4gIH1cbiAgbG9nLmRlYnVnKCdGb3VuZCBhbiBlbWJlZGRlZCByZXNvdXJjZSBmb3I6ICcgKyBjdHgucGFyc2VkS2V5LmtleSArICdbJyArXG4gICAgICBjdHgucGFyc2VkS2V5LmluZGV4ICsgJ10nKTtcbiAgY3R4LmVtYmVkZGVkU3RlcCA9IHtcbiAgICBkb2M6IHJlc291cmNlQXJyYXlbY3R4LnBhcnNlZEtleS5pbmRleF0ub3JpZ2luYWwoKVxuICB9O1xufVxuXG5mdW5jdGlvbiBmaW5kRW1iZWRkZWRBbGwoY3R4KSB7XG4gIGN0eC5lbWJlZGRlZFN0ZXAgPSB7XG4gICAgZG9jOiBjdHguaGFsUmVzb3VyY2Uub3JpZ2luYWwoKS5fZW1iZWRkZWRbY3R4LnBhcnNlZEtleS5rZXldXG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpbmRFbWJlZGRlZFdpdGhvdXRJbmRleChjdHgsIHJlc291cmNlQXJyYXksIGxvZykge1xuICAvLyBjbGllbnQgZGlkIG5vdCBzcGVjaWZ5IGFuIGFycmF5IGluZGV4LCBhcmJpdHJhcmlseSBjaG9vc2UgZmlyc3RcbiAgaWYgKHJlc291cmNlQXJyYXkubGVuZ3RoID4gMSkge1xuICAgIGxvZy53YXJuKCdGb3VuZCBIQUwgZW1iZWRkZWQgcmVzb3VyY2UgYXJyYXkgd2l0aCBtb3JlIHRoYW4gb25lIGVsZW1lbnQgJyArXG4gICAgICAnIGZvciBrZXkgJyArIGN0eC5wYXJzZWRLZXkua2V5ICtcbiAgICAgICcsIGFyYml0cmFyaWx5IGNob29zaW5nIGZpcnN0IGVsZW1lbnQuJyk7XG4gIH1cbiAgY3R4LmVtYmVkZGVkU3RlcCA9IHsgZG9jOiByZXNvdXJjZUFycmF5WzBdLm9yaWdpbmFsKCkgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBKc29uSGFsQWRhcHRlcjtcbiIsInZhciBQYXJzZXIgPSByZXF1aXJlKCcuL2xpYi9wYXJzZXInKVxuICAsIHZhbGlkYXRpb25GbGFnID0gZmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHBhcnNlOiBmdW5jdGlvbih1bnBhcnNlZCkge1xuICAgIHJldHVybiBuZXcgUGFyc2VyKCkucGFyc2UodW5wYXJzZWQsIHZhbGlkYXRpb25GbGFnKTtcbiAgfSxcblxuICBlbmFibGVWYWxpZGF0aW9uOiBmdW5jdGlvbihmbGFnKSB7XG4gICAgdmFsaWRhdGlvbkZsYWcgPSAoZmxhZyAhPSBudWxsKSA/IGZsYWcgOiB0cnVlO1xuICB9LFxuXG4gIGRpc2FibGVWYWxpZGF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YWxpZGF0aW9uRmxhZyA9IGZhbHNlO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKlxuICogQSB2ZXJ5IG5haXZlIGNvcHktb24td3JpdGUgaW1tdXRhYmxlIHN0YWNrLiBTaW5jZSB0aGUgc2l6ZSBvZiB0aGUgc3RhY2tcbiAqIGlzIGVxdWFsIHRvIHRoZSBkZXB0aCBvZiB0aGUgZW1iZWRkZWQgcmVzb3VyY2VzIGZvciBvbmUgSEFMIHJlc291cmNlLCB0aGUgYmFkXG4gKiBwZXJmb3JtYW5jZSBmb3IgdGhlIGNvcHktb24td3JpdGUgYXBwcm9hY2ggaXMgcHJvYmFibHkgbm90IGEgcHJvYmxlbSBhdCBhbGwuXG4gKiBNaWdodCBiZSByZXBsYWNlZCBieSBhIHNtYXJ0ZXIgc29sdXRpb24gbGF0ZXIuIE9yIG5vdC4gV2hhdGV2ZXIuXG4gKi9cbmZ1bmN0aW9uIEltbXV0YWJsZVN0YWNrKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAxKSB7XG4gICAgdGhpcy5fYXJyYXkgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fYXJyYXkgPSBbXTtcbiAgfVxufVxuXG5JbW11dGFibGVTdGFjay5wcm90b3R5cGUuYXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2FycmF5O1xufTtcblxuSW1tdXRhYmxlU3RhY2sucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbihhcnJheSkge1xuICByZXR1cm4gdGhpcy5fYXJyYXkubGVuZ3RoID09PSAwO1xufTtcblxuSW1tdXRhYmxlU3RhY2sucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHZhciBhcnJheSA9IHRoaXMuX2FycmF5LnNsaWNlKDApO1xuICBhcnJheS5wdXNoKGVsZW1lbnQpO1xuICByZXR1cm4gbmV3IEltbXV0YWJsZVN0YWNrKGFycmF5KTtcbn07XG5cbkltbXV0YWJsZVN0YWNrLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGFycmF5ID0gdGhpcy5fYXJyYXkuc2xpY2UoMCwgdGhpcy5fYXJyYXkubGVuZ3RoIC0gMSk7XG4gIHJldHVybiBuZXcgSW1tdXRhYmxlU3RhY2soYXJyYXkpO1xufTtcblxuSW1tdXRhYmxlU3RhY2sucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuaXNFbXB0eSgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYW5cXCd0IHBlZWsgb24gZW1wdHkgc3RhY2snKTtcbiAgfVxuICByZXR1cm4gdGhpcy5fYXJyYXlbdGhpcy5fYXJyYXkubGVuZ3RoIC0gMV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltbXV0YWJsZVN0YWNrO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVzb3VyY2UgPSByZXF1aXJlKCcuL3Jlc291cmNlJylcbiAgLCBTdGFjayA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlX3N0YWNrJyk7XG5cbnZhciBsaW5rU3BlYyA9IHtcbiAgaHJlZjogeyByZXF1aXJlZDogdHJ1ZSwgZGVmYXVsdFZhbHVlOiBudWxsIH0sXG4gIHRlbXBsYXRlZDogeyByZXF1aXJlZDogZmFsc2UsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSxcbiAgdHlwZTogeyByZXF1aXJlZDogZmFsc2UsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICBkZXByZWNhdGlvbjogeyByZXF1aXJlZDogZmFsc2UsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICBuYW1lOiB7IHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdFZhbHVlOiBudWxsIH0sXG4gIHByb2ZpbGU6IHsgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgdGl0bGU6IHsgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgaHJlZmxhbmc6IHsgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0VmFsdWU6IG51bGwgfVxufTtcblxuZnVuY3Rpb24gUGFyc2VyKCkge1xufVxuXG5QYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UodW5wYXJzZWQsIHZhbGlkYXRpb25GbGFnKSB7XG4gIHZhciB2YWxpZGF0aW9uID0gdmFsaWRhdGlvbkZsYWcgPyBbXSA6IG51bGw7XG4gIHJldHVybiBfcGFyc2UodW5wYXJzZWQsIHZhbGlkYXRpb24sIG5ldyBTdGFjaygpKTtcbn07XG5cbmZ1bmN0aW9uIF9wYXJzZSh1bnBhcnNlZCwgdmFsaWRhdGlvbiwgcGF0aCkge1xuICBpZiAodW5wYXJzZWQgPT0gbnVsbCkge1xuICAgIHJldHVybiB1bnBhcnNlZDtcbiAgfVxuICB2YXIgYWxsTGlua0FycmF5cyA9IHBhcnNlTGlua3ModW5wYXJzZWQuX2xpbmtzLCB2YWxpZGF0aW9uLFxuICAgICAgcGF0aC5wdXNoKCdfbGlua3MnKSk7XG4gIHZhciBjdXJpZXMgPSBwYXJzZUN1cmllcyhhbGxMaW5rQXJyYXlzKTtcbiAgdmFyIGFsbEVtYmVkZGVkQXJyYXlzID0gcGFyc2VFbWJlZGRlZFJlc291cmNlc3ModW5wYXJzZWQuX2VtYmVkZGVkLFxuICAgICAgdmFsaWRhdGlvbiwgcGF0aC5wdXNoKCdfZW1iZWRkZWQnKSk7XG4gIHZhciByZXNvdXJjZSA9IG5ldyBSZXNvdXJjZShhbGxMaW5rQXJyYXlzLCBjdXJpZXMsIGFsbEVtYmVkZGVkQXJyYXlzLFxuICAgICAgdmFsaWRhdGlvbik7XG4gIGNvcHlOb25IYWxQcm9wZXJ0aWVzKHVucGFyc2VkLCByZXNvdXJjZSk7XG4gIHJlc291cmNlLl9vcmlnaW5hbCA9IHVucGFyc2VkO1xuICByZXR1cm4gcmVzb3VyY2U7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTGlua3MobGlua3MsIHZhbGlkYXRpb24sIHBhdGgpIHtcbiAgbGlua3MgPSBwYXJzZUhhbFByb3BlcnR5KGxpbmtzLCBwYXJzZUxpbmssIHZhbGlkYXRpb24sIHBhdGgpO1xuICBpZiAobGlua3MgPT0gbnVsbCB8fCBsaW5rcy5zZWxmID09IG51bGwpIHtcbiAgICAvLyBObyBsaW5rcyBhdCBhbGw/IFRoZW4gaXQgaW1wbGljdGx5IG1pc3NlcyB0aGUgc2VsZiBsaW5rIHdoaWNoIGl0IFNIT1VMRFxuICAgIC8vIGhhdmUgYWNjb3JkaW5nIHRvIHNwZWNcbiAgICByZXBvcnRWYWxpZGF0aW9uSXNzdWUoJ1Jlc291cmNlIGRvZXMgbm90IGhhdmUgYSBzZWxmIGxpbmsnLCB2YWxpZGF0aW9uLFxuICAgICAgICBwYXRoKTtcbiAgfVxuICByZXR1cm4gbGlua3M7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ3VyaWVzKGxpbmtBcnJheXMpIHtcbiAgaWYgKGxpbmtBcnJheXMpIHtcbiAgICByZXR1cm4gbGlua0FycmF5cy5jdXJpZXM7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRW1iZWRkZWRSZXNvdXJjZXNzKG9yaWdpbmFsLCBwYXJlbnRWYWxpZGF0aW9uLCBwYXRoKSB7XG4gIHZhciBlbWJlZGRlZCA9IHBhcnNlSGFsUHJvcGVydHkob3JpZ2luYWwsIGlkZW50aXR5LCBwYXJlbnRWYWxpZGF0aW9uLCBwYXRoKTtcbiAgaWYgKGVtYmVkZGVkID09IG51bGwpIHtcbiAgICByZXR1cm4gZW1iZWRkZWQ7XG4gIH1cbiAgT2JqZWN0LmtleXMoZW1iZWRkZWQpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgZW1iZWRkZWRba2V5XSA9IGVtYmVkZGVkW2tleV0ubWFwKGZ1bmN0aW9uKGVtYmVkZGVkRWxlbWVudCkge1xuICAgICAgdmFyIGNoaWxkVmFsaWRhdGlvbiA9IHBhcmVudFZhbGlkYXRpb24gIT0gbnVsbCA/IFtdIDogbnVsbDtcbiAgICAgIHZhciBlbWJlZGRlZFJlc291cmNlID0gX3BhcnNlKGVtYmVkZGVkRWxlbWVudCwgY2hpbGRWYWxpZGF0aW9uLFxuICAgICAgICAgIHBhdGgucHVzaChrZXkpKTtcbiAgICAgIGVtYmVkZGVkUmVzb3VyY2UuX29yaWdpbmFsID0gZW1iZWRkZWRFbGVtZW50O1xuICAgICAgcmV0dXJuIGVtYmVkZGVkUmVzb3VyY2U7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZW1iZWRkZWQ7XG59XG5cbi8qXG4gKiBDb3B5IG92ZXIgbm9uLWhhbCBwcm9wZXJ0aWVzIChldmVyeXRoaW5nIHRoYXQgaXMgbm90IF9saW5rcyBvciBfZW1iZWRkZWQpXG4gKiB0byB0aGUgcGFyc2VkIHJlc291cmNlLlxuICovXG5mdW5jdGlvbiBjb3B5Tm9uSGFsUHJvcGVydGllcyh1bnBhcnNlZCwgcmVzb3VyY2UpIHtcbiAgT2JqZWN0LmtleXModW5wYXJzZWQpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKGtleSAhPT0gJ19saW5rcycgJiYga2V5ICE9PSAnX2VtYmVkZGVkJykge1xuICAgICAgcmVzb3VyY2Vba2V5XSA9IHVucGFyc2VkW2tleV07XG4gICAgfVxuICB9KTtcbn1cblxuLypcbiAqIFByb2Nlc3NlcyBvbmUgb2YgdGhlIHR3byBtYWluIGhhbCBwcm9wZXJ0aWVzLCB0aGF0IGlzIF9saW5rcyBvciBfZW1iZWRkZWQuXG4gKiBFYWNoIHN1Yi1wcm9wZXJ0eSBpcyB0dXJuZWQgaW50byBhIHNpbmdsZSBlbGVtZW50IGFycmF5IGlmIGl0IGlzbid0IGFscmVhZHlcbiAqIGFuIGFycmF5LiBwcm9jZXNzaW5nRnVuY3Rpb24gaXMgYXBwbGllZCB0byBlYWNoIGFycmF5IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlSGFsUHJvcGVydHkocHJvcGVydHksIHByb2Nlc3NpbmdGdW5jdGlvbiwgdmFsaWRhdGlvbiwgcGF0aCkge1xuICBpZiAocHJvcGVydHkgPT0gbnVsbCkge1xuICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgfVxuXG4gIC8vIGNyZWF0ZSBhIHNoYWxsb3cgY29weSBvZiB0aGUgX2xpbmtzL19lbWJlZGRlZCBvYmplY3RcbiAgdmFyIGNvcHkgPSB7fTtcblxuICAvLyBub3JtYWxpemUgZWFjaCBsaW5rL2VhY2ggZW1iZWRkZWQgb2JqZWN0IGFuZCBwdXQgaXQgaW50byBvdXIgY29weVxuICBPYmplY3Qua2V5cyhwcm9wZXJ0eSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBjb3B5W2tleV0gPSBhcnJheWZ5KGtleSwgcHJvcGVydHlba2V5XSwgcHJvY2Vzc2luZ0Z1bmN0aW9uLFxuICAgICAgICB2YWxpZGF0aW9uLCBwYXRoKTtcbiAgfSk7XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiBhcnJheWZ5KGtleSwgb2JqZWN0LCBmbiwgdmFsaWRhdGlvbiwgcGF0aCkge1xuICBpZiAoaXNBcnJheShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG9iamVjdC5tYXAoZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgcmV0dXJuIGZuKGtleSwgZWxlbWVudCwgdmFsaWRhdGlvbiwgcGF0aCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtmbihrZXksIG9iamVjdCwgdmFsaWRhdGlvbiwgcGF0aCldO1xuICB9XG59XG5cblxuZnVuY3Rpb24gcGFyc2VMaW5rKGxpbmtLZXksIGxpbmssIHZhbGlkYXRpb24sIHBhdGgpIHtcbiAgaWYgKCFpc09iamVjdChsaW5rKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTGluayBvYmplY3QgaXMgbm90IGFuIGFjdHVhbCBvYmplY3Q6ICcgKyBsaW5rICtcbiAgICAgICcgWycgKyB0eXBlb2YgbGluayArICddJyk7XG4gIH1cblxuICAvLyBjcmVhdGUgYSBzaGFsbG93IGNvcHkgb2YgdGhlIGxpbmsgb2JqZWN0XG4gIHZhciBjb3B5ID0gc2hhbGxvd0NvcHkobGluayk7XG5cbiAgLy8gYWRkIG1pc3NpbmcgcHJvcGVydGllcyBtYW5kYXRlZCBieSBzcGVjIGFuZCBkbyBnZW5lcmljIHZhbGlkYXRpb25cbiAgT2JqZWN0LmtleXMobGlua1NwZWMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKGNvcHlba2V5XSA9PSBudWxsKSB7XG4gICAgICBpZiAobGlua1NwZWNba2V5XS5yZXF1aXJlZCkge1xuICAgICAgICByZXBvcnRWYWxpZGF0aW9uSXNzdWUoJ0xpbmsgbWlzc2VzIHJlcXVpcmVkIHByb3BlcnR5ICcgKyBrZXkgKyAnLicsXG4gICAgICAgICAgICB2YWxpZGF0aW9uLCBwYXRoLnB1c2gobGlua0tleSkpO1xuICAgICAgfVxuICAgICAgaWYgKGxpbmtTcGVjW2tleV0uZGVmYXVsdFZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgY29weVtrZXldID0gbGlua1NwZWNba2V5XS5kZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBjaGVjayBtb3JlIGludGVyLXByb3BlcnR5IHJlbGF0aW9ucyBtYW5kYXRlZCBieSBzcGVjXG4gIGlmIChjb3B5LmRlcHJlY2F0aW9uKSB7XG4gICAgbG9nKCdXYXJuaW5nOiBMaW5rICcgKyBwYXRoVG9TdHJpbmcocGF0aC5wdXNoKGxpbmtLZXkpKSArXG4gICAgICAgICcgaXMgZGVwcmVjYXRlZCwgc2VlICcgKyBjb3B5LmRlcHJlY2F0aW9uKTtcbiAgfVxuICBpZiAoY29weS50ZW1wbGF0ZWQgIT09IHRydWUgJiYgY29weS50ZW1wbGF0ZWQgIT09IGZhbHNlKSB7XG4gICAgY29weS50ZW1wbGF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICghdmFsaWRhdGlvbikge1xuICAgIHJldHVybiBjb3B5O1xuICB9XG4gIGlmIChjb3B5LmhyZWYgJiYgY29weS5ocmVmLmluZGV4T2YoJ3snKSA+PSAwICYmICFjb3B5LnRlbXBsYXRlZCkge1xuICAgIHJlcG9ydFZhbGlkYXRpb25Jc3N1ZSgnTGluayBzZWVtcyB0byBiZSBhbiBVUkkgdGVtcGxhdGUgJyArXG4gICAgICAgICdidXQgaXRzIFwidGVtcGxhdGVkXCIgcHJvcGVydHkgaXMgbm90IHNldCB0byB0cnVlLicsIHZhbGlkYXRpb24sXG4gICAgICAgIHBhdGgucHVzaChsaW5rS2V5KSk7XG4gIH1cbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChvKSB7XG4gIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCc7XG59XG5cbmZ1bmN0aW9uIGlkZW50aXR5KGtleSwgb2JqZWN0KSB7XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHJlcG9ydFZhbGlkYXRpb25Jc3N1ZShtZXNzYWdlLCB2YWxpZGF0aW9uLCBwYXRoKSB7XG4gIGlmICh2YWxpZGF0aW9uKSB7XG4gICAgdmFsaWRhdGlvbi5wdXNoKHtcbiAgICAgIHBhdGg6IHBhdGhUb1N0cmluZyhwYXRoKSxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBUT0RPIGZpeCB0aGlzIGFkIGhvYyBtZXNzIC0gZG9lcyBpZSBzdXBwb3J0IGNvbnNvbGUubG9nIGFzIG9mIGllOT9cbmZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUubG9nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hhbGxvd0NvcHkoc291cmNlKSB7XG4gIHZhciBjb3B5ID0ge307XG4gIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBjb3B5W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgfSk7XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiBwYXRoVG9TdHJpbmcocGF0aCkge1xuICB2YXIgcyA9ICckLic7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5hcnJheSgpLmxlbmd0aDsgaSsrKSB7XG4gICAgcyArPSBwYXRoLmFycmF5KClbaV0gKyAnLic7XG4gIH1cbiAgcyA9IHMuc3Vic3RyaW5nKDAsIHMubGVuZ3RoIC0gMSk7XG4gIHJldHVybiBzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gUmVzb3VyY2UobGlua3MsIGN1cmllcywgZW1iZWRkZWQsIHZhbGlkYXRpb25Jc3N1ZXMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9saW5rcyA9IGxpbmtzIHx8IHt9O1xuICB0aGlzLl9pbml0Q3VyaWVzKGN1cmllcyk7XG4gIHRoaXMuX2VtYmVkZGVkID0gZW1iZWRkZWQgfHwge307XG4gIHRoaXMuX3ZhbGlkYXRpb24gPSB2YWxpZGF0aW9uSXNzdWVzIHx8IFtdO1xufVxuXG5SZXNvdXJjZS5wcm90b3R5cGUuX2luaXRDdXJpZXMgPSBmdW5jdGlvbihjdXJpZXMpIHtcbiAgdGhpcy5fY3VyaWVzTWFwID0ge307XG4gIGlmICghY3VyaWVzKSB7XG4gICAgdGhpcy5fY3VyaWVzID0gW107XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fY3VyaWVzID0gY3VyaWVzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY3VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VyaWUgPSB0aGlzLl9jdXJpZXNbaV07XG4gICAgICB0aGlzLl9jdXJpZXNNYXBbY3VyaWUubmFtZV0gPSBjdXJpZTtcbiAgICB9XG4gIH1cbiAgdGhpcy5fcHJlUmVzb2x2ZUN1cmllcygpO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLl9wcmVSZXNvbHZlQ3VyaWVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX3Jlc29sdmVkQ3VyaWVzTWFwID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY3VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGN1cmllID0gdGhpcy5fY3VyaWVzW2ldO1xuICAgIGlmICghY3VyaWUubmFtZSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGZvciAodmFyIHJlbCBpbiB0aGlzLl9saW5rcykge1xuICAgICAgaWYgKHJlbCAhPT0gJ2N1cmllcycpIHtcbiAgICAgICAgdGhpcy5fcHJlUmVzb2x2ZUN1cmllKGN1cmllLCByZWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLl9wcmVSZXNvbHZlQ3VyaWUgPSBmdW5jdGlvbihjdXJpZSwgcmVsKSB7XG4gIHZhciBsaW5rID0gdGhpcy5fbGlua3NbcmVsXTtcbiAgdmFyIHByZWZpeEFuZFJlZmVyZW5jZSA9IHJlbC5zcGxpdCgvOiguKykvKTtcbiAgdmFyIGNhbmRpZGF0ZSA9IHByZWZpeEFuZFJlZmVyZW5jZVswXTtcbiAgaWYgKGN1cmllLm5hbWUgPT09IGNhbmRpZGF0ZSkge1xuICAgIGlmIChjdXJpZS50ZW1wbGF0ZWQgJiYgcHJlZml4QW5kUmVmZXJlbmNlLmxlbmd0aCA+PSAxKSB7XG4gICAgICAvLyBUT0RPIHJlc29sdmluZyB0ZW1wbGF0ZWQgQ1VSSUVTIHNob3VsZCB1c2UgYSBzbWFsbCB1cmkgdGVtcGxhdGVcbiAgICAgIC8vIGxpYiwgbm90IGNvZGVkIGhlcmUgYWQgaG9jXG4gICAgICB2YXIgaHJlZiA9IGN1cmllLmhyZWYucmVwbGFjZSgvKC4qKXsoLiopfSguKikvLCAnJDEnICtcbiAgICAgICAgICBwcmVmaXhBbmRSZWZlcmVuY2VbMV0gKyAnJDMnKTtcbiAgICAgIHRoaXMuX3Jlc29sdmVkQ3VyaWVzTWFwW2hyZWZdID0gcmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZXNvbHZlZEN1cmllc01hcFtjdXJpZS5ocmVmXSA9IHJlbDtcbiAgICB9XG4gIH1cbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5hbGxMaW5rQXJyYXlzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9saW5rcztcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5saW5rQXJyYXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgcmV0dXJuIHByb3BlcnR5QXJyYXkodGhpcy5fbGlua3MsIGtleSk7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGtleSwgaW5kZXgpIHtcbiAgcmV0dXJuIGVsZW1lbnRPZlByb3BlcnR5QXJyYXkodGhpcy5fbGlua3MsIGtleSwgaW5kZXgpO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmhhc0N1cmllcyA9IGZ1bmN0aW9uKGtleSkge1xuICByZXR1cm4gdGhpcy5fY3VyaWVzLmxlbmd0aCA+IDA7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuY3VyaWVBcnJheSA9IGZ1bmN0aW9uKGtleSkge1xuICByZXR1cm4gdGhpcy5fY3VyaWVzO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmN1cmllID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5fY3VyaWVzTWFwW25hbWVdO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLnJldmVyc2VSZXNvbHZlQ3VyaWUgPSBmdW5jdGlvbihmdWxsVXJsKSB7XG4gIHJldHVybiB0aGlzLl9yZXNvbHZlZEN1cmllc01hcFtmdWxsVXJsXTtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5hbGxFbWJlZGRlZFJlc291cmNlQXJyYXlzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fZW1iZWRkZWQ7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuZW1iZWRkZWRSZXNvdXJjZUFycmF5ID0gZnVuY3Rpb24oa2V5KSB7XG4gIHJldHVybiBwcm9wZXJ0eUFycmF5KHRoaXMuX2VtYmVkZGVkLCBrZXkpO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmVtYmVkZGVkUmVzb3VyY2UgPSBmdW5jdGlvbihrZXksIGluZGV4KSB7XG4gIHJldHVybiBlbGVtZW50T2ZQcm9wZXJ0eUFycmF5KHRoaXMuX2VtYmVkZGVkLCBrZXksIGluZGV4KTtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5vcmlnaW5hbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fb3JpZ2luYWw7XG59O1xuXG5mdW5jdGlvbiBwcm9wZXJ0eUFycmF5KG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgIT0gbnVsbCA/IG9iamVjdFtrZXldIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gZWxlbWVudE9mUHJvcGVydHlBcnJheShvYmplY3QsIGtleSwgaW5kZXgpIHtcbiAgaW5kZXggPSBpbmRleCB8fCAwO1xuICB2YXIgYXJyYXkgPSBwcm9wZXJ0eUFycmF5KG9iamVjdCwga2V5KTtcbiAgaWYgKGFycmF5ICE9IG51bGwgJiYgYXJyYXkubGVuZ3RoID49IDEpIHtcbiAgICByZXR1cm4gYXJyYXlbaW5kZXhdO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5SZXNvdXJjZS5wcm90b3R5cGUudmFsaWRhdGlvbklzc3VlcyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fdmFsaWRhdGlvbjtcbn07XG5cbi8vIGFsaWFzIGRlZmluaXRpb25zXG5SZXNvdXJjZS5wcm90b3R5cGUuYWxsTGlua3MgPSBSZXNvdXJjZS5wcm90b3R5cGUuYWxsTGlua0FycmF5cztcblJlc291cmNlLnByb3RvdHlwZS5hbGxFbWJlZGRlZEFycmF5cyA9XG4gICAgUmVzb3VyY2UucHJvdG90eXBlLmFsbEVtYmVkZGVkUmVzb3VyY2VzID1cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuYWxsRW1iZWRkZWRSZXNvdXJjZUFycmF5cztcblJlc291cmNlLnByb3RvdHlwZS5lbWJlZGRlZEFycmF5ID0gUmVzb3VyY2UucHJvdG90eXBlLmVtYmVkZGVkUmVzb3VyY2VBcnJheTtcblJlc291cmNlLnByb3RvdHlwZS5lbWJlZGRlZCA9IFJlc291cmNlLnByb3RvdHlwZS5lbWJlZGRlZFJlc291cmNlO1xuUmVzb3VyY2UucHJvdG90eXBlLnZhbGlkYXRpb24gPSBSZXNvdXJjZS5wcm90b3R5cGUudmFsaWRhdGlvbklzc3VlcztcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVE9ETyBSZXBsYWNlIGJ5IGEgcHJvcGVyIGxpZ2h0d2VpZ2h0IGxvZ2dpbmcgbW9kdWxlLCBzdWl0ZWQgZm9yIHRoZSBicm93c2VyXG5cbnZhciBlbmFibGVkID0gZmFsc2U7XG5mdW5jdGlvbiBMb2dnZXIoaWQpIHtcbiAgaWYgKGlkID09IG51bGwpIHtcbiAgICBpZCA9ICcnO1xuICB9XG4gIHRoaXMuaWQgPSBpZDtcbn1cblxuTG9nZ2VyLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIGlmIChlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5pZCArICcvZGVidWc6ICcgKyBtZXNzYWdlKTtcbiAgfVxufTtcblxuTG9nZ2VyLnByb3RvdHlwZS5pbmZvID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBpZiAoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuaWQgKyAnL2luZm86ICcgKyBtZXNzYWdlKTtcbiAgfVxufTtcblxuTG9nZ2VyLnByb3RvdHlwZS53YXJuID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBpZiAoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuaWQgKyAnL3dhcm46ICcgKyBtZXNzYWdlKTtcbiAgfVxufTtcblxuTG9nZ2VyLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgaWYgKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkICsgJy9lcnJvcjogJyArIG1lc3NhZ2UpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtaW5pbG9nKGlkKSB7XG4gIHJldHVybiBuZXcgTG9nZ2VyKGlkKTtcbn1cblxubWluaWxvZy5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgZW5hYmxlZCA9IHRydWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1pbmlsb2c7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBmdW5jdGlvbihvKSB7XG4gICAgaWYgKG8gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxuZnVuY3Rpb24gUmVxdWVzdCgpIHt9XG5cblJlcXVlc3QucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIG1hcFJlcXVlc3Qoc3VwZXJhZ2VudC5nZXQodXJpKSwgb3B0aW9ucylcbiAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKGNhbGxiYWNrKSk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24odXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICByZXR1cm4gbWFwUmVxdWVzdChzdXBlcmFnZW50LnBvc3QodXJpKSwgb3B0aW9ucylcbiAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKGNhbGxiYWNrKSk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBtYXBSZXF1ZXN0KHN1cGVyYWdlbnQucHV0KHVyaSksIG9wdGlvbnMpXG4gICAgLmVuZChoYW5kbGVSZXNwb25zZShjYWxsYmFjaykpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUucGF0Y2ggPSBmdW5jdGlvbih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBtYXBSZXF1ZXN0KHN1cGVyYWdlbnQucGF0Y2godXJpKSwgb3B0aW9ucylcbiAgICAuZW5kKGhhbmRsZVJlc3BvbnNlKGNhbGxiYWNrKSk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5kZWwgPSBmdW5jdGlvbih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBtYXBSZXF1ZXN0KHN1cGVyYWdlbnQuZGVsKHVyaSksIG9wdGlvbnMpXG4gICAgLmVuZChoYW5kbGVSZXNwb25zZShjYWxsYmFjaykpO1xufTtcblxuZnVuY3Rpb24gbWFwUmVxdWVzdChzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbWFwUXVlcnkoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpO1xuICBtYXBIZWFkZXJzKHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKTtcbiAgbWFwQXV0aChzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucyk7XG4gIG1hcEJvZHkoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpO1xuICBtYXBGb3JtKHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIHN1cGVyYWdlbnRSZXF1ZXN0O1xufVxuXG5mdW5jdGlvbiBtYXBRdWVyeShzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucykge1xuICB2YXIgcXMgPSBvcHRpb25zLnFzO1xuICBpZiAocXMgIT0gbnVsbCkge1xuICAgIHN1cGVyYWdlbnRSZXF1ZXN0ID0gc3VwZXJhZ2VudFJlcXVlc3QucXVlcnkocXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcEhlYWRlcnMoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnM7XG4gIGlmIChoZWFkZXJzICE9IG51bGwpIHtcbiAgICBzdXBlcmFnZW50UmVxdWVzdCA9IHN1cGVyYWdlbnRSZXF1ZXN0LnNldChoZWFkZXJzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXBBdXRoKHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKSB7XG4gIHZhciBhdXRoID0gb3B0aW9ucy5hdXRoO1xuICBpZiAoYXV0aCAhPSBudWxsKSB7XG4gICAgc3VwZXJhZ2VudFJlcXVlc3QgPSBzdXBlcmFnZW50UmVxdWVzdC5hdXRoKFxuICAgICAgYXV0aC51c2VyIHx8IGF1dGgudXNlcm5hbWUsXG4gICAgICBhdXRoLnBhc3MgfHwgYXV0aC5wYXNzd29yZFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFwQm9keShzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucykge1xuICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHk7XG4gICAgaWYgKGJvZHkgIT0gbnVsbCkge1xuICAgICAgc3VwZXJhZ2VudFJlcXVlc3QgPSBzdXBlcmFnZW50UmVxdWVzdC5zZW5kKGJvZHkpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYXBGb3JtKHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zICE9IG51bGwpIHtcbiAgICB2YXIgZm9ybSA9IG9wdGlvbnMuZm9ybTtcbiAgICBpZiAoZm9ybSAhPSBudWxsKSB7XG4gICAgICBzdXBlcmFnZW50UmVxdWVzdCA9IHN1cGVyYWdlbnRSZXF1ZXN0LnNlbmQoZm9ybSk7XG4gICAgICBzdXBlcmFnZW50UmVxdWVzdCA9IHN1cGVyYWdlbnRSZXF1ZXN0LnNldCgnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgfVxuICB9XG59XG5cbi8vIG1hcCBYSFIgcmVzcG9uc2Ugb2JqZWN0IHByb3BlcnRpZXMgdG8gTm9kZS5qcyByZXF1ZXN0IGxpYidzIHJlc3BvbnNlIG9iamVjdFxuLy8gcHJvcGVydGllc1xuZnVuY3Rpb24gbWFwUmVzcG9uc2UocmVzcG9uc2UpIHtcbiAgcmVzcG9uc2UuYm9keSA9IHJlc3BvbnNlLnRleHQ7XG4gIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXM7XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAgIC8vIG5ldHdvcmsgZXJyb3Igb3IgdGltZW91dCwgbm8gcmVzcG9uc2VcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTaW5jZSAxLjAuMCBzdXBlcmFnZW50IGNhbGxzIHRoZSBjYWxsYmFjayB3aXRoIGFuIGVycm9yIGlmIHRoZSBzdGF0dXNcbiAgICAgICAgLy8gY29kZSBvZiB0aGUgcmVzcG9uc2UgaXMgbm90IGluIHRoZSAyeHggcmFuZ2UuIEluIHRoaXMgY2FzZXMsIGl0IGFsc29cbiAgICAgICAgLy8gcGFzc2VzIGluIHRoZSByZXNwb25zZS4gVG8gYWxpZ24gdGhpbmdzIHdpdGggcmVxdWVzdCwgY2FsbCB0aGVcbiAgICAgICAgLy8gY2FsbGJhY2sgd2l0aG91dCB0aGUgZXJyb3IgYnV0IGp1c3Qgd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIG1hcFJlc3BvbnNlKHJlc3BvbnNlKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIG1hcFJlc3BvbnNlKHJlc3BvbnNlKSk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBSZXF1ZXN0KCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qXG4gKiBDb3BpZWQgZnJvbSB1bmRlcnNjb3JlLnN0cmluZyBtb2R1bGUuIEp1c3QgdGhlIGZ1bmN0aW9ucyB3ZSBuZWVkLCB0byByZWR1Y2VcbiAqIHRoZSBicm93c2VyaWZpZWQgc2l6ZS5cbiAqL1xuXG52YXIgX3MgPSB7XG4gIHN0YXJ0c1dpdGg6IGZ1bmN0aW9uKHN0ciwgc3RhcnRzKSB7XG4gICAgaWYgKHN0YXJ0cyA9PT0gJycpIHJldHVybiB0cnVlO1xuICAgIGlmIChzdHIgPT0gbnVsbCB8fCBzdGFydHMgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHN0ciA9IFN0cmluZyhzdHIpOyBzdGFydHMgPSBTdHJpbmcoc3RhcnRzKTtcbiAgICByZXR1cm4gc3RyLmxlbmd0aCA+PSBzdGFydHMubGVuZ3RoICYmIHN0ci5zbGljZSgwLCBzdGFydHMubGVuZ3RoKSA9PT0gc3RhcnRzO1xuICB9LFxuXG4gIGVuZHNXaXRoOiBmdW5jdGlvbihzdHIsIGVuZHMpe1xuICAgIGlmIChlbmRzID09PSAnJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKHN0ciA9PSBudWxsIHx8IGVuZHMgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHN0ciA9IFN0cmluZyhzdHIpOyBlbmRzID0gU3RyaW5nKGVuZHMpO1xuICAgIHJldHVybiBzdHIubGVuZ3RoID49IGVuZHMubGVuZ3RoICYmXG4gICAgICBzdHIuc2xpY2Uoc3RyLmxlbmd0aCAtIGVuZHMubGVuZ3RoKSA9PT0gZW5kcztcbiAgfSxcblxuICBzcGxpY2U6IGZ1bmN0aW9uKHN0ciwgaSwgaG93bWFueSwgc3Vic3RyKXtcbiAgICB2YXIgYXJyID0gX3MuY2hhcnMoc3RyKTtcbiAgICBhcnIuc3BsaWNlKH5+aSwgfn5ob3dtYW55LCBzdWJzdHIpO1xuICAgIHJldHVybiBhcnIuam9pbignJyk7XG4gIH0sXG5cbiAgY29udGFpbnM6IGZ1bmN0aW9uKHN0ciwgbmVlZGxlKXtcbiAgICBpZiAobmVlZGxlID09PSAnJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKHN0ciA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIFN0cmluZyhzdHIpLmluZGV4T2YobmVlZGxlKSAhPT0gLTE7XG4gIH0sXG5cbiAgY2hhcnM6IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmIChzdHIgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBTdHJpbmcoc3RyKS5zcGxpdCgnJyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gX3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByZXNvbHZlVXJsID0gcmVxdWlyZSgncmVzb2x2ZS11cmwnKTtcblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgcmV0dXJuIHJlc29sdmVVcmwoZnJvbSwgdG8pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxuZXhwb3J0cy5hYm9ydFRyYXZlcnNhbCA9IGZ1bmN0aW9uIGFib3J0VHJhdmVyc2FsKCkge1xuICBsb2cuZGVidWcoJ2Fib3J0aW5nIGxpbmsgdHJhdmVyc2FsJyk7XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIGlmICh0aGlzLmN1cnJlbnRSZXF1ZXN0KSB7XG4gICAgbG9nLmRlYnVnKCdyZXF1ZXN0IGluIHByb2dyZXNzLiB0cnlpbmcgdG8gYWJvcnQgaXQsIHRvby4nKTtcbiAgICB0aGlzLmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XG4gIH1cbn07XG5cbmV4cG9ydHMucmVnaXN0ZXJBYm9ydExpc3RlbmVyID0gZnVuY3Rpb24gcmVnaXN0ZXJBYm9ydExpc3RlbmVyKHQsIGNhbGxiYWNrKSB7XG4gIGlmICh0LmN1cnJlbnRSZXF1ZXN0KSB7XG4gICAgdC5jdXJyZW50UmVxdWVzdC5vbignYWJvcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cG9ydHMuY2FsbENhbGxiYWNrT25BYm9ydCh0KTtcbiAgICB9KTtcbiAgfVxufTtcblxuZXhwb3J0cy5jYWxsQ2FsbGJhY2tPbkFib3J0ID0gZnVuY3Rpb24gY2FsbENhbGxiYWNrT25BYm9ydCh0KSB7XG4gIGxvZy5kZWJ1ZygnbGluayB0cmF2ZXJzYWwgYWJvcnRlZCcpO1xuICBpZiAoIXQuY2FsbGJhY2tIYXNCZWVuQ2FsbGVkQWZ0ZXJBYm9ydCkge1xuICAgIHQuY2FsbGJhY2tIYXNCZWVuQ2FsbGVkQWZ0ZXJBYm9ydCA9IHRydWU7XG4gICAgdC5jYWxsYmFjayhleHBvcnRzLmFib3J0RXJyb3IoKSwgdCk7XG4gIH1cbn07XG5cbmV4cG9ydHMuYWJvcnRFcnJvciA9IGZ1bmN0aW9uIGFib3J0RXJyb3IoKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcignTGluayB0cmF2ZXJzYWwgcHJvY2VzcyBoYXMgYmVlbiBhYm9ydGVkLicpO1xuICBlcnJvci5uYW1lID0gJ0Fib3J0RXJyb3InO1xuICBlcnJvci5hYm9ydGVkID0gdHJ1ZTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi9hYm9ydF90cmF2ZXJzYWwnKVxuICAsIGFwcGx5VHJhbnNmb3JtcyA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9hcHBseV90cmFuc2Zvcm1zJylcbiAgLCBodHRwUmVxdWVzdHMgPSByZXF1aXJlKCcuL2h0dHBfcmVxdWVzdHMnKVxuICAsIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi9pc19jb250aW51YXRpb24nKVxuICAsIHdhbGtlciA9IHJlcXVpcmUoJy4vd2Fsa2VyJyk7XG5cbnZhciBjaGVja0h0dHBTdGF0dXMgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvY2hlY2tfaHR0cF9zdGF0dXMnKVxuICAsIGNvbnRpbnVhdGlvblRvRG9jID1cbiAgICAgIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9jb250aW51YXRpb25fdG9fZG9jJylcbiAgLCBjb250aW51YXRpb25Ub1Jlc3BvbnNlID1cbiAgICAgIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9jb250aW51YXRpb25fdG9fcmVzcG9uc2UnKVxuICAsIGNvbnZlcnRFbWJlZGRlZERvY1RvUmVzcG9uc2UgPVxuICAgICAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2NvbnZlcnRfZW1iZWRkZWRfZG9jX3RvX3Jlc3BvbnNlJylcbiAgLCBleHRyYWN0RG9jID0gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9leHRyYWN0X2RvYycpXG4gICwgZXh0cmFjdFJlc3BvbnNlID0gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9leHRyYWN0X3Jlc3BvbnNlJylcbiAgLCBleHRyYWN0VXJsID0gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9leHRyYWN0X3VybCcpXG4gICwgZmV0Y2hMYXN0UmVzb3VyY2UgPSAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2ZldGNoX2xhc3RfcmVzb3VyY2UnKVxuICAsIGV4ZWN1dGVMYXN0SHR0cFJlcXVlc3QgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZXhlY3V0ZV9sYXN0X2h0dHBfcmVxdWVzdCcpXG4gICwgZXhlY3V0ZUh0dHBSZXF1ZXN0ID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2V4ZWN1dGVfaHR0cF9yZXF1ZXN0JylcbiAgLCBwYXJzZSA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9wYXJzZScpO1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgZW5kIGl0IHdpdGggYW4gSFRUUCBnZXQuXG4gKi9cbmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24odCwgY2FsbGJhY2spIHtcbiAgdmFyIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwO1xuICBpZiAodC5jb252ZXJ0UmVzcG9uc2VUb09iamVjdCkge1xuICAgIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwID0gW1xuICAgICAgY29udGludWF0aW9uVG9Eb2MsXG4gICAgICBmZXRjaExhc3RSZXNvdXJjZSxcbiAgICAgIGNoZWNrSHR0cFN0YXR1cyxcbiAgICAgIHBhcnNlLFxuICAgICAgZXh0cmFjdERvYyxcbiAgICBdO1xuICB9IGVsc2Uge1xuICAgIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwID0gW1xuICAgICAgY29udGludWF0aW9uVG9SZXNwb25zZSxcbiAgICAgIGZldGNoTGFzdFJlc291cmNlLFxuICAgICAgY29udmVydEVtYmVkZGVkRG9jVG9SZXNwb25zZSxcbiAgICAgIGV4dHJhY3RSZXNwb25zZSxcbiAgICBdO1xuICB9XG4gIHdhbGtlci53YWxrKHQsIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwLCBjYWxsYmFjayk7XG4gIHJldHVybiBjcmVhdGVUcmF2ZXJzYWxIYW5kbGUodCk7XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgdmFyaWFudCBvZiBnZXQoKSB0aGF0IGRvZXMgbm90IGV4ZWN1dGUgdGhlIGxhc3QgcmVxdWVzdCBidXQgaW5zdGVhZFxuICogeWllbGRzIHRoZSBsYXN0IFVSTCB0byB0aGUgY2FsbGJhY2suXG4gKi9cbmV4cG9ydHMuZ2V0VXJsID0gZnVuY3Rpb24odCwgY2FsbGJhY2spIHtcbiAgd2Fsa2VyLndhbGsodCwgWyBleHRyYWN0VXJsIF0sIGNhbGxiYWNrKTtcbiAgcmV0dXJuIGNyZWF0ZVRyYXZlcnNhbEhhbmRsZSh0KTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIFBPU1QgcmVxdWVzdCB3aXRoIHRoZVxuICogZ2l2ZW4gYm9keSB0byB0aGUgbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgUE9TVCByZXF1ZXN0IHRvXG4gKiB0aGUgY2FsbGJhY2suXG4gKi9cbmV4cG9ydHMucG9zdCA9IGZ1bmN0aW9uKHQsIGNhbGxiYWNrKSB7XG4gIHdhbGtBbmRFeGVjdXRlKHQsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZSxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLnBvc3QsXG4gICAgICBjYWxsYmFjayk7XG4gIHJldHVybiBjcmVhdGVUcmF2ZXJzYWxIYW5kbGUodCk7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBQVVQgcmVxdWVzdCB3aXRoIHRoZVxuICogZ2l2ZW4gYm9keSB0byB0aGUgbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgUFVUIHJlcXVlc3QgdG9cbiAqIHRoZSBjYWxsYmFjay5cbiAqL1xuZXhwb3J0cy5wdXQgPSBmdW5jdGlvbih0LCBjYWxsYmFjaykge1xuICB3YWxrQW5kRXhlY3V0ZSh0LFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZS5wdXQsXG4gICAgICBjYWxsYmFjayk7XG4gIHJldHVybiBjcmVhdGVUcmF2ZXJzYWxIYW5kbGUodCk7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBQQVRDSCByZXF1ZXN0IHdpdGggdGhlXG4gKiBnaXZlbiBib2R5IHRvIHRoZSBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBQQVRDSCByZXF1ZXN0IHRvXG4gKiB0aGUgY2FsbGJhY2suXG4gKi9cbmV4cG9ydHMucGF0Y2ggPSBmdW5jdGlvbih0LCBjYWxsYmFjaykge1xuICB3YWxrQW5kRXhlY3V0ZSh0LFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZS5wYXRjaCxcbiAgICAgIGNhbGxiYWNrKTtcbiAgcmV0dXJuIGNyZWF0ZVRyYXZlcnNhbEhhbmRsZSh0KTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIERFTEVURSByZXF1ZXN0IHRvIHRoZVxuICogbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgREVMRVRFIHJlcXVlc3QgdG8gdGhlIGNhbGxiYWNrLlxuICovXG5leHBvcnRzLmRlbGV0ZSA9IGZ1bmN0aW9uKHQsIGNhbGxiYWNrKSB7XG4gIHdhbGtBbmRFeGVjdXRlKHQsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZSxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLmRlbCxcbiAgICAgIGNhbGxiYWNrKTtcbiAgcmV0dXJuIGNyZWF0ZVRyYXZlcnNhbEhhbmRsZSh0KTtcbn07XG5cbmZ1bmN0aW9uIHdhbGtBbmRFeGVjdXRlKHQsIHJlcXVlc3QsIG1ldGhvZCwgY2FsbGJhY2spIHtcbiAgdmFyIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwO1xuICBpZiAodC5jb252ZXJ0UmVzcG9uc2VUb09iamVjdCkge1xuICAgIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwID0gW1xuICAgICAgZXhlY3V0ZUh0dHBSZXF1ZXN0LFxuICAgICAgY2hlY2tIdHRwU3RhdHVzLFxuICAgICAgcGFyc2UsXG4gICAgICBleHRyYWN0RG9jLFxuICAgIF07XG4gIH0gZWxzZSB7XG4gICAgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAgPSBbXG4gICAgICBleGVjdXRlTGFzdEh0dHBSZXF1ZXN0LFxuICAgIF07XG4gIH1cblxuICB0Lmxhc3RNZXRob2QgPSBtZXRob2Q7XG4gIHdhbGtlci53YWxrKHQsIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwLCBjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRyYXZlcnNhbEhhbmRsZSh0KSB7XG4gIHJldHVybiB7XG4gICAgYWJvcnQ6IHQuYWJvcnRUcmF2ZXJzYWxcbiAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBzdGFuZGFyZFJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0JylcbiAgLCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuL2Fib3J0X3RyYXZlcnNhbCcpLmFib3J0VHJhdmVyc2FsXG4gICwgbWVkaWFUeXBlUmVnaXN0cnkgPSByZXF1aXJlKCcuL21lZGlhX3R5cGVfcmVnaXN0cnknKVxuICAsIG1lZGlhVHlwZXMgPSByZXF1aXJlKCcuL21lZGlhX3R5cGVzJylcbiAgLCBtZXJnZVJlY3Vyc2l2ZSA9IHJlcXVpcmUoJy4vbWVyZ2VfcmVjdXJzaXZlJyk7XG5cbnZhciBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxuLy8gTWFpbnRlbmFuY2Ugbm90aWNlOiBUaGUgY29uc3RydWN0b3IgaXMgdXN1YWxseSBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMsIHRoZVxuLy8gbWVkaWFUeXBlIHBhcmFtZXRlciBpcyBvbmx5IHVzZWQgd2hlbiBjbG9uaW5nIHRoZSByZXF1ZXN0IGJ1aWxkZXIgaW5cbi8vIG5ld1JlcXVlc3QoKS5cbmZ1bmN0aW9uIEJ1aWxkZXIobWVkaWFUeXBlKSB7XG4gIHRoaXMubWVkaWFUeXBlID0gbWVkaWFUeXBlIHx8IG1lZGlhVHlwZXMuQ09OVEVOVF9ORUdPVElBVElPTjtcbiAgdGhpcy5hZGFwdGVyID0gdGhpcy5fY3JlYXRlQWRhcHRlcih0aGlzLm1lZGlhVHlwZSk7XG4gIHRoaXMuY29udGVudE5lZ290aWF0aW9uID0gdHJ1ZTtcbiAgdGhpcy5jb252ZXJ0UmVzcG9uc2VUb09iamVjdEZsYWcgPSBmYWxzZTtcbiAgdGhpcy5saW5rcyA9IFtdO1xuICB0aGlzLmpzb25QYXJzZXIgPSBKU09OLnBhcnNlO1xuICB0aGlzLnJlcXVlc3RNb2R1bGVJbnN0YW5jZSA9IHN0YW5kYXJkUmVxdWVzdDtcbiAgdGhpcy5yZXF1ZXN0T3B0aW9ucyA9IHt9O1xuICB0aGlzLnJlc29sdmVSZWxhdGl2ZUZsYWcgPSBmYWxzZTtcbiAgdGhpcy5wcmVmZXJFbWJlZGRlZCA9IGZhbHNlO1xuICB0aGlzLmxhc3RUcmF2ZXJzYWxTdGF0ZSA9IG51bGw7XG4gIHRoaXMuY29udGludWF0aW9uID0gbnVsbDtcbiAgLy8gTWFpbnRlbmFuY2Ugbm90aWNlOiB3aGVuIGV4dGVuZGluZyB0aGUgbGlzdCBvZiBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMsXG4gIC8vIGFsc28gZXh0ZW5kIHRoaXMubmV3UmVxdWVzdCBhbmQgaW5pdEZyb21UcmF2ZXJzYWxTdGF0ZVxufVxuXG5CdWlsZGVyLnByb3RvdHlwZS5fY3JlYXRlQWRhcHRlciA9IGZ1bmN0aW9uKG1lZGlhVHlwZSkge1xuICB2YXIgQWRhcHRlclR5cGUgPSBtZWRpYVR5cGVSZWdpc3RyeS5nZXQobWVkaWFUeXBlKTtcbiAgaWYgKCFBZGFwdGVyVHlwZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBvciB1bnN1cHBvcnRlZCBtZWRpYSB0eXBlOiAnICsgbWVkaWFUeXBlKTtcbiAgfVxuICBsb2cuZGVidWcoJ2NyZWF0aW5nIG5ldyAnICsgQWRhcHRlclR5cGUubmFtZSk7XG4gIHJldHVybiBuZXcgQWRhcHRlclR5cGUobG9nKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBidWlsZGVyIGluc3RhbmNlIHdoaWNoIGlzIGJhc2ljYWxseSBhIGNsb25lIG9mIHRoaXMgYnVpbGRlclxuICogaW5zdGFuY2UuIFRoaXMgYWxsb3dzIHlvdSB0byBpbml0aWF0ZSBhIG5ldyByZXF1ZXN0IGJ1dCBrZWVwaW5nIGFsbCB0aGUgc2V0dXBcbiAqIChzdGFydCBVUkwsIHRlbXBsYXRlIHBhcmFtZXRlcnMsIHJlcXVlc3Qgb3B0aW9ucywgYm9keSBwYXJzZXIsIC4uLikuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLm5ld1JlcXVlc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNsb25lZFJlcXVlc3RCdWlsZGVyID0gbmV3IEJ1aWxkZXIodGhpcy5nZXRNZWRpYVR5cGUoKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLmNvbnRlbnROZWdvdGlhdGlvbiA9XG4gICAgdGhpcy5kb2VzQ29udGVudE5lZ290aWF0aW9uKCk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0KHRoaXMuY29udmVydHNSZXNwb25zZVRvT2JqZWN0KCkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci5mcm9tKHNoYWxsb3dDbG9uZUFycmF5KHRoaXMuZ2V0RnJvbSgpKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLndpdGhUZW1wbGF0ZVBhcmFtZXRlcnMoXG4gICAgY2xvbmVBcnJheU9yT2JqZWN0KHRoaXMuZ2V0VGVtcGxhdGVQYXJhbWV0ZXJzKCkpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIud2l0aFJlcXVlc3RPcHRpb25zKFxuICAgIGNsb25lQXJyYXlPck9iamVjdCh0aGlzLmdldFJlcXVlc3RPcHRpb25zKCkpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIud2l0aFJlcXVlc3RMaWJyYXJ5KHRoaXMuZ2V0UmVxdWVzdExpYnJhcnkoKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLnBhcnNlUmVzcG9uc2VCb2RpZXNXaXRoKHRoaXMuZ2V0SnNvblBhcnNlcigpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIucmVzb2x2ZVJlbGF0aXZlKHRoaXMuZG9lc1Jlc29sdmVSZWxhdGl2ZSgpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIucHJlZmVyRW1iZWRkZWRSZXNvdXJjZXMoXG4gICAgICB0aGlzLmRvZXNQcmVmZXJFbWJlZGRlZFJlc291cmNlcygpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIuY29udGludWF0aW9uID0gdGhpcy5jb250aW51YXRpb247XG4gIC8vIE1haW50ZW5hbmNlIG5vdGljZTogd2hlbiBleHRlbmRpbmcgdGhlIGxpc3Qgb2YgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzLFxuICAvLyBhbHNvIGV4dGVuZCBpbml0RnJvbVRyYXZlcnNhbFN0YXRlXG4gIHJldHVybiBjbG9uZWRSZXF1ZXN0QnVpbGRlcjtcbn07XG5cbi8qKlxuICogRGlzYWJsZXMgY29udGVudCBuZWdvdGlhdGlvbiBhbmQgZm9yY2VzIHRoZSB1c2Ugb2YgYSBnaXZlbiBtZWRpYSB0eXBlLlxuICogVGhlIG1lZGlhIHR5cGUgaGFzIHRvIGJlIHJlZ2lzdGVyZWQgYXQgVHJhdmVyc29uJ3MgbWVkaWEgdHlwZSByZWdpc3RyeVxuICogYmVmb3JlIHZpYSB0cmF2ZXJzb24ucmVnaXN0ZXJNZWRpYVR5cGUgKGV4Y2VwdCBmb3IgbWVkaWEgdHlwZVxuICogYXBwbGljYXRpb24vanNvbiwgd2hpY2ggaXMgdHJhdmVyc29uLm1lZGlhVHlwZXMuSlNPTikuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnNldE1lZGlhVHlwZSA9IGZ1bmN0aW9uKG1lZGlhVHlwZSkge1xuICB0aGlzLm1lZGlhVHlwZSA9IG1lZGlhVHlwZSB8fCBtZWRpYVR5cGVzLkNPTlRFTlRfTkVHT1RJQVRJT047XG4gIHRoaXMuYWRhcHRlciA9IHRoaXMuX2NyZWF0ZUFkYXB0ZXIobWVkaWFUeXBlKTtcbiAgdGhpcy5jb250ZW50TmVnb3RpYXRpb24gPVxuICAgIChtZWRpYVR5cGUgPT09IG1lZGlhVHlwZXMuQ09OVEVOVF9ORUdPVElBVElPTik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTaG9ydGN1dCBmb3JcbiAqIHNldE1lZGlhVHlwZSh0cmF2ZXJzb24ubWVkaWFUeXBlcy5KU09OKTtcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuanNvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNldE1lZGlhVHlwZShtZWRpYVR5cGVzLkpTT04pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2hvcnRjdXQgZm9yXG4gKiBzZXRNZWRpYVR5cGUodHJhdmVyc29uLm1lZGlhVHlwZXMuSlNPTl9IQUwpO1xuICovXG5CdWlsZGVyLnByb3RvdHlwZS5qc29uSGFsID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2V0TWVkaWFUeXBlKG1lZGlhVHlwZXMuSlNPTl9IQUwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW5hYmxlcyBjb250ZW50IG5lZ290aWF0aW9uIChjb250ZW50IG5lZ290aWF0aW9uIGlzIGVuYWJsZWQgYnkgZGVmYXVsdCwgdGhpc1xuICogbWV0aG9kIGNhbiBiZSB1c2VkIHRvIGVuYWJsZSBpdCBhZnRlciBhIGNhbGwgdG8gc2V0TWVkaWFUeXBlIGRpc2FibGVkIGl0KS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUudXNlQ29udGVudE5lZ290aWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2V0TWVkaWFUeXBlKG1lZGlhVHlwZXMuQ09OVEVOVF9ORUdPVElBVElPTik7XG4gIHRoaXMuY29udGVudE5lZ290aWF0aW9uID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgcm9vdCBVUkwgb2YgdGhlIEFQSSwgdGhhdCBpcywgd2hlcmUgdGhlIGxpbmsgdHJhdmVyc2FsIGJlZ2lucy5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZnJvbSA9IGZ1bmN0aW9uKHVybCkge1xuICB0aGlzLnN0YXJ0VXJsID0gdXJsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgdGhlIGxpc3Qgb2YgbGluayByZWxhdGlvbnMgdG8gZm9sbG93XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmZvbGxvdyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB1dGlsLmlzQXJyYXkoYXJndW1lbnRzWzBdKSkge1xuICAgIHRoaXMubGlua3MgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5saW5rcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhcmd1bWVudHMpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3IgZm9sbG93LlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS53YWxrID0gQnVpbGRlci5wcm90b3R5cGUuZm9sbG93O1xuXG4vKipcbiAqIFByb3ZpZGUgdGVtcGxhdGUgcGFyYW1ldGVycyBmb3IgVVJJIHRlbXBsYXRlIHN1YnN0aXR1dGlvbi5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUud2l0aFRlbXBsYXRlUGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtZXRlcnMpIHtcbiAgdGhpcy50ZW1wbGF0ZVBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUHJvdmlkZSBvcHRpb25zIGZvciBIVFRQIHJlcXVlc3RzIChhZGRpdGlvbmFsIEhUVFAgaGVhZGVycywgZm9yIGV4YW1wbGUpLlxuICogVGhpcyBmdW5jdGlvbiByZXNldHMgYW55IHJlcXVlc3Qgb3B0aW9ucywgdGhhdCBoYWQgYmVlbiBzZXQgcHJldmlvdXNseSwgdGhhdFxuICogaXMsIG11bHRpcGxlIGNhbGxzIHRvIHdpdGhSZXF1ZXN0T3B0aW9ucyBhcmUgbm90IGN1bXVsYXRpdmUuIFVzZVxuICogYWRkUmVxdWVzdE9wdGlvbnMgdG8gYWRkIHJlcXVlc3Qgb3B0aW9ucyBpbiBhIGN1bXVsYXRpdmUgd2F5LlxuICpcbiAqIE9wdGlvbnMgY2FuIGVpdGhlciBiZSBwYXNzZWQgYXMgYW4gb2JqZWN0IG9yIGFuIGFycmF5LiBJZiBhbiBvYmplY3QgaXNcbiAqIHBhc3NlZCwgdGhlIG9wdGlvbnMgd2lsbCBiZSB1c2VkIGZvciBlYWNoIEhUVFAgcmVxdWVzdC4gSWYgYW4gYXJyYXkgaXNcbiAqIHBhc3NlZCwgZWFjaCBlbGVtZW50IHNob3VsZCBiZSBhbiBvcHRpb25zIG9iamVjdCBhbmQgdGhlIGZpcnN0IGFycmF5IGVsZW1lbnRcbiAqIHdpbGwgYmUgdXNlZCBmb3IgdGhlIGZpcnN0IHJlcXVlc3QsIHRoZSBzZWNvbmQgZWxlbWVudCBmb3IgdGhlIHNlY29uZCByZXF1ZXN0XG4gKiBhbmQgc28gb24uIG51bGwgZWxlbWVudHMgYXJlIGFsbG93ZWQuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLndpdGhSZXF1ZXN0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdGhpcy5yZXF1ZXN0T3B0aW9ucyA9IG9wdGlvbnM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIG9wdGlvbnMgZm9yIEhUVFAgcmVxdWVzdHMgKGFkZGl0aW9uYWwgSFRUUCBoZWFkZXJzLCBmb3IgZXhhbXBsZSkgb24gdG9wXG4gKiBvZiBleGlzdGluZyBvcHRpb25zLCBpZiBhbnkuIFRvIHJlc2V0IGFsbCByZXF1ZXN0IG9wdGlvbnMgYW5kIHNldCBuZXcgb25lc1xuICogd2l0aG91dCBrZWVwaW5nIHRoZSBvbGQgb25lcywgeW91IGNhbiB1c2Ugd2l0aFJlcXVlc3RPcHRpb25zLlxuICpcbiAqIE9wdGlvbnMgY2FuIGVpdGhlciBiZSBwYXNzZWQgYXMgYW4gb2JqZWN0IG9yIGFuIGFycmF5LiBJZiBhbiBvYmplY3QgaXNcbiAqIHBhc3NlZCwgdGhlIG9wdGlvbnMgd2lsbCBiZSB1c2VkIGZvciBlYWNoIEhUVFAgcmVxdWVzdC4gSWYgYW4gYXJyYXkgaXNcbiAqIHBhc3NlZCwgZWFjaCBlbGVtZW50IHNob3VsZCBiZSBhbiBvcHRpb25zIG9iamVjdCBhbmQgdGhlIGZpcnN0IGFycmF5IGVsZW1lbnRcbiAqIHdpbGwgYmUgdXNlZCBmb3IgdGhlIGZpcnN0IHJlcXVlc3QsIHRoZSBzZWNvbmQgZWxlbWVudCBmb3IgdGhlIHNlY29uZCByZXF1ZXN0XG4gKiBhbmQgc28gb24uIG51bGwgZWxlbWVudHMgYXJlIGFsbG93ZWQuXG4gKlxuICogV2hlbiBjYWxsZWQgYWZ0ZXIgYSBjYWxsIHRvIHdpdGhSZXF1ZXN0T3B0aW9ucyBvciB3aGVuIGNvbWJpbmluZyBtdWx0aXBsZVxuICogYWRkUmVxdWVzdE9wdGlvbnMgY2FsbHMsIHNvbWUgd2l0aCBvYmplY3RzIGFuZCBzb21lIHdpdGggYXJyYXlzLCBhIG11bHRpdHVkZVxuICogb2YgaW50ZXJlc3Rpbmcgc2l0dWF0aW9ucyBjYW4gb2NjdXI6XG4gKlxuICogMSkgVGhlIGV4aXN0aW5nIHJlcXVlc3Qgb3B0aW9ucyBhcmUgYW4gb2JqZWN0IGFuZCB0aGUgbmV3IG9wdGlvbnMgcGFzc2VkIGludG9cbiAqIHRoaXMgbWV0aG9kIGFyZSBhbHNvIGFuIG9iamVjdC4gT3V0Y29tZTogQm90aCBvYmplY3RzIGFyZSBtZXJnZWQgYW5kIGFsbFxuICogb3B0aW9ucyBhcmUgYXBwbGllZCB0byBhbGwgcmVxdWVzdHMuXG4gKlxuICogMikgVGhlIGV4aXN0aW5nIG9wdGlvbnMgYXJlIGFuIGFycmF5IGFuZCB0aGUgbmV3IG9wdGlvbnMgcGFzc2VkIGludG8gdGhpc1xuICogbWV0aG9kIGFyZSBhbHNvIGFuIGFycmF5LiBPdXRjb21lOiBFYWNoIGFycmF5IGVsZW1lbnQgaXMgbWVyZ2VkIGluZGl2aWR1YWxseS5cbiAqIFRoZSBjb21iaW5lZCBvcHRpb25zIGZyb20gdGhlIG4tdGggYXJyYXkgZWxlbWVudCBpbiB0aGUgZXhpc3Rpbmcgb3B0aW9uc1xuICogYXJyYXkgYW5kIHRoZSBuLXRoIGFycmF5IGVsZW1lbnQgaW4gdGhlIGdpdmVuIGFycmF5IGFyZSBhcHBsaWVkIHRvIHRoZSBuLXRoXG4gKiByZXF1ZXN0LlxuICpcbiAqIDMpIFRoZSBleGlzdGluZyBvcHRpb25zIGFyZSBhbiBvYmplY3QgYW5kIHRoZSBuZXcgb3B0aW9ucyBwYXNzZWQgaW50byB0aGlzXG4gKiBtZXRob2QgYXJlIGFuIGFycmF5LiBPdXRjb21lOiBBIG5ldyBvcHRpb25zIGFycmF5IHdpbGwgYmUgY3JlYXRlZC4gRm9yIGVhY2hcbiAqIGVsZW1lbnQsIGEgY2xvbmUgb2YgdGhlIGV4aXN0aW5nIG9wdGlvbnMgb2JqZWN0IHdpbGwgYmUgbWVyZ2VkIHdpdGggYW5cbiAqIGVsZW1lbnQgZnJvbSB0aGUgZ2l2ZW4gb3B0aW9ucyBhcnJheS5cbiAqXG4gKiBOb3RlIHRoYXQgaWYgdGhlIGdpdmVuIGFycmF5IGhhcyBsZXNzIGVsZW1lbnRzIHRoYW4gdGhlIG51bWJlciBvZiBzdGVwcyBpblxuICogdGhlIGxpbmsgdHJhdmVyc2FsICh1c3VhbGx5IHRoZSBudW1iZXIgb2Ygc3RlcHMgaXMgZGVyaXZlZCBmcm9tIHRoZSBudW1iZXJcbiAqIG9mIGxpbmsgcmVsYXRpb25zIGdpdmVuIHRvIHRoZSBmb2xsb3cgbWV0aG9kKSwgb25seSB0aGUgZmlyc3QgbiBodHRwXG4gKiByZXF1ZXN0cyB3aWxsIHVzZSBvcHRpb25zIGF0IGFsbCwgd2hlcmUgbiBpcyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZVxuICogZ2l2ZW4gYXJyYXkuIEhUVFAgcmVxdWVzdCBuICsgMSBhbmQgYWxsIGZvbGxvd2luZyBIVFRQIHJlcXVlc3RzIHdpbGwgdXNlIGFuXG4gKiBlbXB0eSBvcHRpb25zIG9iamVjdC4gVGhpcyBpcyBkdWUgdG8gdGhlIGZhY3QsIHRoYXQgYXQgdGhlIHRpbWUgb2YgY3JlYXRpbmdcbiAqIHRoZSBuZXcgb3B0aW9ucyBhcnJheSwgd2UgY2FuIG5vdCBrbm93IHdpdGggY2VydGFpbnR5IGhvdyBtYW55IHN0ZXBzIHRoZVxuICogbGluayB0cmF2ZXJzYWwgd2lsbCBoYXZlLlxuICpcbiAqIDQpIFRoZSBleGlzdGluZyBvcHRpb25zIGFyZSBhbiBhcnJheSBhbmQgdGhlIG5ldyBvcHRpb25zIHBhc3NlZCBpbnRvIHRoaXNcbiAqIG1ldGhvZCBhcmUgYW4gb2JqZWN0LiBPdXRjb21lOiBBIGNsb25lIG9mIHRoZSBnaXZlbiBvcHRpb25zIG9iamVjdCB3aWxsIGJlXG4gKiBtZXJnZWQgaW50byBpbnRvIGVhY2ggYXJyYXkgZWxlbWVudCBvZiB0aGUgZXhpc3Rpbmcgb3B0aW9ucy5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuYWRkUmVxdWVzdE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgLy8gY2FzZSAyOiBib3RoIHRoZSBwcmVzZW50IG9wdGlvbnMgYW5kIHRoZSBuZXcgb3B0aW9ucyBhcmUgYXJyYXlzLlxuICAvLyA9PiBtZXJnZSBlYWNoIGFycmF5IGVsZW1lbnQgaW5kaXZpZHVhbGx5XG4gIGlmICh1dGlsLmlzQXJyYXkodGhpcy5yZXF1ZXN0T3B0aW9ucykgJiYgdXRpbC5pc0FycmF5KG9wdGlvbnMpKSB7XG4gICAgbWVyZ2VBcnJheUVsZW1lbnRzKHRoaXMucmVxdWVzdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gIC8vIGNhc2UgMzogdGhlcmUgaXMgYW4gb3B0aW9ucyBvYmplY3QgdGhlIG5ldyBvcHRpb25zIGFyZSBhbiBhcnJheS5cbiAgLy8gPT4gY3JlYXRlIGEgbmV3IGFycmF5LCBlYWNoIGVsZW1lbnQgaXMgYSBtZXJnZSBvZiB0aGUgZXhpc3RpbmcgYmFzZSBvYmplY3RcbiAgLy8gYW5kIHRoZSBhcnJheSBlbGVtZW50IGZyb20gdGhlIG5ldyBvcHRpb25zIGFycmF5LlxuICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLnJlcXVlc3RPcHRpb25zID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgIHV0aWwuaXNBcnJheShvcHRpb25zKSkge1xuICAgIHRoaXMucmVxdWVzdE9wdGlvbnMgPVxuICAgICAgbWVyZ2VCYXNlT2JqZWN0V2l0aEFycmF5RWxlbWVudHModGhpcy5yZXF1ZXN0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgLy8gY2FzZSA0OiB0aGVyZSBpcyBhbiBvcHRpb25zIGFycmF5IGFuZCB0aGUgbmV3IG9wdGlvbnMgYXJlIGFuIG9iamVjdC5cbiAgLy8gPT4gbWVyZ2UgdGhlIG5ldyBvYmplY3QgaW50byBlYWNoIGFycmF5IGVsZW1lbnQuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0FycmF5KHRoaXMucmVxdWVzdE9wdGlvbnMpICYmXG4gICAgICAgICAgICAgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgbWVyZ2VPcHRpb25PYmplY3RJbnRvRWFjaEFycmF5RWxlbWVudCh0aGlzLnJlcXVlc3RPcHRpb25zLCBvcHRpb25zKTtcblxuICAvLyBjYXNlIDE6IGJvdGggYXJlIG9iamVjdHNcbiAgLy8gPT4gbWVyZ2UgYm90aCBvYmplY3RzXG4gIH0gZWxzZSB7XG4gICAgbWVyZ2VSZWN1cnNpdmUodGhpcy5yZXF1ZXN0T3B0aW9ucywgb3B0aW9ucyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBtZXJnZUFycmF5RWxlbWVudHMoZXhpc3RpbmdPcHRpb25zLCBuZXdPcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwO1xuICAgICAgIGkgPCBNYXRoLm1heChleGlzdGluZ09wdGlvbnMubGVuZ3RoLCBuZXdPcHRpb25zLmxlbmd0aCk7XG4gICAgICAgaSsrKSB7XG4gICAgZXhpc3RpbmdPcHRpb25zW2ldID1cbiAgICAgIG1lcmdlUmVjdXJzaXZlKGV4aXN0aW5nT3B0aW9uc1tpXSwgbmV3T3B0aW9uc1tpXSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWVyZ2VCYXNlT2JqZWN0V2l0aEFycmF5RWxlbWVudHMoZXhpc3RpbmdPcHRpb25zLCBuZXdPcHRpb25zKSB7XG4gIHZhciBuZXdPcHRBcnJheSA9IFtdO1xuICBmb3IgKHZhciBpID0gMDtcbiAgICAgICBpIDwgbmV3T3B0aW9ucy5sZW5ndGg7XG4gICAgICAgaSsrKSB7XG4gICAgbmV3T3B0QXJyYXlbaV0gPVxuICAgICAgbWVyZ2VSZWN1cnNpdmUobmV3T3B0aW9uc1tpXSwgZXhpc3RpbmdPcHRpb25zKTtcbiAgfVxuICByZXR1cm4gbmV3T3B0QXJyYXk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9uT2JqZWN0SW50b0VhY2hBcnJheUVsZW1lbnQoZXhpc3RpbmdPcHRpb25zLCBuZXdPcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwO1xuICAgICAgIGkgPCBleGlzdGluZ09wdGlvbnMubGVuZ3RoO1xuICAgICAgIGkrKykge1xuICAgIG1lcmdlUmVjdXJzaXZlKGV4aXN0aW5nT3B0aW9uc1tpXSwgbmV3T3B0aW9ucyk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbmplY3RzIGEgY3VzdG9tIHJlcXVlc3QgbGlicmFyeS4gV2hlbiB1c2luZyB0aGlzIG1ldGhvZCwgeW91IHNob3VsZCBub3RcbiAqIGNhbGwgd2l0aFJlcXVlc3RPcHRpb25zIG9yIGFkZFJlcXVlc3RPcHRpb25zIGJ1dCBpbnN0ZWFkIHByZS1jb25maWd1cmUgdGhlXG4gKiBpbmplY3RlZCByZXF1ZXN0IGxpYnJhcnkgaW5zdGFuY2UgYmVmb3JlIHBhc3NpbmcgaXQgdG8gd2l0aFJlcXVlc3RMaWJyYXJ5LlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS53aXRoUmVxdWVzdExpYnJhcnkgPSBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gIHRoaXMucmVxdWVzdE1vZHVsZUluc3RhbmNlID0gcmVxdWVzdDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluamVjdHMgYSBjdXN0b20gSlNPTiBwYXJzZXIuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnBhcnNlUmVzcG9uc2VCb2RpZXNXaXRoID0gZnVuY3Rpb24ocGFyc2VyKSB7XG4gIHRoaXMuanNvblBhcnNlciA9IHBhcnNlcjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdpdGggdGhpcyBvcHRpb24gZW5hYmxlZCwgdGhlIGJvZHkgb2YgdGhlIHJlc3BvbnNlIGF0IHRoZSBlbmQgb2YgdGhlXG4gKiB0cmF2ZXJzYWwgd2lsbCBiZSBjb252ZXJ0ZWQgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0IChmb3IgZXhhbXBsZSBieSBwYXNzaW5nXG4gKiBpdCBpbnRvIEpTT04ucGFyc2UpIGFuZCBwYXNzaW5nIHRoZSByZXN1bHRpbmcgb2JqZWN0IGludG8gdGhlIGNhbGxiYWNrLlxuICogVGhlIGRlZmF1bHQgaXMgZmFsc2UsIHdoaWNoIG1lYW5zIHRoZSBmdWxsIHJlc3BvbnNlIGlzIGhhbmRlZCB0byB0aGVcbiAqIGNhbGxiYWNrLlxuICpcbiAqIFdoZW4gcmVzcG9uc2UgYm9keSBjb252ZXJzaW9uIGlzIGVuYWJsZWQsIHlvdSB3aWxsIG5vdCBnZXQgdGhlIGZ1bGxcbiAqIHJlc3BvbnNlLCBzbyB5b3Ugd29uJ3QgaGF2ZSBhY2Nlc3MgdG8gdGhlIEhUVFAgc3RhdHVzIGNvZGUgb3IgaGVhZGVycy5cbiAqIEluc3RlYWQgb25seSB0aGUgY29udmVydGVkIG9iamVjdCB3aWxsIGJlIHBhc3NlZCBpbnRvIHRoZSBjYWxsYmFjay5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGJvZHkgb2YgYW55IGludGVybWVkaWFyeSByZXNwb25zZXMgZHVyaW5nIHRoZSB0cmF2ZXJzYWwgaXNcbiAqIGFsd2F5cyBjb252ZXJ0ZWQgYnkgVHJhdmVyc29uICh0byBmaW5kIHRoZSBuZXh0IGxpbmspLlxuICpcbiAqIElmIHRoZSBtZXRob2QgaXMgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzIChvciB0aGUgZmlyc3QgYXJndW1lbnQgaXMgdW5kZWZpbmVkXG4gKiBvciBudWxsKSwgcmVzcG9uc2UgYm9keSBjb252ZXJzaW9uIGlzIHN3aXRjaGVkIG9uLCBvdGhlcndpc2UgdGhlIGFyZ3VtZW50IGlzXG4gKiBpbnRlcnByZXRlZCBhcyBhIGJvb2xlYW4gZmxhZy4gSWYgaXQgaXMgYSB0cnV0aHkgdmFsdWUsIHJlc3BvbnNlIGJvZHlcbiAqIGNvbnZlcnNpb24gaXMgc3dpdGNoZWQgdG8gb24sIGlmIGl0IGlzIGEgZmFsc3kgdmFsdWUgKGJ1dCBub3QgbnVsbCBvclxuICogdW5kZWZpbmVkKSwgcmVzcG9uc2UgYm9keSBjb252ZXJzaW9uIGlzIHN3aXRjaGVkIG9mZi5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuY29udmVydFJlc3BvbnNlVG9PYmplY3QgPSBmdW5jdGlvbihmbGFnKSB7XG4gIGlmICh0eXBlb2YgZmxhZyA9PT0gJ3VuZGVmaW5lZCcgfHwgZmxhZyA9PT0gbnVsbCkge1xuICAgIGZsYWcgPSB0cnVlO1xuICB9XG4gIHRoaXMuY29udmVydFJlc3BvbnNlVG9PYmplY3RGbGFnID0gISFmbGFnO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3dpdGNoZXMgVVJMIHJlc29sdXRpb24gdG8gcmVsYXRpdmUgKGRlZmF1bHQgaXMgYWJzb2x1dGUpIG9yIGJhY2sgdG9cbiAqIGFic29sdXRlLlxuICpcbiAqIElmIHRoZSBtZXRob2QgaXMgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzIChvciB0aGUgZmlyc3QgYXJndW1lbnQgaXMgdW5kZWZpbmVkXG4gKiBvciBudWxsKSwgVVJMIHJlc29sdXRpb24gaXMgc3dpdGNoZWQgdG8gcmVsYXRpdmUsIG90aGVyd2lzZSB0aGUgYXJndW1lbnQgaXNcbiAqIGludGVycHJldGVkIGFzIGEgYm9vbGVhbiBmbGFnLiBJZiBpdCBpcyBhIHRydXRoeSB2YWx1ZSwgVVJMIHJlc29sdXRpb24gaXNcbiAqIHN3aXRjaGVkIHRvIHJlbGF0aXZlLCBpZiBpdCBpcyBhIGZhbHN5IHZhbHVlLCBVUkwgcmVzb2x1dGlvbiBpcyBzd2l0Y2hlZCB0b1xuICogYWJzb2x1dGUuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnJlc29sdmVSZWxhdGl2ZSA9IGZ1bmN0aW9uKGZsYWcpIHtcbiAgaWYgKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyB8fCBmbGFnID09PSBudWxsKSB7XG4gICAgZmxhZyA9IHRydWU7XG4gIH1cbiAgdGhpcy5yZXNvbHZlUmVsYXRpdmVGbGFnID0gISFmbGFnO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWFrZXMgVHJhdmVyc29uIHByZWZlciBlbWJlZGRlZCByZXNvdXJjZXMgb3ZlciB0cmF2ZXJzaW5nIGEgbGluayBvciB2aWNlXG4gKiB2ZXJzYS4gVGhpcyBvbmx5IGFwcGxpZXMgdG8gbWVkaWEgdHlwZXMgd2hpY2ggc3VwcG9ydCBlbWJlZGRlZCByZXNvdXJjZXNcbiAqIChsaWtlIEhBTCkuIEl0IGhhcyBubyBlZmZlY3Qgd2hlbiB1c2luZyBhIG1lZGlhIHR5cGUgdGhhdCBkb2VzIG5vdCBzdXBwb3J0XG4gKiBlbWJlZGRlZCByZXNvdXJjZXMuXG4gKlxuICogSXQgYWxzbyBvbmx5IHRha2VzIGVmZmVjdCB3aGVuIGEgcmVzb3VyY2UgY29udGFpbnMgYm90aCBhIGxpbmsgX2FuZF8gYW5cbiAqIGVtYmVkZGVkIHJlc291cmNlIHdpdGggdGhlIG5hbWUgdGhhdCBpcyB0byBiZSBmb2xsb3dlZCBhdCB0aGlzIHN0ZXAgaW4gdGhlXG4gKiBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzLlxuICpcbiAqIElmIHRoZSBtZXRob2QgaXMgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzIChvciB0aGUgZmlyc3QgYXJndW1lbnQgaXMgdW5kZWZpbmVkXG4gKiBvciBudWxsKSwgZW1iZWRkZWQgcmVzb3VyY2VzIHdpbGwgYmUgcHJlZmVycmVkIG92ZXIgZmV0Y2hpbmcgbGlua2VkIHJlc291cmNlc1xuICogd2l0aCBhbiBhZGRpdGlvbmFsIEhUVFAgcmVxdWVzdC4gT3RoZXJ3aXNlIHRoZSBhcmd1bWVudCBpcyBpbnRlcnByZXRlZCBhcyBhXG4gKiBib29sZWFuIGZsYWcuIElmIGl0IGlzIGEgdHJ1dGh5IHZhbHVlLCBlbWJlZGRlZCByZXNvdXJjZXMgd2lsbCBiZSBwcmVmZXJyZWQsXG4gKiBpZiBpdCBpcyBhIGZhbHN5IHZhbHVlLCB0cmF2ZXJzaW5nIHRoZSBsaW5rIHJlbGF0aW9uIHdpbGwgYmUgcHJlZmVycmVkLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wcmVmZXJFbWJlZGRlZFJlc291cmNlcyA9IGZ1bmN0aW9uKGZsYWcpIHtcbiAgaWYgKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyB8fCBmbGFnID09PSBudWxsKSB7XG4gICAgZmxhZyA9IHRydWU7XG4gIH1cbiAgdGhpcy5wcmVmZXJFbWJlZGRlZCA9ICEhZmxhZztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgbWVkaWEgdHlwZS4gSWYgbm8gbWVkaWEgdHlwZSBpcyBlbmZvcmNlZCBidXQgY29udGVudCB0eXBlXG4gKiBkZXRlY3Rpb24gaXMgdXNlZCwgdGhlIHN0cmluZyBgY29udGVudC1uZWdvdGlhdGlvbmAgaXMgcmV0dXJuZWQuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldE1lZGlhVHlwZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5tZWRpYVR5cGU7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIFVSTCBzZXQgYnkgdGhlIGZyb20odXJsKSBtZXRob2QsIHRoYXQgaXMsIHRoZSByb290IFVSTCBvZiB0aGVcbiAqIEFQSS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0RnJvbSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdGFydFVybDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdGVtcGxhdGUgcGFyYW1ldGVycyBzZXQgYnkgdGhlIHdpdGhUZW1wbGF0ZVBhcmFtZXRlcnMuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldFRlbXBsYXRlUGFyYW1ldGVycyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50ZW1wbGF0ZVBhcmFtZXRlcnM7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlcXVlc3Qgb3B0aW9ucyBzZXQgYnkgdGhlIHdpdGhSZXF1ZXN0T3B0aW9ucyBvclxuICogYWRkUmVxdWVzdE9wdGlvbnMuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldFJlcXVlc3RPcHRpb25zID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnJlcXVlc3RPcHRpb25zO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXN0b20gcmVxdWVzdCBsaWJyYXJ5IGluc3RhbmNlIHNldCBieSB3aXRoUmVxdWVzdExpYnJhcnkgb3IgdGhlXG4gKiBzdGFuZGFyZCByZXF1ZXN0IGxpYnJhcnkgaW5zdGFuY2UsIGlmIGEgY3VzdG9tIG9uZSBoYXMgbm90IGJlZW4gc2V0LlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRSZXF1ZXN0TGlicmFyeSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yZXF1ZXN0TW9kdWxlSW5zdGFuY2U7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1c3RvbSBKU09OIHBhcnNlciBmdW5jdGlvbiBzZXQgYnkgcGFyc2VSZXNwb25zZUJvZGllc1dpdGggb3IgdGhlXG4gKiBzdGFuZGFyZCBwYXJzZXIgZnVuY3Rpb24sIGlmIGEgY3VzdG9tIG9uZSBoYXMgbm90IGJlZW4gc2V0LlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRKc29uUGFyc2VyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmpzb25QYXJzZXI7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYm9keSBvZiB0aGUgbGFzdCByZXNwb25zZSB3aWxsIGJlIGNvbnZlcnRlZCB0byBhXG4gKiBKYXZhU2NyaXB0IG9iamVjdCBiZWZvcmUgcGFzc2luZyB0aGUgcmVzdWx0IGJhY2sgdG8gdGhlIGNhbGxiYWNrLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5jb252ZXJ0c1Jlc3BvbnNlVG9PYmplY3QgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY29udmVydFJlc3BvbnNlVG9PYmplY3RGbGFnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmbGFnIGNvbnRyb2xsaW5nIGlmIFVSTHMgYXJlIHJlc29sdmVkIHJlbGF0aXZlIG9yIGFic29sdXRlLlxuICogQSByZXR1cm4gdmFsdWUgb2YgdHJ1ZSBtZWFucyB0aGF0IFVSTHMgYXJlIHJlc29sdmVkIHJlbGF0aXZlLCBmYWxzZSBtZWFuc1xuICogYWJzb2x1dGUuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmRvZXNSZXNvbHZlUmVsYXRpdmUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZVJlbGF0aXZlRmxhZztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmxhZyBjb250cm9sbGluZyBpZiBlbWJlZGRlZCByZXNvdXJjZXMgYXJlIHByZWZlcnJlZCBvdmVyIGxpbmtzLlxuICogQSByZXR1cm4gdmFsdWUgb2YgdHJ1ZSBtZWFucyB0aGF0IGVtYmVkZGVkIHJlc291cmNlcyBhcmUgcHJlZmVycmVkLCBmYWxzZVxuICogbWVhbnMgdGhhdCBmb2xsb3dpbmcgbGlua3MgaXMgcHJlZmVycmVkLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5kb2VzUHJlZmVyRW1iZWRkZWRSZXNvdXJjZXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucHJlZmVyRW1iZWRkZWQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBjb250ZW50IG5lZ290aWF0aW9uIGlzIGVuYWJsZWQgYW5kIGZhbHNlIGlmIGEgcGFydGljdWxhclxuICogbWVkaWEgdHlwZSBpcyBmb3JjZWQuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmRvZXNDb250ZW50TmVnb3RpYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY29udGVudE5lZ290aWF0aW9uO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHBhc3NlcyB0aGUgbGFzdCBIVFRQIHJlc3BvbnNlIHRvIHRoZVxuICogY2FsbGJhY2suXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldChjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2luaXRpYXRpbmcgdHJhdmVyc2FsIChnZXQpJyk7XG4gIHZhciB0ID0gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHRoaXMpO1xuICByZXR1cm4gYWN0aW9ucy5nZXQodCwgd3JhcEZvckNvbnRpbnVlKHRoaXMsIHQsIGNhbGxiYWNrLCAnZ2V0JykpO1xufTtcblxuLyoqXG4gKiBTcGVjaWFsIHZhcmlhbnQgb2YgZ2V0KCkgdGhhdCBkb2VzIG5vdCB5aWVsZCB0aGUgZnVsbCBodHRwIHJlc3BvbnNlIHRvIHRoZVxuICogY2FsbGJhY2sgYnV0IGluc3RlYWQgdGhlIGFscmVhZHkgcGFyc2VkIEpTT04gYXMgYW4gb2JqZWN0LlxuICpcbiAqIFRoaXMgaXMgYSBzaG9ydGN1dCBmb3IgYnVpbGRlci5jb252ZXJ0UmVzcG9uc2VUb09iamVjdCgpLmdldChjYWxsYmFjaykuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldFJlc291cmNlID0gZnVuY3Rpb24gZ2V0UmVzb3VyY2UoY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdpbml0aWF0aW5nIHRyYXZlcnNhbCAoZ2V0UmVzb3VyY2UpJyk7XG4gIHRoaXMuY29udmVydFJlc3BvbnNlVG9PYmplY3RGbGFnID0gdHJ1ZTtcbiAgdmFyIHQgPSBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUodGhpcyk7XG4gIHJldHVybiBhY3Rpb25zLmdldCh0LCB3cmFwRm9yQ29udGludWUodGhpcywgdCwgY2FsbGJhY2ssXG4gICAgICAnZ2V0UmVzb3VyY2UnKSk7XG59O1xuXG4vKipcbiAqIFNwZWNpYWwgdmFyaWFudCBvZiBnZXQoKSB0aGF0IGRvZXMgbm90IGV4ZWN1dGUgdGhlIGxhc3QgcmVxdWVzdCBidXQgaW5zdGVhZFxuICogeWllbGRzIHRoZSBsYXN0IFVSTCB0byB0aGUgY2FsbGJhY2suXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldFVybCA9IGZ1bmN0aW9uIGdldFVybChjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2luaXRpYXRpbmcgdHJhdmVyc2FsIChnZXRVcmwpJyk7XG4gIHZhciB0ID0gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHRoaXMpO1xuICByZXR1cm4gYWN0aW9ucy5nZXRVcmwodCwgd3JhcEZvckNvbnRpbnVlKHRoaXMsIHQsIGNhbGxiYWNrLCAnZ2V0VXJsJykpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3IgZ2V0VXJsLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRVcmkgPSBCdWlsZGVyLnByb3RvdHlwZS5nZXRVcmw7XG5cblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgUE9TVCByZXF1ZXN0IHdpdGggdGhlXG4gKiBnaXZlbiBib2R5IHRvIHRoZSBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBQT1NUIHJlcXVlc3QgdG9cbiAqIHRoZSBjYWxsYmFjay5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIHBvc3QoYm9keSwgY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdpbml0aWF0aW5nIHRyYXZlcnNhbCAocG9zdCknKTtcbiAgdmFyIHQgPSBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUodGhpcywgYm9keSk7XG4gIHJldHVybiBhY3Rpb25zLnBvc3QodCwgd3JhcEZvckNvbnRpbnVlKHRoaXMsIHQsIGNhbGxiYWNrLCAncG9zdCcpKTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIFBVVCByZXF1ZXN0IHdpdGggdGhlXG4gKiBnaXZlbiBib2R5IHRvIHRoZSBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBQVVQgcmVxdWVzdCB0b1xuICogdGhlIGNhbGxiYWNrLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbiBwdXQoYm9keSwgY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdpbml0aWF0aW5nIHRyYXZlcnNhbCAocHV0KScpO1xuICB2YXIgdCA9IGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZSh0aGlzLCBib2R5KTtcbiAgcmV0dXJuIGFjdGlvbnMucHV0KHQsIHdyYXBGb3JDb250aW51ZSh0aGlzLCB0LCBjYWxsYmFjaywgJ3B1dCcpKTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIFBBVENIIHJlcXVlc3Qgd2l0aCB0aGVcbiAqIGdpdmVuIGJvZHkgdG8gdGhlIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIFBBVENIIHJlcXVlc3QgdG9cbiAqIHRoZSBjYWxsYmFjay5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucGF0Y2ggPSBmdW5jdGlvbiBwYXRjaChib2R5LCBjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2luaXRpYXRpbmcgdHJhdmVyc2FsIChwYXRjaCknKTtcbiAgdmFyIHQgPSBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUodGhpcywgYm9keSk7XG4gIHJldHVybiBhY3Rpb25zLnBhdGNoKHQsIHdyYXBGb3JDb250aW51ZSh0aGlzLCB0LCBjYWxsYmFjaywgJ3BhdGNoJykpO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgREVMRVRFIHJlcXVlc3QgdG8gdGhlXG4gKiBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBERUxFVEUgcmVxdWVzdCB0byB0aGUgY2FsbGJhY2suXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uIGRlbChjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2luaXRpYXRpbmcgdHJhdmVyc2FsIChkZWxldGUpJyk7XG4gIHZhciB0ID0gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHRoaXMpO1xuICByZXR1cm4gYWN0aW9ucy5kZWxldGUodCwgd3JhcEZvckNvbnRpbnVlKHRoaXMsIHQsIGNhbGxiYWNrLCAnZGVsZXRlJykpO1xufTtcblxuLyoqXG4gKiBBbGlhcyBmb3IgZGVsZXRlLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5kZWwgPSBCdWlsZGVyLnByb3RvdHlwZS5kZWxldGU7XG5cbmZ1bmN0aW9uIGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZShzZWxmLCBib2R5KSB7XG5cbiAgdmFyIHRyYXZlcnNhbFN0YXRlID0ge1xuICAgIGFib3J0ZWQ6IGZhbHNlLFxuICAgIGFkYXB0ZXI6IHNlbGYuYWRhcHRlciB8fCBudWxsLFxuICAgIGJvZHk6IGJvZHkgfHwgbnVsbCxcbiAgICBjYWxsYmFja0hhc0JlZW5DYWxsZWRBZnRlckFib3J0OiBmYWxzZSxcbiAgICBjb250ZW50TmVnb3RpYXRpb246IHNlbGYuZG9lc0NvbnRlbnROZWdvdGlhdGlvbigpLFxuICAgIGNvbnRpbnVhdGlvbjogbnVsbCxcbiAgICBjb252ZXJ0UmVzcG9uc2VUb09iamVjdDogc2VsZi5jb252ZXJ0c1Jlc3BvbnNlVG9PYmplY3QoKSxcbiAgICBsaW5rczogc2VsZi5saW5rcyxcbiAgICBqc29uUGFyc2VyOiBzZWxmLmdldEpzb25QYXJzZXIoKSxcbiAgICByZXF1ZXN0TW9kdWxlSW5zdGFuY2U6IHNlbGYuZ2V0UmVxdWVzdExpYnJhcnkoKSxcbiAgICByZXF1ZXN0T3B0aW9uczogc2VsZi5nZXRSZXF1ZXN0T3B0aW9ucygpLFxuICAgIHJlc29sdmVSZWxhdGl2ZTogc2VsZi5kb2VzUmVzb2x2ZVJlbGF0aXZlKCksXG4gICAgcHJlZmVyRW1iZWRkZWQ6IHNlbGYuZG9lc1ByZWZlckVtYmVkZGVkUmVzb3VyY2VzKCksXG4gICAgc3RhcnRVcmw6IHNlbGYuc3RhcnRVcmwsXG4gICAgc3RlcCA6IHtcbiAgICAgIHVybDogc2VsZi5zdGFydFVybCxcbiAgICAgIGluZGV4OiAwLFxuICAgIH0sXG4gICAgdGVtcGxhdGVQYXJhbWV0ZXJzOiBzZWxmLmdldFRlbXBsYXRlUGFyYW1ldGVycygpLFxuICB9O1xuICB0cmF2ZXJzYWxTdGF0ZS5hYm9ydFRyYXZlcnNhbCA9IGFib3J0VHJhdmVyc2FsLmJpbmQodHJhdmVyc2FsU3RhdGUpO1xuXG4gIGlmIChzZWxmLmNvbnRpbnVhdGlvbikge1xuICAgIHRyYXZlcnNhbFN0YXRlLmNvbnRpbnVhdGlvbiA9IHNlbGYuY29udGludWF0aW9uO1xuICAgIHRyYXZlcnNhbFN0YXRlLnN0ZXAgPSBzZWxmLmNvbnRpbnVhdGlvbi5zdGVwO1xuICAgIHNlbGYuY29udGludWF0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0cmF2ZXJzYWxTdGF0ZTtcbn1cblxuZnVuY3Rpb24gd3JhcEZvckNvbnRpbnVlKHNlbGYsIHQsIGNhbGxiYWNrLCBmaXJzdFRyYXZlcnNhbEFjdGlvbikge1xuICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyKSB7IHJldHVybiBjYWxsYmFjayhlcnIpOyB9XG4gICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3VsdCwge1xuICAgICAgY29udGludWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIHRyYXZlcnNhbCBzdGF0ZSB0byBjb250aW51ZSBmcm9tLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmRlYnVnKCc+IGNvbnRpbnVpbmcgZmluaXNoZWQgdHJhdmVyc2FsIHByb2Nlc3MnKTtcbiAgICAgICAgc2VsZi5jb250aW51YXRpb24gPSB7XG4gICAgICAgICAgc3RlcDogdC5zdGVwLFxuICAgICAgICAgIGFjdGlvbjogZmlyc3RUcmF2ZXJzYWxBY3Rpb24sXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuY29udGludWF0aW9uLnN0ZXAuaW5kZXggPSAwO1xuICAgICAgICBpbml0RnJvbVRyYXZlcnNhbFN0YXRlKHNlbGYsIHQpO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG59XG5cbi8qXG4gKiBDb3B5IGNvbmZpZ3VyYXRpb24gZnJvbSB0cmF2ZXJzYWwgc3RhdGUgdG8gYnVpbGRlciBpbnN0YW5jZSB0b1xuICogcHJlcGFyZSBmb3IgbmV4dCB0cmF2ZXJzYWwgcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gaW5pdEZyb21UcmF2ZXJzYWxTdGF0ZShzZWxmLCB0KSB7XG4gIHNlbGYuYWJvcnRlZCA9IGZhbHNlO1xuICBzZWxmLmFkYXB0ZXIgPSB0LmFkYXB0ZXI7XG4gIHNlbGYuYm9keSA9IHQuYm9keTtcbiAgc2VsZi5jYWxsYmFja0hhc0JlZW5DYWxsZWRBZnRlckFib3J0ID0gZmFsc2U7XG4gIHNlbGYuY29udGVudE5lZ290aWF0aW9uID0gdC5jb250ZW50TmVnb3RpYXRpb247XG4gIHNlbGYuY29udmVydFJlc3BvbnNlVG9PYmplY3RGbGFnID0gdC5jb252ZXJ0UmVzcG9uc2VUb09iamVjdDtcbiAgc2VsZi5saW5rcyA9IFtdO1xuICBzZWxmLmpzb25QYXJzZXIgPSAgdC5qc29uUGFyc2VyO1xuICBzZWxmLnJlcXVlc3RNb2R1bGVJbnN0YW5jZSA9IHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLFxuICBzZWxmLnJlcXVlc3RPcHRpb25zID0gdC5yZXF1ZXN0T3B0aW9ucyxcbiAgc2VsZi5yZXNvbHZlUmVsYXRpdmVGbGFnID0gdC5yZXNvbHZlUmVsYXRpdmU7XG4gIHNlbGYucHJlZmVyRW1iZWRkZWQgPSB0LnByZWZlckVtYmVkZGVkO1xuICBzZWxmLnN0YXJ0VXJsID0gdC5zdGFydFVybDtcbiAgc2VsZi50ZW1wbGF0ZVBhcmFtZXRlcnMgPSB0LnRlbXBsYXRlUGFyYW1ldGVycztcbn1cblxuZnVuY3Rpb24gY2xvbmVBcnJheU9yT2JqZWN0KHRoaW5nKSB7XG4gIGlmICh1dGlsLmlzQXJyYXkodGhpbmcpKSB7XG4gICAgcmV0dXJuIHNoYWxsb3dDbG9uZUFycmF5KHRoaW5nKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdGhpbmcgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGRlZXBDbG9uZU9iamVjdCh0aGluZyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlZXBDbG9uZU9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuIG1lcmdlUmVjdXJzaXZlKG51bGwsIG9iamVjdCk7XG59XG5cbmZ1bmN0aW9uIHNoYWxsb3dDbG9uZUFycmF5KGFycmF5KSB7XG4gIGlmICghYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cbiAgcmV0dXJuIGFycmF5LnNsaWNlKDApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1aWxkZXI7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuL2Fib3J0X3RyYXZlcnNhbCcpXG4gICwgZGV0ZWN0Q29udGVudFR5cGUgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZGV0ZWN0X2NvbnRlbnRfdHlwZScpXG4gICwgZ2V0T3B0aW9uc0ZvclN0ZXAgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZ2V0X29wdGlvbnNfZm9yX3N0ZXAnKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhIEhUVFAgR0VUIHJlcXVlc3QgZHVyaW5nIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzLlxuICovXG4vLyBUaGlzIG1ldGhvZCBpcyBjdXJyZW50bHkgdXNlZCBmb3IgYWxsIGludGVybWVkaWF0ZSBHRVQgcmVxdWVzdHMgZHVyaW5nIHRoZVxuLy8gbGluayB0cmF2ZXJzYWwgcHJvY2Vzcy4gQ29pbmNpZGVudGFsbHksIGl0IGlzIGFsc28gdXNlZCBmb3IgdGhlIGZpbmFsIHJlcXVlc3Rcbi8vIGluIGEgbGluayB0cmF2ZXJzYWwgc2hvdWxkIHRoaXMgaGFwcGVuIHRvIGJlIGEgR0VUIHJlcXVlc3QuIE90aGVyd2lzZSAoUE9TVC9cbi8vIFBVVC9QQVRDSC9ERUxFVEUpLCBUcmF2ZXJzb24gdXNlcyBleGVjdHVlSHR0cFJlcXVlc3QuXG5leHBvcnRzLmZldGNoUmVzb3VyY2UgPSBmdW5jdGlvbiBmZXRjaFJlc291cmNlKHQsIGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnZmV0Y2hpbmcgcmVzb3VyY2UgZm9yIG5leHQgc3RlcCcpO1xuICBpZiAodC5zdGVwLnVybCkge1xuICAgIGxvZy5kZWJ1ZygnZmV0Y2hpbmcgcmVzb3VyY2UgZnJvbSAnLCB0LnN0ZXAudXJsKTtcbiAgICByZXR1cm4gZXhlY3V0ZUh0dHBHZXQodCwgY2FsbGJhY2spO1xuICB9IGVsc2UgaWYgKHQuc3RlcC5kb2MpIHtcbiAgICAvLyBUaGUgc3RlcCBhbHJlYWR5IGhhcyBhbiBhdHRhY2hlZCByZXN1bHQgZG9jdW1lbnQsIHNvIGFsbCBpcyBmaW5lIGFuZCB3ZVxuICAgIC8vIGNhbiBjYWxsIHRoZSBjYWxsYmFjayBpbW1lZGlhdGVseVxuICAgIGxvZy5kZWJ1ZygncmVzb3VyY2UgZm9yIG5leHQgc3RlcCBoYXMgYWxyZWFkeSBiZWVuIGZldGNoZWQsIHVzaW5nICcgK1xuICAgICAgICAnZW1iZWRkZWQnKTtcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHQpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdDYW4gbm90IHByb2Nlc3Mgc3RlcCcpO1xuICAgICAgZXJyb3Iuc3RlcCA9IHQuc3RlcDtcbiAgICAgIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhlY3V0ZUh0dHBHZXQodCwgY2FsbGJhY2spIHtcbiAgdmFyIG9wdGlvbnMgPSBnZXRPcHRpb25zRm9yU3RlcCh0KTtcbiAgbG9nLmRlYnVnKCdIVFRQIEdFVCByZXF1ZXN0IHRvICcsIHQuc3RlcC51cmwpO1xuICBsb2cuZGVidWcoJ29wdGlvbnMgJywgb3B0aW9ucyk7XG4gIHQuY3VycmVudFJlcXVlc3QgPVxuICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLmdldCh0LnN0ZXAudXJsLCBvcHRpb25zLFxuICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgbG9nLmRlYnVnKCdIVFRQIEdFVCByZXF1ZXN0IHRvICcgKyB0LnN0ZXAudXJsICsgJyByZXR1cm5lZCcpO1xuICAgIHQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuXG4gICAgLy8gd29ya2Fyb3VuZCBmb3IgY2FzZXMgd2hlcmUgcmVzcG9uc2UgYm9keSBpcyBlbXB0eSBidXQgYm9keSBjb21lcyBpbiBhc1xuICAgIC8vIHRoZSB0aGlyZCBhcmd1bWVudFxuICAgIGlmIChib2R5ICYmICFyZXNwb25zZS5ib2R5KSB7XG4gICAgICByZXNwb25zZS5ib2R5ID0gYm9keTtcbiAgICB9XG4gICAgdC5zdGVwLnJlc3BvbnNlID0gcmVzcG9uc2U7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHQpO1xuICAgIH1cbiAgICBsb2cuZGVidWcoJ3JlcXVlc3QgdG8gJyArIHQuc3RlcC51cmwgKyAnIGZpbmlzaGVkIHdpdGhvdXQgZXJyb3IgKCcgK1xuICAgICAgcmVzcG9uc2Uuc3RhdHVzQ29kZSArICcpJyk7XG5cbiAgICBpZiAoIWRldGVjdENvbnRlbnRUeXBlKHQsIGNhbGxiYWNrKSkgcmV0dXJuO1xuXG4gICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHQpO1xuICB9KTtcbiAgYWJvcnRUcmF2ZXJzYWwucmVnaXN0ZXJBYm9ydExpc3RlbmVyKHQsIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhbiBhcmJpdHJhcnkgSFRUUCByZXF1ZXN0LlxuICovXG4vLyBUaGlzIG1ldGhvZCBpcyBjdXJyZW50bHkgdXNlZCBmb3IgUE9TVC9QVVQvUEFUQ0gvREVMRVRFIGF0IHRoZSBlbmQgb2YgYSBsaW5rXG4vLyB0cmF2ZXJzYWwgcHJvY2Vzcy4gSWYgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgcmVxdWlyZXMgYSBHRVQgYXMgdGhlIGxhc3Rcbi8vIHJlcXVlc3QsIFRyYXZlcnNvbiB1c2VzIGV4ZWN0dWVIdHRwR2V0LlxuZXhwb3J0cy5leGVjdXRlSHR0cFJlcXVlc3QgPSBmdW5jdGlvbih0LCByZXF1ZXN0LCBtZXRob2QsIGNhbGxiYWNrKSB7XG4gIHZhciByZXF1ZXN0T3B0aW9ucyA9IGdldE9wdGlvbnNGb3JTdGVwKHQpO1xuICBpZiAodC5ib2R5KSB7XG4gICAgcmVxdWVzdE9wdGlvbnMuYm9keSA9IEpTT04uc3RyaW5naWZ5KHQuYm9keSk7XG4gIH1cblxuICBsb2cuZGVidWcoJ0hUVFAgJyArIG1ldGhvZC5uYW1lICsgJyByZXF1ZXN0IHRvICcsIHQuc3RlcC51cmwpO1xuICBsb2cuZGVidWcoJ29wdGlvbnMgJywgcmVxdWVzdE9wdGlvbnMpO1xuICB0LmN1cnJlbnRSZXF1ZXN0ID1cbiAgICBtZXRob2QuY2FsbChyZXF1ZXN0LCB0LnN0ZXAudXJsLCByZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgZnVuY3Rpb24oZXJyLCByZXNwb25zZSwgYm9keSkge1xuICAgIGxvZy5kZWJ1ZygnSFRUUCAnICsgbWV0aG9kLm5hbWUgKyAnIHJlcXVlc3QgdG8gJyArIHQuc3RlcC51cmwgK1xuICAgICAgJyByZXR1cm5lZCcpO1xuICAgIHQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuXG4gICAgLy8gd29ya2Fyb3VuZCBmb3IgY2FzZXMgd2hlcmUgcmVzcG9uc2UgYm9keSBpcyBlbXB0eSBidXQgYm9keSBjb21lcyBpbiBhc1xuICAgIC8vIHRoZSB0aGlyZCBhcmd1bWVudFxuICAgIGlmIChib2R5ICYmICFyZXNwb25zZS5ib2R5KSB7XG4gICAgICByZXNwb25zZS5ib2R5ID0gYm9keTtcbiAgICB9XG4gICAgdC5zdGVwLnJlc3BvbnNlID0gcmVzcG9uc2U7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UpO1xuICB9KTtcbiAgYWJvcnRUcmF2ZXJzYWwucmVnaXN0ZXJBYm9ydExpc3RlbmVyKHQsIGNhbGxiYWNrKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDb250aW51YXRpb24odCkge1xuICByZXR1cm4gdC5jb250aW51YXRpb24gJiYgdC5zdGVwICYmIHQuc3RlcC5yZXNwb25zZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBqc29ucGF0aExpYiA9IHJlcXVpcmUoJ0pTT05QYXRoJylcbiAgLCBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgX3MgPSByZXF1aXJlKCd1bmRlcnNjb3JlLnN0cmluZycpO1xuXG52YXIganNvbnBhdGggPSBqc29ucGF0aExpYi5ldmFsO1xuXG5mdW5jdGlvbiBKc29uQWRhcHRlcihsb2cpIHtcbiAgdGhpcy5sb2cgPSBsb2c7XG59XG5cbkpzb25BZGFwdGVyLnByb3RvdHlwZS5maW5kTmV4dFN0ZXAgPSBmdW5jdGlvbihkb2MsIGxpbmspIHtcbiAgdGhpcy5sb2cuZGVidWcoJ2V4dHJhY3RpbmcgbGluayBmcm9tIGRvYycsIGxpbmssIGRvYyk7XG4gIHZhciB1cmw7XG4gIGlmICh0aGlzLnRlc3RKU09OUGF0aChsaW5rKSkge1xuICAgIHJldHVybiB7IHVybDogdGhpcy5yZXNvbHZlSlNPTlBhdGgobGluaywgZG9jKSB9O1xuICB9IGVsc2UgaWYgKGRvY1tsaW5rXSkge1xuICAgIHJldHVybiB7IHVybCA6IGRvY1tsaW5rXSB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgcHJvcGVydHkgJyArIGxpbmsgK1xuICAgICAgICAnIGluIGRvY3VtZW50OlxcbicsIGRvYyk7XG4gIH1cbn07XG5cbkpzb25BZGFwdGVyLnByb3RvdHlwZS50ZXN0SlNPTlBhdGggPSBmdW5jdGlvbihsaW5rKSB7XG4gIHJldHVybiBfcy5zdGFydHNXaXRoKGxpbmssICckLicpIHx8IF9zLnN0YXJ0c1dpdGgobGluaywgJyRbJyk7XG59O1xuXG5Kc29uQWRhcHRlci5wcm90b3R5cGUucmVzb2x2ZUpTT05QYXRoID0gZnVuY3Rpb24obGluaywgZG9jKSB7XG4gIHZhciBtYXRjaGVzID0ganNvbnBhdGgoZG9jLCBsaW5rKTtcbiAgaWYgKG1hdGNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHVybCA9IG1hdGNoZXNbMF07XG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSlNPTlBhdGggZXhwcmVzc2lvbiAnICsgbGluayArXG4gICAgICAgICcgd2FzIHJlc29sdmVkIGJ1dCB0aGUgcmVzdWx0IHdhcyBudWxsLCB1bmRlZmluZWQgb3IgYW4gZW1wdHknICtcbiAgICAgICAgJyBzdHJpbmcgaW4gZG9jdW1lbnQ6XFxuJyArIEpTT04uc3RyaW5naWZ5KGRvYykpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSlNPTlBhdGggZXhwcmVzc2lvbiAnICsgbGluayArXG4gICAgICAgICcgd2FzIHJlc29sdmVkIGJ1dCB0aGUgcmVzdWx0IGlzIG5vdCBhIHByb3BlcnR5IG9mIHR5cGUgc3RyaW5nLiAnICtcbiAgICAgICAgJ0luc3RlYWQgaXQgaGFzIHR5cGUgXCInICsgKHR5cGVvZiB1cmwpICtcbiAgICAgICAgJ1wiIGluIGRvY3VtZW50OlxcbicgKyBKU09OLnN0cmluZ2lmeShkb2MpKTtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbiAgfSBlbHNlIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAvLyBhbWJpZ2lvdXMgbWF0Y2hcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT05QYXRoIGV4cHJlc3Npb24gJyArIGxpbmsgK1xuICAgICAgJyByZXR1cm5lZCBtb3JlIHRoYW4gb25lIG1hdGNoIGluIGRvY3VtZW50OlxcbicgK1xuICAgICAgSlNPTi5zdHJpbmdpZnkoZG9jKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gbm8gbWF0Y2ggYXQgYWxsXG4gICAgdGhyb3cgbmV3IEVycm9yKCdKU09OUGF0aCBleHByZXNzaW9uICcgKyBsaW5rICtcbiAgICAgICcgcmV0dXJuZWQgbm8gbWF0Y2ggaW4gZG9jdW1lbnQ6XFxuJyArIEpTT04uc3RyaW5naWZ5KGRvYykpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEpzb25BZGFwdGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVkaWFUeXBlcyA9IHJlcXVpcmUoJy4vbWVkaWFfdHlwZXMnKTtcblxudmFyIHJlZ2lzdHJ5ID0ge307XG5cbmV4cG9ydHMucmVnaXN0ZXIgPSBmdW5jdGlvbiByZWdpc3Rlcihjb250ZW50VHlwZSwgY29uc3RydWN0b3IpIHtcbiAgcmVnaXN0cnlbY29udGVudFR5cGVdID0gY29uc3RydWN0b3I7XG59O1xuXG5leHBvcnRzLmdldCA9IGZ1bmN0aW9uIGdldChjb250ZW50VHlwZSkge1xuICByZXR1cm4gcmVnaXN0cnlbY29udGVudFR5cGVdO1xufTtcblxuZXhwb3J0cy5yZWdpc3RlcihtZWRpYVR5cGVzLkNPTlRFTlRfTkVHT1RJQVRJT04sXG4gICAgcmVxdWlyZSgnLi9uZWdvdGlhdGlvbl9hZGFwdGVyJykpO1xuZXhwb3J0cy5yZWdpc3RlcihtZWRpYVR5cGVzLkpTT04sIHJlcXVpcmUoJy4vanNvbl9hZGFwdGVyJykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ09OVEVOVF9ORUdPVElBVElPTjogJ2NvbnRlbnQtbmVnb3RpYXRpb24nLFxuICBKU09OOiAnYXBwbGljYXRpb24vanNvbicsXG4gIEpTT05fSEFMOiAnYXBwbGljYXRpb24vaGFsK2pzb24nLFxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVE9ETyBNYXliZSByZXBsYWNlIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL1JheW5vcy94dGVuZFxuLy8gY2hlY2sgYnJvd3NlciBidWlsZCBzaXplLCB0aG91Z2guXG5mdW5jdGlvbiBtZXJnZVJlY3Vyc2l2ZShvYmoxLCBvYmoyKSB7XG4gIGlmICghb2JqMSAmJiBvYmoyKSB7XG4gICAgb2JqMSA9IHt9O1xuICB9XG4gIGZvciAodmFyIGtleSBpbiBvYmoyKSB7XG4gICAgaWYgKCFvYmoyLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBtZXJnZShvYmoxLCBvYmoyLCBrZXkpO1xuICB9XG4gIHJldHVybiBvYmoxO1xufVxuXG5mdW5jdGlvbiBtZXJnZShvYmoxLCBvYmoyLCBrZXkpIHtcbiAgaWYgKHR5cGVvZiBvYmoyW2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgLy8gaWYgaXQgaXMgYW4gb2JqZWN0ICh0aGF0IGlzLCBhIG5vbi1sZWF2ZSBpbiB0aGUgdHJlZSksXG4gICAgLy8gYW5kIGl0IGlzIG5vdCBwcmVzZW50IGluIG9iajFcbiAgICBpZiAoIW9iajFba2V5XSB8fCB0eXBlb2Ygb2JqMVtrZXldICE9PSAnb2JqZWN0Jykge1xuICAgICAgLy8gLi4uIHdlIGNyZWF0ZSBhbiBlbXB0eSBvYmplY3QgaW4gb2JqMVxuICAgICAgb2JqMVtrZXldID0ge307XG4gICAgfVxuICAgIC8vIGFuZCB3ZSByZWN1cnNlIGRlZXBlciBpbnRvIHRoZSBzdHJ1Y3R1cmVcbiAgICBtZXJnZVJlY3Vyc2l2ZShvYmoxW2tleV0sIG9iajJba2V5XSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG9iajJba2V5XSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIGlmIGl0IGlzIHByaW1pdGl2ZSAoc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4pLCB3ZSBvdmVyd3JpdGUvYWRkIGl0IHRvXG4gICAgLy8gb2JqMVxuICAgIG9iajFba2V5XSA9IG9iajJba2V5XTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlUmVjdXJzaXZlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOZWdvdGlhdGlvbkFkYXB0ZXIobG9nKSB7fVxuXG5OZWdvdGlhdGlvbkFkYXB0ZXIucHJvdG90eXBlLmZpbmROZXh0U3RlcCA9IGZ1bmN0aW9uKGRvYywgbGluaykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NvbnRlbnQgbmVnb3RpYXRpb24gZGlkIG5vdCBoYXBwZW4nKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTmVnb3RpYXRpb25BZGFwdGVyO1xuIiwiLyoganNoaW50IGxvb3BmdW5jOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbi8qXG4gKiBBcHBsaWVzIGFzeW5jIGFuZCBzeW5jIHRyYW5zZm9ybXMsIG9uZSBhZnRlciBhbm90aGVyLlxuICovXG5mdW5jdGlvbiBhcHBseVRyYW5zZm9ybXModHJhbnNmb3JtcywgdCwgY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdhcHBseWluZycsIHRyYW5zZm9ybXMubGVuZ3RoLCAndHJhbnNmb3JtcycpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zZm9ybXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdHJhbnNmb3JtID0gdHJhbnNmb3Jtc1tpXTtcbiAgICBsb2cuZGVidWcoJ25leHQgdHJhbnNmb3JtJywgdHJhbnNmb3JtKTtcbiAgICBpZiAodHJhbnNmb3JtLmlzQXN5bmMpIHtcbiAgICAgIGxvZy5kZWJ1ZygndHJhbnNmb3JtIGlzIGFzeW5jaHJvbm91cycpO1xuICAgICAgLy8gYXN5bmNocm9ub3VzIGNhc2VcbiAgICAgIHJldHVybiB0cmFuc2Zvcm0odCwgZnVuY3Rpb24odCkge1xuICAgICAgICAvLyB0aGlzIGlzIG9ubHkgY2FsbGVkIHdoZW4gdGhlIGFzeW5jIHRyYW5zZm9ybSB3YXMgc3VjY2Vzc2Z1bCxcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHQuY2FsbGJhY2sgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQgd2l0aCBhbiBlcnJvci5cbiAgICAgICAgbG9nLmRlYnVnKCdhc3luY2hyb25vdXMgdHJhbnNmb3JtIGZpbmlzaGVkIHN1Y2Nlc3NmdWxseSwgYXBwbHlpbmcgJyArXG4gICAgICAgICAgJ3JlbWFpbmluZyB0cmFuc2Zvcm1zLicpO1xuICAgICAgICBhcHBseVRyYW5zZm9ybXModHJhbnNmb3Jtcy5zbGljZShpICsgMSksIHQsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2cuZGVidWcoJ3RyYW5zZm9ybSBpcyBzeW5jaHJvbm91cycpO1xuICAgICAgLy8gc3luY2hyb25vdXMgY2FzZVxuICAgICAgdmFyIHJlc3VsdCA9IHRyYW5zZm9ybSh0KTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIGxvZy5kZWJ1ZygndHJhbnNmb3JtIGhhcyBmYWlsZWQnKTtcbiAgICAgICAgLy8gc3RvcCBwcm9jZXNzaW5nIHQuY2FsbGJhY2sgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWRcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nLmRlYnVnKCd0cmFuc2Zvcm0gc3VjY2Vzc2Z1bCcpO1xuICAgIH1cbiAgfVxuICBsb2cuZGVidWcoJ2FsbCB0cmFuc2Zvcm1zIGRvbmUnKTtcbiAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgY2FsbGJhY2sodCk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGx5VHJhbnNmb3JtcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi4vaXNfY29udGludWF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2hlY2tIdHRwU3RhdHVzKHQpIHtcbiAgLy8gdGhpcyBzdGVwIGlzIG9tbWl0dGVkIGZvciBjb250aW51YXRpb25zXG4gIGlmIChpc0NvbnRpbnVhdGlvbih0KSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbG9nLmRlYnVnKCdjaGVja2luZyBodHRwIHN0YXR1cycpO1xuICBpZiAoIXQuc3RlcC5yZXNwb25zZSAmJiB0LnN0ZXAuZG9jKSB7XG4gICAgLy8gTGFzdCBzdGVwIHByb2JhYmx5IGRpZCBub3QgZXhlY3V0ZSBhIEhUVFAgcmVxdWVzdCBidXQgdXNlZCBhbiBlbWJlZGRlZFxuICAgIC8vIGRvY3VtZW50LlxuICAgIGxvZy5kZWJ1ZygnZm91bmQgZW1iZWRkZWQgZG9jdW1lbnQsIGFzc3VtaW5nIG5vIEhUVFAgcmVxdWVzdCBoYXMgYmVlbiAnICtcbiAgICAgICAgJ21hZGUnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIE9ubHkgcHJvY2VzcyByZXNwb25zZSBpZiBodHRwIHN0YXR1cyB3YXMgaW4gMjAwIC0gMjk5IHJhbmdlLlxuICAvLyBUaGUgcmVxdWVzdCBtb2R1bGUgZm9sbG93cyByZWRpcmVjdHMgZm9yIEdFVCByZXF1ZXN0cyBhbGwgYnkgaXRzZWxmLCBzb1xuICAvLyB3ZSBzaG91bGQgbm90IGhhdmUgdG8gaGFuZGxlIHRoZW0gaGVyZS4gSWYgYSAzeHggaHR0cCBzdGF0dXMgZ2V0J3MgaGVyZVxuICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZy4gNHh4IGFuZCA1eHggb2YgY291cnNlIGFsc28gaW5kaWNhdGUgYW4gZXJyb3JcbiAgLy8gY29uZGl0aW9uLiAxeHggc2hvdWxkIG5vdCBvY2N1ci5cbiAgdmFyIGh0dHBTdGF0dXMgPSB0LnN0ZXAucmVzcG9uc2Uuc3RhdHVzQ29kZTtcbiAgaWYgKGh0dHBTdGF0dXMgJiYgKGh0dHBTdGF0dXMgPCAyMDAgfHwgaHR0cFN0YXR1cyA+PSAzMDApKSB7XG4gICAgdmFyIGVycm9yID0gaHR0cEVycm9yKHQuc3RlcC51cmwsIGh0dHBTdGF0dXMsIHQuc3RlcC5yZXNwb25zZS5ib2R5KTtcbiAgICBsb2cuZXJyb3IoJ3VuZXhwZWN0ZWQgaHR0cCBzdGF0dXMgY29kZScpO1xuICAgIGxvZy5lcnJvcihlcnJvcik7XG4gICAgdC5jYWxsYmFjayhlcnJvcik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGxvZy5kZWJ1ZygnaHR0cCBzdGF0dXMgY29kZSBvayAoJyArIGh0dHBTdGF0dXMgKyAnKScpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIGh0dHBFcnJvcih1cmwsIGh0dHBTdGF0dXMsIGJvZHkpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdIVFRQIEdFVCBmb3IgJyArIHVybCArXG4gICAgICAnIHJlc3VsdGVkIGluIEhUVFAgc3RhdHVzIGNvZGUgJyArIGh0dHBTdGF0dXMgKyAnLicpO1xuICBlcnJvci5uYW1lID0gJ0hUVFBFcnJvcic7XG4gIGVycm9yLnVybCA9IHVybDtcbiAgZXJyb3IuaHR0cFN0YXR1cyA9IGh0dHBTdGF0dXM7XG4gIGVycm9yLmJvZHkgPSBib2R5O1xuICB0cnkge1xuICAgIGVycm9yLmRvYyA9IEpTT04ucGFyc2UoYm9keSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBpZ25vcmVcbiAgfVxuICByZXR1cm4gZXJyb3I7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4uL2lzX2NvbnRpbnVhdGlvbicpO1xuXG4vKlxuICogVGhpcyB0cmFuc2Zvcm0gY292ZXJzIHRoZSBjYXNlIG9mIGEgZm9sbG93KCkgY2FsbCAqd2l0aG91dCBhbnkgbGlua3MqIGFmdGVyXG4gKiBhIGNvbnRpbnVlKCkuIEFjdHVhbGx5LCB0aGVyZSBpcyBub3RoaW5nIHRvIGRvIGhlcmUgc2luY2Ugd2Ugc2hvdWxkIGhhdmVcbiAqIGZldGNoZWQgZXZlcnl0aGluZyBsYXN0IHRpbWUuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29udGludWF0aW9uVG9Eb2ModCkge1xuICBpZiAoaXNDb250aW51YXRpb24odCkpIHtcbiAgICBsb2cuZGVidWcoJ2NvbnRpbnVpbmcgZnJvbSBsYXN0IHRyYXZlcnNhbCBwcm9jZXNzIChhY3Rpb25zKScpO1xuICAgIHQuY29udGludWF0aW9uID0gbnVsbDtcbiAgICB0LmNhbGxiYWNrKG51bGwsIHQuc3RlcC5kb2MpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBjb252ZXJ0RW1iZWRkZWREb2NUb1Jlc3BvbnNlID1cbiAgICAgIHJlcXVpcmUoJy4vY29udmVydF9lbWJlZGRlZF9kb2NfdG9fcmVzcG9uc2UnKVxuICAsIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi4vaXNfY29udGludWF0aW9uJyk7XG5cbi8qXG4gKiBmb2xsb3coKSBjYWxsIHdpdGhvdXQgbGlua3MgYWZ0ZXIgY29udGludWUoKS4gQWN0dWFsbHksIHRoZXJlIGlzIG5vdGhpbmdcbiAqIHRvIGRvIGhlcmUgc2luY2Ugd2Ugc2hvdWxkIGhhdmUgZmV0Y2hlZCBldmVyeXRoaW5nIGxhc3QgdGltZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb250aW51YXRpb25Ub1Jlc3BvbnNlKHQpIHtcbiAgaWYgKGlzQ29udGludWF0aW9uKHQpKSB7XG4gICAgbG9nLmRlYnVnKCdjb250aW51aW5nIGZyb20gbGFzdCB0cmF2ZXJzYWwgcHJvY2VzcyAoYWN0aW9ucyknKTtcbiAgICB0LmNvbnRpbnVhdGlvbiA9IG51bGw7XG4gICAgLy8gSG0sIGEgdHJhbnNmb3JtIHVzaW5nIGFub3RoZXIgdHJhbnNmb3JtLiBUaGlzIGZlZWxzIGEgYml0IGZpc2h5LlxuICAgIGNvbnZlcnRFbWJlZGRlZERvY1RvUmVzcG9uc2UodCk7XG4gICAgdC5jYWxsYmFjayhudWxsLCB0LnN0ZXAucmVzcG9uc2UpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29udmVydEVtYmVkZGVkRG9jVG9SZXNwb25zZSh0KSB7XG4gIGlmICghdC5zdGVwLnJlc3BvbnNlICYmIHQuc3RlcC5kb2MpIHtcbiAgICBsb2cuZGVidWcoJ2Zha2luZyBIVFRQIHJlc3BvbnNlIGZvciBlbWJlZGRlZCByZXNvdXJjZScpO1xuICAgIHQuc3RlcC5yZXNwb25zZSA9IHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHQuc3RlcC5kb2MpLFxuICAgICAgcmVtYXJrOiAnVGhpcyBpcyBub3QgYW4gYWN0dWFsIEhUVFAgcmVzcG9uc2UuIFRoZSByZXNvdXJjZSB5b3UgJyArXG4gICAgICAgICdyZXF1ZXN0ZWQgd2FzIGFuIGVtYmVkZGVkIHJlc291cmNlLCBzbyBubyBIVFRQIHJlcXVlc3Qgd2FzICcgK1xuICAgICAgICAnbWFkZSB0byBhY3F1aXJlIGl0LidcbiAgICB9O1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxudmFyIG1lZGlhVHlwZVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi4vbWVkaWFfdHlwZV9yZWdpc3RyeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRldGVjdENvbnRlbnRUeXBlKHQsIGNhbGxiYWNrKSB7XG4gIGlmICh0LmNvbnRlbnROZWdvdGlhdGlvbiAmJlxuICAgICAgdC5zdGVwLnJlc3BvbnNlICYmXG4gICAgICB0LnN0ZXAucmVzcG9uc2UuaGVhZGVycyAmJlxuICAgICAgdC5zdGVwLnJlc3BvbnNlLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddKSB7XG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdC5zdGVwLnJlc3BvbnNlLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddLnNwbGl0KC9bOyBdLylbMF07XG4gICAgdmFyIEFkYXB0ZXJUeXBlID0gbWVkaWFUeXBlUmVnaXN0cnkuZ2V0KGNvbnRlbnRUeXBlKTtcbiAgICBpZiAoIUFkYXB0ZXJUeXBlKSB7XG4gICAgICBjYWxsYmFjayhuZXcgRXJyb3IoJ1Vua25vd24gY29udGVudCB0eXBlIGZvciBjb250ZW50ICcgK1xuICAgICAgICAgICd0eXBlIGRldGVjdGlvbjogJyArIGNvbnRlbnRUeXBlKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIHN3aXRjaCB0byBuZXcgQWRhcHRlciBkZXBlbmRpbmcgb24gQ29udGVudC1UeXBlIGhlYWRlciBvZiBzZXJ2ZXJcbiAgICB0LmFkYXB0ZXIgPSBuZXcgQWRhcHRlclR5cGUobG9nKTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4uL2Fib3J0X3RyYXZlcnNhbCcpXG4gICwgaHR0cFJlcXVlc3RzID0gcmVxdWlyZSgnLi4vaHR0cF9yZXF1ZXN0cycpO1xuXG4vKlxuICogRXhlY3V0ZSB0aGUgbGFzdCBIVFRQIHJlcXVlc3QgaW4gYSB0cmF2ZXJzYWwgdGhhdCBlbmRzIGluXG4gKiBwb3N0L3B1dC9wYXRjaC9kZWxldGUsIGJ1dCBkbyBub3QgY2FsbCB0LmNhbGxiYWNrIGltbWVkaWF0ZWx5XG4gKiAoYmVjYXVzZSB3ZSBzdGlsbCBuZWVkIHRvIGRvIHJlc3BvbnNlIGJvZHkgdG8gb2JqZWN0IGNvbnZlcnNpb25cbiAqIGFmdGVyd2FyZHMsIGZvciBleGFtcGxlKVxuICovXG4vLyBUT0RPIFdoeSBpcyB0aGlzIGRpZmZlcmVudCBmcm9tIHdoZW4gZG8gYSBHRVQ/XG4vLyBQcm9iYWJseSBvbmx5IGJlY2F1c2UgdGhlIEhUVFAgbWV0aG9kIGlzIGNvbmZpZ3VyYWJsZSBoZXJlICh3aXRoXG4vLyB0Lmxhc3RNZXRob2QpLCB3ZSBtaWdodCBiZSBhYmxlIHRvIHVuaWZ5IHRoaXMgd2l0aCB0aGVcbi8vIGZldGNoX3Jlc291cmNlL2ZldGNoX2xhc3RfcmVzb3VyY2UgdHJhbnNmb3JtLlxuZnVuY3Rpb24gZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdCh0LCBjYWxsYmFjaykge1xuICAvLyBhbHdheXMgY2hlY2sgZm9yIGFib3J0ZWQgYmVmb3JlIGRvaW5nIGFuIEhUVFAgcmVxdWVzdFxuICBpZiAodC5hYm9ydGVkKSB7XG4gICAgcmV0dXJuIGFib3J0VHJhdmVyc2FsLmNhbGxDYWxsYmFja09uQWJvcnQodCk7XG4gIH1cbiAgLy8gb25seSBkaWZmIHRvIGV4ZWN1dGVfbGFzdF9odHRwX3JlcXVlc3Q6IHBhc3MgYSBuZXcgY2FsbGJhY2sgZnVuY3Rpb25cbiAgLy8gaW5zdGVhZCBvZiB0LmNhbGxiYWNrLlxuICBodHRwUmVxdWVzdHMuZXhlY3V0ZUh0dHBSZXF1ZXN0KFxuICAgICAgdCwgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UsIHQubGFzdE1ldGhvZCwgZnVuY3Rpb24oZXJyLCByZXNwb25zZSkge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGlmICghZXJyLmFib3J0ZWQpIHtcbiAgICAgICAgbG9nLmRlYnVnKCdlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHN0ZXAgJywgdC5zdGVwKTtcbiAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdC5jYWxsYmFjayhlcnIpO1xuICAgIH1cbiAgICBjYWxsYmFjayh0KTtcbiAgfSk7XG59XG5cbmV4ZWN1dGVMYXN0SHR0cFJlcXVlc3QuaXNBc3luYyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi4vYWJvcnRfdHJhdmVyc2FsJylcbiAgLCBodHRwUmVxdWVzdHMgPSByZXF1aXJlKCcuLi9odHRwX3JlcXVlc3RzJyk7XG5cbi8qXG4gKiBFeGVjdXRlIHRoZSBsYXN0IGh0dHAgcmVxdWVzdCBpbiBhIHRyYXZlcnNhbCB0aGF0IGVuZHMgaW5cbiAqIHBvc3QvcHV0L3BhdGNoL2RlbGV0ZS5cbiAqL1xuLy8gVE9ETyBXaHkgaXMgdGhpcyBkaWZmZXJlbnQgZnJvbSB3aGVuIGRvIGEgR0VUIGF0IHRoZSBlbmQgb2YgdGhlIHRyYXZlcnNhbD9cbi8vIFByb2JhYmx5IG9ubHkgYmVjYXVzZSB0aGUgSFRUUCBtZXRob2QgaXMgY29uZmlndXJhYmxlIGhlcmUgKHdpdGhcbi8vIHQubGFzdE1ldGhvZCksIHdlIG1pZ2h0IGJlIGFibGUgdG8gdW5pZnkgdGhpcyB3aXRoIHRoZVxuLy8gZmV0Y2hfcmVzb3VyY2UvZmV0Y2hfbGFzdF9yZXNvdXJjZSB0cmFuc2Zvcm0uXG5mdW5jdGlvbiBleGVjdXRlTGFzdEh0dHBSZXF1ZXN0KHQsIGNhbGxiYWNrKSB7XG4gIC8vIGFsd2F5cyBjaGVjayBmb3IgYWJvcnRlZCBiZWZvcmUgZG9pbmcgYW4gSFRUUCByZXF1ZXN0XG4gIGlmICh0LmFib3J0ZWQpIHtcbiAgICByZXR1cm4gYWJvcnRUcmF2ZXJzYWwuY2FsbENhbGxiYWNrT25BYm9ydCh0KTtcbiAgfVxuICBodHRwUmVxdWVzdHMuZXhlY3V0ZUh0dHBSZXF1ZXN0KFxuICAgICAgdCwgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UsIHQubGFzdE1ldGhvZCwgdC5jYWxsYmFjayk7XG59XG5cbmV4ZWN1dGVMYXN0SHR0cFJlcXVlc3QuaXNBc3luYyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxuLypcbiAqIFRoaXMgdHJhbnNmb3JtIGlzIG1lYW50IHRvIGJlIHJ1biBhdCB0aGUgdmVyeSBlbmQgb2YgYSBnZXRSZXNvdXJjZSBjYWxsLiBJdFxuICoganVzdCBleHRyYWN0cyB0aGUgbGFzdCBkb2MgZnJvbSB0aGUgc3RlcCBhbmQgY2FsbHMgdC5jYWxsYmFjayB3aXRoIGl0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dHJhY3REb2ModCkge1xuICBsb2cuZGVidWcoJ3dhbGtlci53YWxrIGhhcyBmaW5pc2hlZCcpO1xuICAvKlxuICBUT0RPIEJyZWFrcyBhIGxvdCBvZiB0ZXN0cyBhbHRob3VnaCBpdCBzZWVtcyB0byBtYWtlIHBlcmZlY3Qgc2Vuc2U/IT9cbiAgaWYgKCF0LmRvYykge1xuICAgIHQuY2FsbGJhY2sobmV3IEVycm9yKCdObyBkb2N1bWVudCBhdmFpbGFibGUnKSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gICovXG4gIHQuY2FsbGJhY2sobnVsbCwgdC5zdGVwLmRvYyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG4vKlxuICogVGhpcyB0cmFuc2Zvcm0gaXMgbWVhbnQgdG8gYmUgcnVuIGF0IHRoZSB2ZXJ5IGVuZCBvZiBhIGdldC9wb3N0L3B1dC9wYXRjaC9cbiAqIGRlbGV0ZSBjYWxsLiBJdCBqdXN0IGV4dHJhY3RzIHRoZSBsYXN0IHJlc3BvbnNlIGZyb20gdGhlIHN0ZXAgYW5kIGNhbGxzXG4gKiB0LmNhbGxiYWNrIHdpdGggaXQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0cmFjdERvYyh0KSB7XG4gIGxvZy5kZWJ1Zygnd2Fsa2VyLndhbGsgaGFzIGZpbmlzaGVkJyk7XG4gIC8qXG4gIFRPRE8gQnJlYWtzIGEgbG90IG9mIHRlc3RzIGFsdGhvdWdoIGl0IHNlZW1zIHRvIG1ha2UgcGVyZmVjdCBzZW5zZT8hP1xuICBpZiAoIXQucmVzcG9uc2UpIHtcbiAgICB0LmNhbGxiYWNrKG5ldyBFcnJvcignTm8gcmVzcG9uc2UgYXZhaWxhYmxlJykpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAqL1xuICB0LmNhbGxiYWNrKG51bGwsIHQuc3RlcC5yZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgdXJsID0gcmVxdWlyZSgndXJsJyk7XG5cbi8qXG4gKiBUaGlzIHRyYW5zZm9ybSBpcyBtZWFudCB0byBiZSBydW4gYXQgdGhlIHZlcnkgZW5kIG9mIGEgZ2V0L3Bvc3QvcHV0L3BhdGNoL1xuICogZGVsZXRlIGNhbGwuIEl0IGp1c3QgZXh0cmFjdHMgdGhlIGxhc3QgYWNjZXNzZWQgdXJsIGZyb20gdGhlIHN0ZXAgYW5kIGNhbGxzXG4gKiB0LmNhbGxiYWNrIHdpdGggaXQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0cmFjdERvYyh0KSB7XG4gIGxvZy5kZWJ1Zygnd2Fsa2VyLndhbGsgaGFzIGZpbmlzaGVkJyk7XG4gIGlmICh0LnN0ZXAudXJsKSB7XG4gICAgcmV0dXJuIHQuY2FsbGJhY2sobnVsbCwgdC5zdGVwLnVybCk7XG4gIH0gZWxzZSBpZiAodC5zdGVwLmRvYyAmJlxuICAgIC8vIFRPRE8gYWN0dWFsbHkgdGhpcyBpcyB2ZXJ5IEhBTCBzcGVjaWZpYyA6LS9cbiAgICB0LnN0ZXAuZG9jLl9saW5rcyAmJlxuICAgIHQuc3RlcC5kb2MuX2xpbmtzLnNlbGYgJiZcbiAgICB0LnN0ZXAuZG9jLl9saW5rcy5zZWxmLmhyZWYpIHtcbiAgICByZXR1cm4gdC5jYWxsYmFjayhcbiAgICAgICAgbnVsbCwgdXJsLnJlc29sdmUodC5zdGFydFVybCwgdC5zdGVwLmRvYy5fbGlua3Muc2VsZi5ocmVmKSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHQuY2FsbGJhY2sobmV3IEVycm9yKCdZb3UgcmVxdWVzdGVkIGFuIFVSTCBidXQgdGhlIGxhc3QgJyArXG4gICAgICAgICdyZXNvdXJjZSBpcyBhbiBlbWJlZGRlZCByZXNvdXJjZSBhbmQgaGFzIG5vIFVSTCBvZiBpdHMgb3duICcgK1xuICAgICAgICAnKHRoYXQgaXMsIGl0IGhhcyBubyBsaW5rIHdpdGggcmVsPVxcXCJzZWxmXFxcIicpKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVE9ETyBPbmx5IGRpZmZlcmVuY2UgdG8gbGliL3RyYW5zZm9ybS9mZXRjaF9yZXNvdXJjZSBpcyB0aGUgY29udGludWF0aW9uXG4vLyBjaGVja2luZywgd2hpY2ggaXMgbWlzc2luZyBoZXJlLiBNYXliZSB3ZSBjYW4gZGVsZXRlIHRoaXMgdHJhbnNmb3JtIGFuZCB1c2Vcbi8vIGZldGNoX3Jlc291cmNlIGluIGl0cyBwbGFjZSBldmVyeXdoZXJlP1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuLi9hYm9ydF90cmF2ZXJzYWwnKVxuICAsIGh0dHBSZXF1ZXN0cyA9IHJlcXVpcmUoJy4uL2h0dHBfcmVxdWVzdHMnKTtcblxuLypcbiAqIEV4ZWN1dGUgdGhlIGxhc3Qgc3RlcCBpbiBhIHRyYXZlcnNhbCB0aGF0IGVuZHMgd2l0aCBhbiBIVFRQIEdFVC5cbiAqL1xuLy8gVGhpcyBpcyBzaW1pbGFyIHRvIGxpYi90cmFuc2Zvcm1zL2ZldGNoX3Jlc291cmNlLmpzIC0gcmVmYWN0b3JpbmcgcG90ZW50aWFsP1xuZnVuY3Rpb24gZmV0Y2hMYXN0UmVzb3VyY2UodCwgY2FsbGJhY2spIHtcbiAgLy8gYWx3YXlzIGNoZWNrIGZvciBhYm9ydGVkIGJlZm9yZSBkb2luZyBhbiBIVFRQIHJlcXVlc3RcbiAgaWYgKHQuYWJvcnRlZCkge1xuICAgIHJldHVybiBhYm9ydFRyYXZlcnNhbC5jYWxsQ2FsbGJhY2tPbkFib3J0KHQpO1xuICB9XG4gIGh0dHBSZXF1ZXN0cy5mZXRjaFJlc291cmNlKHQsIGZ1bmN0aW9uKGVyciwgdCkge1xuICAgIGxvZy5kZWJ1ZygnZmV0Y2hSZXNvdXJjZSByZXR1cm5lZCAoZmV0Y2hMYXN0UmVzb3VyY2UpLicpO1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGlmICghZXJyLmFib3J0ZWQpIHtcbiAgICAgICAgbG9nLmRlYnVnKCdlcnJvciB3aGlsZSBwcm9jZXNzaW5nIHN0ZXAgJywgdC5zdGVwKTtcbiAgICAgICAgbG9nLmVycm9yKGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdC5jYWxsYmFjayhlcnIpO1xuICAgIH1cbiAgICBjYWxsYmFjayh0KTtcbiAgfSk7XG59XG5cbmZldGNoTGFzdFJlc291cmNlLmlzQXN5bmMgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZldGNoTGFzdFJlc291cmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuLi9hYm9ydF90cmF2ZXJzYWwnKVxuICAsIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi4vaXNfY29udGludWF0aW9uJylcbiAgLCBodHRwUmVxdWVzdHMgPSByZXF1aXJlKCcuLi9odHRwX3JlcXVlc3RzJyk7XG5cbi8qXG4gKiBFeGVjdXRlIHRoZSBuZXh0IHN0ZXAgaW4gdGhlIHRyYXZlcnNhbC4gSW4gbW9zdCBjYXNlcyB0aGF0IGlzIGFuIEhUVFAgZ2V0IHRvXG4gKnRoZSBuZXh0IFVSTC5cbiAqL1xuXG5mdW5jdGlvbiBmZXRjaFJlc291cmNlKHQsIGNhbGxiYWNrKSB7XG4gIGlmIChpc0NvbnRpbnVhdGlvbih0KSkge1xuICAgIGNvbnZlcnRDb250aW51YXRpb24odCwgY2FsbGJhY2spO1xuICB9IGVsc2Uge1xuICAgIGZldGNoVmlhSHR0cCh0LCBjYWxsYmFjayk7XG4gIH1cbn1cblxuZmV0Y2hSZXNvdXJjZS5pc0FzeW5jID0gdHJ1ZTtcblxuLypcbiAqIFRoaXMgaXMgYSBjb250aW51YXRpb24gb2YgYW4gZWFybGllciB0cmF2ZXJzYWwgcHJvY2Vzcy5cbiAqIFdlIG5lZWQgdG8gc2hvcnRjdXQgdG8gdGhlIG5leHQgc3RlcCAod2l0aG91dCBleGVjdXRpbmcgdGhlIGZpbmFsIEhUVFBcbiAqIHJlcXVlc3Qgb2YgdGhlIGxhc3QgdHJhdmVyc2FsIGFnYWluLlxuICovXG5mdW5jdGlvbiBjb252ZXJ0Q29udGludWF0aW9uKHQsIGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnY29udGludWluZyBmcm9tIGxhc3QgdHJhdmVyc2FsIHByb2Nlc3MgKHdhbGtlciknKTtcbiAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHsgLy8gZGUtemFsZ28gY29udGludWF0aW9uc1xuICAgIGNhbGxiYWNrKHQpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZmV0Y2hWaWFIdHRwKHQsIGNhbGxiYWNrKSB7XG4gIC8vIGFsd2F5cyBjaGVjayBmb3IgYWJvcnRlZCBiZWZvcmUgZG9pbmcgYW4gSFRUUCByZXF1ZXN0XG4gIGlmICh0LmFib3J0ZWQpIHtcbiAgICByZXR1cm4gYWJvcnRUcmF2ZXJzYWwuY2FsbENhbGxiYWNrT25BYm9ydCh0KTtcbiAgfVxuICBodHRwUmVxdWVzdHMuZmV0Y2hSZXNvdXJjZSh0LCBmdW5jdGlvbihlcnIsIHQpIHtcbiAgICBsb2cuZGVidWcoJ2ZldGNoUmVzb3VyY2UgcmV0dXJuZWQnKTtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBpZiAoIWVyci5hYm9ydGVkKSB7XG4gICAgICAgIGxvZy5kZWJ1ZygnZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBzdGVwICcsIHQuc3RlcCk7XG4gICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHQuY2FsbGJhY2soZXJyKTtcbiAgICB9XG4gICAgY2FsbGJhY2sodCk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZldGNoUmVzb3VyY2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE9wdGlvbnNGb3JTdGVwKHQpIHtcbiAgdmFyIG9wdGlvbnMgPSB0LnJlcXVlc3RPcHRpb25zO1xuICBpZiAodXRpbC5pc0FycmF5KHQucmVxdWVzdE9wdGlvbnMpKSB7XG4gICAgb3B0aW9ucyA9IHQucmVxdWVzdE9wdGlvbnNbdC5zdGVwLmluZGV4XSB8fCB7fTtcbiAgfVxuICBsb2cuZGVidWcoJ29wdGlvbnM6ICcsIG9wdGlvbnMpO1xuICByZXR1cm4gb3B0aW9ucztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4uL2lzX2NvbnRpbnVhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlKHQpIHtcbiAgLy8gVE9ETyBEdXBsaWNhdGVkIGluIGFjdGlvbnMjYWZ0ZXJHZXRSZXNvdXJjZSBldGMuXG4gIC8vIHRoaXMgc3RlcCBpcyBvbW1pdHRlZCBmb3IgY29udGludWF0aW9ucyB0aGF0IHBhcnNlIGF0IHRoZSBlbmRcbiAgaWYgKGlzQ29udGludWF0aW9uKHQpKSB7XG4gICAgbG9nLmRlYnVnKCdjb250aW51aW5nIGZyb20gbGFzdCB0cmF2ZXJzYWwgcHJvY2VzcyAodHJhbnNmb3Jtcy9wYXJzZSknKTtcbiAgICAvLyBpZiBsYXN0IHRyYXZlcnNhbCBkaWQgYSBwYXJzZSBhdCB0aGUgZW5kIHdlIGRvIG5vdCBuZWVkIHRvIHBhcnNlIGFnYWluXG4gICAgLy8gKHRoaXMgY29uZGl0aW9uIHdpbGwgbmVlZCB0byBjaGFuZ2Ugd2l0aFxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXN0aTEzMDIvdHJhdmVyc29uL2lzc3Vlcy80NClcbiAgICBpZiAodC5jb250aW51YXRpb24uYWN0aW9uID09PSAnZ2V0UmVzb3VyY2UnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgaWYgKHQuc3RlcC5kb2MpIHtcbiAgICAvLyBMYXN0IHN0ZXAgcHJvYmFibHkgZGlkIG5vdCBleGVjdXRlIGEgSFRUUCByZXF1ZXN0IGJ1dCB1c2VkIGFuIGVtYmVkZGVkXG4gICAgLy8gZG9jdW1lbnQuXG4gICAgbG9nLmRlYnVnKCdubyBwYXJzaW5nIG5lY2Vzc2FyeSwgcHJvYmFibHkgYW4gZW1iZWRkZWQgZG9jdW1lbnQnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgbG9nLmRlYnVnKCdwYXJzaW5nIHJlc3BvbnNlIGJvZHknKTtcbiAgICB0LnN0ZXAuZG9jID0gdC5qc29uUGFyc2VyKHQuc3RlcC5yZXNwb25zZS5ib2R5KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHZhciBlcnJvciA9IGU7XG4gICAgaWYgKGUubmFtZSA9PT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgZXJyb3IgPSBqc29uRXJyb3IodC5zdGVwLnVybCwgdC5zdGVwLnJlc3BvbnNlLmJvZHkpO1xuICAgIH1cbiAgICBsb2cuZXJyb3IoJ3BhcnNpbmcgZmFpbGVkJyk7XG4gICAgbG9nLmVycm9yKGVycm9yKTtcbiAgICB0LmNhbGxiYWNrKGVycm9yKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGpzb25FcnJvcih1cmwsIGJvZHkpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdUaGUgZG9jdW1lbnQgYXQgJyArIHVybCArXG4gICAgICAnIGNvdWxkIG5vdCBiZSBwYXJzZWQgYXMgSlNPTjogJyArIGJvZHkpO1xuICBlcnJvci5uYW1lID0gJ0pTT05FcnJvcic7XG4gIGVycm9yLnVybCA9IHVybDtcbiAgZXJyb3IuYm9keSA9IGJvZHk7XG4gIHJldHVybiBlcnJvcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi4vaXNfY29udGludWF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVzZXRMYXN0U3RlcCh0KSB7XG4gIC8vIHRoaXMgc3RlcCBpcyBvbW1pdHRlZCBmb3IgY29udGludWF0aW9uc1xuICBpZiAoaXNDb250aW51YXRpb24odCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHQuY29udGludWF0aW9uID0gbnVsbDtcbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuLi9pc19jb250aW51YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXNldExhc3RTdGVwKHQpIHtcbiAgLy8gdGhpcyBzdGVwIGlzIG9tbWl0dGVkIGZvciBjb250aW51YXRpb25zXG4gIGlmIChpc0NvbnRpbnVhdGlvbih0KSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdC5sYXN0U3RlcCA9IG51bGw7XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIF9zID0gcmVxdWlyZSgndW5kZXJzY29yZS5zdHJpbmcnKVxuICAsIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuXG52YXIgcHJvdG9jb2xSZWdFeCA9IC9odHRwcz86XFwvXFwvL2k7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVzb2x2ZU5leHRVcmwodCkge1xuICBpZiAodC5zdGVwLnVybCkge1xuICAgIGlmICh0LnN0ZXAudXJsLnNlYXJjaChwcm90b2NvbFJlZ0V4KSAhPT0gMCkge1xuICAgICAgbG9nLmRlYnVnKCdmb3VuZCBub24gZnVsbCBxdWFsaWZpZWQgVVJMJyk7XG4gICAgICBpZiAodC5yZXNvbHZlUmVsYXRpdmUgJiYgdC5sYXN0U3RlcCAmJiB0Lmxhc3RTdGVwLnVybCkge1xuICAgICAgICAvLyBlZGdlIGNhc2U6IHJlc29sdmUgVVJMIHJlbGF0aXZlbHkgKG9ubHkgd2hlbiByZXF1ZXN0ZWQgYnkgY2xpZW50KVxuICAgICAgICBsb2cuZGVidWcoJ3Jlc29sdmluZyBVUkwgcmVsYXRpdmUnKTtcbiAgICAgICAgaWYgKF9zLnN0YXJ0c1dpdGgodC5zdGVwLnVybCwgJy8nKSAmJlxuICAgICAgICAgIF9zLmVuZHNXaXRoKHQubGFzdFN0ZXAudXJsLCAnLycpKSB7XG4gICAgICAgICAgdC5zdGVwLnVybCA9IF9zLnNwbGljZSh0LnN0ZXAudXJsLCAwLCAxKTtcbiAgICAgICAgfVxuICAgICAgICB0LnN0ZXAudXJsID0gdC5sYXN0U3RlcC51cmwgKyB0LnN0ZXAudXJsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGVmYXVsdCBjYXNlIGFuZCB3aGF0IGhhcHBlbnMgbW9zdCBsaWtlbHkgKG5vdCBhIGZ1bGxcbiAgICAgICAgLy8gcXVhbGlmaWVkIFVSTCwgbm90IHJlc29sdmluZyByZWxhdGl2ZWx5KSBhbmQgd2Ugc2ltcGx5IHVzZSBOb2RlJ3MgdXJsXG4gICAgICAgIC8vIG1vZHVsZSAob3IgdGhlIGFwcHJvcHJpYXRlIHNoaW0pIGhlcmUuXG4gICAgICAgIHQuc3RlcC51cmwgPSB1cmwucmVzb2x2ZSh0LnN0YXJ0VXJsLCB0LnN0ZXAudXJsKTtcbiAgICAgIH1cbiAgICB9IC8vIGVkZ2UgY2FzZTogZnVsbCBxdWFsaWZpZWQgVVJMIC0+IG5vIFVSTCByZXNvbHZpbmcgbmVjZXNzYXJ5XG4gIH0gLy8gbm8gdC5zdGVwLnVybCAtPiBubyBVUkwgcmVzb2x2aW5nIChzdGVwIG1pZ2h0IGNvbnRhaW4gYW4gZW1iZWRkZWQgZG9jKVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBfcyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUuc3RyaW5nJylcbiAgLCB1cmlUZW1wbGF0ZSA9IHJlcXVpcmUoJ3VybC10ZW1wbGF0ZScpXG4gICwgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXNvbHZlVXJpVGVtcGxhdGUodCkge1xuICBpZiAodC5zdGVwLnVybCkge1xuICAgIC8vIG5leHQgbGluayBmb3VuZCBpbiBsYXN0IHJlc3BvbnNlLCBtaWdodCBiZSBhIFVSSSB0ZW1wbGF0ZVxuICAgIHZhciB0ZW1wbGF0ZVBhcmFtcyA9IHQudGVtcGxhdGVQYXJhbWV0ZXJzO1xuICAgIGlmICh1dGlsLmlzQXJyYXkodGVtcGxhdGVQYXJhbXMpKSB7XG4gICAgICAvLyBpZiB0ZW1wbGF0ZSBwYXJhbXMgd2VyZSBnaXZlbiBhcyBhbiBhcnJheSwgb25seSB1c2UgdGhlIGFycmF5IGVsZW1lbnRcbiAgICAgIC8vIGZvciB0aGUgY3VycmVudCBpbmRleCBmb3IgVVJJIHRlbXBsYXRlIHJlc29sdmluZy5cbiAgICAgIHRlbXBsYXRlUGFyYW1zID0gdGVtcGxhdGVQYXJhbXNbdC5zdGVwLmluZGV4XTtcbiAgICB9XG4gICAgdGVtcGxhdGVQYXJhbXMgPSB0ZW1wbGF0ZVBhcmFtcyB8fCB7fTtcblxuICAgIGlmIChfcy5jb250YWlucyh0LnN0ZXAudXJsLCAneycpKSB7XG4gICAgICBsb2cuZGVidWcoJ3Jlc29sdmluZyBVUkkgdGVtcGxhdGUnKTtcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IHVyaVRlbXBsYXRlLnBhcnNlKHQuc3RlcC51cmwpO1xuICAgICAgdmFyIHJlc29sdmVkID0gdGVtcGxhdGUuZXhwYW5kKHRlbXBsYXRlUGFyYW1zKTtcbiAgICAgIGxvZy5kZWJ1ZygncmVzb2x2ZWQgdG8gJywgcmVzb2x2ZWQpO1xuICAgICAgdC5zdGVwLnVybCA9IHJlc29sdmVkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN3aXRjaFRvTmV4dFN0ZXAodCkge1xuICAvLyBleHRyYWN0IG5leHQgbGluayB0byBmb2xsb3cgZnJvbSBsYXN0IHJlc3BvbnNlXG4gIHZhciBsaW5rID0gdC5saW5rc1t0LnN0ZXAuaW5kZXhdO1xuICBsb2cuZGVidWcoJ25leHQgbGluazogJyArIGxpbmspO1xuXG4gIC8vIHNhdmUgbGFzdCBzdGVwIGJlZm9yZSBvdmVyd3JpdGluZyBpdCB3aXRoIHRoZSBuZXh0IHN0ZXAgKHJlcXVpcmVkIGZvclxuICAvLyByZWxhdGl2ZSBVUkwgcmVzb2x1dGlvbiwgd2hlcmUgd2UgbmVlZCB0aGUgbGFzdCBVUkwpXG4gIHQubGFzdFN0ZXAgPSB0LnN0ZXA7XG5cbiAgdC5zdGVwID0gZmluZE5leHRTdGVwKHQsIHQubGFzdFN0ZXAuZG9jLCBsaW5rLCB0LnByZWZlckVtYmVkZGVkKTtcbiAgaWYgKCF0LnN0ZXApIHJldHVybiBmYWxzZTtcblxuICAvLyBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IGZpeCBmb3IgbWVkaWEgdHlwZSBwbHVnLWlucyB1c2luZyBzdGVwLnVyaSBpbnN0ZWFkXG4gIC8vIG9mIHN0ZXAudXJsICh1bnRpbCAxLjAuMClcbiAgdC5zdGVwLnVybCA9IHQuc3RlcC51cmwgfHwgdC5zdGVwLnVyaTtcblxuICB0LnN0ZXAuaW5kZXggPSB0Lmxhc3RTdGVwLmluZGV4ICsgMTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBmaW5kTmV4dFN0ZXAodCwgZG9jLCBsaW5rLCBwcmVmZXJFbWJlZGRlZCkge1xuICB0cnkge1xuICAgIHJldHVybiB0LmFkYXB0ZXIuZmluZE5leHRTdGVwKGRvYywgbGluaywgcHJlZmVyRW1iZWRkZWQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nLmVycm9yKCdjb3VsZCBub3QgZmluZCBuZXh0IHN0ZXAnKTtcbiAgICBsb2cuZXJyb3IoZSk7XG4gICAgdC5jYWxsYmFjayhlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuL2Fib3J0X3RyYXZlcnNhbCcpXG4gICwgYXBwbHlUcmFuc2Zvcm1zID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2FwcGx5X3RyYW5zZm9ybXMnKVxuICAsIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi9pc19jb250aW51YXRpb24nKVxuICAsIHJlc29sdmVVcmlUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9yZXNvbHZlX3VyaV90ZW1wbGF0ZScpO1xuXG52YXIgdHJhbnNmb3JtcyA9IFtcbiAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2ZldGNoX3Jlc291cmNlJyksXG4gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9yZXNldF9sYXN0X3N0ZXAnKSxcbiAgLy8gY2hlY2sgSFRUUCBzdGF0dXMgY29kZVxuICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvY2hlY2tfaHR0cF9zdGF0dXMnKSxcbiAgLy8gcGFyc2UgSlNPTiBmcm9tIGxhc3QgcmVzcG9uc2VcbiAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL3BhcnNlJyksXG4gIC8vIHJldHJpZXZlIG5leHQgbGluayBhbmQgc3dpdGNoIHRvIG5leHQgc3RlcFxuICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvc3dpdGNoX3RvX25leHRfc3RlcCcpLFxuICAvLyBVUkkgdGVtcGxhdGUgaGFzIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBwb3N0IHByb2Nlc3NpbmcgdGhlIFVSTCxcbiAgLy8gYmVjYXVzZSB3ZSBkbyB1cmwucmVzb2x2ZSB3aXRoIGl0IChpbiBqc29uX2hhbCkgYW5kIHRoaXMgd291bGQgVVJMLVxuICAvLyBlbmNvZGUgY3VybHkgYnJhY2VzLlxuICByZXNvbHZlVXJpVGVtcGxhdGUsXG4gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9yZXNvbHZlX25leHRfdXJsJyksXG4gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9yZXNldF9jb250aW51YXRpb24nKSxcbl07XG5cbi8qKlxuICogV2Fsa3MgZnJvbSByZXNvdXJjZSB0byByZXNvdXJjZSBhbG9uZyB0aGUgcGF0aCBnaXZlbiBieSB0aGUgbGluayByZWxhdGlvbnNcbiAqIGZyb20gdGhpcy5saW5rcyB1bnRpbCBpdCBoYXMgcmVhY2hlZCB0aGUgbGFzdCBVUkwuIE9uIHJlYWNoaW5nIHRoaXMsIGl0IGNhbGxzXG4gKiB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2l0aCB0aGUgbGFzdCByZXN1bHRpbmcgc3RlcC5cbiAqL1xuZXhwb3J0cy53YWxrID0gZnVuY3Rpb24odCwgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAsIGNhbGxiYWNrKSB7XG4gIC8vIGV2ZW4gdGhlIHJvb3QgVVJMIG1pZ2h0IGJlIGEgdGVtcGxhdGUsIHNvIHdlIGFwcGx5IHRoZSByZXNvbHZlVXJpVGVtcGxhdGVcbiAgLy8gb25jZSBiZWZvcmUgc3RhcnRpbmcgdGhlIHdhbGsuXG4gIGlmICghcmVzb2x2ZVVyaVRlbXBsYXRlKHQpKSByZXR1cm47XG5cbiAgLy8gc3RhcnRzIHRoZSBsaW5rIHJlbCB3YWxraW5nIHByb2Nlc3NcbiAgbG9nLmRlYnVnKCdzdGFydGluZyB0byBmb2xsb3cgbGlua3MnKTtcbiAgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAgPSB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCB8fCBbXTtcbiAgdC5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICBwcm9jZXNzU3RlcCh0LCB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCk7XG59O1xuXG5mdW5jdGlvbiBwcm9jZXNzU3RlcCh0LCB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCkge1xuICBsb2cuZGVidWcoJ3Byb2Nlc3NpbmcgbmV4dCBzdGVwJyk7XG4gIGlmIChtb3JlTGlua3NUb0ZvbGxvdyh0KSAmJiAhaXNBYm9ydGVkKHQpKSB7XG4gICAgYXBwbHlUcmFuc2Zvcm1zKHRyYW5zZm9ybXMsIHQsIGZ1bmN0aW9uKHQpIHtcbiAgICAgIGxvZy5kZWJ1Zygnc3VjY2Vzc2Z1bGx5IHByb2Nlc3NlZCBzdGVwJyk7XG4gICAgICAvLyBjYWxsIHByb2Nlc3NTdGVwIHJlY3Vyc2l2ZWx5IGFnYWluIHRvIGZvbGxvdyBuZXh0IGxpbmtcbiAgICAgIHByb2Nlc3NTdGVwKHQsIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChpc0Fib3J0ZWQodCkpIHtcbiAgICByZXR1cm4gYWJvcnRUcmF2ZXJzYWwuY2FsbENhbGxiYWNrT25BYm9ydCh0KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBsaW5rIGFycmF5IGlzIGV4aGF1c3RlZCwgd2UgYXJlIGRvbmUgYW5kIHJldHVybiB0aGUgbGFzdCByZXNwb25zZVxuICAgIC8vIGFuZCBVUkwgdG8gdGhlIGNhbGxiYWNrIHRoZSBjbGllbnQgcGFzc2VkIGludG8gdGhlIHdhbGsgbWV0aG9kLlxuICAgIGxvZy5kZWJ1ZygnbGluayBhcnJheSBleGhhdXN0ZWQnKTtcblxuICAgIGFwcGx5VHJhbnNmb3Jtcyh0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCwgdCwgZnVuY3Rpb24odCkge1xuICAgICAgcmV0dXJuIHQuY2FsbGJhY2soKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtb3JlTGlua3NUb0ZvbGxvdyh0KSB7XG4gIHJldHVybiB0LnN0ZXAuaW5kZXggPCB0LmxpbmtzLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gaXNBYm9ydGVkKHQpIHtcbiAgcmV0dXJuIHQuYWJvcnRlZDtcbn1cbiIsIi8qIEpTT05QYXRoIDAuOC4wIC0gWFBhdGggZm9yIEpTT05cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDA3IFN0ZWZhbiBHb2Vzc25lciAoZ29lc3NuZXIubmV0KVxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIChNSVQtTElDRU5TRS50eHQpIGxpY2VuY2UuXHJcbiAqL1xyXG5cclxudmFyIGlzTm9kZSA9IGZhbHNlO1xyXG4oZnVuY3Rpb24oZXhwb3J0cywgcmVxdWlyZSkge1xyXG5cclxuLy8gS2VlcCBjb21wYXRpYmlsaXR5IHdpdGggb2xkIGJyb3dzZXJzXHJcbmlmICghQXJyYXkuaXNBcnJheSkge1xyXG4gIEFycmF5LmlzQXJyYXkgPSBmdW5jdGlvbih2QXJnKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZBcmcpID09PSBcIltvYmplY3QgQXJyYXldXCI7XHJcbiAgfTtcclxufVxyXG5cclxuLy8gTWFrZSBzdXJlIHRvIGtub3cgaWYgd2UgYXJlIGluIHJlYWwgbm9kZSBvciBub3QgKHRoZSBgcmVxdWlyZWAgdmFyaWFibGVcclxuLy8gY291bGQgYWN0dWFsbHkgYmUgcmVxdWlyZS5qcywgZm9yIGV4YW1wbGUuXHJcbnZhciBpc05vZGUgPSB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiAhIW1vZHVsZS5leHBvcnRzO1xyXG5cclxudmFyIHZtID0gaXNOb2RlID9cclxuICAgIHJlcXVpcmUoJ3ZtJykgOiB7XHJcbiAgICAgIHJ1bkluTmV3Q29udGV4dDogZnVuY3Rpb24oZXhwciwgY29udGV4dCkgeyB3aXRoIChjb250ZXh0KSByZXR1cm4gZXZhbChleHByKTsgfVxyXG4gICAgfTtcclxuZXhwb3J0cy5ldmFsID0ganNvblBhdGg7XHJcblxyXG52YXIgY2FjaGUgPSB7fTtcclxuXHJcbmZ1bmN0aW9uIHB1c2goYXJyLCBlbGVtKSB7IGFyciA9IGFyci5zbGljZSgpOyBhcnIucHVzaChlbGVtKTsgcmV0dXJuIGFycjsgfVxyXG5mdW5jdGlvbiB1bnNoaWZ0KGVsZW0sIGFycikgeyBhcnIgPSBhcnIuc2xpY2UoKTsgYXJyLnVuc2hpZnQoZWxlbSk7IHJldHVybiBhcnI7IH1cclxuXHJcbmZ1bmN0aW9uIGpzb25QYXRoKG9iaiwgZXhwciwgYXJnKSB7XHJcbiAgIHZhciBQID0ge1xyXG4gICAgICByZXN1bHRUeXBlOiBhcmcgJiYgYXJnLnJlc3VsdFR5cGUgfHwgXCJWQUxVRVwiLFxyXG4gICAgICBmbGF0dGVuOiBhcmcgJiYgYXJnLmZsYXR0ZW4gfHwgZmFsc2UsXHJcbiAgICAgIHdyYXA6IChhcmcgJiYgYXJnLmhhc093blByb3BlcnR5KCd3cmFwJykpID8gYXJnLndyYXAgOiB0cnVlLFxyXG4gICAgICBzYW5kYm94OiAoYXJnICYmIGFyZy5zYW5kYm94KSA/IGFyZy5zYW5kYm94IDoge30sXHJcbiAgICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24oZXhwcikge1xyXG4gICAgICAgICBpZiAoY2FjaGVbZXhwcl0pIHJldHVybiBjYWNoZVtleHByXTtcclxuICAgICAgICAgdmFyIHN1YnggPSBbXTtcclxuICAgICAgICAgdmFyIG5vcm1hbGl6ZWQgPSBleHByLnJlcGxhY2UoL1tcXFsnXShcXD8/XFwoLio/XFwpKVtcXF0nXS9nLCBmdW5jdGlvbigkMCwkMSl7cmV0dXJuIFwiWyNcIisoc3VieC5wdXNoKCQxKS0xKStcIl1cIjt9KVxyXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJz9cXC4nP3xcXFsnPy9nLCBcIjtcIilcclxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg7KT8oXFxeKykoOyk/L2csIGZ1bmN0aW9uKF8sIGZyb250LCB1cHMsIGJhY2spIHsgcmV0dXJuICc7JyArIHVwcy5zcGxpdCgnJykuam9pbignOycpICsgJzsnOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvOzs7fDs7L2csIFwiOy4uO1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvOyR8Jz9cXF18JyQvZywgXCJcIik7XHJcbiAgICAgICAgIHZhciBleHByTGlzdCA9IG5vcm1hbGl6ZWQuc3BsaXQoJzsnKS5tYXAoZnVuY3Rpb24oZXhwcikge1xyXG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBleHByLm1hdGNoKC8jKFswLTldKykvKTtcclxuICAgICAgICAgICAgcmV0dXJuICFtYXRjaCB8fCAhbWF0Y2hbMV0gPyBleHByIDogc3VieFttYXRjaFsxXV07XHJcbiAgICAgICAgIH0pXHJcbiAgICAgICAgIHJldHVybiBjYWNoZVtleHByXSA9IGV4cHJMaXN0O1xyXG4gICAgICB9LFxyXG4gICAgICBhc1BhdGg6IGZ1bmN0aW9uKHBhdGgpIHtcclxuICAgICAgICAgdmFyIHggPSBwYXRoLCBwID0gXCIkXCI7XHJcbiAgICAgICAgIGZvciAodmFyIGk9MSxuPXgubGVuZ3RoOyBpPG47IGkrKylcclxuICAgICAgICAgICAgcCArPSAvXlswLTkqXSskLy50ZXN0KHhbaV0pID8gKFwiW1wiK3hbaV0rXCJdXCIpIDogKFwiWydcIit4W2ldK1wiJ11cIik7XHJcbiAgICAgICAgIHJldHVybiBwO1xyXG4gICAgICB9LFxyXG4gICAgICB0cmFjZTogZnVuY3Rpb24oZXhwciwgdmFsLCBwYXRoKSB7XHJcbiAgICAgICAgIC8vIG5vIGV4cHIgdG8gZm9sbG93PyByZXR1cm4gcGF0aCBhbmQgdmFsdWUgYXMgdGhlIHJlc3VsdCBvZiB0aGlzIHRyYWNlIGJyYW5jaFxyXG4gICAgICAgICBpZiAoIWV4cHIubGVuZ3RoKSByZXR1cm4gW3twYXRoOiBwYXRoLCB2YWx1ZTogdmFsfV07XHJcblxyXG4gICAgICAgICB2YXIgbG9jID0gZXhwclswXSwgeCA9IGV4cHIuc2xpY2UoMSk7XHJcbiAgICAgICAgIC8vIHRoZSBwYXJlbnQgc2VsIGNvbXB1dGF0aW9uIGlzIGhhbmRsZWQgaW4gdGhlIGZyYW1lIGFib3ZlIHVzaW5nIHRoZVxyXG4gICAgICAgICAvLyBhbmNlc3RvciBvYmplY3Qgb2YgdmFsXHJcbiAgICAgICAgIGlmIChsb2MgPT09ICdeJykgcmV0dXJuIHBhdGgubGVuZ3RoID8gW3twYXRoOiBwYXRoLnNsaWNlKDAsLTEpLCBleHByOiB4LCBpc1BhcmVudFNlbGVjdG9yOiB0cnVlfV0gOiBbXTtcclxuXHJcbiAgICAgICAgIC8vIHdlIG5lZWQgdG8gZ2F0aGVyIHRoZSByZXR1cm4gdmFsdWUgb2YgcmVjdXJzaXZlIHRyYWNlIGNhbGxzIGluIG9yZGVyIHRvXHJcbiAgICAgICAgIC8vIGRvIHRoZSBwYXJlbnQgc2VsIGNvbXB1dGF0aW9uLlxyXG4gICAgICAgICB2YXIgcmV0ID0gW107XHJcbiAgICAgICAgIGZ1bmN0aW9uIGFkZFJldChlbGVtcykgeyByZXQgPSByZXQuY29uY2F0KGVsZW1zKTsgfVxyXG5cclxuICAgICAgICAgaWYgKHZhbCAmJiB2YWwuaGFzT3duUHJvcGVydHkobG9jKSkgLy8gc2ltcGxlIGNhc2UsIGRpcmVjdGx5IGZvbGxvdyBwcm9wZXJ0eVxyXG4gICAgICAgICAgICBhZGRSZXQoUC50cmFjZSh4LCB2YWxbbG9jXSwgcHVzaChwYXRoLCBsb2MpKSk7XHJcbiAgICAgICAgIGVsc2UgaWYgKGxvYyA9PT0gXCIqXCIpIHsgLy8gYW55IHByb3BlcnR5XHJcbiAgICAgICAgICAgIFAud2Fsayhsb2MsIHgsIHZhbCwgcGF0aCwgZnVuY3Rpb24obSxsLHgsdixwKSB7XHJcbiAgICAgICAgICAgICAgIGFkZFJldChQLnRyYWNlKHVuc2hpZnQobSwgeCksIHYsIHApKTsgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgZWxzZSBpZiAobG9jID09PSBcIi4uXCIpIHsgLy8gYWxsIGNoaWQgcHJvcGVydGllc1xyXG4gICAgICAgICAgICBhZGRSZXQoUC50cmFjZSh4LCB2YWwsIHBhdGgpKTtcclxuICAgICAgICAgICAgUC53YWxrKGxvYywgeCwgdmFsLCBwYXRoLCBmdW5jdGlvbihtLGwseCx2LHApIHtcclxuICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2W21dID09PSBcIm9iamVjdFwiKVxyXG4gICAgICAgICAgICAgICAgICBhZGRSZXQoUC50cmFjZSh1bnNoaWZ0KFwiLi5cIiwgeCksIHZbbV0sIHB1c2gocCwgbSkpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgZWxzZSBpZiAobG9jWzBdID09PSAnKCcpIHsgLy8gWyhleHByKV1cclxuICAgICAgICAgICAgYWRkUmV0KFAudHJhY2UodW5zaGlmdChQLmV2YWwobG9jLCB2YWwsIHBhdGhbcGF0aC5sZW5ndGhdLCBwYXRoKSx4KSwgdmFsLCBwYXRoKSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgZWxzZSBpZiAobG9jLmluZGV4T2YoJz8oJykgPT09IDApIHsgLy8gWz8oZXhwcildXHJcbiAgICAgICAgICAgIFAud2Fsayhsb2MsIHgsIHZhbCwgcGF0aCwgZnVuY3Rpb24obSxsLHgsdixwKSB7XHJcbiAgICAgICAgICAgICAgIGlmIChQLmV2YWwobC5yZXBsYWNlKC9eXFw/XFwoKC4qPylcXCkkLyxcIiQxXCIpLHZbbV0sbSwgcGF0aCkpXHJcbiAgICAgICAgICAgICAgICAgIGFkZFJldChQLnRyYWNlKHVuc2hpZnQobSx4KSx2LHApKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgZWxzZSBpZiAobG9jLmluZGV4T2YoJywnKSA+IC0xKSB7IC8vIFtuYW1lMSxuYW1lMiwuLi5dXHJcbiAgICAgICAgICAgIGZvciAodmFyIHBhcnRzID0gbG9jLnNwbGl0KCcsJyksIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgIGFkZFJldChQLnRyYWNlKHVuc2hpZnQocGFydHNbaV0sIHgpLCB2YWwsIHBhdGgpKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBlbHNlIGlmICgvXigtP1swLTldKik6KC0/WzAtOV0qKTo/KFswLTldKikkLy50ZXN0KGxvYykpIHsgLy8gW3N0YXJ0OmVuZDpzdGVwXSAgcHl0aG9uIHNsaWNlIHN5bnRheFxyXG4gICAgICAgICAgICBhZGRSZXQoUC5zbGljZShsb2MsIHgsIHZhbCwgcGF0aCkpO1xyXG4gICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyB3ZSBjaGVjayB0aGUgcmVzdWx0aW5nIHZhbHVlcyBmb3IgcGFyZW50IHNlbGVjdGlvbnMuIGZvciBwYXJlbnRcclxuICAgICAgICAgLy8gc2VsZWN0aW9ucyB3ZSBkaXNjYXJkIHRoZSB2YWx1ZSBvYmplY3QgYW5kIGNvbnRpbnVlIHRoZSB0cmFjZSB3aXRoIHRoZVxyXG4gICAgICAgICAvLyBjdXJyZW50IHZhbCBvYmplY3RcclxuICAgICAgICAgcmV0dXJuIHJldC5yZWR1Y2UoZnVuY3Rpb24oYWxsLCBlYSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYWxsLmNvbmNhdChlYS5pc1BhcmVudFNlbGVjdG9yID8gUC50cmFjZShlYS5leHByLCB2YWwsIGVhLnBhdGgpIDogW2VhXSk7XHJcbiAgICAgICAgIH0sIFtdKTtcclxuICAgICAgfSxcclxuICAgICAgd2FsazogZnVuY3Rpb24obG9jLCBleHByLCB2YWwsIHBhdGgsIGYpIHtcclxuICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSlcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB2YWwubGVuZ3RoOyBpIDwgbjsgaSsrKVxyXG4gICAgICAgICAgICAgICBmKGksIGxvYywgZXhwciwgdmFsLCBwYXRoKTtcclxuICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIilcclxuICAgICAgICAgICAgZm9yICh2YXIgbSBpbiB2YWwpXHJcbiAgICAgICAgICAgICAgIGlmICh2YWwuaGFzT3duUHJvcGVydHkobSkpXHJcbiAgICAgICAgICAgICAgICAgIGYobSwgbG9jLCBleHByLCB2YWwsIHBhdGgpO1xyXG4gICAgICB9LFxyXG4gICAgICBzbGljZTogZnVuY3Rpb24obG9jLCBleHByLCB2YWwsIHBhdGgpIHtcclxuICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbCkpIHJldHVybjtcclxuICAgICAgICAgdmFyIGxlbiA9IHZhbC5sZW5ndGgsIHBhcnRzID0gbG9jLnNwbGl0KCc6JyksXHJcbiAgICAgICAgICAgICBzdGFydCA9IChwYXJ0c1swXSAmJiBwYXJzZUludChwYXJ0c1swXSkpIHx8IDAsXHJcbiAgICAgICAgICAgICBlbmQgPSAocGFydHNbMV0gJiYgcGFyc2VJbnQocGFydHNbMV0pKSB8fCBsZW4sXHJcbiAgICAgICAgICAgICBzdGVwID0gKHBhcnRzWzJdICYmIHBhcnNlSW50KHBhcnRzWzJdKSkgfHwgMTtcclxuICAgICAgICAgc3RhcnQgPSAoc3RhcnQgPCAwKSA/IE1hdGgubWF4KDAsc3RhcnQrbGVuKSA6IE1hdGgubWluKGxlbixzdGFydCk7XHJcbiAgICAgICAgIGVuZCAgID0gKGVuZCA8IDApICAgPyBNYXRoLm1heCgwLGVuZCtsZW4pICAgOiBNYXRoLm1pbihsZW4sZW5kKTtcclxuICAgICAgICAgdmFyIHJldCA9IFtdO1xyXG4gICAgICAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gc3RlcClcclxuICAgICAgICAgICAgcmV0ID0gcmV0LmNvbmNhdChQLnRyYWNlKHVuc2hpZnQoaSxleHByKSwgdmFsLCBwYXRoKSk7XHJcbiAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgIH0sXHJcbiAgICAgIGV2YWw6IGZ1bmN0aW9uKGNvZGUsIF92LCBfdm5hbWUsIHBhdGgpIHtcclxuICAgICAgICAgaWYgKCEkIHx8ICFfdikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICBpZiAoY29kZS5pbmRleE9mKFwiQHBhdGhcIikgPiAtMSkge1xyXG4gICAgICAgICAgICBQLnNhbmRib3hbXCJfcGF0aFwiXSA9IFAuYXNQYXRoKHBhdGguY29uY2F0KFtfdm5hbWVdKSk7XHJcbiAgICAgICAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL0BwYXRoL2csIFwiX3BhdGhcIik7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgaWYgKGNvZGUuaW5kZXhPZihcIkBcIikgPiAtMSkge1xyXG4gICAgICAgICAgICBQLnNhbmRib3hbXCJfdlwiXSA9IF92O1xyXG4gICAgICAgICAgICBjb2RlID0gY29kZS5yZXBsYWNlKC9AL2csIFwiX3ZcIik7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgIHJldHVybiB2bS5ydW5Jbk5ld0NvbnRleHQoY29kZSwgUC5zYW5kYm94KTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImpzb25QYXRoOiBcIiArIGUubWVzc2FnZSArIFwiOiBcIiArIGNvZGUpO1xyXG4gICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgfTtcclxuXHJcbiAgIHZhciAkID0gb2JqO1xyXG4gICB2YXIgcmVzdWx0VHlwZSA9IFAucmVzdWx0VHlwZS50b0xvd2VyQ2FzZSgpO1xyXG4gICBpZiAoZXhwciAmJiBvYmogJiYgKHJlc3VsdFR5cGUgPT0gXCJ2YWx1ZVwiIHx8IHJlc3VsdFR5cGUgPT0gXCJwYXRoXCIpKSB7XHJcbiAgICAgIHZhciBleHByTGlzdCA9IFAubm9ybWFsaXplKGV4cHIpO1xyXG4gICAgICBpZiAoZXhwckxpc3RbMF0gPT09IFwiJFwiICYmIGV4cHJMaXN0Lmxlbmd0aCA+IDEpIGV4cHJMaXN0LnNoaWZ0KCk7XHJcbiAgICAgIHZhciByZXN1bHQgPSBQLnRyYWNlKGV4cHJMaXN0LCBvYmosIFtcIiRcIl0pO1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKGZ1bmN0aW9uKGVhKSB7IHJldHVybiBlYSAmJiAhZWEuaXNQYXJlbnRTZWxlY3RvcjsgfSk7XHJcbiAgICAgIGlmICghcmVzdWx0Lmxlbmd0aCkgcmV0dXJuIFAud3JhcCA/IFtdIDogZmFsc2U7XHJcbiAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAxICYmICFQLndyYXAgJiYgIUFycmF5LmlzQXJyYXkocmVzdWx0WzBdLnZhbHVlKSkgcmV0dXJuIHJlc3VsdFswXVtyZXN1bHRUeXBlXSB8fCBmYWxzZTtcclxuICAgICAgcmV0dXJuIHJlc3VsdC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlYSkge1xyXG4gICAgICAgICB2YXIgdmFsT3JQYXRoID0gZWFbcmVzdWx0VHlwZV07XHJcbiAgICAgICAgIGlmIChyZXN1bHRUeXBlID09PSAncGF0aCcpIHZhbE9yUGF0aCA9IFAuYXNQYXRoKHZhbE9yUGF0aCk7XHJcbiAgICAgICAgIGlmIChQLmZsYXR0ZW4gJiYgQXJyYXkuaXNBcnJheSh2YWxPclBhdGgpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodmFsT3JQYXRoKTtcclxuICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsT3JQYXRoKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9LCBbXSk7XHJcbiAgIH1cclxufVxyXG59KSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzWydqc29uUGF0aCddID0ge30gOiBleHBvcnRzLCB0eXBlb2YgcmVxdWlyZSA9PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IHJlcXVpcmUpO1xyXG4iLCIvLyBDb3B5cmlnaHQgMjAxNCBTaW1vbiBMeWRlbGxcclxuLy8gWDExICjigJxNSVTigJ0pIExpY2Vuc2VkLiAoU2VlIExJQ0VOU0UuKVxyXG5cclxudm9pZCAoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKGZhY3RvcnkpXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KClcclxuICB9IGVsc2Uge1xyXG4gICAgcm9vdC5yZXNvbHZlVXJsID0gZmFjdG9yeSgpXHJcbiAgfVxyXG59KHRoaXMsIGZ1bmN0aW9uKCkge1xyXG5cclxuICBmdW5jdGlvbiByZXNvbHZlVXJsKC8qIC4uLnVybHMgKi8pIHtcclxuICAgIHZhciBudW1VcmxzID0gYXJndW1lbnRzLmxlbmd0aFxyXG5cclxuICAgIGlmIChudW1VcmxzID09PSAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInJlc29sdmVVcmwgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50OyBnb3Qgbm9uZS5cIilcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYmFzZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiYXNlXCIpXHJcbiAgICBiYXNlLmhyZWYgPSBhcmd1bWVudHNbMF1cclxuXHJcbiAgICBpZiAobnVtVXJscyA9PT0gMSkge1xyXG4gICAgICByZXR1cm4gYmFzZS5ocmVmXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF1cclxuICAgIGhlYWQuaW5zZXJ0QmVmb3JlKGJhc2UsIGhlYWQuZmlyc3RDaGlsZClcclxuXHJcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXHJcbiAgICB2YXIgcmVzb2x2ZWRcclxuXHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbnVtVXJsczsgaW5kZXgrKykge1xyXG4gICAgICBhLmhyZWYgPSBhcmd1bWVudHNbaW5kZXhdXHJcbiAgICAgIHJlc29sdmVkID0gYS5ocmVmXHJcbiAgICAgIGJhc2UuaHJlZiA9IHJlc29sdmVkXHJcbiAgICB9XHJcblxyXG4gICAgaGVhZC5yZW1vdmVDaGlsZChiYXNlKVxyXG5cclxuICAgIHJldHVybiByZXNvbHZlZFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc29sdmVVcmxcclxuXHJcbn0pKTtcclxuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QudXJsdGVtcGxhdGUgPSBmYWN0b3J5KCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGZ1bmN0aW9uIFVybFRlbXBsYXRlKCkge1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgVXJsVGVtcGxhdGUucHJvdG90eXBlLmVuY29kZVJlc2VydmVkID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoLyglWzAtOUEtRmEtZl17Mn0pL2cpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgaWYgKCEvJVswLTlBLUZhLWZdLy50ZXN0KHBhcnQpKSB7XG4gICAgICAgIHBhcnQgPSBlbmNvZGVVUkkocGFydCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFydDtcbiAgICB9KS5qb2luKCcnKTtcbiAgfTtcblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wZXJhdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIFVybFRlbXBsYXRlLnByb3RvdHlwZS5lbmNvZGVWYWx1ZSA9IGZ1bmN0aW9uIChvcGVyYXRvciwgdmFsdWUsIGtleSkge1xuICAgIHZhbHVlID0gKG9wZXJhdG9yID09PSAnKycgfHwgb3BlcmF0b3IgPT09ICcjJykgPyB0aGlzLmVuY29kZVJlc2VydmVkKHZhbHVlKSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgVXJsVGVtcGxhdGUucHJvdG90eXBlLmlzRGVmaW5lZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ31cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIFVybFRlbXBsYXRlLnByb3RvdHlwZS5pc0tleU9wZXJhdG9yID0gZnVuY3Rpb24gKG9wZXJhdG9yKSB7XG4gICAgcmV0dXJuIG9wZXJhdG9yID09PSAnOycgfHwgb3BlcmF0b3IgPT09ICcmJyB8fCBvcGVyYXRvciA9PT0gJz8nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3BlcmF0b3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kaWZpZXJcbiAgICovXG4gIFVybFRlbXBsYXRlLnByb3RvdHlwZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgb3BlcmF0b3IsIGtleSwgbW9kaWZpZXIpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0W2tleV0sXG4gICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgaWYgKHRoaXMuaXNEZWZpbmVkKHZhbHVlKSAmJiB2YWx1ZSAhPT0gJycpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xuXG4gICAgICAgIGlmIChtb2RpZmllciAmJiBtb2RpZmllciAhPT0gJyonKSB7XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcGFyc2VJbnQobW9kaWZpZXIsIDEwKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZSwgdGhpcy5pc0tleU9wZXJhdG9yKG9wZXJhdG9yKSA/IGtleSA6IG51bGwpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChtb2RpZmllciA9PT0gJyonKSB7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICB2YWx1ZS5maWx0ZXIodGhpcy5pc0RlZmluZWQpLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlLCB0aGlzLmlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpID8ga2V5IDogbnVsbCkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmlzRGVmaW5lZCh2YWx1ZVtrXSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLmVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZVtrXSwgaykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHRtcCA9IFtdO1xuXG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICB2YWx1ZS5maWx0ZXIodGhpcy5pc0RlZmluZWQpLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgIHRtcC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlKSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmtleXModmFsdWUpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaXNEZWZpbmVkKHZhbHVlW2tdKSkge1xuICAgICAgICAgICAgICAgIHRtcC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrKSk7XG4gICAgICAgICAgICAgICAgdG1wLnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWVba10udG9TdHJpbmcoKSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5pc0tleU9wZXJhdG9yKG9wZXJhdG9yKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB0bXAuam9pbignLCcpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRtcC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRtcC5qb2luKCcsJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3BlcmF0b3IgPT09ICc7Jykge1xuICAgICAgICByZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSk7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnJyAmJiAob3BlcmF0b3IgPT09ICcmJyB8fCBvcGVyYXRvciA9PT0gJz8nKSkge1xuICAgICAgICByZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9Jyk7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgICByZXN1bHQucHVzaCgnJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZW1wbGF0ZVxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZ31cbiAgICovXG4gIFVybFRlbXBsYXRlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgb3BlcmF0b3JzID0gWycrJywgJyMnLCAnLicsICcvJywgJzsnLCAnPycsICcmJ107XG5cbiAgICByZXR1cm4ge1xuICAgICAgZXhwYW5kOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGUucmVwbGFjZSgvXFx7KFteXFx7XFx9XSspXFx9fChbXlxce1xcfV0rKS9nLCBmdW5jdGlvbiAoXywgZXhwcmVzc2lvbiwgbGl0ZXJhbCkge1xuICAgICAgICAgIGlmIChleHByZXNzaW9uKSB7XG4gICAgICAgICAgICB2YXIgb3BlcmF0b3IgPSBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAob3BlcmF0b3JzLmluZGV4T2YoZXhwcmVzc2lvbi5jaGFyQXQoMCkpICE9PSAtMSkge1xuICAgICAgICAgICAgICBvcGVyYXRvciA9IGV4cHJlc3Npb24uY2hhckF0KDApO1xuICAgICAgICAgICAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5zdWJzdHIoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4cHJlc3Npb24uc3BsaXQoLywvZykuZm9yRWFjaChmdW5jdGlvbiAodmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IC8oW146XFwqXSopKD86OihcXGQrKXwoXFwqKSk/Ly5leGVjKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgdmFsdWVzLnB1c2guYXBwbHkodmFsdWVzLCB0aGF0LmdldFZhbHVlcyhjb250ZXh0LCBvcGVyYXRvciwgdG1wWzFdLCB0bXBbMl0gfHwgdG1wWzNdKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKG9wZXJhdG9yICYmIG9wZXJhdG9yICE9PSAnKycpIHtcbiAgICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9ICcsJztcblxuICAgICAgICAgICAgICBpZiAob3BlcmF0b3IgPT09ICc/Jykge1xuICAgICAgICAgICAgICAgIHNlcGFyYXRvciA9ICcmJztcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcGVyYXRvciAhPT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgc2VwYXJhdG9yID0gb3BlcmF0b3I7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZXMubGVuZ3RoICE9PSAwID8gb3BlcmF0b3IgOiAnJykgKyB2YWx1ZXMuam9pbihzZXBhcmF0b3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcy5qb2luKCcsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGF0LmVuY29kZVJlc2VydmVkKGxpdGVyYWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICByZXR1cm4gbmV3IFVybFRlbXBsYXRlKCk7XG59KSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbWVkaWFUeXBlcyA9IHJlcXVpcmUoJy4vbGliL21lZGlhX3R5cGVzJylcbiAgLCBCdWlsZGVyID0gcmVxdWlyZSgnLi9saWIvYnVpbGRlcicpXG4gICwgbWVkaWFUeXBlcyA9IHJlcXVpcmUoJy4vbGliL21lZGlhX3R5cGVzJylcbiAgLCBtZWRpYVR5cGVSZWdpc3RyeSA9IHJlcXVpcmUoJy4vbGliL21lZGlhX3R5cGVfcmVnaXN0cnknKTtcblxuLy8gYWN0aXZhdGUgdGhpcyBsaW5lIHRvIGVuYWJsZSBsb2dnaW5nXG5pZiAocHJvY2Vzcy5lbnYuVFJBVkVSU09OX0xPR0dJTkcpIHtcbiAgcmVxdWlyZSgnbWluaWxvZycpLmVuYWJsZSgpO1xufVxuXG4vLyBleHBvcnQgYnVpbGRlciBmb3IgdHJhdmVyc29uLWFuZ3VsYXJcbmV4cG9ydHMuX0J1aWxkZXIgPSBCdWlsZGVyO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcmVxdWVzdCBidWlsZGVyIGluc3RhbmNlLlxuICovXG5leHBvcnRzLm5ld1JlcXVlc3QgPSBmdW5jdGlvbiBuZXdSZXF1ZXN0KCkge1xuICByZXR1cm4gbmV3IEJ1aWxkZXIoKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyByZXF1ZXN0IGJ1aWxkZXIgaW5zdGFuY2Ugd2l0aCB0aGUgZ2l2ZW4gcm9vdCBVUkwuXG4gKi9cbmV4cG9ydHMuZnJvbSA9IGZ1bmN0aW9uIGZyb20odXJsKSB7XG4gIHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoKTtcbiAgYnVpbGRlci5mcm9tKHVybCk7XG4gIHJldHVybiBidWlsZGVyO1xufTtcblxuLy8gUHJvdmlkZWQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBwcmUtMS4wLjAgdmVyc2lvbnMuXG4vLyBUaGUgcHJlZmVycmVkIHdheSBpcyB0byB1c2UgbmV3UmVxdWVzdCgpIG9yIGZyb20oKSB0byBjcmVhdGUgYSByZXF1ZXN0XG4vLyBidWlsZGVyIGFuZCBlaXRoZXIgc2V0IHRoZSBtZWRpYSB0eXBlIGV4cGxpY2l0bHkgYnkgY2FsbGluZyBqc29uKCkgb24gdGhlXG4vLyByZXF1ZXN0IGJ1aWxkZXIgaW5zdGFuY2UgLSBvciB1c2UgY29udGVudCBuZWdvdGlhdGlvbi5cbmV4cG9ydHMuanNvbiA9IHtcbiAgZnJvbTogZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIGJ1aWxkZXIgPSBuZXcgQnVpbGRlcigpO1xuICAgIGJ1aWxkZXIuZnJvbSh1cmwpO1xuICAgIGJ1aWxkZXIuc2V0TWVkaWFUeXBlKG1lZGlhVHlwZXMuSlNPTik7XG4gICAgcmV0dXJuIGJ1aWxkZXI7XG4gIH1cbn0sXG5cbi8vIFByb3ZpZGVkIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggcHJlLTEuMC4wIHZlcnNpb25zLlxuLy8gVGhlIHByZWZlcnJlZCB3YXkgaXMgdG8gdXNlIG5ld1JlcXVlc3QoKSBvciBmcm9tKCkgdG8gY3JlYXRlIGEgcmVxdWVzdFxuLy8gYnVpbGRlciBhbmQgdGhlbiBlaXRoZXIgc2V0IHRoZSBtZWRpYSB0eXBlIGV4cGxpY2l0bHkgYnkgY2FsbGluZyBqc29uSGFsKCkgb25cbi8vIHRoZSByZXF1ZXN0IGJ1aWxkZXIgaW5zdGFuY2UgLSBvciB1c2UgY29udGVudCBuZWdvdGlhdGlvbi5cbmV4cG9ydHMuanNvbkhhbCA9IHtcbiAgZnJvbTogZnVuY3Rpb24odXJsKSB7XG4gICAgaWYgKCFtZWRpYVR5cGVSZWdpc3RyeS5nZXQobWVkaWFUeXBlcy5KU09OX0hBTCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSlNPTiBIQUwgYWRhcHRlciBpcyBub3QgcmVnaXN0ZXJlZC4gRnJvbSB2ZXJzaW9uICcgK1xuICAgICAgICAnMS4wLjAgb24sIFRyYXZlcnNvbiBoYXMgbm8gbG9uZ2VyIGJ1aWx0LWluIHN1cHBvcnQgZm9yICcgK1xuICAgICAgICAnYXBwbGljYXRpb24vaGFsK2pzb24uIEhBTCBzdXBwb3J0IHdhcyBtb3ZlZCB0byBhIHNlcGFyYXRlLCBvcHRpb25hbCAnICtcbiAgICAgICAgJ3BsdWctaW4uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYmFzdGkxMzAyL3RyYXZlcnNvbi1oYWwnKTtcbiAgICB9XG4gICAgdmFyIGJ1aWxkZXIgPSBuZXcgQnVpbGRlcigpO1xuICAgIGJ1aWxkZXIuZnJvbSh1cmwpO1xuICAgIGJ1aWxkZXIuc2V0TWVkaWFUeXBlKG1lZGlhVHlwZXMuSlNPTl9IQUwpO1xuICAgIHJldHVybiBidWlsZGVyO1xuICB9XG59O1xuXG4vLyBleHBvc2UgbWVkaWEgdHlwZSByZWdpc3RyeSBzbyB0aGF0IG1lZGlhIHR5cGUgcGx1Zy1pbnMgY2FuIHJlZ2lzdGVyXG4vLyB0aGVtc2VsdmVzXG5leHBvcnRzLnJlZ2lzdGVyTWVkaWFUeXBlID0gbWVkaWFUeXBlUmVnaXN0cnkucmVnaXN0ZXI7XG5cbi8vIGV4cG9ydCBtZWRpYSB0eXBlIGNvbnN0YW50c1xuZXhwb3J0cy5tZWRpYVR5cGVzID0gbWVkaWFUeXBlcztcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIGluZGV4T2YgPSByZXF1aXJlKCdpbmRleG9mJyk7XG5cbnZhciBPYmplY3Rfa2V5cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAoT2JqZWN0LmtleXMpIHJldHVybiBPYmplY3Qua2V5cyhvYmopXG4gICAgZWxzZSB7XG4gICAgICAgIHZhciByZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikgcmVzLnB1c2goa2V5KVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbn07XG5cbnZhciBmb3JFYWNoID0gZnVuY3Rpb24gKHhzLCBmbikge1xuICAgIGlmICh4cy5mb3JFYWNoKSByZXR1cm4geHMuZm9yRWFjaChmbilcbiAgICBlbHNlIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm4oeHNbaV0sIGksIHhzKTtcbiAgICB9XG59O1xuXG52YXIgZGVmaW5lUHJvcCA9IChmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdfJywge30pO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihvYmosIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICBvYmpbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG59KCkpO1xuXG52YXIgZ2xvYmFscyA9IFsnQXJyYXknLCAnQm9vbGVhbicsICdEYXRlJywgJ0Vycm9yJywgJ0V2YWxFcnJvcicsICdGdW5jdGlvbicsXG4nSW5maW5pdHknLCAnSlNPTicsICdNYXRoJywgJ05hTicsICdOdW1iZXInLCAnT2JqZWN0JywgJ1JhbmdlRXJyb3InLFxuJ1JlZmVyZW5jZUVycm9yJywgJ1JlZ0V4cCcsICdTdHJpbmcnLCAnU3ludGF4RXJyb3InLCAnVHlwZUVycm9yJywgJ1VSSUVycm9yJyxcbidkZWNvZGVVUkknLCAnZGVjb2RlVVJJQ29tcG9uZW50JywgJ2VuY29kZVVSSScsICdlbmNvZGVVUklDb21wb25lbnQnLCAnZXNjYXBlJyxcbidldmFsJywgJ2lzRmluaXRlJywgJ2lzTmFOJywgJ3BhcnNlRmxvYXQnLCAncGFyc2VJbnQnLCAndW5kZWZpbmVkJywgJ3VuZXNjYXBlJ107XG5cbmZ1bmN0aW9uIENvbnRleHQoKSB7fVxuQ29udGV4dC5wcm90b3R5cGUgPSB7fTtcblxudmFyIFNjcmlwdCA9IGV4cG9ydHMuU2NyaXB0ID0gZnVuY3Rpb24gTm9kZVNjcmlwdCAoY29kZSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTY3JpcHQpKSByZXR1cm4gbmV3IFNjcmlwdChjb2RlKTtcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xufTtcblxuU2NyaXB0LnByb3RvdHlwZS5ydW5JbkNvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGlmICghKGNvbnRleHQgaW5zdGFuY2VvZiBDb250ZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwibmVlZHMgYSAnY29udGV4dCcgYXJndW1lbnQuXCIpO1xuICAgIH1cbiAgICBcbiAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgaWYgKCFpZnJhbWUuc3R5bGUpIGlmcmFtZS5zdHlsZSA9IHt9O1xuICAgIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIFxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICBcbiAgICB2YXIgd2luID0gaWZyYW1lLmNvbnRlbnRXaW5kb3c7XG4gICAgdmFyIHdFdmFsID0gd2luLmV2YWwsIHdFeGVjU2NyaXB0ID0gd2luLmV4ZWNTY3JpcHQ7XG5cbiAgICBpZiAoIXdFdmFsICYmIHdFeGVjU2NyaXB0KSB7XG4gICAgICAgIC8vIHdpbi5ldmFsKCkgbWFnaWNhbGx5IGFwcGVhcnMgd2hlbiB0aGlzIGlzIGNhbGxlZCBpbiBJRTpcbiAgICAgICAgd0V4ZWNTY3JpcHQuY2FsbCh3aW4sICdudWxsJyk7XG4gICAgICAgIHdFdmFsID0gd2luLmV2YWw7XG4gICAgfVxuICAgIFxuICAgIGZvckVhY2goT2JqZWN0X2tleXMoY29udGV4dCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgd2luW2tleV0gPSBjb250ZXh0W2tleV07XG4gICAgfSk7XG4gICAgZm9yRWFjaChnbG9iYWxzLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmIChjb250ZXh0W2tleV0pIHtcbiAgICAgICAgICAgIHdpbltrZXldID0gY29udGV4dFtrZXldO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgdmFyIHdpbktleXMgPSBPYmplY3Rfa2V5cyh3aW4pO1xuXG4gICAgdmFyIHJlcyA9IHdFdmFsLmNhbGwod2luLCB0aGlzLmNvZGUpO1xuICAgIFxuICAgIGZvckVhY2goT2JqZWN0X2tleXMod2luKSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAvLyBBdm9pZCBjb3B5aW5nIGNpcmN1bGFyIG9iamVjdHMgbGlrZSBgdG9wYCBhbmQgYHdpbmRvd2AgYnkgb25seVxuICAgICAgICAvLyB1cGRhdGluZyBleGlzdGluZyBjb250ZXh0IHByb3BlcnRpZXMgb3IgbmV3IHByb3BlcnRpZXMgaW4gdGhlIGB3aW5gXG4gICAgICAgIC8vIHRoYXQgd2FzIG9ubHkgaW50cm9kdWNlZCBhZnRlciB0aGUgZXZhbC5cbiAgICAgICAgaWYgKGtleSBpbiBjb250ZXh0IHx8IGluZGV4T2Yod2luS2V5cywga2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnRleHRba2V5XSA9IHdpbltrZXldO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmb3JFYWNoKGdsb2JhbHMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCEoa2V5IGluIGNvbnRleHQpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wKGNvbnRleHQsIGtleSwgd2luW2tleV0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICAgIFxuICAgIHJldHVybiByZXM7XG59O1xuXG5TY3JpcHQucHJvdG90eXBlLnJ1bkluVGhpc0NvbnRleHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGV2YWwodGhpcy5jb2RlKTsgLy8gbWF5YmUuLi5cbn07XG5cblNjcmlwdC5wcm90b3R5cGUucnVuSW5OZXdDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICB2YXIgY3R4ID0gU2NyaXB0LmNyZWF0ZUNvbnRleHQoY29udGV4dCk7XG4gICAgdmFyIHJlcyA9IHRoaXMucnVuSW5Db250ZXh0KGN0eCk7XG5cbiAgICBmb3JFYWNoKE9iamVjdF9rZXlzKGN0eCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgY29udGV4dFtrZXldID0gY3R4W2tleV07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuZm9yRWFjaChPYmplY3Rfa2V5cyhTY3JpcHQucHJvdG90eXBlKSwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBleHBvcnRzW25hbWVdID0gU2NyaXB0W25hbWVdID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgICAgdmFyIHMgPSBTY3JpcHQoY29kZSk7XG4gICAgICAgIHJldHVybiBzW25hbWVdLmFwcGx5KHMsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgfTtcbn0pO1xuXG5leHBvcnRzLmNyZWF0ZVNjcmlwdCA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuU2NyaXB0KGNvZGUpO1xufTtcblxuZXhwb3J0cy5jcmVhdGVDb250ZXh0ID0gU2NyaXB0LmNyZWF0ZUNvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHZhciBjb3B5ID0gbmV3IENvbnRleHQoKTtcbiAgICBpZih0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yRWFjaChPYmplY3Rfa2V5cyhjb250ZXh0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgY29weVtrZXldID0gY29udGV4dFtrZXldO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG59O1xuIiwiXG52YXIgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBvYmope1xuICBpZiAoaW5kZXhPZikgcmV0dXJuIGFyci5pbmRleE9mKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59OyJdfQ==
