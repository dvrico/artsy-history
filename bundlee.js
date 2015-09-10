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
            var artistArtworks = artistArray
            //getImagesOfArtists(artistArtworks)
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
    })


var getImagesOfArtists = function(artistArtworks) {
    traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter)

    for(var i=0; i < artistArtworks.length; i++) {

        console.log(artistArtworks.length)
        traverson
        .from(artistArtworks[i]._links.artworks.href)
        .jsonHal()
        .withRequestOptions({
            headers: {
                'X-Xapp-Token': xappToken,
                'Accept': 'application/vnd.artsy-v2+json'
            }
        })
        .getResource(function(error, artworks) {
            if (error) {
                console.log('another error..')
            }
            if(artworks._embedded.artworks.length > 0) {
                console.log(artworks)
                artworkArray.push(artworks._embedded.artworks[0]._links.thumbnail.href)
            }
            if(artworkArray.length >= 2) {
                getDegas()
            }
        })
    }
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcnRzeS5qcyIsIm1haW4uanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uLWhhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24taGFsL25vZGVfbW9kdWxlcy9oYWxmcmVkL2hhbGZyZWQuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uLWhhbC9ub2RlX21vZHVsZXMvaGFsZnJlZC9saWIvaW1tdXRhYmxlX3N0YWNrLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi1oYWwvbm9kZV9tb2R1bGVzL2hhbGZyZWQvbGliL3BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24taGFsL25vZGVfbW9kdWxlcy9oYWxmcmVkL2xpYi9yZXNvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vYnJvd3Nlci9saWIvc2hpbS9sb2cuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2Jyb3dzZXIvbGliL3NoaW0vbm9kZS11dGlsLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9icm93c2VyL2xpYi9zaGltL3JlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2Jyb3dzZXIvbGliL3NoaW0vdW5kZXJzY29yZS1zdHJpbmctcmVkdWNlZC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vYnJvd3Nlci9saWIvc2hpbS91cmwtcmVzb2x2ZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2Fib3J0X3RyYXZlcnNhbC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2FjdGlvbnMuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9idWlsZGVyLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvaHR0cF9yZXF1ZXN0cy5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2lzX2NvbnRpbnVhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL2pzb25fYWRhcHRlci5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL21lZGlhX3R5cGVfcmVnaXN0cnkuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi9tZWRpYV90eXBlcy5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL21lcmdlX3JlY3Vyc2l2ZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL25lZ290aWF0aW9uX2FkYXB0ZXIuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2FwcGx5X3RyYW5zZm9ybXMuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2NoZWNrX2h0dHBfc3RhdHVzLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9jb250aW51YXRpb25fdG9fZG9jLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9jb250aW51YXRpb25fdG9fcmVzcG9uc2UuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2NvbnZlcnRfZW1iZWRkZWRfZG9jX3RvX3Jlc3BvbnNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9kZXRlY3RfY29udGVudF90eXBlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9leGVjdXRlX2h0dHBfcmVxdWVzdC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZXhlY3V0ZV9sYXN0X2h0dHBfcmVxdWVzdC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZXh0cmFjdF9kb2MuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2V4dHJhY3RfcmVzcG9uc2UuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL2V4dHJhY3RfdXJsLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9mZXRjaF9sYXN0X3Jlc291cmNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9mZXRjaF9yZXNvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvZ2V0X29wdGlvbnNfZm9yX3N0ZXAuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3BhcnNlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi9saWIvdHJhbnNmb3Jtcy9yZXNldF9jb250aW51YXRpb24uanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3Jlc2V0X2xhc3Rfc3RlcC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvcmVzb2x2ZV9uZXh0X3VybC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbGliL3RyYW5zZm9ybXMvcmVzb2x2ZV91cmlfdGVtcGxhdGUuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi90cmFuc2Zvcm1zL3N3aXRjaF90b19uZXh0X3N0ZXAuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL2xpYi93YWxrZXIuanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9KU09OUGF0aC9saWIvanNvbnBhdGguanMiLCJub2RlX21vZHVsZXMvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9yZXNvbHZlLXVybC9yZXNvbHZlLXVybC5qcyIsIm5vZGVfbW9kdWxlcy90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3VybC10ZW1wbGF0ZS9saWIvdXJsLXRlbXBsYXRlLmpzIiwibm9kZV9tb2R1bGVzL3RyYXZlcnNvbi90cmF2ZXJzb24uanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3ZtLWJyb3dzZXJpZnkvaW5kZXguanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdm0tYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5kZXhvZi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDem1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50JylcbnZhciB0cmF2ZXJzb24gPSByZXF1aXJlKCd0cmF2ZXJzb24nKVxudmFyIEpzb25IYWxBZGFwdGVyID0gcmVxdWlyZSgndHJhdmVyc29uLWhhbCcpXG5cbnZhciBjbGllbnRJRCA9ICcwMDY2NWQ0NmJiNGY1NmQ0MmI5OCcsXG4gICAgY2xpZW50U2VjcmV0ID0gJzg2ZDQ4MzcyMGFhNmRlZGM5Yzg2ZDExMjlhOTk1NzQ5JyxcbiAgICBhcGlVcmwgPSAnaHR0cHM6Ly9hcGkuYXJ0c3kubmV0L2FwaS90b2tlbnMveGFwcF90b2tlbidcblxudmFyIGFydGlzdEFycmF5ID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgeGFwcFRva2VuOiAnJyxcblxuICAgIHJlcXVlc3RUb2tlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgLnBvc3QoYXBpVXJsKVxuICAgICAgICAgICAgICAgICAgICAuc2VuZCh7IGNsaWVudF9pZDogY2xpZW50SUQsIGNsaWVudF9zZWNyZXQ6IGNsaWVudFNlY3JldCB9KVxuICAgICAgICAgICAgICAgICAgICAuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMuYm9keS50b2tlbilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0sXG4gICAgcXVlcnlGb3JDYXRlZ29yeTogZnVuY3Rpb24oU1RBUlQsIFBBVEgsIENBVEVHT1JZKSB7XG4gICAgICAgIHRyYXZlcnNvbi5yZWdpc3Rlck1lZGlhVHlwZShKc29uSGFsQWRhcHRlci5tZWRpYVR5cGUsIEpzb25IYWxBZGFwdGVyKVxuXG4gICAgICAgIHZhciBhcGkgPSB0cmF2ZXJzb25cbiAgICAgICAgLmZyb20oU1RBUlQpXG4gICAgICAgIC5qc29uSGFsKClcbiAgICAgICAgLndpdGhSZXF1ZXN0T3B0aW9ucyh7XG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ1gtWGFwcC1Ub2tlbic6IHRoaXMueGFwcFRva2VuLFxuICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi92bmQuYXJ0c3ktdjIranNvbidcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgYXBpXG4gICAgICAgIC5uZXdSZXF1ZXN0KClcbiAgICAgICAgLmZvbGxvdyhQQVRIKVxuICAgICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7IGlkOiBDQVRFR09SWSB9KVxuICAgICAgICAuZ2V0UmVzb3VyY2UoZnVuY3Rpb24oZXJyb3IsIHJlc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2l0aCB0aGUgUXVlcnkhJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTw0OyBpKyspIHtcbiAgICAgICAgICAgICAgICBhcnRpc3RBcnJheS5wdXNoKHJlc291cmNlLl9lbWJlZGRlZC5hcnRpc3RzW2ldKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coYXJ0aXN0QXJyYXkpXG4gICAgICAgICAgICB2YXIgYXJ0aXN0QXJ0d29ya3MgPSBhcnRpc3RBcnJheVxuICAgICAgICAgICAgLy9nZXRJbWFnZXNPZkFydGlzdHMoYXJ0aXN0QXJ0d29ya3MpXG4gICAgICAgIH0pXG4gICAgfVxufSAvLyBFTkQgT0YgQVJUU1kgT0JKRUNUXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBBcnRzeSA9IHJlcXVpcmUoJy4vYXJ0c3kuanMnKTtcblxudmFyIGRlZ2FzLCBkZWdhc0FydHdvcms7XG52YXIgZGVnYXNUaGVEYW5jZUxlc3NvbjtcbnZhciBlbERlZ2FzQmlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FydGlzdEJpbycpO1xudmFyIGVsRGVnYXNMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FydGlzdExpbmsnKTtcbnZhciBlbERlZ2FzQXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FydGlzdEltYWdlJyk7XG5cbnZhciBlbGZpcnN0QXJ0aXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpcnN0QXJ0aXN0Jyk7XG52YXIgZWxmaXJzdEltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpcnN0SW1hZ2UnKTtcbnZhciBmaXJzdEFydGlzdEFydHdvcms7XG5cbnZhciBlbHNlY29uZEFydGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWNvbmRBcnRpc3QnKTtcbnZhciBlbHNlY29uZEltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlY29uZEltYWdlJyk7XG5cbnZhciBlbHRoaXJkQXJ0aXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RoaXJkQXJ0aXN0Jyk7XG52YXIgZWx0aGlyZEltYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RoaXJkSW1hZ2UnKTtcblxudmFyIGVsZm91cnRoQXJ0aXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvdXJ0aEFydGlzdCcpO1xudmFyIGVsZm91cnRoSW1hZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm91cnRoSW1hZ2UnKTtcblxudmFyIGltcHJlc3Npb25pc20gPSAnNGQ5MGQxOTFkY2RkNWY0NGE1MDAwMDRlJztcblxudmFyIGZyb21Sb290ID0gJ2h0dHBzOi8vYXBpLmFydHN5Lm5ldC9hcGknXG52YXIgdG9QYXRoID0gWydnZW5lJywgJ2FydGlzdHMnXVxuXG52YXIgaW1wcmVzc2lvbmlzbURlc2NyaXB0aW9uO1xuXG52YXIgYXJ0d29ya0FycmF5ID0gW11cbi8vdmFyIGFydGlzdEFycmF5ID0gW11cbi8vdmFyIHhhcHBUb2tlbjtcblxuQXJ0c3kucmVxdWVzdFRva2VuKClcbiAgICAudGhlbihmdW5jdGlvbih4YXBwVG9rZW4pIHtcbiAgICAgICAgY29uc29sZS5sb2coeGFwcFRva2VuKVxuICAgICAgICBBcnRzeS54YXBwVG9rZW4gPSB4YXBwVG9rZW5cbiAgICAgICAgQXJ0c3kucXVlcnlGb3JDYXRlZ29yeShmcm9tUm9vdCwgdG9QYXRoLCBpbXByZXNzaW9uaXNtKVxuICAgIH0pXG5cblxudmFyIGdldEltYWdlc09mQXJ0aXN0cyA9IGZ1bmN0aW9uKGFydGlzdEFydHdvcmtzKSB7XG4gICAgdHJhdmVyc29uLnJlZ2lzdGVyTWVkaWFUeXBlKEpzb25IYWxBZGFwdGVyLm1lZGlhVHlwZSwgSnNvbkhhbEFkYXB0ZXIpXG5cbiAgICBmb3IodmFyIGk9MDsgaSA8IGFydGlzdEFydHdvcmtzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coYXJ0aXN0QXJ0d29ya3MubGVuZ3RoKVxuICAgICAgICB0cmF2ZXJzb25cbiAgICAgICAgLmZyb20oYXJ0aXN0QXJ0d29ya3NbaV0uX2xpbmtzLmFydHdvcmtzLmhyZWYpXG4gICAgICAgIC5qc29uSGFsKClcbiAgICAgICAgLndpdGhSZXF1ZXN0T3B0aW9ucyh7XG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ1gtWGFwcC1Ub2tlbic6IHhhcHBUb2tlbixcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5hcnRzeS12Mitqc29uJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuZ2V0UmVzb3VyY2UoZnVuY3Rpb24oZXJyb3IsIGFydHdvcmtzKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYW5vdGhlciBlcnJvci4uJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGFydHdvcmtzLl9lbWJlZGRlZC5hcnR3b3Jrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXJ0d29ya3MpXG4gICAgICAgICAgICAgICAgYXJ0d29ya0FycmF5LnB1c2goYXJ0d29ya3MuX2VtYmVkZGVkLmFydHdvcmtzWzBdLl9saW5rcy50aHVtYm5haWwuaHJlZilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGFydHdvcmtBcnJheS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIGdldERlZ2FzKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59XG5cbi8vIHZhciBnZXREZWdhcyA9IGZ1bmN0aW9uKCkge1xuLy8gICAgIHRyYXZlcnNvbi5yZWdpc3Rlck1lZGlhVHlwZShKc29uSGFsQWRhcHRlci5tZWRpYVR5cGUsIEpzb25IYWxBZGFwdGVyKVxuLy9cbi8vICAgICB2YXIgYXBpID0gdHJhdmVyc29uXG4vLyAgICAgLmZyb20oJ2h0dHBzOi8vYXBpLmFydHN5Lm5ldC9hcGknKVxuLy8gICAgIC5qc29uSGFsKClcbi8vICAgICAud2l0aFJlcXVlc3RPcHRpb25zKHtcbi8vICAgICAgICAgaGVhZGVyczoge1xuLy8gICAgICAgICAgICAgJ1gtWGFwcC1Ub2tlbic6IHhhcHBUb2tlbixcbi8vICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vdm5kLmFydHN5LXYyK2pzb24nXG4vLyAgICAgICAgIH1cbi8vICAgICB9KVxuLy9cbi8vICAgICBhcGlcbi8vICAgICAubmV3UmVxdWVzdCgpXG4vLyAgICAgLmZvbGxvdygnYXJ0aXN0Jylcbi8vICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7IGlkOiAnNGRhZGQyMTc3MTI5ZjA1OTI0MDAwYzY4JyB9KVxuLy8gICAgIC5nZXRSZXNvdXJjZShmdW5jdGlvbihlcnJvciwgZWRnYXJEZWdhcykge1xuLy8gICAgICAgICBpZiAoZXJyb3IpIHtcbi8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvciEnKVxuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGNvbnNvbGUubG9nKGVkZ2FyRGVnYXMpXG4vLyAgICAgICAgIGRlZ2FzID0gZWRnYXJEZWdhcy5uYW1lICsgJyB8ICcgKyAnQmlydGhkYXk6ICcgKyBlZGdhckRlZ2FzLmJpcnRoZGF5ICsgJyB8ICcgKyAnSG9tZXRvd246ICcgKyBlZGdhckRlZ2FzLmhvbWV0b3duICsgJyB8ICcgKyAnTmF0aW9uYWxpdHk6ICcgKyBlZGdhckRlZ2FzLm5hdGlvbmFsaXR5O1xuLy8gICAgICAgICB2YXIgYXJ0d29yayA9IGVkZ2FyRGVnYXMuX2xpbmtzLmFydHdvcmtzLmhyZWZcbi8vICAgICAgICAgZ2V0RGVnYXNBcnR3b3JrKGFydHdvcmspXG4vLyAgICAgfSk7XG4vLyB9XG4vL1xuLy8gdmFyIGdldERlZ2FzQXJ0d29yayA9IGZ1bmN0aW9uKGFydHdvcmspIHtcbi8vICAgICB0cmF2ZXJzb24ucmVnaXN0ZXJNZWRpYVR5cGUoSnNvbkhhbEFkYXB0ZXIubWVkaWFUeXBlLCBKc29uSGFsQWRhcHRlcilcbi8vXG4vLyAgICAgdHJhdmVyc29uXG4vLyAgICAgLmZyb20oYXJ0d29yaylcbi8vICAgICAuanNvbkhhbCgpXG4vLyAgICAgLndpdGhSZXF1ZXN0T3B0aW9ucyh7XG4vLyAgICAgICAgIGhlYWRlcnM6IHtcbi8vICAgICAgICAgICAgICdYLVhhcHAtVG9rZW4nOiB4YXBwVG9rZW4sXG4vLyAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL3ZuZC5hcnRzeS12Mitqc29uJ1xuLy8gICAgICAgICB9XG4vLyAgICAgfSlcbi8vICAgICAuZ2V0UmVzb3VyY2UoZnVuY3Rpb24oZXJyb3IsIGFsbEFydHdvcmspIHtcbi8vICAgICAgICAgaWYgKGVycm9yKSB7XG4vLyAgICAgICAgICAgICBjb25zb2xlLmxvZygnYW5vdGhlciBlcnJvci4uJylcbi8vICAgICAgICAgfVxuLy8gICAgICAgICAvL2NvbnNvbGUubG9nKGFsbEFydHdvcmspXG4vLyAgICAgICAgIGNvbnNvbGUubG9nKGFsbEFydHdvcmsuX2VtYmVkZGVkLmFydHdvcmtzWzNdLnRpdGxlKVxuLy8gICAgICAgICBkZWdhc0FydHdvcmsgPSBhbGxBcnR3b3JrLl9lbWJlZGRlZC5hcnR3b3Jrc1szXS50aXRsZTtcbi8vICAgICAgICAgZGVnYXNUaGVEYW5jZUxlc3NvbiA9IGFsbEFydHdvcmsuX2VtYmVkZGVkLmFydHdvcmtzWzNdLl9saW5rcy50aHVtYm5haWwuaHJlZlxuLy8gICAgICAgICBkaXNwbGF5RGVnYXMoKVxuLy8gICAgIH0pXG4vLyB9XG4vL1xuLy8gdmFyIGRpc3BsYXlEZWdhcyA9IGZ1bmN0aW9uKCkge1xuLy8gICAgIGVsRGVnYXNCaW8uaW5uZXJIVE1MID0gZGVnYXNcbi8vICAgICBlbERlZ2FzTGluay5pbm5lckhUTUwgPSBkZWdhc0FydHdvcmtcbi8vICAgICBlbERlZ2FzQXJ0LnNyYz1kZWdhc1RoZURhbmNlTGVzc29uXG4vL1xuLy8gICAgIGVsZmlyc3RBcnRpc3QuaW5uZXJIVE1MID0gYXJ0aXN0QXJyYXlbMF0ubmFtZVxuLy8gICAgIGVsZmlyc3RJbWFnZS5zcmM9YXJ0d29ya0FycmF5WzBdXG4vL1xuLy8gICAgIGVsc2Vjb25kQXJ0aXN0LmlubmVySFRNTCA9IGFydGlzdEFycmF5WzFdLm5hbWVcbi8vICAgICBlbHNlY29uZEltYWdlLnNyYz1hcnR3b3JrQXJyYXlbMV1cbi8vXG4vLyAgICAgZWx0aGlyZEFydGlzdC5pbm5lckhUTUwgPSBhcnRpc3RBcnJheVsyXS5uYW1lXG4vLyAgICAgLy9lbHRoaXJkSW1hZ2Uuc3JjPWFydHdvcmtBcnJheVsyXSAgLy8gVGhpcyBhcnRpc3QgZG9lcyBub3QgaGF2ZSBhcnR3b3JrXG4vL1xuLy8gICAgIGVsZm91cnRoQXJ0aXN0LmlubmVySFRNTCA9IGFydGlzdEFycmF5WzNdLm5hbWVcbi8vICAgICAvL2VsZm91cnRoSW1hZ2Uuc3JjPWFydHdvcmtBcnJheVszXSAgLy9UaGlzIGFydGlzdCBkb2VzIG5vdCBoYXZlIGFydHdvcmtcbi8vIH1cbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdCA9ICd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3dcbiAgPyAodGhpcyB8fCBzZWxmKVxuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gZnVuY3Rpb24gKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICAgJiYgKCFyb290LmxvY2F0aW9uIHx8ICdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpba2V5XSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcmFtcyhzdHIpe1xuICByZXR1cm4gcmVkdWNlKHN0ci5zcGxpdCgvICo7ICovKSwgZnVuY3Rpb24ob2JqLCBzdHIpe1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKVxuICAgICAgLCBrZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICAsIHZhbCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoa2V5ICYmIHZhbCkgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnJlcSA9IHJlcTtcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIC8vIHJlc3BvbnNlVGV4dCBpcyBhY2Nlc3NpYmxlIG9ubHkgaWYgcmVzcG9uc2VUeXBlIGlzICcnIG9yICd0ZXh0JyBhbmQgb24gb2xkZXIgYnJvd3NlcnNcbiAgdGhpcy50ZXh0ID0gKCh0aGlzLnJlcS5tZXRob2QgIT0nSEVBRCcgJiYgKHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJycgfHwgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndGV4dCcpKSB8fCB0eXBlb2YgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndW5kZWZpbmVkJylcbiAgICAgPyB0aGlzLnhoci5yZXNwb25zZVRleHRcbiAgICAgOiBudWxsO1xuICB0aGlzLnN0YXR1c1RleHQgPSB0aGlzLnJlcS54aHIuc3RhdHVzVGV4dDtcbiAgdGhpcy5zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5ib2R5ID0gdGhpcy5yZXEubWV0aG9kICE9ICdIRUFEJ1xuICAgID8gdGhpcy5wYXJzZUJvZHkodGhpcy50ZXh0ID8gdGhpcy50ZXh0IDogdGhpcy54aHIucmVzcG9uc2UpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiAoc3RyLmxlbmd0aCB8fCBzdHIgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIC8vIGhhbmRsZSBJRTkgYnVnOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwMDQ2OTcyL21zaWUtcmV0dXJucy1zdGF0dXMtY29kZS1vZi0xMjIzLWZvci1hamF4LXJlcXVlc3RcbiAgaWYgKHN0YXR1cyA9PT0gMTIyMykge1xuICAgIHN0YXR1cyA9IDIwNDtcbiAgfVxuXG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBlcnIgPSBudWxsO1xuICAgIHZhciByZXMgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGVyciA9IG5ldyBFcnJvcignUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2UnKTtcbiAgICAgIGVyci5wYXJzZSA9IHRydWU7XG4gICAgICBlcnIub3JpZ2luYWwgPSBlO1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ3Jlc3BvbnNlJywgcmVzKTtcblxuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICBpZiAocmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICAgIH1cblxuICAgIHZhciBuZXdfZXJyID0gbmV3IEVycm9yKHJlcy5zdGF0dXNUZXh0IHx8ICdVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZScpO1xuICAgIG5ld19lcnIub3JpZ2luYWwgPSBlcnI7XG4gICAgbmV3X2Vyci5yZXNwb25zZSA9IHJlcztcbiAgICBuZXdfZXJyLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG5cbiAgICBzZWxmLmNhbGxiYWNrKG5ld19lcnIsIHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgYGRhdGFgLCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIHF1ZXJ5c3RyaW5nXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbXVsdGlwbGUgZGF0YSBcIndyaXRlc1wiXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5zZW5kKHsgc2VhcmNoOiAncXVlcnknIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgcmFuZ2U6ICcxLi41JyB9KVxuICogICAgICAgICAuc2VuZCh7IG9yZGVyOiAnZGVzYycgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqIHx8IGlzSG9zdChkYXRhKSkgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGZuKGVyciwgcmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ09yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcigndGltZW91dCBvZiAnICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gcmVxdWVzdC5nZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG5cbiAgICAvLyBJbiBJRTksIHJlYWRzIHRvIGFueSBwcm9wZXJ0eSAoZS5nLiBzdGF0dXMpIG9mZiBvZiBhbiBhYm9ydGVkIFhIUiB3aWxsXG4gICAgLy8gcmVzdWx0IGluIHRoZSBlcnJvciBcIkNvdWxkIG5vdCBjb21wbGV0ZSB0aGUgb3BlcmF0aW9uIGR1ZSB0byBlcnJvciBjMDBjMDIzZlwiXG4gICAgdmFyIHN0YXR1cztcbiAgICB0cnkgeyBzdGF0dXMgPSB4aHIuc3RhdHVzIH0gY2F0Y2goZSkgeyBzdGF0dXMgPSAwOyB9XG5cbiAgICBpZiAoMCA9PSBzdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLnRpbWVkb3V0KSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgIGlmIChzZWxmLmFib3J0ZWQpIHJldHVybjtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfTtcblxuICAvLyBwcm9ncmVzc1xuICB2YXIgaGFuZGxlUHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICBpZiAoZS50b3RhbCA+IDApIHtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB4aHIub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKHhoci51cGxvYWQgJiYgdGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYudGltZWRvdXQgPSB0cnVlO1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVtjb250ZW50VHlwZSA/IGNvbnRlbnRUeXBlLnNwbGl0KCc7JylbMF0gOiAnJ107XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRmF1eCBwcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsLCByZWplY3QpIHtcbiAgcmV0dXJuIHRoaXMuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgZXJyID8gcmVqZWN0KGVycikgOiBmdWxmaWxsKHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmRlbCA9IGZ1bmN0aW9uKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhbGZyZWQgPSByZXF1aXJlKCdoYWxmcmVkJyk7XG5cbmZ1bmN0aW9uIEpzb25IYWxBZGFwdGVyKGxvZykge1xuICB0aGlzLmxvZyA9IGxvZztcbn1cblxuSnNvbkhhbEFkYXB0ZXIubWVkaWFUeXBlID0gJ2FwcGxpY2F0aW9uL2hhbCtqc29uJztcblxuLy8gVE9ETyBQYXNzIHRoZSB0cmF2ZXJzYWwgc3RhdGUgaW50byB0aGUgYWRhcHRlci4uLiBhbmQgcG9zc2libHkgYWxzbyBvbmx5XG4vLyBtb2RpZnkgaXQsIGRvIG5vdCByZXR1cm4gYW55dGhpbmcuXG5Kc29uSGFsQWRhcHRlci5wcm90b3R5cGUuZmluZE5leHRTdGVwID0gZnVuY3Rpb24oZG9jLCBrZXksIHByZWZlckVtYmVkZGVkKSB7XG4gIHRoaXMubG9nLmRlYnVnKCdwYXJzaW5nIGhhbCcpO1xuICB2YXIgY3R4ID0ge1xuICAgIGRvYzogZG9jLFxuICAgIGhhbFJlc291cmNlOiBoYWxmcmVkLnBhcnNlKGRvYyksXG4gICAgcGFyc2VkS2V5OiBwYXJzZUtleShrZXkpLFxuICAgIGxpbmtTdGVwOiBudWxsLFxuICAgIGVtYmVkZGVkU3RlcDogbnVsbCxcbiAgfTtcbiAgcmVzb2x2ZUN1cmllKGN0eCk7XG4gIGZpbmRMaW5rKGN0eCwgdGhpcy5sb2cpO1xuICBmaW5kRW1iZWRkZWQoY3R4LCB0aGlzLmxvZyk7XG4gIHJldHVybiBwcmVwYXJlUmVzdWx0KGN0eCwga2V5LCBwcmVmZXJFbWJlZGRlZCk7XG59O1xuXG5mdW5jdGlvbiBwcmVwYXJlUmVzdWx0KGN0eCwga2V5LCBwcmVmZXJFbWJlZGRlZCkge1xuICB2YXIgc3RlcDtcbiAgaWYgKHByZWZlckVtYmVkZGVkIHx8IGN0eC5wYXJzZWRLZXkubW9kZSA9PT0gJ2FsbCcpIHtcbiAgICBzdGVwID0gY3R4LmVtYmVkZGVkU3RlcCB8fCBjdHgubGlua1N0ZXA7XG4gIH0gZWxzZSB7XG4gICAgc3RlcCA9IGN0eC5saW5rU3RlcCB8fCBjdHguZW1iZWRkZWRTdGVwO1xuICB9XG5cbiAgaWYgKHN0ZXApIHtcbiAgICByZXR1cm4gc3RlcDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbWVzc2FnZSA9ICdDb3VsZCBub3QgZmluZCBhIG1hdGNoaW5nIGxpbmsgbm9yIGFuIGVtYmVkZGVkIGRvY3VtZW50ICcrXG4gICAgICAnZm9yICcgKyBrZXkgKyAnLic7XG4gICAgaWYgKGN0eC5saW5rRXJyb3IpIHtcbiAgICAgIG1lc3NhZ2UgKz0gJyBFcnJvciB3aGlsZSByZXNvbHZpbmcgbGlua2VkIGRvY3VtZW50czogJyArIGN0eC5saW5rRXJyb3I7XG4gICAgfVxuICAgIGlmIChjdHguZW1iZWRkZWRFcnJvcikge1xuICAgICAgbWVzc2FnZSArPSAnIEVycm9yIHdoaWxlIHJlc29sdmluZyBlbWJlZGRlZCBkb2N1bWVudHM6ICcgK1xuICAgICAgICBjdHguZW1iZWRkZWRFcnJvcjtcbiAgICB9XG4gICAgbWVzc2FnZSArPSAnIERvY3VtZW50OiAnICsgSlNPTi5zdHJpbmdpZnkoY3R4LmRvYyk7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VLZXkoa2V5KSB7XG4gIHZhciBtYXRjaCA9IGtleS5tYXRjaCgvKC4qKVxcWyguKik6KC4qKVxcXS8pO1xuICAvLyBlYTphZG1pblt0aXRsZTpLYXRlXSA9PiBhY2Nlc3MgYnkgc2Vjb25kYXJ5IGtleVxuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kZTogJ3NlY29uZGFyeScsXG4gICAgICBrZXk6IG1hdGNoWzFdLFxuICAgICAgc2Vjb25kYXJ5S2V5OiBtYXRjaFsyXSxcbiAgICAgIHNlY29uZGFyeVZhbHVlOiBtYXRjaFszXSxcbiAgICAgIGluZGV4OiBudWxsLFxuICAgIH07XG4gIH1cbiAgLy8gZWE6b3JkZXJbM10gPT4gaW5kZXggYWNjZXNzIGludG8gZW1iZWRkZWQgYXJyYXlcbiAgbWF0Y2ggPSBrZXkubWF0Y2goLyguKilcXFsoXFxkKylcXF0vKTtcbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGU6ICdpbmRleCcsXG4gICAgICBrZXk6IG1hdGNoWzFdLFxuICAgICAgc2Vjb25kYXJ5S2V5OiBudWxsLFxuICAgICAgc2Vjb25kYXJ5VmFsdWU6IG51bGwsXG4gICAgICBpbmRleDogbWF0Y2hbMl0sXG4gICAgfTtcbiAgfVxuICAvLyBlYTpvcmRlclskYWxsXSA9PiBtZXRhLWtleSwgcmV0dXJuIGZ1bGwgYXJyYXlcbiAgbWF0Y2ggPSBrZXkubWF0Y2goLyguKilcXFtcXCRhbGxcXF0vKTtcbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGU6ICdhbGwnLFxuICAgICAga2V5OiBtYXRjaFsxXSxcbiAgICAgIHNlY29uZGFyeUtleTogbnVsbCxcbiAgICAgIHNlY29uZGFyeVZhbHVlOiBudWxsLFxuICAgICAgaW5kZXg6IG51bGwsXG4gICAgfTtcbiAgfVxuICAvLyBlYTpvcmRlciA9PiBzaW1wbGUgbGluayByZWxhdGlvblxuICByZXR1cm4ge1xuICAgIG1vZGU6ICdmaXJzdCcsXG4gICAga2V5OiBrZXksXG4gICAgc2Vjb25kYXJ5S2V5OiBudWxsLFxuICAgIHNlY29uZGFyeVZhbHVlOiBudWxsLFxuICAgIGluZGV4OiBudWxsLFxuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQ3VyaWUoY3R4KSB7XG4gIGlmIChjdHguaGFsUmVzb3VyY2UuaGFzQ3VyaWVzKCkpIHtcbiAgICBjdHgucGFyc2VkS2V5LmN1cmllID1cbiAgICAgIGN0eC5oYWxSZXNvdXJjZS5yZXZlcnNlUmVzb2x2ZUN1cmllKGN0eC5wYXJzZWRLZXkua2V5KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kTGluayhjdHgsIGxvZykge1xuICB2YXIgbGlua0FycmF5ID0gY3R4LmhhbFJlc291cmNlLmxpbmtBcnJheShjdHgucGFyc2VkS2V5LmtleSk7XG4gIGlmICghbGlua0FycmF5KSB7XG4gICAgbGlua0FycmF5ID0gY3R4LmhhbFJlc291cmNlLmxpbmtBcnJheShjdHgucGFyc2VkS2V5LmN1cmllKTtcbiAgfVxuICBpZiAoIWxpbmtBcnJheSB8fCBsaW5rQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc3dpdGNoIChjdHgucGFyc2VkS2V5Lm1vZGUpIHtcbiAgICBjYXNlICdzZWNvbmRhcnknOlxuICAgICAgZmluZExpbmtCeVNlY29uZGFyeUtleShjdHgsIGxpbmtBcnJheSwgbG9nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgIGZpbmRMaW5rQnlJbmRleChjdHgsIGxpbmtBcnJheSwgbG9nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpcnN0JzpcbiAgICAgIGZpbmRMaW5rV2l0aG91dEluZGV4KGN0eCwgbGlua0FycmF5LCBsb2cpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBtb2RlOiAnICsgY3R4LnBhcnNlZEtleS5tb2RlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kTGlua0J5U2Vjb25kYXJ5S2V5KGN0eCwgbGlua0FycmF5LCBsb2cpIHtcbiAgLy8gY2xpZW50IHNlbGVjdGVkIGEgc3BlY2lmaWMgbGluayBieSBhbiBleHBsaWNpdCBzZWNvbmRhcnkga2V5IGxpa2UgJ25hbWUnLFxuICAvLyBzbyB1c2UgaXQgb3IgZmFpbFxuICB2YXIgaSA9IDA7XG4gIGZvciAoOyBpIDwgbGlua0FycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHZhbCA9IGxpbmtBcnJheVtpXVtjdHgucGFyc2VkS2V5LnNlY29uZGFyeUtleV07XG4gICAgLyoganNoaW50IC1XMTE2ICovXG4gICAgaWYgKHZhbCAhPSBudWxsICYmIHZhbCA9PSBjdHgucGFyc2VkS2V5LnNlY29uZGFyeVZhbHVlKSB7XG4gICAgICBpZiAoIWxpbmtBcnJheVtpXS5ocmVmKSB7XG4gICAgICAgIGN0eC5saW5rRXJyb3IgPSAnVGhlIGxpbmsgJyArIGN0eC5wYXJzZWRLZXkua2V5ICsgJ1snICtcbiAgICAgICAgICBjdHgucGFyc2VkS2V5LnNlY29uZGFyeUtleSArICc6JyArIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5VmFsdWUgK1xuICAgICAgICAgICAgJ10gZXhpc3RzLCBidXQgaXQgaGFzIG5vIGhyZWYgYXR0cmlidXRlLic7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZy5kZWJ1ZygnZm91bmQgaGFsIGxpbms6ICcgKyBsaW5rQXJyYXlbaV0uaHJlZik7XG4gICAgICBjdHgubGlua1N0ZXAgPSB7IHVybDogbGlua0FycmF5W2ldLmhyZWYgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyoganNoaW50ICtXMTE2ICovXG4gIH1cbiAgY3R4LmxpbmtFcnJvciA9IGN0eC5wYXJzZWRLZXkua2V5ICsgJ1snICsgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlLZXkgKyAnOicgK1xuICAgICAgY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlWYWx1ZSArXG4gICAgICddIHJlcXVlc3RlZCwgYnV0IHRoZXJlIGlzIG5vIHN1Y2ggbGluay4nO1xufVxuXG5mdW5jdGlvbiBmaW5kTGlua0J5SW5kZXgoY3R4LCBsaW5rQXJyYXksIGxvZykge1xuICAvLyBjbGllbnQgc3BlY2lmaWVkIGFuIGV4cGxpY2l0IGFycmF5IGluZGV4IGZvciB0aGlzIGxpbmssIHNvIHVzZSBpdCBvciBmYWlsXG4gIGlmICghbGlua0FycmF5W2N0eC5wYXJzZWRLZXkuaW5kZXhdKSB7XG4gICAgY3R4LmxpbmtFcnJvciA9ICdUaGUgbGluayBhcnJheSAnICsgY3R4LnBhcnNlZEtleS5rZXkgK1xuICAgICAgICAnIGV4aXN0cywgYnV0IGhhcyBubyBlbGVtZW50IGF0IGluZGV4ICcgKyBjdHgucGFyc2VkS2V5LmluZGV4ICsgJy4nO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIWxpbmtBcnJheVtjdHgucGFyc2VkS2V5LmluZGV4XS5ocmVmKSB7XG4gICAgY3R4LmxpbmtFcnJvciA9ICdUaGUgbGluayAnICsgY3R4LnBhcnNlZEtleS5rZXkgKyAnWycgK1xuICAgICAgY3R4LnBhcnNlZEtleS5pbmRleCArICddIGV4aXN0cywgYnV0IGl0IGhhcyBubyBocmVmIGF0dHJpYnV0ZS4nO1xuICAgIHJldHVybjtcbiAgfVxuICBsb2cuZGVidWcoJ2ZvdW5kIGhhbCBsaW5rOiAnICsgbGlua0FycmF5W2N0eC5wYXJzZWRLZXkuaW5kZXhdLmhyZWYpO1xuICBjdHgubGlua1N0ZXAgPSB7IHVybDogbGlua0FycmF5W2N0eC5wYXJzZWRLZXkuaW5kZXhdLmhyZWYgfTtcbn1cblxuZnVuY3Rpb24gZmluZExpbmtXaXRob3V0SW5kZXgoY3R4LCBsaW5rQXJyYXksIGxvZykge1xuICAvLyBjbGllbnQgZGlkIG5vdCBzcGVjaWZ5IGFuIGFycmF5IGluZGV4IGZvciB0aGlzIGxpbmssIGFyYml0cmFyaWx5IGNob29zZVxuICAvLyB0aGUgZmlyc3QgdGhhdCBoYXMgYSBocmVmIGF0dHJpYnV0ZVxuICB2YXIgbGluaztcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxpbmtBcnJheS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBpZiAobGlua0FycmF5W2luZGV4XS5ocmVmKSB7XG4gICAgICBsaW5rID0gbGlua0FycmF5W2luZGV4XTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAobGluaykge1xuICAgIGlmIChsaW5rQXJyYXkubGVuZ3RoID4gMSkge1xuICAgICAgbG9nLndhcm4oJ0ZvdW5kIEhBTCBsaW5rIGFycmF5IHdpdGggbW9yZSB0aGFuIG9uZSBlbGVtZW50IGZvciAnICtcbiAgICAgICAgICAna2V5ICcgKyBjdHgucGFyc2VkS2V5LmtleSArICcsIGFyYml0cmFyaWx5IGNob29zaW5nIGluZGV4ICcgKyBpbmRleCArXG4gICAgICAgICAgJywgYmVjYXVzZSBpdCB3YXMgdGhlIGZpcnN0IHRoYXQgaGFkIGEgaHJlZiBhdHRyaWJ1dGUuJyk7XG4gICAgfVxuICAgIGxvZy5kZWJ1ZygnZm91bmQgaGFsIGxpbms6ICcgKyBsaW5rLmhyZWYpO1xuICAgIGN0eC5saW5rU3RlcCA9IHsgdXJsOiBsaW5rLmhyZWYgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kRW1iZWRkZWQoY3R4LCBsb2cpIHtcbiAgbG9nLmRlYnVnKCdjaGVja2luZyBmb3IgZW1iZWRkZWQ6ICcgKyBjdHgucGFyc2VkS2V5LmtleSArXG4gICAgICAoY3R4LnBhcnNlZEtleS5pbmRleCA/IGN0eC5wYXJzZWRLZXkuaW5kZXggOiAnJykpO1xuXG4gIHZhciByZXNvdXJjZUFycmF5ID0gY3R4LmhhbFJlc291cmNlLmVtYmVkZGVkQXJyYXkoY3R4LnBhcnNlZEtleS5rZXkpO1xuICBpZiAoIXJlc291cmNlQXJyYXkgfHwgcmVzb3VyY2VBcnJheS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBsb2cuZGVidWcoJ0ZvdW5kIGFuIGFycmF5IG9mIGVtYmVkZGVkIHJlc291cmNlIGZvcjogJyArIGN0eC5wYXJzZWRLZXkua2V5KTtcblxuICBzd2l0Y2ggKGN0eC5wYXJzZWRLZXkubW9kZSkge1xuICAgIGNhc2UgJ3NlY29uZGFyeSc6XG4gICAgICBmaW5kRW1iZWRkZWRCeVNlY29uZGFyeUtleShjdHgsIHJlc291cmNlQXJyYXksIGxvZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbmRleCc6XG4gICAgICBmaW5kRW1iZWRkZWRCeUluZGV4KGN0eCwgcmVzb3VyY2VBcnJheSwgbG9nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FsbCc6XG4gICAgICBmaW5kRW1iZWRkZWRBbGwoY3R4KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpcnN0JzpcbiAgICAgIGZpbmRFbWJlZGRlZFdpdGhvdXRJbmRleChjdHgsIHJlc291cmNlQXJyYXksIGxvZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIG1vZGU6ICcgKyBjdHgucGFyc2VkS2V5Lm1vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRFbWJlZGRlZEJ5U2Vjb25kYXJ5S2V5KGN0eCwgZW1iZWRkZWRBcnJheSwgbG9nKSB7XG4gIC8vIGNsaWVudCBzZWxlY3RlZCBhIHNwZWNpZmljIGVtYmVkIGJ5IGFuIGV4cGxpY2l0IHNlY29uZGFyeSBrZXksXG4gIC8vIHNvIHVzZSBpdCBvciBmYWlsXG4gIHZhciBpID0gMDtcbiAgZm9yICg7IGkgPCBlbWJlZGRlZEFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHZhbCA9IGVtYmVkZGVkQXJyYXlbaV1bY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlLZXldO1xuICAgIC8qIGpzaGludCAtVzExNiAqL1xuICAgIGlmICh2YWwgIT0gbnVsbCAmJiB2YWwgPT0gY3R4LnBhcnNlZEtleS5zZWNvbmRhcnlWYWx1ZSkge1xuICAgICAgbG9nLmRlYnVnKCdGb3VuZCBhbiBlbWJlZGRlZCByZXNvdXJjZSBmb3I6ICcgKyBjdHgucGFyc2VkS2V5LmtleSArICdbJyArXG4gICAgICBjdHgucGFyc2VkS2V5LnNlY29uZGFyeUtleSArICc6JyArIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5VmFsdWUgKyAnXScpO1xuICAgICAgY3R4LmVtYmVkZGVkU3RlcCA9IHsgZG9jOiBlbWJlZGRlZEFycmF5W2ldLm9yaWdpbmFsKCkgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLyoganNoaW50ICtXMTE2ICovXG4gIH1cbiAgY3R4LmVtYmVkZGVkRXJyb3IgPSBjdHgucGFyc2VkS2V5LmtleSArICdbJyArIGN0eC5wYXJzZWRLZXkuc2Vjb25kYXJ5S2V5ICtcbiAgICAnOicgKyBjdHgucGFyc2VkS2V5LnNlY29uZGFyeVZhbHVlICtcbiAgICAnXSByZXF1ZXN0ZWQsIGJ1dCB0aGUgZW1iZWRkZWQgYXJyYXkgJyArIGN0eC5wYXJzZWRLZXkua2V5ICtcbiAgICAnIGhhcyBubyBzdWNoIGVsZW1lbnQuJztcbn1cblxuZnVuY3Rpb24gZmluZEVtYmVkZGVkQnlJbmRleChjdHgsIHJlc291cmNlQXJyYXksIGxvZykge1xuICAvLyBjbGllbnQgc3BlY2lmaWVkIGFuIGV4cGxpY2l0IGFycmF5IGluZGV4LCBzbyB1c2UgaXQgb3IgZmFpbFxuICBpZiAoIXJlc291cmNlQXJyYXlbY3R4LnBhcnNlZEtleS5pbmRleF0pIHtcbiAgICBjdHguZW1iZWRkZWRFcnJvciA9ICdUaGUgZW1iZWRkZWQgYXJyYXkgJyArIGN0eC5wYXJzZWRLZXkua2V5ICtcbiAgICAgICcgZXhpc3RzLCBidXQgaGFzIG5vIGVsZW1lbnQgYXQgaW5kZXggJyArIGN0eC5wYXJzZWRLZXkuaW5kZXggKyAnLic7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxvZy5kZWJ1ZygnRm91bmQgYW4gZW1iZWRkZWQgcmVzb3VyY2UgZm9yOiAnICsgY3R4LnBhcnNlZEtleS5rZXkgKyAnWycgK1xuICAgICAgY3R4LnBhcnNlZEtleS5pbmRleCArICddJyk7XG4gIGN0eC5lbWJlZGRlZFN0ZXAgPSB7XG4gICAgZG9jOiByZXNvdXJjZUFycmF5W2N0eC5wYXJzZWRLZXkuaW5kZXhdLm9yaWdpbmFsKClcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmluZEVtYmVkZGVkQWxsKGN0eCkge1xuICBjdHguZW1iZWRkZWRTdGVwID0ge1xuICAgIGRvYzogY3R4LmhhbFJlc291cmNlLm9yaWdpbmFsKCkuX2VtYmVkZGVkW2N0eC5wYXJzZWRLZXkua2V5XVxuICB9O1xufVxuXG5mdW5jdGlvbiBmaW5kRW1iZWRkZWRXaXRob3V0SW5kZXgoY3R4LCByZXNvdXJjZUFycmF5LCBsb2cpIHtcbiAgLy8gY2xpZW50IGRpZCBub3Qgc3BlY2lmeSBhbiBhcnJheSBpbmRleCwgYXJiaXRyYXJpbHkgY2hvb3NlIGZpcnN0XG4gIGlmIChyZXNvdXJjZUFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICBsb2cud2FybignRm91bmQgSEFMIGVtYmVkZGVkIHJlc291cmNlIGFycmF5IHdpdGggbW9yZSB0aGFuIG9uZSBlbGVtZW50ICcgK1xuICAgICAgJyBmb3Iga2V5ICcgKyBjdHgucGFyc2VkS2V5LmtleSArXG4gICAgICAnLCBhcmJpdHJhcmlseSBjaG9vc2luZyBmaXJzdCBlbGVtZW50LicpO1xuICB9XG4gIGN0eC5lbWJlZGRlZFN0ZXAgPSB7IGRvYzogcmVzb3VyY2VBcnJheVswXS5vcmlnaW5hbCgpIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSnNvbkhhbEFkYXB0ZXI7XG4iLCJ2YXIgUGFyc2VyID0gcmVxdWlyZSgnLi9saWIvcGFyc2VyJylcbiAgLCB2YWxpZGF0aW9uRmxhZyA9IGZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBwYXJzZTogZnVuY3Rpb24odW5wYXJzZWQpIHtcbiAgICByZXR1cm4gbmV3IFBhcnNlcigpLnBhcnNlKHVucGFyc2VkLCB2YWxpZGF0aW9uRmxhZyk7XG4gIH0sXG5cbiAgZW5hYmxlVmFsaWRhdGlvbjogZnVuY3Rpb24oZmxhZykge1xuICAgIHZhbGlkYXRpb25GbGFnID0gKGZsYWcgIT0gbnVsbCkgPyBmbGFnIDogdHJ1ZTtcbiAgfSxcblxuICBkaXNhYmxlVmFsaWRhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFsaWRhdGlvbkZsYWcgPSBmYWxzZTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIEEgdmVyeSBuYWl2ZSBjb3B5LW9uLXdyaXRlIGltbXV0YWJsZSBzdGFjay4gU2luY2UgdGhlIHNpemUgb2YgdGhlIHN0YWNrXG4gKiBpcyBlcXVhbCB0byB0aGUgZGVwdGggb2YgdGhlIGVtYmVkZGVkIHJlc291cmNlcyBmb3Igb25lIEhBTCByZXNvdXJjZSwgdGhlIGJhZFxuICogcGVyZm9ybWFuY2UgZm9yIHRoZSBjb3B5LW9uLXdyaXRlIGFwcHJvYWNoIGlzIHByb2JhYmx5IG5vdCBhIHByb2JsZW0gYXQgYWxsLlxuICogTWlnaHQgYmUgcmVwbGFjZWQgYnkgYSBzbWFydGVyIHNvbHV0aW9uIGxhdGVyLiBPciBub3QuIFdoYXRldmVyLlxuICovXG5mdW5jdGlvbiBJbW11dGFibGVTdGFjaygpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMSkge1xuICAgIHRoaXMuX2FycmF5ID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2FycmF5ID0gW107XG4gIH1cbn1cblxuSW1tdXRhYmxlU3RhY2sucHJvdG90eXBlLmFycmF5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9hcnJheTtcbn07XG5cbkltbXV0YWJsZVN0YWNrLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgcmV0dXJuIHRoaXMuX2FycmF5Lmxlbmd0aCA9PT0gMDtcbn07XG5cbkltbXV0YWJsZVN0YWNrLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheS5zbGljZSgwKTtcbiAgYXJyYXkucHVzaChlbGVtZW50KTtcbiAgcmV0dXJuIG5ldyBJbW11dGFibGVTdGFjayhhcnJheSk7XG59O1xuXG5JbW11dGFibGVTdGFjay5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhcnJheSA9IHRoaXMuX2FycmF5LnNsaWNlKDAsIHRoaXMuX2FycmF5Lmxlbmd0aCAtIDEpO1xuICByZXR1cm4gbmV3IEltbXV0YWJsZVN0YWNrKGFycmF5KTtcbn07XG5cbkltbXV0YWJsZVN0YWNrLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmlzRW1wdHkoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2FuXFwndCBwZWVrIG9uIGVtcHR5IHN0YWNrJyk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2FycmF5W3RoaXMuX2FycmF5Lmxlbmd0aCAtIDFdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbW11dGFibGVTdGFjaztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlc291cmNlID0gcmVxdWlyZSgnLi9yZXNvdXJjZScpXG4gICwgU3RhY2sgPSByZXF1aXJlKCcuL2ltbXV0YWJsZV9zdGFjaycpO1xuXG52YXIgbGlua1NwZWMgPSB7XG4gIGhyZWY6IHsgcmVxdWlyZWQ6IHRydWUsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICB0ZW1wbGF0ZWQ6IHsgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0sXG4gIHR5cGU6IHsgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgZGVwcmVjYXRpb246IHsgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0VmFsdWU6IG51bGwgfSxcbiAgbmFtZTogeyByZXF1aXJlZDogZmFsc2UsIGRlZmF1bHRWYWx1ZTogbnVsbCB9LFxuICBwcm9maWxlOiB7IHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdFZhbHVlOiBudWxsIH0sXG4gIHRpdGxlOiB7IHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdFZhbHVlOiBudWxsIH0sXG4gIGhyZWZsYW5nOiB7IHJlcXVpcmVkOiBmYWxzZSwgZGVmYXVsdFZhbHVlOiBudWxsIH1cbn07XG5cbmZ1bmN0aW9uIFBhcnNlcigpIHtcbn1cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKHVucGFyc2VkLCB2YWxpZGF0aW9uRmxhZykge1xuICB2YXIgdmFsaWRhdGlvbiA9IHZhbGlkYXRpb25GbGFnID8gW10gOiBudWxsO1xuICByZXR1cm4gX3BhcnNlKHVucGFyc2VkLCB2YWxpZGF0aW9uLCBuZXcgU3RhY2soKSk7XG59O1xuXG5mdW5jdGlvbiBfcGFyc2UodW5wYXJzZWQsIHZhbGlkYXRpb24sIHBhdGgpIHtcbiAgaWYgKHVucGFyc2VkID09IG51bGwpIHtcbiAgICByZXR1cm4gdW5wYXJzZWQ7XG4gIH1cbiAgdmFyIGFsbExpbmtBcnJheXMgPSBwYXJzZUxpbmtzKHVucGFyc2VkLl9saW5rcywgdmFsaWRhdGlvbixcbiAgICAgIHBhdGgucHVzaCgnX2xpbmtzJykpO1xuICB2YXIgY3VyaWVzID0gcGFyc2VDdXJpZXMoYWxsTGlua0FycmF5cyk7XG4gIHZhciBhbGxFbWJlZGRlZEFycmF5cyA9IHBhcnNlRW1iZWRkZWRSZXNvdXJjZXNzKHVucGFyc2VkLl9lbWJlZGRlZCxcbiAgICAgIHZhbGlkYXRpb24sIHBhdGgucHVzaCgnX2VtYmVkZGVkJykpO1xuICB2YXIgcmVzb3VyY2UgPSBuZXcgUmVzb3VyY2UoYWxsTGlua0FycmF5cywgY3VyaWVzLCBhbGxFbWJlZGRlZEFycmF5cyxcbiAgICAgIHZhbGlkYXRpb24pO1xuICBjb3B5Tm9uSGFsUHJvcGVydGllcyh1bnBhcnNlZCwgcmVzb3VyY2UpO1xuICByZXNvdXJjZS5fb3JpZ2luYWwgPSB1bnBhcnNlZDtcbiAgcmV0dXJuIHJlc291cmNlO1xufVxuXG5mdW5jdGlvbiBwYXJzZUxpbmtzKGxpbmtzLCB2YWxpZGF0aW9uLCBwYXRoKSB7XG4gIGxpbmtzID0gcGFyc2VIYWxQcm9wZXJ0eShsaW5rcywgcGFyc2VMaW5rLCB2YWxpZGF0aW9uLCBwYXRoKTtcbiAgaWYgKGxpbmtzID09IG51bGwgfHwgbGlua3Muc2VsZiA9PSBudWxsKSB7XG4gICAgLy8gTm8gbGlua3MgYXQgYWxsPyBUaGVuIGl0IGltcGxpY3RseSBtaXNzZXMgdGhlIHNlbGYgbGluayB3aGljaCBpdCBTSE9VTERcbiAgICAvLyBoYXZlIGFjY29yZGluZyB0byBzcGVjXG4gICAgcmVwb3J0VmFsaWRhdGlvbklzc3VlKCdSZXNvdXJjZSBkb2VzIG5vdCBoYXZlIGEgc2VsZiBsaW5rJywgdmFsaWRhdGlvbixcbiAgICAgICAgcGF0aCk7XG4gIH1cbiAgcmV0dXJuIGxpbmtzO1xufVxuXG5mdW5jdGlvbiBwYXJzZUN1cmllcyhsaW5rQXJyYXlzKSB7XG4gIGlmIChsaW5rQXJyYXlzKSB7XG4gICAgcmV0dXJuIGxpbmtBcnJheXMuY3VyaWVzO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUVtYmVkZGVkUmVzb3VyY2VzcyhvcmlnaW5hbCwgcGFyZW50VmFsaWRhdGlvbiwgcGF0aCkge1xuICB2YXIgZW1iZWRkZWQgPSBwYXJzZUhhbFByb3BlcnR5KG9yaWdpbmFsLCBpZGVudGl0eSwgcGFyZW50VmFsaWRhdGlvbiwgcGF0aCk7XG4gIGlmIChlbWJlZGRlZCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGVtYmVkZGVkO1xuICB9XG4gIE9iamVjdC5rZXlzKGVtYmVkZGVkKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGVtYmVkZGVkW2tleV0gPSBlbWJlZGRlZFtrZXldLm1hcChmdW5jdGlvbihlbWJlZGRlZEVsZW1lbnQpIHtcbiAgICAgIHZhciBjaGlsZFZhbGlkYXRpb24gPSBwYXJlbnRWYWxpZGF0aW9uICE9IG51bGwgPyBbXSA6IG51bGw7XG4gICAgICB2YXIgZW1iZWRkZWRSZXNvdXJjZSA9IF9wYXJzZShlbWJlZGRlZEVsZW1lbnQsIGNoaWxkVmFsaWRhdGlvbixcbiAgICAgICAgICBwYXRoLnB1c2goa2V5KSk7XG4gICAgICBlbWJlZGRlZFJlc291cmNlLl9vcmlnaW5hbCA9IGVtYmVkZGVkRWxlbWVudDtcbiAgICAgIHJldHVybiBlbWJlZGRlZFJlc291cmNlO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGVtYmVkZGVkO1xufVxuXG4vKlxuICogQ29weSBvdmVyIG5vbi1oYWwgcHJvcGVydGllcyAoZXZlcnl0aGluZyB0aGF0IGlzIG5vdCBfbGlua3Mgb3IgX2VtYmVkZGVkKVxuICogdG8gdGhlIHBhcnNlZCByZXNvdXJjZS5cbiAqL1xuZnVuY3Rpb24gY29weU5vbkhhbFByb3BlcnRpZXModW5wYXJzZWQsIHJlc291cmNlKSB7XG4gIE9iamVjdC5rZXlzKHVucGFyc2VkKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChrZXkgIT09ICdfbGlua3MnICYmIGtleSAhPT0gJ19lbWJlZGRlZCcpIHtcbiAgICAgIHJlc291cmNlW2tleV0gPSB1bnBhcnNlZFtrZXldO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qXG4gKiBQcm9jZXNzZXMgb25lIG9mIHRoZSB0d28gbWFpbiBoYWwgcHJvcGVydGllcywgdGhhdCBpcyBfbGlua3Mgb3IgX2VtYmVkZGVkLlxuICogRWFjaCBzdWItcHJvcGVydHkgaXMgdHVybmVkIGludG8gYSBzaW5nbGUgZWxlbWVudCBhcnJheSBpZiBpdCBpc24ndCBhbHJlYWR5XG4gKiBhbiBhcnJheS4gcHJvY2Vzc2luZ0Z1bmN0aW9uIGlzIGFwcGxpZWQgdG8gZWFjaCBhcnJheSBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBwYXJzZUhhbFByb3BlcnR5KHByb3BlcnR5LCBwcm9jZXNzaW5nRnVuY3Rpb24sIHZhbGlkYXRpb24sIHBhdGgpIHtcbiAgaWYgKHByb3BlcnR5ID09IG51bGwpIHtcbiAgICByZXR1cm4gcHJvcGVydHk7XG4gIH1cblxuICAvLyBjcmVhdGUgYSBzaGFsbG93IGNvcHkgb2YgdGhlIF9saW5rcy9fZW1iZWRkZWQgb2JqZWN0XG4gIHZhciBjb3B5ID0ge307XG5cbiAgLy8gbm9ybWFsaXplIGVhY2ggbGluay9lYWNoIGVtYmVkZGVkIG9iamVjdCBhbmQgcHV0IGl0IGludG8gb3VyIGNvcHlcbiAgT2JqZWN0LmtleXMocHJvcGVydHkpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgY29weVtrZXldID0gYXJyYXlmeShrZXksIHByb3BlcnR5W2tleV0sIHByb2Nlc3NpbmdGdW5jdGlvbixcbiAgICAgICAgdmFsaWRhdGlvbiwgcGF0aCk7XG4gIH0pO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gYXJyYXlmeShrZXksIG9iamVjdCwgZm4sIHZhbGlkYXRpb24sIHBhdGgpIHtcbiAgaWYgKGlzQXJyYXkob2JqZWN0KSkge1xuICAgIHJldHVybiBvYmplY3QubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBmbihrZXksIGVsZW1lbnQsIHZhbGlkYXRpb24sIHBhdGgpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbZm4oa2V5LCBvYmplY3QsIHZhbGlkYXRpb24sIHBhdGgpXTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHBhcnNlTGluayhsaW5rS2V5LCBsaW5rLCB2YWxpZGF0aW9uLCBwYXRoKSB7XG4gIGlmICghaXNPYmplY3QobGluaykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0xpbmsgb2JqZWN0IGlzIG5vdCBhbiBhY3R1YWwgb2JqZWN0OiAnICsgbGluayArXG4gICAgICAnIFsnICsgdHlwZW9mIGxpbmsgKyAnXScpO1xuICB9XG5cbiAgLy8gY3JlYXRlIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBsaW5rIG9iamVjdFxuICB2YXIgY29weSA9IHNoYWxsb3dDb3B5KGxpbmspO1xuXG4gIC8vIGFkZCBtaXNzaW5nIHByb3BlcnRpZXMgbWFuZGF0ZWQgYnkgc3BlYyBhbmQgZG8gZ2VuZXJpYyB2YWxpZGF0aW9uXG4gIE9iamVjdC5rZXlzKGxpbmtTcGVjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChjb3B5W2tleV0gPT0gbnVsbCkge1xuICAgICAgaWYgKGxpbmtTcGVjW2tleV0ucmVxdWlyZWQpIHtcbiAgICAgICAgcmVwb3J0VmFsaWRhdGlvbklzc3VlKCdMaW5rIG1pc3NlcyByZXF1aXJlZCBwcm9wZXJ0eSAnICsga2V5ICsgJy4nLFxuICAgICAgICAgICAgdmFsaWRhdGlvbiwgcGF0aC5wdXNoKGxpbmtLZXkpKTtcbiAgICAgIH1cbiAgICAgIGlmIChsaW5rU3BlY1trZXldLmRlZmF1bHRWYWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGNvcHlba2V5XSA9IGxpbmtTcGVjW2tleV0uZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gY2hlY2sgbW9yZSBpbnRlci1wcm9wZXJ0eSByZWxhdGlvbnMgbWFuZGF0ZWQgYnkgc3BlY1xuICBpZiAoY29weS5kZXByZWNhdGlvbikge1xuICAgIGxvZygnV2FybmluZzogTGluayAnICsgcGF0aFRvU3RyaW5nKHBhdGgucHVzaChsaW5rS2V5KSkgK1xuICAgICAgICAnIGlzIGRlcHJlY2F0ZWQsIHNlZSAnICsgY29weS5kZXByZWNhdGlvbik7XG4gIH1cbiAgaWYgKGNvcHkudGVtcGxhdGVkICE9PSB0cnVlICYmIGNvcHkudGVtcGxhdGVkICE9PSBmYWxzZSkge1xuICAgIGNvcHkudGVtcGxhdGVkID0gZmFsc2U7XG4gIH1cblxuICBpZiAoIXZhbGlkYXRpb24pIHtcbiAgICByZXR1cm4gY29weTtcbiAgfVxuICBpZiAoY29weS5ocmVmICYmIGNvcHkuaHJlZi5pbmRleE9mKCd7JykgPj0gMCAmJiAhY29weS50ZW1wbGF0ZWQpIHtcbiAgICByZXBvcnRWYWxpZGF0aW9uSXNzdWUoJ0xpbmsgc2VlbXMgdG8gYmUgYW4gVVJJIHRlbXBsYXRlICcgK1xuICAgICAgICAnYnV0IGl0cyBcInRlbXBsYXRlZFwiIHByb3BlcnR5IGlzIG5vdCBzZXQgdG8gdHJ1ZS4nLCB2YWxpZGF0aW9uLFxuICAgICAgICBwYXRoLnB1c2gobGlua0tleSkpO1xuICB9XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiBpc0FycmF5KG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3Qobykge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBpZGVudGl0eShrZXksIG9iamVjdCkge1xuICByZXR1cm4gb2JqZWN0O1xufVxuXG5mdW5jdGlvbiByZXBvcnRWYWxpZGF0aW9uSXNzdWUobWVzc2FnZSwgdmFsaWRhdGlvbiwgcGF0aCkge1xuICBpZiAodmFsaWRhdGlvbikge1xuICAgIHZhbGlkYXRpb24ucHVzaCh7XG4gICAgICBwYXRoOiBwYXRoVG9TdHJpbmcocGF0aCksXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cblxuLy8gVE9ETyBmaXggdGhpcyBhZCBob2MgbWVzcyAtIGRvZXMgaWUgc3VwcG9ydCBjb25zb2xlLmxvZyBhcyBvZiBpZTk/XG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNoYWxsb3dDb3B5KHNvdXJjZSkge1xuICB2YXIgY29weSA9IHt9O1xuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgY29weVtrZXldID0gc291cmNlW2tleV07XG4gIH0pO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gcGF0aFRvU3RyaW5nKHBhdGgpIHtcbiAgdmFyIHMgPSAnJC4nO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGguYXJyYXkoKS5sZW5ndGg7IGkrKykge1xuICAgIHMgKz0gcGF0aC5hcnJheSgpW2ldICsgJy4nO1xuICB9XG4gIHMgPSBzLnN1YnN0cmluZygwLCBzLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJzZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFJlc291cmNlKGxpbmtzLCBjdXJpZXMsIGVtYmVkZGVkLCB2YWxpZGF0aW9uSXNzdWVzKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fbGlua3MgPSBsaW5rcyB8fCB7fTtcbiAgdGhpcy5faW5pdEN1cmllcyhjdXJpZXMpO1xuICB0aGlzLl9lbWJlZGRlZCA9IGVtYmVkZGVkIHx8IHt9O1xuICB0aGlzLl92YWxpZGF0aW9uID0gdmFsaWRhdGlvbklzc3VlcyB8fCBbXTtcbn1cblxuUmVzb3VyY2UucHJvdG90eXBlLl9pbml0Q3VyaWVzID0gZnVuY3Rpb24oY3VyaWVzKSB7XG4gIHRoaXMuX2N1cmllc01hcCA9IHt9O1xuICBpZiAoIWN1cmllcykge1xuICAgIHRoaXMuX2N1cmllcyA9IFtdO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2N1cmllcyA9IGN1cmllcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2N1cmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1cmllID0gdGhpcy5fY3VyaWVzW2ldO1xuICAgICAgdGhpcy5fY3VyaWVzTWFwW2N1cmllLm5hbWVdID0gY3VyaWU7XG4gICAgfVxuICB9XG4gIHRoaXMuX3ByZVJlc29sdmVDdXJpZXMoKTtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5fcHJlUmVzb2x2ZUN1cmllcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9yZXNvbHZlZEN1cmllc01hcCA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2N1cmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBjdXJpZSA9IHRoaXMuX2N1cmllc1tpXTtcbiAgICBpZiAoIWN1cmllLm5hbWUpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmb3IgKHZhciByZWwgaW4gdGhpcy5fbGlua3MpIHtcbiAgICAgIGlmIChyZWwgIT09ICdjdXJpZXMnKSB7XG4gICAgICAgIHRoaXMuX3ByZVJlc29sdmVDdXJpZShjdXJpZSwgcmVsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5fcHJlUmVzb2x2ZUN1cmllID0gZnVuY3Rpb24oY3VyaWUsIHJlbCkge1xuICB2YXIgbGluayA9IHRoaXMuX2xpbmtzW3JlbF07XG4gIHZhciBwcmVmaXhBbmRSZWZlcmVuY2UgPSByZWwuc3BsaXQoLzooLispLyk7XG4gIHZhciBjYW5kaWRhdGUgPSBwcmVmaXhBbmRSZWZlcmVuY2VbMF07XG4gIGlmIChjdXJpZS5uYW1lID09PSBjYW5kaWRhdGUpIHtcbiAgICBpZiAoY3VyaWUudGVtcGxhdGVkICYmIHByZWZpeEFuZFJlZmVyZW5jZS5sZW5ndGggPj0gMSkge1xuICAgICAgLy8gVE9ETyByZXNvbHZpbmcgdGVtcGxhdGVkIENVUklFUyBzaG91bGQgdXNlIGEgc21hbGwgdXJpIHRlbXBsYXRlXG4gICAgICAvLyBsaWIsIG5vdCBjb2RlZCBoZXJlIGFkIGhvY1xuICAgICAgdmFyIGhyZWYgPSBjdXJpZS5ocmVmLnJlcGxhY2UoLyguKil7KC4qKX0oLiopLywgJyQxJyArXG4gICAgICAgICAgcHJlZml4QW5kUmVmZXJlbmNlWzFdICsgJyQzJyk7XG4gICAgICB0aGlzLl9yZXNvbHZlZEN1cmllc01hcFtocmVmXSA9IHJlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVzb2x2ZWRDdXJpZXNNYXBbY3VyaWUuaHJlZl0gPSByZWw7XG4gICAgfVxuICB9XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuYWxsTGlua0FycmF5cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fbGlua3M7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUubGlua0FycmF5ID0gZnVuY3Rpb24oa2V5KSB7XG4gIHJldHVybiBwcm9wZXJ0eUFycmF5KHRoaXMuX2xpbmtzLCBrZXkpO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbihrZXksIGluZGV4KSB7XG4gIHJldHVybiBlbGVtZW50T2ZQcm9wZXJ0eUFycmF5KHRoaXMuX2xpbmtzLCBrZXksIGluZGV4KTtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5oYXNDdXJpZXMgPSBmdW5jdGlvbihrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX2N1cmllcy5sZW5ndGggPiAwO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmN1cmllQXJyYXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX2N1cmllcztcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5jdXJpZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMuX2N1cmllc01hcFtuYW1lXTtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5yZXZlcnNlUmVzb2x2ZUN1cmllID0gZnVuY3Rpb24oZnVsbFVybCkge1xuICByZXR1cm4gdGhpcy5fcmVzb2x2ZWRDdXJpZXNNYXBbZnVsbFVybF07XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuYWxsRW1iZWRkZWRSZXNvdXJjZUFycmF5cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX2VtYmVkZGVkO1xufTtcblxuUmVzb3VyY2UucHJvdG90eXBlLmVtYmVkZGVkUmVzb3VyY2VBcnJheSA9IGZ1bmN0aW9uKGtleSkge1xuICByZXR1cm4gcHJvcGVydHlBcnJheSh0aGlzLl9lbWJlZGRlZCwga2V5KTtcbn07XG5cblJlc291cmNlLnByb3RvdHlwZS5lbWJlZGRlZFJlc291cmNlID0gZnVuY3Rpb24oa2V5LCBpbmRleCkge1xuICByZXR1cm4gZWxlbWVudE9mUHJvcGVydHlBcnJheSh0aGlzLl9lbWJlZGRlZCwga2V5LCBpbmRleCk7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUub3JpZ2luYWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX29yaWdpbmFsO1xufTtcblxuZnVuY3Rpb24gcHJvcGVydHlBcnJheShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgPyBvYmplY3Rba2V5XSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRPZlByb3BlcnR5QXJyYXkob2JqZWN0LCBrZXksIGluZGV4KSB7XG4gIGluZGV4ID0gaW5kZXggfHwgMDtcbiAgdmFyIGFycmF5ID0gcHJvcGVydHlBcnJheShvYmplY3QsIGtleSk7XG4gIGlmIChhcnJheSAhPSBudWxsICYmIGFycmF5Lmxlbmd0aCA+PSAxKSB7XG4gICAgcmV0dXJuIGFycmF5W2luZGV4XTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuUmVzb3VyY2UucHJvdG90eXBlLnZhbGlkYXRpb25Jc3N1ZXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRpb247XG59O1xuXG4vLyBhbGlhcyBkZWZpbml0aW9uc1xuUmVzb3VyY2UucHJvdG90eXBlLmFsbExpbmtzID0gUmVzb3VyY2UucHJvdG90eXBlLmFsbExpbmtBcnJheXM7XG5SZXNvdXJjZS5wcm90b3R5cGUuYWxsRW1iZWRkZWRBcnJheXMgPVxuICAgIFJlc291cmNlLnByb3RvdHlwZS5hbGxFbWJlZGRlZFJlc291cmNlcyA9XG4gICAgUmVzb3VyY2UucHJvdG90eXBlLmFsbEVtYmVkZGVkUmVzb3VyY2VBcnJheXM7XG5SZXNvdXJjZS5wcm90b3R5cGUuZW1iZWRkZWRBcnJheSA9IFJlc291cmNlLnByb3RvdHlwZS5lbWJlZGRlZFJlc291cmNlQXJyYXk7XG5SZXNvdXJjZS5wcm90b3R5cGUuZW1iZWRkZWQgPSBSZXNvdXJjZS5wcm90b3R5cGUuZW1iZWRkZWRSZXNvdXJjZTtcblJlc291cmNlLnByb3RvdHlwZS52YWxpZGF0aW9uID0gUmVzb3VyY2UucHJvdG90eXBlLnZhbGlkYXRpb25Jc3N1ZXM7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzb3VyY2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFRPRE8gUmVwbGFjZSBieSBhIHByb3BlciBsaWdodHdlaWdodCBsb2dnaW5nIG1vZHVsZSwgc3VpdGVkIGZvciB0aGUgYnJvd3NlclxuXG52YXIgZW5hYmxlZCA9IGZhbHNlO1xuZnVuY3Rpb24gTG9nZ2VyKGlkKSB7XG4gIGlmIChpZCA9PSBudWxsKSB7XG4gICAgaWQgPSAnJztcbiAgfVxuICB0aGlzLmlkID0gaWQ7XG59XG5cbkxvZ2dlci5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW5hYmxlZCA9IHRydWU7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBpZiAoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuaWQgKyAnL2RlYnVnOiAnICsgbWVzc2FnZSk7XG4gIH1cbn07XG5cbkxvZ2dlci5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgaWYgKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkICsgJy9pbmZvOiAnICsgbWVzc2FnZSk7XG4gIH1cbn07XG5cbkxvZ2dlci5wcm90b3R5cGUud2FybiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgaWYgKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlkICsgJy93YXJuOiAnICsgbWVzc2FnZSk7XG4gIH1cbn07XG5cbkxvZ2dlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIGlmIChlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5pZCArICcvZXJyb3I6ICcgKyBtZXNzYWdlKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gbWluaWxvZyhpZCkge1xuICByZXR1cm4gbmV3IExvZ2dlcihpZCk7XG59XG5cbm1pbmlsb2cuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIGVuYWJsZWQgPSB0cnVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtaW5pbG9nO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogZnVuY3Rpb24obykge1xuICAgIGlmIChvID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN1cGVyYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbmZ1bmN0aW9uIFJlcXVlc3QoKSB7fVxuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih1cmksIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBtYXBSZXF1ZXN0KHN1cGVyYWdlbnQuZ2V0KHVyaSksIG9wdGlvbnMpXG4gICAgLmVuZChoYW5kbGVSZXNwb25zZShjYWxsYmFjaykpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uKHVyaSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIG1hcFJlcXVlc3Qoc3VwZXJhZ2VudC5wb3N0KHVyaSksIG9wdGlvbnMpXG4gICAgLmVuZChoYW5kbGVSZXNwb25zZShjYWxsYmFjaykpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24odXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICByZXR1cm4gbWFwUmVxdWVzdChzdXBlcmFnZW50LnB1dCh1cmkpLCBvcHRpb25zKVxuICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UoY2FsbGJhY2spKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnBhdGNoID0gZnVuY3Rpb24odXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICByZXR1cm4gbWFwUmVxdWVzdChzdXBlcmFnZW50LnBhdGNoKHVyaSksIG9wdGlvbnMpXG4gICAgLmVuZChoYW5kbGVSZXNwb25zZShjYWxsYmFjaykpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24odXJpLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICByZXR1cm4gbWFwUmVxdWVzdChzdXBlcmFnZW50LmRlbCh1cmkpLCBvcHRpb25zKVxuICAgIC5lbmQoaGFuZGxlUmVzcG9uc2UoY2FsbGJhY2spKTtcbn07XG5cbmZ1bmN0aW9uIG1hcFJlcXVlc3Qoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIG1hcFF1ZXJ5KHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKTtcbiAgbWFwSGVhZGVycyhzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucyk7XG4gIG1hcEF1dGgoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpO1xuICBtYXBCb2R5KHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKTtcbiAgbWFwRm9ybShzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBzdXBlcmFnZW50UmVxdWVzdDtcbn1cblxuZnVuY3Rpb24gbWFwUXVlcnkoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgdmFyIHFzID0gb3B0aW9ucy5xcztcbiAgaWYgKHFzICE9IG51bGwpIHtcbiAgICBzdXBlcmFnZW50UmVxdWVzdCA9IHN1cGVyYWdlbnRSZXF1ZXN0LnF1ZXJ5KHFzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXBIZWFkZXJzKHN1cGVyYWdlbnRSZXF1ZXN0LCBvcHRpb25zKSB7XG4gIHZhciBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzO1xuICBpZiAoaGVhZGVycyAhPSBudWxsKSB7XG4gICAgc3VwZXJhZ2VudFJlcXVlc3QgPSBzdXBlcmFnZW50UmVxdWVzdC5zZXQoaGVhZGVycyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFwQXV0aChzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucykge1xuICB2YXIgYXV0aCA9IG9wdGlvbnMuYXV0aDtcbiAgaWYgKGF1dGggIT0gbnVsbCkge1xuICAgIHN1cGVyYWdlbnRSZXF1ZXN0ID0gc3VwZXJhZ2VudFJlcXVlc3QuYXV0aChcbiAgICAgIGF1dGgudXNlciB8fCBhdXRoLnVzZXJuYW1lLFxuICAgICAgYXV0aC5wYXNzIHx8IGF1dGgucGFzc3dvcmRcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcEJvZHkoc3VwZXJhZ2VudFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5O1xuICAgIGlmIChib2R5ICE9IG51bGwpIHtcbiAgICAgIHN1cGVyYWdlbnRSZXF1ZXN0ID0gc3VwZXJhZ2VudFJlcXVlc3Quc2VuZChib2R5KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFwRm9ybShzdXBlcmFnZW50UmVxdWVzdCwgb3B0aW9ucykge1xuICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XG4gICAgdmFyIGZvcm0gPSBvcHRpb25zLmZvcm07XG4gICAgaWYgKGZvcm0gIT0gbnVsbCkge1xuICAgICAgc3VwZXJhZ2VudFJlcXVlc3QgPSBzdXBlcmFnZW50UmVxdWVzdC5zZW5kKGZvcm0pO1xuICAgICAgc3VwZXJhZ2VudFJlcXVlc3QgPSBzdXBlcmFnZW50UmVxdWVzdC5zZXQoJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBtYXAgWEhSIHJlc3BvbnNlIG9iamVjdCBwcm9wZXJ0aWVzIHRvIE5vZGUuanMgcmVxdWVzdCBsaWIncyByZXNwb25zZSBvYmplY3Rcbi8vIHByb3BlcnRpZXNcbmZ1bmN0aW9uIG1hcFJlc3BvbnNlKHJlc3BvbnNlKSB7XG4gIHJlc3BvbnNlLmJvZHkgPSByZXNwb25zZS50ZXh0O1xuICByZXNwb25zZS5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xuICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgICAvLyBuZXR3b3JrIGVycm9yIG9yIHRpbWVvdXQsIG5vIHJlc3BvbnNlXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2luY2UgMS4wLjAgc3VwZXJhZ2VudCBjYWxscyB0aGUgY2FsbGJhY2sgd2l0aCBhbiBlcnJvciBpZiB0aGUgc3RhdHVzXG4gICAgICAgIC8vIGNvZGUgb2YgdGhlIHJlc3BvbnNlIGlzIG5vdCBpbiB0aGUgMnh4IHJhbmdlLiBJbiB0aGlzIGNhc2VzLCBpdCBhbHNvXG4gICAgICAgIC8vIHBhc3NlcyBpbiB0aGUgcmVzcG9uc2UuIFRvIGFsaWduIHRoaW5ncyB3aXRoIHJlcXVlc3QsIGNhbGwgdGhlXG4gICAgICAgIC8vIGNhbGxiYWNrIHdpdGhvdXQgdGhlIGVycm9yIGJ1dCBqdXN0IHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICBjYWxsYmFjayhudWxsLCBtYXBSZXNwb25zZShyZXNwb25zZSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBtYXBSZXNwb25zZShyZXNwb25zZSkpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUmVxdWVzdCgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKlxuICogQ29waWVkIGZyb20gdW5kZXJzY29yZS5zdHJpbmcgbW9kdWxlLiBKdXN0IHRoZSBmdW5jdGlvbnMgd2UgbmVlZCwgdG8gcmVkdWNlXG4gKiB0aGUgYnJvd3NlcmlmaWVkIHNpemUuXG4gKi9cblxudmFyIF9zID0ge1xuICBzdGFydHNXaXRoOiBmdW5jdGlvbihzdHIsIHN0YXJ0cykge1xuICAgIGlmIChzdGFydHMgPT09ICcnKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoc3RyID09IG51bGwgfHwgc3RhcnRzID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBzdHIgPSBTdHJpbmcoc3RyKTsgc3RhcnRzID0gU3RyaW5nKHN0YXJ0cyk7XG4gICAgcmV0dXJuIHN0ci5sZW5ndGggPj0gc3RhcnRzLmxlbmd0aCAmJiBzdHIuc2xpY2UoMCwgc3RhcnRzLmxlbmd0aCkgPT09IHN0YXJ0cztcbiAgfSxcblxuICBlbmRzV2l0aDogZnVuY3Rpb24oc3RyLCBlbmRzKXtcbiAgICBpZiAoZW5kcyA9PT0gJycpIHJldHVybiB0cnVlO1xuICAgIGlmIChzdHIgPT0gbnVsbCB8fCBlbmRzID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBzdHIgPSBTdHJpbmcoc3RyKTsgZW5kcyA9IFN0cmluZyhlbmRzKTtcbiAgICByZXR1cm4gc3RyLmxlbmd0aCA+PSBlbmRzLmxlbmd0aCAmJlxuICAgICAgc3RyLnNsaWNlKHN0ci5sZW5ndGggLSBlbmRzLmxlbmd0aCkgPT09IGVuZHM7XG4gIH0sXG5cbiAgc3BsaWNlOiBmdW5jdGlvbihzdHIsIGksIGhvd21hbnksIHN1YnN0cil7XG4gICAgdmFyIGFyciA9IF9zLmNoYXJzKHN0cik7XG4gICAgYXJyLnNwbGljZSh+fmksIH5+aG93bWFueSwgc3Vic3RyKTtcbiAgICByZXR1cm4gYXJyLmpvaW4oJycpO1xuICB9LFxuXG4gIGNvbnRhaW5zOiBmdW5jdGlvbihzdHIsIG5lZWRsZSl7XG4gICAgaWYgKG5lZWRsZSA9PT0gJycpIHJldHVybiB0cnVlO1xuICAgIGlmIChzdHIgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBTdHJpbmcoc3RyKS5pbmRleE9mKG5lZWRsZSkgIT09IC0xO1xuICB9LFxuXG4gIGNoYXJzOiBmdW5jdGlvbihzdHIpIHtcbiAgICBpZiAoc3RyID09IG51bGwpIHJldHVybiBbXTtcbiAgICByZXR1cm4gU3RyaW5nKHN0cikuc3BsaXQoJycpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVzb2x2ZVVybCA9IHJlcXVpcmUoJ3Jlc29sdmUtdXJsJyk7XG5cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIHJldHVybiByZXNvbHZlVXJsKGZyb20sIHRvKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbmV4cG9ydHMuYWJvcnRUcmF2ZXJzYWwgPSBmdW5jdGlvbiBhYm9ydFRyYXZlcnNhbCgpIHtcbiAgbG9nLmRlYnVnKCdhYm9ydGluZyBsaW5rIHRyYXZlcnNhbCcpO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICBpZiAodGhpcy5jdXJyZW50UmVxdWVzdCkge1xuICAgIGxvZy5kZWJ1ZygncmVxdWVzdCBpbiBwcm9ncmVzcy4gdHJ5aW5nIHRvIGFib3J0IGl0LCB0b28uJyk7XG4gICAgdGhpcy5jdXJyZW50UmVxdWVzdC5hYm9ydCgpO1xuICB9XG59O1xuXG5leHBvcnRzLnJlZ2lzdGVyQWJvcnRMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlZ2lzdGVyQWJvcnRMaXN0ZW5lcih0LCBjYWxsYmFjaykge1xuICBpZiAodC5jdXJyZW50UmVxdWVzdCkge1xuICAgIHQuY3VycmVudFJlcXVlc3Qub24oJ2Fib3J0JywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBvcnRzLmNhbGxDYWxsYmFja09uQWJvcnQodCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbmV4cG9ydHMuY2FsbENhbGxiYWNrT25BYm9ydCA9IGZ1bmN0aW9uIGNhbGxDYWxsYmFja09uQWJvcnQodCkge1xuICBsb2cuZGVidWcoJ2xpbmsgdHJhdmVyc2FsIGFib3J0ZWQnKTtcbiAgaWYgKCF0LmNhbGxiYWNrSGFzQmVlbkNhbGxlZEFmdGVyQWJvcnQpIHtcbiAgICB0LmNhbGxiYWNrSGFzQmVlbkNhbGxlZEFmdGVyQWJvcnQgPSB0cnVlO1xuICAgIHQuY2FsbGJhY2soZXhwb3J0cy5hYm9ydEVycm9yKCksIHQpO1xuICB9XG59O1xuXG5leHBvcnRzLmFib3J0RXJyb3IgPSBmdW5jdGlvbiBhYm9ydEVycm9yKCkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ0xpbmsgdHJhdmVyc2FsIHByb2Nlc3MgaGFzIGJlZW4gYWJvcnRlZC4nKTtcbiAgZXJyb3IubmFtZSA9ICdBYm9ydEVycm9yJztcbiAgZXJyb3IuYWJvcnRlZCA9IHRydWU7XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4vYWJvcnRfdHJhdmVyc2FsJylcbiAgLCBhcHBseVRyYW5zZm9ybXMgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvYXBwbHlfdHJhbnNmb3JtcycpXG4gICwgaHR0cFJlcXVlc3RzID0gcmVxdWlyZSgnLi9odHRwX3JlcXVlc3RzJylcbiAgLCBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4vaXNfY29udGludWF0aW9uJylcbiAgLCB3YWxrZXIgPSByZXF1aXJlKCcuL3dhbGtlcicpO1xuXG52YXIgY2hlY2tIdHRwU3RhdHVzID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2NoZWNrX2h0dHBfc3RhdHVzJylcbiAgLCBjb250aW51YXRpb25Ub0RvYyA9XG4gICAgICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvY29udGludWF0aW9uX3RvX2RvYycpXG4gICwgY29udGludWF0aW9uVG9SZXNwb25zZSA9XG4gICAgICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvY29udGludWF0aW9uX3RvX3Jlc3BvbnNlJylcbiAgLCBjb252ZXJ0RW1iZWRkZWREb2NUb1Jlc3BvbnNlID1cbiAgICAgIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9jb252ZXJ0X2VtYmVkZGVkX2RvY190b19yZXNwb25zZScpXG4gICwgZXh0cmFjdERvYyA9ICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZXh0cmFjdF9kb2MnKVxuICAsIGV4dHJhY3RSZXNwb25zZSA9ICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZXh0cmFjdF9yZXNwb25zZScpXG4gICwgZXh0cmFjdFVybCA9ICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvZXh0cmFjdF91cmwnKVxuICAsIGZldGNoTGFzdFJlc291cmNlID0gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9mZXRjaF9sYXN0X3Jlc291cmNlJylcbiAgLCBleGVjdXRlTGFzdEh0dHBSZXF1ZXN0ID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2V4ZWN1dGVfbGFzdF9odHRwX3JlcXVlc3QnKVxuICAsIGV4ZWN1dGVIdHRwUmVxdWVzdCA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9leGVjdXRlX2h0dHBfcmVxdWVzdCcpXG4gICwgcGFyc2UgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvcGFyc2UnKTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIGVuZCBpdCB3aXRoIGFuIEhUVFAgZ2V0LlxuICovXG5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKHQsIGNhbGxiYWNrKSB7XG4gIHZhciB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcDtcbiAgaWYgKHQuY29udmVydFJlc3BvbnNlVG9PYmplY3QpIHtcbiAgICB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCA9IFtcbiAgICAgIGNvbnRpbnVhdGlvblRvRG9jLFxuICAgICAgZmV0Y2hMYXN0UmVzb3VyY2UsXG4gICAgICBjaGVja0h0dHBTdGF0dXMsXG4gICAgICBwYXJzZSxcbiAgICAgIGV4dHJhY3REb2MsXG4gICAgXTtcbiAgfSBlbHNlIHtcbiAgICB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCA9IFtcbiAgICAgIGNvbnRpbnVhdGlvblRvUmVzcG9uc2UsXG4gICAgICBmZXRjaExhc3RSZXNvdXJjZSxcbiAgICAgIGNvbnZlcnRFbWJlZGRlZERvY1RvUmVzcG9uc2UsXG4gICAgICBleHRyYWN0UmVzcG9uc2UsXG4gICAgXTtcbiAgfVxuICB3YWxrZXIud2Fsayh0LCB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCwgY2FsbGJhY2spO1xuICByZXR1cm4gY3JlYXRlVHJhdmVyc2FsSGFuZGxlKHQpO1xufTtcblxuLyoqXG4gKiBTcGVjaWFsIHZhcmlhbnQgb2YgZ2V0KCkgdGhhdCBkb2VzIG5vdCBleGVjdXRlIHRoZSBsYXN0IHJlcXVlc3QgYnV0IGluc3RlYWRcbiAqIHlpZWxkcyB0aGUgbGFzdCBVUkwgdG8gdGhlIGNhbGxiYWNrLlxuICovXG5leHBvcnRzLmdldFVybCA9IGZ1bmN0aW9uKHQsIGNhbGxiYWNrKSB7XG4gIHdhbGtlci53YWxrKHQsIFsgZXh0cmFjdFVybCBdLCBjYWxsYmFjayk7XG4gIHJldHVybiBjcmVhdGVUcmF2ZXJzYWxIYW5kbGUodCk7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBQT1NUIHJlcXVlc3Qgd2l0aCB0aGVcbiAqIGdpdmVuIGJvZHkgdG8gdGhlIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIFBPU1QgcmVxdWVzdCB0b1xuICogdGhlIGNhbGxiYWNrLlxuICovXG5leHBvcnRzLnBvc3QgPSBmdW5jdGlvbih0LCBjYWxsYmFjaykge1xuICB3YWxrQW5kRXhlY3V0ZSh0LFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZS5wb3N0LFxuICAgICAgY2FsbGJhY2spO1xuICByZXR1cm4gY3JlYXRlVHJhdmVyc2FsSGFuZGxlKHQpO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgUFVUIHJlcXVlc3Qgd2l0aCB0aGVcbiAqIGdpdmVuIGJvZHkgdG8gdGhlIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIFBVVCByZXF1ZXN0IHRvXG4gKiB0aGUgY2FsbGJhY2suXG4gKi9cbmV4cG9ydHMucHV0ID0gZnVuY3Rpb24odCwgY2FsbGJhY2spIHtcbiAgd2Fsa0FuZEV4ZWN1dGUodCxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UucHV0LFxuICAgICAgY2FsbGJhY2spO1xuICByZXR1cm4gY3JlYXRlVHJhdmVyc2FsSGFuZGxlKHQpO1xufTtcblxuLyoqXG4gKiBTdGFydHMgdGhlIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MgYW5kIHNlbmRzIGFuIEhUVFAgUEFUQ0ggcmVxdWVzdCB3aXRoIHRoZVxuICogZ2l2ZW4gYm9keSB0byB0aGUgbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgUEFUQ0ggcmVxdWVzdCB0b1xuICogdGhlIGNhbGxiYWNrLlxuICovXG5leHBvcnRzLnBhdGNoID0gZnVuY3Rpb24odCwgY2FsbGJhY2spIHtcbiAgd2Fsa0FuZEV4ZWN1dGUodCxcbiAgICAgIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UucGF0Y2gsXG4gICAgICBjYWxsYmFjayk7XG4gIHJldHVybiBjcmVhdGVUcmF2ZXJzYWxIYW5kbGUodCk7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBERUxFVEUgcmVxdWVzdCB0byB0aGVcbiAqIGxhc3QgVVJMLiBQYXNzZXMgdGhlIEhUVFAgcmVzcG9uc2Ugb2YgdGhlIERFTEVURSByZXF1ZXN0IHRvIHRoZSBjYWxsYmFjay5cbiAqL1xuZXhwb3J0cy5kZWxldGUgPSBmdW5jdGlvbih0LCBjYWxsYmFjaykge1xuICB3YWxrQW5kRXhlY3V0ZSh0LFxuICAgICAgdC5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UsXG4gICAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZS5kZWwsXG4gICAgICBjYWxsYmFjayk7XG4gIHJldHVybiBjcmVhdGVUcmF2ZXJzYWxIYW5kbGUodCk7XG59O1xuXG5mdW5jdGlvbiB3YWxrQW5kRXhlY3V0ZSh0LCByZXF1ZXN0LCBtZXRob2QsIGNhbGxiYWNrKSB7XG4gIHZhciB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcDtcbiAgaWYgKHQuY29udmVydFJlc3BvbnNlVG9PYmplY3QpIHtcbiAgICB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCA9IFtcbiAgICAgIGV4ZWN1dGVIdHRwUmVxdWVzdCxcbiAgICAgIGNoZWNrSHR0cFN0YXR1cyxcbiAgICAgIHBhcnNlLFxuICAgICAgZXh0cmFjdERvYyxcbiAgICBdO1xuICB9IGVsc2Uge1xuICAgIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwID0gW1xuICAgICAgZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdCxcbiAgICBdO1xuICB9XG5cbiAgdC5sYXN0TWV0aG9kID0gbWV0aG9kO1xuICB3YWxrZXIud2Fsayh0LCB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCwgY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUcmF2ZXJzYWxIYW5kbGUodCkge1xuICByZXR1cm4ge1xuICAgIGFib3J0OiB0LmFib3J0VHJhdmVyc2FsXG4gIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgc3RhbmRhcmRSZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcpXG4gICwgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxudmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuL2FjdGlvbnMnKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi9hYm9ydF90cmF2ZXJzYWwnKS5hYm9ydFRyYXZlcnNhbFxuICAsIG1lZGlhVHlwZVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9tZWRpYV90eXBlX3JlZ2lzdHJ5JylcbiAgLCBtZWRpYVR5cGVzID0gcmVxdWlyZSgnLi9tZWRpYV90eXBlcycpXG4gICwgbWVyZ2VSZWN1cnNpdmUgPSByZXF1aXJlKCcuL21lcmdlX3JlY3Vyc2l2ZScpO1xuXG52YXIgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbi8vIE1haW50ZW5hbmNlIG5vdGljZTogVGhlIGNvbnN0cnVjdG9yIGlzIHVzdWFsbHkgY2FsbGVkIHdpdGhvdXQgYXJndW1lbnRzLCB0aGVcbi8vIG1lZGlhVHlwZSBwYXJhbWV0ZXIgaXMgb25seSB1c2VkIHdoZW4gY2xvbmluZyB0aGUgcmVxdWVzdCBidWlsZGVyIGluXG4vLyBuZXdSZXF1ZXN0KCkuXG5mdW5jdGlvbiBCdWlsZGVyKG1lZGlhVHlwZSkge1xuICB0aGlzLm1lZGlhVHlwZSA9IG1lZGlhVHlwZSB8fCBtZWRpYVR5cGVzLkNPTlRFTlRfTkVHT1RJQVRJT047XG4gIHRoaXMuYWRhcHRlciA9IHRoaXMuX2NyZWF0ZUFkYXB0ZXIodGhpcy5tZWRpYVR5cGUpO1xuICB0aGlzLmNvbnRlbnROZWdvdGlhdGlvbiA9IHRydWU7XG4gIHRoaXMuY29udmVydFJlc3BvbnNlVG9PYmplY3RGbGFnID0gZmFsc2U7XG4gIHRoaXMubGlua3MgPSBbXTtcbiAgdGhpcy5qc29uUGFyc2VyID0gSlNPTi5wYXJzZTtcbiAgdGhpcy5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UgPSBzdGFuZGFyZFJlcXVlc3Q7XG4gIHRoaXMucmVxdWVzdE9wdGlvbnMgPSB7fTtcbiAgdGhpcy5yZXNvbHZlUmVsYXRpdmVGbGFnID0gZmFsc2U7XG4gIHRoaXMucHJlZmVyRW1iZWRkZWQgPSBmYWxzZTtcbiAgdGhpcy5sYXN0VHJhdmVyc2FsU3RhdGUgPSBudWxsO1xuICB0aGlzLmNvbnRpbnVhdGlvbiA9IG51bGw7XG4gIC8vIE1haW50ZW5hbmNlIG5vdGljZTogd2hlbiBleHRlbmRpbmcgdGhlIGxpc3Qgb2YgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzLFxuICAvLyBhbHNvIGV4dGVuZCB0aGlzLm5ld1JlcXVlc3QgYW5kIGluaXRGcm9tVHJhdmVyc2FsU3RhdGVcbn1cblxuQnVpbGRlci5wcm90b3R5cGUuX2NyZWF0ZUFkYXB0ZXIgPSBmdW5jdGlvbihtZWRpYVR5cGUpIHtcbiAgdmFyIEFkYXB0ZXJUeXBlID0gbWVkaWFUeXBlUmVnaXN0cnkuZ2V0KG1lZGlhVHlwZSk7XG4gIGlmICghQWRhcHRlclR5cGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb3IgdW5zdXBwb3J0ZWQgbWVkaWEgdHlwZTogJyArIG1lZGlhVHlwZSk7XG4gIH1cbiAgbG9nLmRlYnVnKCdjcmVhdGluZyBuZXcgJyArIEFkYXB0ZXJUeXBlLm5hbWUpO1xuICByZXR1cm4gbmV3IEFkYXB0ZXJUeXBlKGxvZyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgYnVpbGRlciBpbnN0YW5jZSB3aGljaCBpcyBiYXNpY2FsbHkgYSBjbG9uZSBvZiB0aGlzIGJ1aWxkZXJcbiAqIGluc3RhbmNlLiBUaGlzIGFsbG93cyB5b3UgdG8gaW5pdGlhdGUgYSBuZXcgcmVxdWVzdCBidXQga2VlcGluZyBhbGwgdGhlIHNldHVwXG4gKiAoc3RhcnQgVVJMLCB0ZW1wbGF0ZSBwYXJhbWV0ZXJzLCByZXF1ZXN0IG9wdGlvbnMsIGJvZHkgcGFyc2VyLCAuLi4pLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5uZXdSZXF1ZXN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjbG9uZWRSZXF1ZXN0QnVpbGRlciA9IG5ldyBCdWlsZGVyKHRoaXMuZ2V0TWVkaWFUeXBlKCkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci5jb250ZW50TmVnb3RpYXRpb24gPVxuICAgIHRoaXMuZG9lc0NvbnRlbnROZWdvdGlhdGlvbigpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci5jb252ZXJ0UmVzcG9uc2VUb09iamVjdCh0aGlzLmNvbnZlcnRzUmVzcG9uc2VUb09iamVjdCgpKTtcbiAgY2xvbmVkUmVxdWVzdEJ1aWxkZXIuZnJvbShzaGFsbG93Q2xvbmVBcnJheSh0aGlzLmdldEZyb20oKSkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKFxuICAgIGNsb25lQXJyYXlPck9iamVjdCh0aGlzLmdldFRlbXBsYXRlUGFyYW1ldGVycygpKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLndpdGhSZXF1ZXN0T3B0aW9ucyhcbiAgICBjbG9uZUFycmF5T3JPYmplY3QodGhpcy5nZXRSZXF1ZXN0T3B0aW9ucygpKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLndpdGhSZXF1ZXN0TGlicmFyeSh0aGlzLmdldFJlcXVlc3RMaWJyYXJ5KCkpO1xuICBjbG9uZWRSZXF1ZXN0QnVpbGRlci5wYXJzZVJlc3BvbnNlQm9kaWVzV2l0aCh0aGlzLmdldEpzb25QYXJzZXIoKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLnJlc29sdmVSZWxhdGl2ZSh0aGlzLmRvZXNSZXNvbHZlUmVsYXRpdmUoKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLnByZWZlckVtYmVkZGVkUmVzb3VyY2VzKFxuICAgICAgdGhpcy5kb2VzUHJlZmVyRW1iZWRkZWRSZXNvdXJjZXMoKSk7XG4gIGNsb25lZFJlcXVlc3RCdWlsZGVyLmNvbnRpbnVhdGlvbiA9IHRoaXMuY29udGludWF0aW9uO1xuICAvLyBNYWludGVuYW5jZSBub3RpY2U6IHdoZW4gZXh0ZW5kaW5nIHRoZSBsaXN0IG9mIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyxcbiAgLy8gYWxzbyBleHRlbmQgaW5pdEZyb21UcmF2ZXJzYWxTdGF0ZVxuICByZXR1cm4gY2xvbmVkUmVxdWVzdEJ1aWxkZXI7XG59O1xuXG4vKipcbiAqIERpc2FibGVzIGNvbnRlbnQgbmVnb3RpYXRpb24gYW5kIGZvcmNlcyB0aGUgdXNlIG9mIGEgZ2l2ZW4gbWVkaWEgdHlwZS5cbiAqIFRoZSBtZWRpYSB0eXBlIGhhcyB0byBiZSByZWdpc3RlcmVkIGF0IFRyYXZlcnNvbidzIG1lZGlhIHR5cGUgcmVnaXN0cnlcbiAqIGJlZm9yZSB2aWEgdHJhdmVyc29uLnJlZ2lzdGVyTWVkaWFUeXBlIChleGNlcHQgZm9yIG1lZGlhIHR5cGVcbiAqIGFwcGxpY2F0aW9uL2pzb24sIHdoaWNoIGlzIHRyYXZlcnNvbi5tZWRpYVR5cGVzLkpTT04pLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5zZXRNZWRpYVR5cGUgPSBmdW5jdGlvbihtZWRpYVR5cGUpIHtcbiAgdGhpcy5tZWRpYVR5cGUgPSBtZWRpYVR5cGUgfHwgbWVkaWFUeXBlcy5DT05URU5UX05FR09USUFUSU9OO1xuICB0aGlzLmFkYXB0ZXIgPSB0aGlzLl9jcmVhdGVBZGFwdGVyKG1lZGlhVHlwZSk7XG4gIHRoaXMuY29udGVudE5lZ290aWF0aW9uID1cbiAgICAobWVkaWFUeXBlID09PSBtZWRpYVR5cGVzLkNPTlRFTlRfTkVHT1RJQVRJT04pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2hvcnRjdXQgZm9yXG4gKiBzZXRNZWRpYVR5cGUodHJhdmVyc29uLm1lZGlhVHlwZXMuSlNPTik7XG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zZXRNZWRpYVR5cGUobWVkaWFUeXBlcy5KU09OKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNob3J0Y3V0IGZvclxuICogc2V0TWVkaWFUeXBlKHRyYXZlcnNvbi5tZWRpYVR5cGVzLkpTT05fSEFMKTtcbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuanNvbkhhbCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNldE1lZGlhVHlwZShtZWRpYVR5cGVzLkpTT05fSEFMKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVuYWJsZXMgY29udGVudCBuZWdvdGlhdGlvbiAoY29udGVudCBuZWdvdGlhdGlvbiBpcyBlbmFibGVkIGJ5IGRlZmF1bHQsIHRoaXNcbiAqIG1ldGhvZCBjYW4gYmUgdXNlZCB0byBlbmFibGUgaXQgYWZ0ZXIgYSBjYWxsIHRvIHNldE1lZGlhVHlwZSBkaXNhYmxlZCBpdCkuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnVzZUNvbnRlbnROZWdvdGlhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNldE1lZGlhVHlwZShtZWRpYVR5cGVzLkNPTlRFTlRfTkVHT1RJQVRJT04pO1xuICB0aGlzLmNvbnRlbnROZWdvdGlhdGlvbiA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHJvb3QgVVJMIG9mIHRoZSBBUEksIHRoYXQgaXMsIHdoZXJlIHRoZSBsaW5rIHRyYXZlcnNhbCBiZWdpbnMuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbih1cmwpIHtcbiAgdGhpcy5zdGFydFVybCA9IHVybDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSBsaXN0IG9mIGxpbmsgcmVsYXRpb25zIHRvIGZvbGxvd1xuICovXG5CdWlsZGVyLnByb3RvdHlwZS5mb2xsb3cgPSBmdW5jdGlvbigpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdXRpbC5pc0FycmF5KGFyZ3VtZW50c1swXSkpIHtcbiAgICB0aGlzLmxpbmtzID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubGlua3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYXJndW1lbnRzKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIGZvbGxvdy5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUud2FsayA9IEJ1aWxkZXIucHJvdG90eXBlLmZvbGxvdztcblxuLyoqXG4gKiBQcm92aWRlIHRlbXBsYXRlIHBhcmFtZXRlcnMgZm9yIFVSSSB0ZW1wbGF0ZSBzdWJzdGl0dXRpb24uXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLndpdGhUZW1wbGF0ZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbWV0ZXJzKSB7XG4gIHRoaXMudGVtcGxhdGVQYXJhbWV0ZXJzID0gcGFyYW1ldGVycztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFByb3ZpZGUgb3B0aW9ucyBmb3IgSFRUUCByZXF1ZXN0cyAoYWRkaXRpb25hbCBIVFRQIGhlYWRlcnMsIGZvciBleGFtcGxlKS5cbiAqIFRoaXMgZnVuY3Rpb24gcmVzZXRzIGFueSByZXF1ZXN0IG9wdGlvbnMsIHRoYXQgaGFkIGJlZW4gc2V0IHByZXZpb3VzbHksIHRoYXRcbiAqIGlzLCBtdWx0aXBsZSBjYWxscyB0byB3aXRoUmVxdWVzdE9wdGlvbnMgYXJlIG5vdCBjdW11bGF0aXZlLiBVc2VcbiAqIGFkZFJlcXVlc3RPcHRpb25zIHRvIGFkZCByZXF1ZXN0IG9wdGlvbnMgaW4gYSBjdW11bGF0aXZlIHdheS5cbiAqXG4gKiBPcHRpb25zIGNhbiBlaXRoZXIgYmUgcGFzc2VkIGFzIGFuIG9iamVjdCBvciBhbiBhcnJheS4gSWYgYW4gb2JqZWN0IGlzXG4gKiBwYXNzZWQsIHRoZSBvcHRpb25zIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBIVFRQIHJlcXVlc3QuIElmIGFuIGFycmF5IGlzXG4gKiBwYXNzZWQsIGVhY2ggZWxlbWVudCBzaG91bGQgYmUgYW4gb3B0aW9ucyBvYmplY3QgYW5kIHRoZSBmaXJzdCBhcnJheSBlbGVtZW50XG4gKiB3aWxsIGJlIHVzZWQgZm9yIHRoZSBmaXJzdCByZXF1ZXN0LCB0aGUgc2Vjb25kIGVsZW1lbnQgZm9yIHRoZSBzZWNvbmQgcmVxdWVzdFxuICogYW5kIHNvIG9uLiBudWxsIGVsZW1lbnRzIGFyZSBhbGxvd2VkLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS53aXRoUmVxdWVzdE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHRoaXMucmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBvcHRpb25zIGZvciBIVFRQIHJlcXVlc3RzIChhZGRpdGlvbmFsIEhUVFAgaGVhZGVycywgZm9yIGV4YW1wbGUpIG9uIHRvcFxuICogb2YgZXhpc3Rpbmcgb3B0aW9ucywgaWYgYW55LiBUbyByZXNldCBhbGwgcmVxdWVzdCBvcHRpb25zIGFuZCBzZXQgbmV3IG9uZXNcbiAqIHdpdGhvdXQga2VlcGluZyB0aGUgb2xkIG9uZXMsIHlvdSBjYW4gdXNlIHdpdGhSZXF1ZXN0T3B0aW9ucy5cbiAqXG4gKiBPcHRpb25zIGNhbiBlaXRoZXIgYmUgcGFzc2VkIGFzIGFuIG9iamVjdCBvciBhbiBhcnJheS4gSWYgYW4gb2JqZWN0IGlzXG4gKiBwYXNzZWQsIHRoZSBvcHRpb25zIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBIVFRQIHJlcXVlc3QuIElmIGFuIGFycmF5IGlzXG4gKiBwYXNzZWQsIGVhY2ggZWxlbWVudCBzaG91bGQgYmUgYW4gb3B0aW9ucyBvYmplY3QgYW5kIHRoZSBmaXJzdCBhcnJheSBlbGVtZW50XG4gKiB3aWxsIGJlIHVzZWQgZm9yIHRoZSBmaXJzdCByZXF1ZXN0LCB0aGUgc2Vjb25kIGVsZW1lbnQgZm9yIHRoZSBzZWNvbmQgcmVxdWVzdFxuICogYW5kIHNvIG9uLiBudWxsIGVsZW1lbnRzIGFyZSBhbGxvd2VkLlxuICpcbiAqIFdoZW4gY2FsbGVkIGFmdGVyIGEgY2FsbCB0byB3aXRoUmVxdWVzdE9wdGlvbnMgb3Igd2hlbiBjb21iaW5pbmcgbXVsdGlwbGVcbiAqIGFkZFJlcXVlc3RPcHRpb25zIGNhbGxzLCBzb21lIHdpdGggb2JqZWN0cyBhbmQgc29tZSB3aXRoIGFycmF5cywgYSBtdWx0aXR1ZGVcbiAqIG9mIGludGVyZXN0aW5nIHNpdHVhdGlvbnMgY2FuIG9jY3VyOlxuICpcbiAqIDEpIFRoZSBleGlzdGluZyByZXF1ZXN0IG9wdGlvbnMgYXJlIGFuIG9iamVjdCBhbmQgdGhlIG5ldyBvcHRpb25zIHBhc3NlZCBpbnRvXG4gKiB0aGlzIG1ldGhvZCBhcmUgYWxzbyBhbiBvYmplY3QuIE91dGNvbWU6IEJvdGggb2JqZWN0cyBhcmUgbWVyZ2VkIGFuZCBhbGxcbiAqIG9wdGlvbnMgYXJlIGFwcGxpZWQgdG8gYWxsIHJlcXVlc3RzLlxuICpcbiAqIDIpIFRoZSBleGlzdGluZyBvcHRpb25zIGFyZSBhbiBhcnJheSBhbmQgdGhlIG5ldyBvcHRpb25zIHBhc3NlZCBpbnRvIHRoaXNcbiAqIG1ldGhvZCBhcmUgYWxzbyBhbiBhcnJheS4gT3V0Y29tZTogRWFjaCBhcnJheSBlbGVtZW50IGlzIG1lcmdlZCBpbmRpdmlkdWFsbHkuXG4gKiBUaGUgY29tYmluZWQgb3B0aW9ucyBmcm9tIHRoZSBuLXRoIGFycmF5IGVsZW1lbnQgaW4gdGhlIGV4aXN0aW5nIG9wdGlvbnNcbiAqIGFycmF5IGFuZCB0aGUgbi10aCBhcnJheSBlbGVtZW50IGluIHRoZSBnaXZlbiBhcnJheSBhcmUgYXBwbGllZCB0byB0aGUgbi10aFxuICogcmVxdWVzdC5cbiAqXG4gKiAzKSBUaGUgZXhpc3Rpbmcgb3B0aW9ucyBhcmUgYW4gb2JqZWN0IGFuZCB0aGUgbmV3IG9wdGlvbnMgcGFzc2VkIGludG8gdGhpc1xuICogbWV0aG9kIGFyZSBhbiBhcnJheS4gT3V0Y29tZTogQSBuZXcgb3B0aW9ucyBhcnJheSB3aWxsIGJlIGNyZWF0ZWQuIEZvciBlYWNoXG4gKiBlbGVtZW50LCBhIGNsb25lIG9mIHRoZSBleGlzdGluZyBvcHRpb25zIG9iamVjdCB3aWxsIGJlIG1lcmdlZCB3aXRoIGFuXG4gKiBlbGVtZW50IGZyb20gdGhlIGdpdmVuIG9wdGlvbnMgYXJyYXkuXG4gKlxuICogTm90ZSB0aGF0IGlmIHRoZSBnaXZlbiBhcnJheSBoYXMgbGVzcyBlbGVtZW50cyB0aGFuIHRoZSBudW1iZXIgb2Ygc3RlcHMgaW5cbiAqIHRoZSBsaW5rIHRyYXZlcnNhbCAodXN1YWxseSB0aGUgbnVtYmVyIG9mIHN0ZXBzIGlzIGRlcml2ZWQgZnJvbSB0aGUgbnVtYmVyXG4gKiBvZiBsaW5rIHJlbGF0aW9ucyBnaXZlbiB0byB0aGUgZm9sbG93IG1ldGhvZCksIG9ubHkgdGhlIGZpcnN0IG4gaHR0cFxuICogcmVxdWVzdHMgd2lsbCB1c2Ugb3B0aW9ucyBhdCBhbGwsIHdoZXJlIG4gaXMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGVcbiAqIGdpdmVuIGFycmF5LiBIVFRQIHJlcXVlc3QgbiArIDEgYW5kIGFsbCBmb2xsb3dpbmcgSFRUUCByZXF1ZXN0cyB3aWxsIHVzZSBhblxuICogZW1wdHkgb3B0aW9ucyBvYmplY3QuIFRoaXMgaXMgZHVlIHRvIHRoZSBmYWN0LCB0aGF0IGF0IHRoZSB0aW1lIG9mIGNyZWF0aW5nXG4gKiB0aGUgbmV3IG9wdGlvbnMgYXJyYXksIHdlIGNhbiBub3Qga25vdyB3aXRoIGNlcnRhaW50eSBob3cgbWFueSBzdGVwcyB0aGVcbiAqIGxpbmsgdHJhdmVyc2FsIHdpbGwgaGF2ZS5cbiAqXG4gKiA0KSBUaGUgZXhpc3Rpbmcgb3B0aW9ucyBhcmUgYW4gYXJyYXkgYW5kIHRoZSBuZXcgb3B0aW9ucyBwYXNzZWQgaW50byB0aGlzXG4gKiBtZXRob2QgYXJlIGFuIG9iamVjdC4gT3V0Y29tZTogQSBjbG9uZSBvZiB0aGUgZ2l2ZW4gb3B0aW9ucyBvYmplY3Qgd2lsbCBiZVxuICogbWVyZ2VkIGludG8gaW50byBlYWNoIGFycmF5IGVsZW1lbnQgb2YgdGhlIGV4aXN0aW5nIG9wdGlvbnMuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmFkZFJlcXVlc3RPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gIC8vIGNhc2UgMjogYm90aCB0aGUgcHJlc2VudCBvcHRpb25zIGFuZCB0aGUgbmV3IG9wdGlvbnMgYXJlIGFycmF5cy5cbiAgLy8gPT4gbWVyZ2UgZWFjaCBhcnJheSBlbGVtZW50IGluZGl2aWR1YWxseVxuICBpZiAodXRpbC5pc0FycmF5KHRoaXMucmVxdWVzdE9wdGlvbnMpICYmIHV0aWwuaXNBcnJheShvcHRpb25zKSkge1xuICAgIG1lcmdlQXJyYXlFbGVtZW50cyh0aGlzLnJlcXVlc3RPcHRpb25zLCBvcHRpb25zKTtcblxuICAvLyBjYXNlIDM6IHRoZXJlIGlzIGFuIG9wdGlvbnMgb2JqZWN0IHRoZSBuZXcgb3B0aW9ucyBhcmUgYW4gYXJyYXkuXG4gIC8vID0+IGNyZWF0ZSBhIG5ldyBhcnJheSwgZWFjaCBlbGVtZW50IGlzIGEgbWVyZ2Ugb2YgdGhlIGV4aXN0aW5nIGJhc2Ugb2JqZWN0XG4gIC8vIGFuZCB0aGUgYXJyYXkgZWxlbWVudCBmcm9tIHRoZSBuZXcgb3B0aW9ucyBhcnJheS5cbiAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZXF1ZXN0T3B0aW9ucyA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICB1dGlsLmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICB0aGlzLnJlcXVlc3RPcHRpb25zID1cbiAgICAgIG1lcmdlQmFzZU9iamVjdFdpdGhBcnJheUVsZW1lbnRzKHRoaXMucmVxdWVzdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gIC8vIGNhc2UgNDogdGhlcmUgaXMgYW4gb3B0aW9ucyBhcnJheSBhbmQgdGhlIG5ldyBvcHRpb25zIGFyZSBhbiBvYmplY3QuXG4gIC8vID0+IG1lcmdlIHRoZSBuZXcgb2JqZWN0IGludG8gZWFjaCBhcnJheSBlbGVtZW50LlxuICB9IGVsc2UgaWYgKHV0aWwuaXNBcnJheSh0aGlzLnJlcXVlc3RPcHRpb25zKSAmJlxuICAgICAgICAgICAgIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgIG1lcmdlT3B0aW9uT2JqZWN0SW50b0VhY2hBcnJheUVsZW1lbnQodGhpcy5yZXF1ZXN0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgLy8gY2FzZSAxOiBib3RoIGFyZSBvYmplY3RzXG4gIC8vID0+IG1lcmdlIGJvdGggb2JqZWN0c1xuICB9IGVsc2Uge1xuICAgIG1lcmdlUmVjdXJzaXZlKHRoaXMucmVxdWVzdE9wdGlvbnMsIG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gbWVyZ2VBcnJheUVsZW1lbnRzKGV4aXN0aW5nT3B0aW9ucywgbmV3T3B0aW9ucykge1xuICBmb3IgKHZhciBpID0gMDtcbiAgICAgICBpIDwgTWF0aC5tYXgoZXhpc3RpbmdPcHRpb25zLmxlbmd0aCwgbmV3T3B0aW9ucy5sZW5ndGgpO1xuICAgICAgIGkrKykge1xuICAgIGV4aXN0aW5nT3B0aW9uc1tpXSA9XG4gICAgICBtZXJnZVJlY3Vyc2l2ZShleGlzdGluZ09wdGlvbnNbaV0sIG5ld09wdGlvbnNbaV0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlQmFzZU9iamVjdFdpdGhBcnJheUVsZW1lbnRzKGV4aXN0aW5nT3B0aW9ucywgbmV3T3B0aW9ucykge1xuICB2YXIgbmV3T3B0QXJyYXkgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7XG4gICAgICAgaSA8IG5ld09wdGlvbnMubGVuZ3RoO1xuICAgICAgIGkrKykge1xuICAgIG5ld09wdEFycmF5W2ldID1cbiAgICAgIG1lcmdlUmVjdXJzaXZlKG5ld09wdGlvbnNbaV0sIGV4aXN0aW5nT3B0aW9ucyk7XG4gIH1cbiAgcmV0dXJuIG5ld09wdEFycmF5O1xufVxuXG5mdW5jdGlvbiBtZXJnZU9wdGlvbk9iamVjdEludG9FYWNoQXJyYXlFbGVtZW50KGV4aXN0aW5nT3B0aW9ucywgbmV3T3B0aW9ucykge1xuICBmb3IgKHZhciBpID0gMDtcbiAgICAgICBpIDwgZXhpc3RpbmdPcHRpb25zLmxlbmd0aDtcbiAgICAgICBpKyspIHtcbiAgICBtZXJnZVJlY3Vyc2l2ZShleGlzdGluZ09wdGlvbnNbaV0sIG5ld09wdGlvbnMpO1xuICB9XG59XG5cbi8qKlxuICogSW5qZWN0cyBhIGN1c3RvbSByZXF1ZXN0IGxpYnJhcnkuIFdoZW4gdXNpbmcgdGhpcyBtZXRob2QsIHlvdSBzaG91bGQgbm90XG4gKiBjYWxsIHdpdGhSZXF1ZXN0T3B0aW9ucyBvciBhZGRSZXF1ZXN0T3B0aW9ucyBidXQgaW5zdGVhZCBwcmUtY29uZmlndXJlIHRoZVxuICogaW5qZWN0ZWQgcmVxdWVzdCBsaWJyYXJ5IGluc3RhbmNlIGJlZm9yZSBwYXNzaW5nIGl0IHRvIHdpdGhSZXF1ZXN0TGlicmFyeS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUud2l0aFJlcXVlc3RMaWJyYXJ5ID0gZnVuY3Rpb24ocmVxdWVzdCkge1xuICB0aGlzLnJlcXVlc3RNb2R1bGVJbnN0YW5jZSA9IHJlcXVlc3Q7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbmplY3RzIGEgY3VzdG9tIEpTT04gcGFyc2VyLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5wYXJzZVJlc3BvbnNlQm9kaWVzV2l0aCA9IGZ1bmN0aW9uKHBhcnNlcikge1xuICB0aGlzLmpzb25QYXJzZXIgPSBwYXJzZXI7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXaXRoIHRoaXMgb3B0aW9uIGVuYWJsZWQsIHRoZSBib2R5IG9mIHRoZSByZXNwb25zZSBhdCB0aGUgZW5kIG9mIHRoZVxuICogdHJhdmVyc2FsIHdpbGwgYmUgY29udmVydGVkIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdCAoZm9yIGV4YW1wbGUgYnkgcGFzc2luZ1xuICogaXQgaW50byBKU09OLnBhcnNlKSBhbmQgcGFzc2luZyB0aGUgcmVzdWx0aW5nIG9iamVjdCBpbnRvIHRoZSBjYWxsYmFjay5cbiAqIFRoZSBkZWZhdWx0IGlzIGZhbHNlLCB3aGljaCBtZWFucyB0aGUgZnVsbCByZXNwb25zZSBpcyBoYW5kZWQgdG8gdGhlXG4gKiBjYWxsYmFjay5cbiAqXG4gKiBXaGVuIHJlc3BvbnNlIGJvZHkgY29udmVyc2lvbiBpcyBlbmFibGVkLCB5b3Ugd2lsbCBub3QgZ2V0IHRoZSBmdWxsXG4gKiByZXNwb25zZSwgc28geW91IHdvbid0IGhhdmUgYWNjZXNzIHRvIHRoZSBIVFRQIHN0YXR1cyBjb2RlIG9yIGhlYWRlcnMuXG4gKiBJbnN0ZWFkIG9ubHkgdGhlIGNvbnZlcnRlZCBvYmplY3Qgd2lsbCBiZSBwYXNzZWQgaW50byB0aGUgY2FsbGJhY2suXG4gKlxuICogTm90ZSB0aGF0IHRoZSBib2R5IG9mIGFueSBpbnRlcm1lZGlhcnkgcmVzcG9uc2VzIGR1cmluZyB0aGUgdHJhdmVyc2FsIGlzXG4gKiBhbHdheXMgY29udmVydGVkIGJ5IFRyYXZlcnNvbiAodG8gZmluZCB0aGUgbmV4dCBsaW5rKS5cbiAqXG4gKiBJZiB0aGUgbWV0aG9kIGlzIGNhbGxlZCB3aXRob3V0IGFyZ3VtZW50cyAob3IgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIHVuZGVmaW5lZFxuICogb3IgbnVsbCksIHJlc3BvbnNlIGJvZHkgY29udmVyc2lvbiBpcyBzd2l0Y2hlZCBvbiwgb3RoZXJ3aXNlIHRoZSBhcmd1bWVudCBpc1xuICogaW50ZXJwcmV0ZWQgYXMgYSBib29sZWFuIGZsYWcuIElmIGl0IGlzIGEgdHJ1dGh5IHZhbHVlLCByZXNwb25zZSBib2R5XG4gKiBjb252ZXJzaW9uIGlzIHN3aXRjaGVkIHRvIG9uLCBpZiBpdCBpcyBhIGZhbHN5IHZhbHVlIChidXQgbm90IG51bGwgb3JcbiAqIHVuZGVmaW5lZCksIHJlc3BvbnNlIGJvZHkgY29udmVyc2lvbiBpcyBzd2l0Y2hlZCBvZmYuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0ID0gZnVuY3Rpb24oZmxhZykge1xuICBpZiAodHlwZW9mIGZsYWcgPT09ICd1bmRlZmluZWQnIHx8IGZsYWcgPT09IG51bGwpIHtcbiAgICBmbGFnID0gdHJ1ZTtcbiAgfVxuICB0aGlzLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0RmxhZyA9ICEhZmxhZztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN3aXRjaGVzIFVSTCByZXNvbHV0aW9uIHRvIHJlbGF0aXZlIChkZWZhdWx0IGlzIGFic29sdXRlKSBvciBiYWNrIHRvXG4gKiBhYnNvbHV0ZS5cbiAqXG4gKiBJZiB0aGUgbWV0aG9kIGlzIGNhbGxlZCB3aXRob3V0IGFyZ3VtZW50cyAob3IgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIHVuZGVmaW5lZFxuICogb3IgbnVsbCksIFVSTCByZXNvbHV0aW9uIGlzIHN3aXRjaGVkIHRvIHJlbGF0aXZlLCBvdGhlcndpc2UgdGhlIGFyZ3VtZW50IGlzXG4gKiBpbnRlcnByZXRlZCBhcyBhIGJvb2xlYW4gZmxhZy4gSWYgaXQgaXMgYSB0cnV0aHkgdmFsdWUsIFVSTCByZXNvbHV0aW9uIGlzXG4gKiBzd2l0Y2hlZCB0byByZWxhdGl2ZSwgaWYgaXQgaXMgYSBmYWxzeSB2YWx1ZSwgVVJMIHJlc29sdXRpb24gaXMgc3dpdGNoZWQgdG9cbiAqIGFic29sdXRlLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5yZXNvbHZlUmVsYXRpdmUgPSBmdW5jdGlvbihmbGFnKSB7XG4gIGlmICh0eXBlb2YgZmxhZyA9PT0gJ3VuZGVmaW5lZCcgfHwgZmxhZyA9PT0gbnVsbCkge1xuICAgIGZsYWcgPSB0cnVlO1xuICB9XG4gIHRoaXMucmVzb2x2ZVJlbGF0aXZlRmxhZyA9ICEhZmxhZztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1ha2VzIFRyYXZlcnNvbiBwcmVmZXIgZW1iZWRkZWQgcmVzb3VyY2VzIG92ZXIgdHJhdmVyc2luZyBhIGxpbmsgb3IgdmljZVxuICogdmVyc2EuIFRoaXMgb25seSBhcHBsaWVzIHRvIG1lZGlhIHR5cGVzIHdoaWNoIHN1cHBvcnQgZW1iZWRkZWQgcmVzb3VyY2VzXG4gKiAobGlrZSBIQUwpLiBJdCBoYXMgbm8gZWZmZWN0IHdoZW4gdXNpbmcgYSBtZWRpYSB0eXBlIHRoYXQgZG9lcyBub3Qgc3VwcG9ydFxuICogZW1iZWRkZWQgcmVzb3VyY2VzLlxuICpcbiAqIEl0IGFsc28gb25seSB0YWtlcyBlZmZlY3Qgd2hlbiBhIHJlc291cmNlIGNvbnRhaW5zIGJvdGggYSBsaW5rIF9hbmRfIGFuXG4gKiBlbWJlZGRlZCByZXNvdXJjZSB3aXRoIHRoZSBuYW1lIHRoYXQgaXMgdG8gYmUgZm9sbG93ZWQgYXQgdGhpcyBzdGVwIGluIHRoZVxuICogbGluayB0cmF2ZXJzYWwgcHJvY2Vzcy5cbiAqXG4gKiBJZiB0aGUgbWV0aG9kIGlzIGNhbGxlZCB3aXRob3V0IGFyZ3VtZW50cyAob3IgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIHVuZGVmaW5lZFxuICogb3IgbnVsbCksIGVtYmVkZGVkIHJlc291cmNlcyB3aWxsIGJlIHByZWZlcnJlZCBvdmVyIGZldGNoaW5nIGxpbmtlZCByZXNvdXJjZXNcbiAqIHdpdGggYW4gYWRkaXRpb25hbCBIVFRQIHJlcXVlc3QuIE90aGVyd2lzZSB0aGUgYXJndW1lbnQgaXMgaW50ZXJwcmV0ZWQgYXMgYVxuICogYm9vbGVhbiBmbGFnLiBJZiBpdCBpcyBhIHRydXRoeSB2YWx1ZSwgZW1iZWRkZWQgcmVzb3VyY2VzIHdpbGwgYmUgcHJlZmVycmVkLFxuICogaWYgaXQgaXMgYSBmYWxzeSB2YWx1ZSwgdHJhdmVyc2luZyB0aGUgbGluayByZWxhdGlvbiB3aWxsIGJlIHByZWZlcnJlZC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucHJlZmVyRW1iZWRkZWRSZXNvdXJjZXMgPSBmdW5jdGlvbihmbGFnKSB7XG4gIGlmICh0eXBlb2YgZmxhZyA9PT0gJ3VuZGVmaW5lZCcgfHwgZmxhZyA9PT0gbnVsbCkge1xuICAgIGZsYWcgPSB0cnVlO1xuICB9XG4gIHRoaXMucHJlZmVyRW1iZWRkZWQgPSAhIWZsYWc7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IG1lZGlhIHR5cGUuIElmIG5vIG1lZGlhIHR5cGUgaXMgZW5mb3JjZWQgYnV0IGNvbnRlbnQgdHlwZVxuICogZGV0ZWN0aW9uIGlzIHVzZWQsIHRoZSBzdHJpbmcgYGNvbnRlbnQtbmVnb3RpYXRpb25gIGlzIHJldHVybmVkLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRNZWRpYVR5cGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubWVkaWFUeXBlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBVUkwgc2V0IGJ5IHRoZSBmcm9tKHVybCkgbWV0aG9kLCB0aGF0IGlzLCB0aGUgcm9vdCBVUkwgb2YgdGhlXG4gKiBBUEkuXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLmdldEZyb20gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RhcnRVcmw7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHRlbXBsYXRlIHBhcmFtZXRlcnMgc2V0IGJ5IHRoZSB3aXRoVGVtcGxhdGVQYXJhbWV0ZXJzLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRUZW1wbGF0ZVBhcmFtZXRlcnMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudGVtcGxhdGVQYXJhbWV0ZXJzO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSByZXF1ZXN0IG9wdGlvbnMgc2V0IGJ5IHRoZSB3aXRoUmVxdWVzdE9wdGlvbnMgb3JcbiAqIGFkZFJlcXVlc3RPcHRpb25zLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRSZXF1ZXN0T3B0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yZXF1ZXN0T3B0aW9ucztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VzdG9tIHJlcXVlc3QgbGlicmFyeSBpbnN0YW5jZSBzZXQgYnkgd2l0aFJlcXVlc3RMaWJyYXJ5IG9yIHRoZVxuICogc3RhbmRhcmQgcmVxdWVzdCBsaWJyYXJ5IGluc3RhbmNlLCBpZiBhIGN1c3RvbSBvbmUgaGFzIG5vdCBiZWVuIHNldC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0UmVxdWVzdExpYnJhcnkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmVxdWVzdE1vZHVsZUluc3RhbmNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXN0b20gSlNPTiBwYXJzZXIgZnVuY3Rpb24gc2V0IGJ5IHBhcnNlUmVzcG9uc2VCb2RpZXNXaXRoIG9yIHRoZVxuICogc3RhbmRhcmQgcGFyc2VyIGZ1bmN0aW9uLCBpZiBhIGN1c3RvbSBvbmUgaGFzIG5vdCBiZWVuIHNldC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0SnNvblBhcnNlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5qc29uUGFyc2VyO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGJvZHkgb2YgdGhlIGxhc3QgcmVzcG9uc2Ugd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYVxuICogSmF2YVNjcmlwdCBvYmplY3QgYmVmb3JlIHBhc3NpbmcgdGhlIHJlc3VsdCBiYWNrIHRvIHRoZSBjYWxsYmFjay5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuY29udmVydHNSZXNwb25zZVRvT2JqZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0RmxhZztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmxhZyBjb250cm9sbGluZyBpZiBVUkxzIGFyZSByZXNvbHZlZCByZWxhdGl2ZSBvciBhYnNvbHV0ZS5cbiAqIEEgcmV0dXJuIHZhbHVlIG9mIHRydWUgbWVhbnMgdGhhdCBVUkxzIGFyZSByZXNvbHZlZCByZWxhdGl2ZSwgZmFsc2UgbWVhbnNcbiAqIGFic29sdXRlLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5kb2VzUmVzb2x2ZVJlbGF0aXZlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnJlc29sdmVSZWxhdGl2ZUZsYWc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZsYWcgY29udHJvbGxpbmcgaWYgZW1iZWRkZWQgcmVzb3VyY2VzIGFyZSBwcmVmZXJyZWQgb3ZlciBsaW5rcy5cbiAqIEEgcmV0dXJuIHZhbHVlIG9mIHRydWUgbWVhbnMgdGhhdCBlbWJlZGRlZCByZXNvdXJjZXMgYXJlIHByZWZlcnJlZCwgZmFsc2VcbiAqIG1lYW5zIHRoYXQgZm9sbG93aW5nIGxpbmtzIGlzIHByZWZlcnJlZC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZG9lc1ByZWZlckVtYmVkZGVkUmVzb3VyY2VzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnByZWZlckVtYmVkZGVkO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgY29udGVudCBuZWdvdGlhdGlvbiBpcyBlbmFibGVkIGFuZCBmYWxzZSBpZiBhIHBhcnRpY3VsYXJcbiAqIG1lZGlhIHR5cGUgaXMgZm9yY2VkLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5kb2VzQ29udGVudE5lZ290aWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmNvbnRlbnROZWdvdGlhdGlvbjtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBwYXNzZXMgdGhlIGxhc3QgSFRUUCByZXNwb25zZSB0byB0aGVcbiAqIGNhbGxiYWNrLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdpbml0aWF0aW5nIHRyYXZlcnNhbCAoZ2V0KScpO1xuICB2YXIgdCA9IGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZSh0aGlzKTtcbiAgcmV0dXJuIGFjdGlvbnMuZ2V0KHQsIHdyYXBGb3JDb250aW51ZSh0aGlzLCB0LCBjYWxsYmFjaywgJ2dldCcpKTtcbn07XG5cbi8qKlxuICogU3BlY2lhbCB2YXJpYW50IG9mIGdldCgpIHRoYXQgZG9lcyBub3QgeWllbGQgdGhlIGZ1bGwgaHR0cCByZXNwb25zZSB0byB0aGVcbiAqIGNhbGxiYWNrIGJ1dCBpbnN0ZWFkIHRoZSBhbHJlYWR5IHBhcnNlZCBKU09OIGFzIGFuIG9iamVjdC5cbiAqXG4gKiBUaGlzIGlzIGEgc2hvcnRjdXQgZm9yIGJ1aWxkZXIuY29udmVydFJlc3BvbnNlVG9PYmplY3QoKS5nZXQoY2FsbGJhY2spLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRSZXNvdXJjZSA9IGZ1bmN0aW9uIGdldFJlc291cmNlKGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnaW5pdGlhdGluZyB0cmF2ZXJzYWwgKGdldFJlc291cmNlKScpO1xuICB0aGlzLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0RmxhZyA9IHRydWU7XG4gIHZhciB0ID0gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHRoaXMpO1xuICByZXR1cm4gYWN0aW9ucy5nZXQodCwgd3JhcEZvckNvbnRpbnVlKHRoaXMsIHQsIGNhbGxiYWNrLFxuICAgICAgJ2dldFJlc291cmNlJykpO1xufTtcblxuLyoqXG4gKiBTcGVjaWFsIHZhcmlhbnQgb2YgZ2V0KCkgdGhhdCBkb2VzIG5vdCBleGVjdXRlIHRoZSBsYXN0IHJlcXVlc3QgYnV0IGluc3RlYWRcbiAqIHlpZWxkcyB0aGUgbGFzdCBVUkwgdG8gdGhlIGNhbGxiYWNrLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5nZXRVcmwgPSBmdW5jdGlvbiBnZXRVcmwoY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdpbml0aWF0aW5nIHRyYXZlcnNhbCAoZ2V0VXJsKScpO1xuICB2YXIgdCA9IGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZSh0aGlzKTtcbiAgcmV0dXJuIGFjdGlvbnMuZ2V0VXJsKHQsIHdyYXBGb3JDb250aW51ZSh0aGlzLCB0LCBjYWxsYmFjaywgJ2dldFVybCcpKTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIGdldFVybC5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZ2V0VXJpID0gQnVpbGRlci5wcm90b3R5cGUuZ2V0VXJsO1xuXG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIFBPU1QgcmVxdWVzdCB3aXRoIHRoZVxuICogZ2l2ZW4gYm9keSB0byB0aGUgbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgUE9TVCByZXF1ZXN0IHRvXG4gKiB0aGUgY2FsbGJhY2suXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiBwb3N0KGJvZHksIGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnaW5pdGlhdGluZyB0cmF2ZXJzYWwgKHBvc3QpJyk7XG4gIHZhciB0ID0gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHRoaXMsIGJvZHkpO1xuICByZXR1cm4gYWN0aW9ucy5wb3N0KHQsIHdyYXBGb3JDb250aW51ZSh0aGlzLCB0LCBjYWxsYmFjaywgJ3Bvc3QnKSk7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBQVVQgcmVxdWVzdCB3aXRoIHRoZVxuICogZ2l2ZW4gYm9keSB0byB0aGUgbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgUFVUIHJlcXVlc3QgdG9cbiAqIHRoZSBjYWxsYmFjay5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24gcHV0KGJvZHksIGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnaW5pdGlhdGluZyB0cmF2ZXJzYWwgKHB1dCknKTtcbiAgdmFyIHQgPSBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUodGhpcywgYm9keSk7XG4gIHJldHVybiBhY3Rpb25zLnB1dCh0LCB3cmFwRm9yQ29udGludWUodGhpcywgdCwgY2FsbGJhY2ssICdwdXQnKSk7XG59O1xuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2VzcyBhbmQgc2VuZHMgYW4gSFRUUCBQQVRDSCByZXF1ZXN0IHdpdGggdGhlXG4gKiBnaXZlbiBib2R5IHRvIHRoZSBsYXN0IFVSTC4gUGFzc2VzIHRoZSBIVFRQIHJlc3BvbnNlIG9mIHRoZSBQQVRDSCByZXF1ZXN0IHRvXG4gKiB0aGUgY2FsbGJhY2suXG4gKi9cbkJ1aWxkZXIucHJvdG90eXBlLnBhdGNoID0gZnVuY3Rpb24gcGF0Y2goYm9keSwgY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdpbml0aWF0aW5nIHRyYXZlcnNhbCAocGF0Y2gpJyk7XG4gIHZhciB0ID0gY3JlYXRlSW5pdGlhbFRyYXZlcnNhbFN0YXRlKHRoaXMsIGJvZHkpO1xuICByZXR1cm4gYWN0aW9ucy5wYXRjaCh0LCB3cmFwRm9yQ29udGludWUodGhpcywgdCwgY2FsbGJhY2ssICdwYXRjaCcpKTtcbn07XG5cbi8qKlxuICogU3RhcnRzIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIGFuZCBzZW5kcyBhbiBIVFRQIERFTEVURSByZXF1ZXN0IHRvIHRoZVxuICogbGFzdCBVUkwuIFBhc3NlcyB0aGUgSFRUUCByZXNwb25zZSBvZiB0aGUgREVMRVRFIHJlcXVlc3QgdG8gdGhlIGNhbGxiYWNrLlxuICovXG5CdWlsZGVyLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiBkZWwoY2FsbGJhY2spIHtcbiAgbG9nLmRlYnVnKCdpbml0aWF0aW5nIHRyYXZlcnNhbCAoZGVsZXRlKScpO1xuICB2YXIgdCA9IGNyZWF0ZUluaXRpYWxUcmF2ZXJzYWxTdGF0ZSh0aGlzKTtcbiAgcmV0dXJuIGFjdGlvbnMuZGVsZXRlKHQsIHdyYXBGb3JDb250aW51ZSh0aGlzLCB0LCBjYWxsYmFjaywgJ2RlbGV0ZScpKTtcbn07XG5cbi8qKlxuICogQWxpYXMgZm9yIGRlbGV0ZS5cbiAqL1xuQnVpbGRlci5wcm90b3R5cGUuZGVsID0gQnVpbGRlci5wcm90b3R5cGUuZGVsZXRlO1xuXG5mdW5jdGlvbiBjcmVhdGVJbml0aWFsVHJhdmVyc2FsU3RhdGUoc2VsZiwgYm9keSkge1xuXG4gIHZhciB0cmF2ZXJzYWxTdGF0ZSA9IHtcbiAgICBhYm9ydGVkOiBmYWxzZSxcbiAgICBhZGFwdGVyOiBzZWxmLmFkYXB0ZXIgfHwgbnVsbCxcbiAgICBib2R5OiBib2R5IHx8IG51bGwsXG4gICAgY2FsbGJhY2tIYXNCZWVuQ2FsbGVkQWZ0ZXJBYm9ydDogZmFsc2UsXG4gICAgY29udGVudE5lZ290aWF0aW9uOiBzZWxmLmRvZXNDb250ZW50TmVnb3RpYXRpb24oKSxcbiAgICBjb250aW51YXRpb246IG51bGwsXG4gICAgY29udmVydFJlc3BvbnNlVG9PYmplY3Q6IHNlbGYuY29udmVydHNSZXNwb25zZVRvT2JqZWN0KCksXG4gICAgbGlua3M6IHNlbGYubGlua3MsXG4gICAganNvblBhcnNlcjogc2VsZi5nZXRKc29uUGFyc2VyKCksXG4gICAgcmVxdWVzdE1vZHVsZUluc3RhbmNlOiBzZWxmLmdldFJlcXVlc3RMaWJyYXJ5KCksXG4gICAgcmVxdWVzdE9wdGlvbnM6IHNlbGYuZ2V0UmVxdWVzdE9wdGlvbnMoKSxcbiAgICByZXNvbHZlUmVsYXRpdmU6IHNlbGYuZG9lc1Jlc29sdmVSZWxhdGl2ZSgpLFxuICAgIHByZWZlckVtYmVkZGVkOiBzZWxmLmRvZXNQcmVmZXJFbWJlZGRlZFJlc291cmNlcygpLFxuICAgIHN0YXJ0VXJsOiBzZWxmLnN0YXJ0VXJsLFxuICAgIHN0ZXAgOiB7XG4gICAgICB1cmw6IHNlbGYuc3RhcnRVcmwsXG4gICAgICBpbmRleDogMCxcbiAgICB9LFxuICAgIHRlbXBsYXRlUGFyYW1ldGVyczogc2VsZi5nZXRUZW1wbGF0ZVBhcmFtZXRlcnMoKSxcbiAgfTtcbiAgdHJhdmVyc2FsU3RhdGUuYWJvcnRUcmF2ZXJzYWwgPSBhYm9ydFRyYXZlcnNhbC5iaW5kKHRyYXZlcnNhbFN0YXRlKTtcblxuICBpZiAoc2VsZi5jb250aW51YXRpb24pIHtcbiAgICB0cmF2ZXJzYWxTdGF0ZS5jb250aW51YXRpb24gPSBzZWxmLmNvbnRpbnVhdGlvbjtcbiAgICB0cmF2ZXJzYWxTdGF0ZS5zdGVwID0gc2VsZi5jb250aW51YXRpb24uc3RlcDtcbiAgICBzZWxmLmNvbnRpbnVhdGlvbiA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gdHJhdmVyc2FsU3RhdGU7XG59XG5cbmZ1bmN0aW9uIHdyYXBGb3JDb250aW51ZShzZWxmLCB0LCBjYWxsYmFjaywgZmlyc3RUcmF2ZXJzYWxBY3Rpb24pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycikgeyByZXR1cm4gY2FsbGJhY2soZXJyKTsgfVxuICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXN1bHQsIHtcbiAgICAgIGNvbnRpbnVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdubyB0cmF2ZXJzYWwgc3RhdGUgdG8gY29udGludWUgZnJvbS4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5kZWJ1ZygnPiBjb250aW51aW5nIGZpbmlzaGVkIHRyYXZlcnNhbCBwcm9jZXNzJyk7XG4gICAgICAgIHNlbGYuY29udGludWF0aW9uID0ge1xuICAgICAgICAgIHN0ZXA6IHQuc3RlcCxcbiAgICAgICAgICBhY3Rpb246IGZpcnN0VHJhdmVyc2FsQWN0aW9uLFxuICAgICAgICB9O1xuICAgICAgICBzZWxmLmNvbnRpbnVhdGlvbi5zdGVwLmluZGV4ID0gMDtcbiAgICAgICAgaW5pdEZyb21UcmF2ZXJzYWxTdGF0ZShzZWxmLCB0KTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xufVxuXG4vKlxuICogQ29weSBjb25maWd1cmF0aW9uIGZyb20gdHJhdmVyc2FsIHN0YXRlIHRvIGJ1aWxkZXIgaW5zdGFuY2UgdG9cbiAqIHByZXBhcmUgZm9yIG5leHQgdHJhdmVyc2FsIHByb2Nlc3MuXG4gKi9cbmZ1bmN0aW9uIGluaXRGcm9tVHJhdmVyc2FsU3RhdGUoc2VsZiwgdCkge1xuICBzZWxmLmFib3J0ZWQgPSBmYWxzZTtcbiAgc2VsZi5hZGFwdGVyID0gdC5hZGFwdGVyO1xuICBzZWxmLmJvZHkgPSB0LmJvZHk7XG4gIHNlbGYuY2FsbGJhY2tIYXNCZWVuQ2FsbGVkQWZ0ZXJBYm9ydCA9IGZhbHNlO1xuICBzZWxmLmNvbnRlbnROZWdvdGlhdGlvbiA9IHQuY29udGVudE5lZ290aWF0aW9uO1xuICBzZWxmLmNvbnZlcnRSZXNwb25zZVRvT2JqZWN0RmxhZyA9IHQuY29udmVydFJlc3BvbnNlVG9PYmplY3Q7XG4gIHNlbGYubGlua3MgPSBbXTtcbiAgc2VsZi5qc29uUGFyc2VyID0gIHQuanNvblBhcnNlcjtcbiAgc2VsZi5yZXF1ZXN0TW9kdWxlSW5zdGFuY2UgPSB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZSxcbiAgc2VsZi5yZXF1ZXN0T3B0aW9ucyA9IHQucmVxdWVzdE9wdGlvbnMsXG4gIHNlbGYucmVzb2x2ZVJlbGF0aXZlRmxhZyA9IHQucmVzb2x2ZVJlbGF0aXZlO1xuICBzZWxmLnByZWZlckVtYmVkZGVkID0gdC5wcmVmZXJFbWJlZGRlZDtcbiAgc2VsZi5zdGFydFVybCA9IHQuc3RhcnRVcmw7XG4gIHNlbGYudGVtcGxhdGVQYXJhbWV0ZXJzID0gdC50ZW1wbGF0ZVBhcmFtZXRlcnM7XG59XG5cbmZ1bmN0aW9uIGNsb25lQXJyYXlPck9iamVjdCh0aGluZykge1xuICBpZiAodXRpbC5pc0FycmF5KHRoaW5nKSkge1xuICAgIHJldHVybiBzaGFsbG93Q2xvbmVBcnJheSh0aGluZyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHRoaW5nID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBkZWVwQ2xvbmVPYmplY3QodGhpbmcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWVwQ2xvbmVPYmplY3Qob2JqZWN0KSB7XG4gIHJldHVybiBtZXJnZVJlY3Vyc2l2ZShudWxsLCBvYmplY3QpO1xufVxuXG5mdW5jdGlvbiBzaGFsbG93Q2xvbmVBcnJheShhcnJheSkge1xuICBpZiAoIWFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG4gIHJldHVybiBhcnJheS5zbGljZSgwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWlsZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi9hYm9ydF90cmF2ZXJzYWwnKVxuICAsIGRldGVjdENvbnRlbnRUeXBlID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2RldGVjdF9jb250ZW50X3R5cGUnKVxuICAsIGdldE9wdGlvbnNGb3JTdGVwID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2dldF9vcHRpb25zX2Zvcl9zdGVwJyk7XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBIVFRQIEdFVCByZXF1ZXN0IGR1cmluZyB0aGUgbGluayB0cmF2ZXJzYWwgcHJvY2Vzcy5cbiAqL1xuLy8gVGhpcyBtZXRob2QgaXMgY3VycmVudGx5IHVzZWQgZm9yIGFsbCBpbnRlcm1lZGlhdGUgR0VUIHJlcXVlc3RzIGR1cmluZyB0aGVcbi8vIGxpbmsgdHJhdmVyc2FsIHByb2Nlc3MuIENvaW5jaWRlbnRhbGx5LCBpdCBpcyBhbHNvIHVzZWQgZm9yIHRoZSBmaW5hbCByZXF1ZXN0XG4vLyBpbiBhIGxpbmsgdHJhdmVyc2FsIHNob3VsZCB0aGlzIGhhcHBlbiB0byBiZSBhIEdFVCByZXF1ZXN0LiBPdGhlcndpc2UgKFBPU1QvXG4vLyBQVVQvUEFUQ0gvREVMRVRFKSwgVHJhdmVyc29uIHVzZXMgZXhlY3R1ZUh0dHBSZXF1ZXN0LlxuZXhwb3J0cy5mZXRjaFJlc291cmNlID0gZnVuY3Rpb24gZmV0Y2hSZXNvdXJjZSh0LCBjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2ZldGNoaW5nIHJlc291cmNlIGZvciBuZXh0IHN0ZXAnKTtcbiAgaWYgKHQuc3RlcC51cmwpIHtcbiAgICBsb2cuZGVidWcoJ2ZldGNoaW5nIHJlc291cmNlIGZyb20gJywgdC5zdGVwLnVybCk7XG4gICAgcmV0dXJuIGV4ZWN1dGVIdHRwR2V0KHQsIGNhbGxiYWNrKTtcbiAgfSBlbHNlIGlmICh0LnN0ZXAuZG9jKSB7XG4gICAgLy8gVGhlIHN0ZXAgYWxyZWFkeSBoYXMgYW4gYXR0YWNoZWQgcmVzdWx0IGRvY3VtZW50LCBzbyBhbGwgaXMgZmluZSBhbmQgd2VcbiAgICAvLyBjYW4gY2FsbCB0aGUgY2FsbGJhY2sgaW1tZWRpYXRlbHlcbiAgICBsb2cuZGVidWcoJ3Jlc291cmNlIGZvciBuZXh0IHN0ZXAgaGFzIGFscmVhZHkgYmVlbiBmZXRjaGVkLCB1c2luZyAnICtcbiAgICAgICAgJ2VtYmVkZGVkJyk7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICBjYWxsYmFjayhudWxsLCB0KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignQ2FuIG5vdCBwcm9jZXNzIHN0ZXAnKTtcbiAgICAgIGVycm9yLnN0ZXAgPSB0LnN0ZXA7XG4gICAgICBjYWxsYmFjayhlcnJvcik7XG4gICAgfSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4ZWN1dGVIdHRwR2V0KHQsIGNhbGxiYWNrKSB7XG4gIHZhciBvcHRpb25zID0gZ2V0T3B0aW9uc0ZvclN0ZXAodCk7XG4gIGxvZy5kZWJ1ZygnSFRUUCBHRVQgcmVxdWVzdCB0byAnLCB0LnN0ZXAudXJsKTtcbiAgbG9nLmRlYnVnKCdvcHRpb25zICcsIG9wdGlvbnMpO1xuICB0LmN1cnJlbnRSZXF1ZXN0ID1cbiAgICB0LnJlcXVlc3RNb2R1bGVJbnN0YW5jZS5nZXQodC5zdGVwLnVybCwgb3B0aW9ucyxcbiAgICAgICAgZnVuY3Rpb24oZXJyLCByZXNwb25zZSwgYm9keSkge1xuICAgIGxvZy5kZWJ1ZygnSFRUUCBHRVQgcmVxdWVzdCB0byAnICsgdC5zdGVwLnVybCArICcgcmV0dXJuZWQnKTtcbiAgICB0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcblxuICAgIC8vIHdvcmthcm91bmQgZm9yIGNhc2VzIHdoZXJlIHJlc3BvbnNlIGJvZHkgaXMgZW1wdHkgYnV0IGJvZHkgY29tZXMgaW4gYXNcbiAgICAvLyB0aGUgdGhpcmQgYXJndW1lbnRcbiAgICBpZiAoYm9keSAmJiAhcmVzcG9uc2UuYm9keSkge1xuICAgICAgcmVzcG9uc2UuYm9keSA9IGJvZHk7XG4gICAgfVxuICAgIHQuc3RlcC5yZXNwb25zZSA9IHJlc3BvbnNlO1xuXG4gICAgaWYgKGVycikge1xuICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCB0KTtcbiAgICB9XG4gICAgbG9nLmRlYnVnKCdyZXF1ZXN0IHRvICcgKyB0LnN0ZXAudXJsICsgJyBmaW5pc2hlZCB3aXRob3V0IGVycm9yICgnICtcbiAgICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgKyAnKScpO1xuXG4gICAgaWYgKCFkZXRlY3RDb250ZW50VHlwZSh0LCBjYWxsYmFjaykpIHJldHVybjtcblxuICAgIHJldHVybiBjYWxsYmFjayhudWxsLCB0KTtcbiAgfSk7XG4gIGFib3J0VHJhdmVyc2FsLnJlZ2lzdGVyQWJvcnRMaXN0ZW5lcih0LCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYW4gYXJiaXRyYXJ5IEhUVFAgcmVxdWVzdC5cbiAqL1xuLy8gVGhpcyBtZXRob2QgaXMgY3VycmVudGx5IHVzZWQgZm9yIFBPU1QvUFVUL1BBVENIL0RFTEVURSBhdCB0aGUgZW5kIG9mIGEgbGlua1xuLy8gdHJhdmVyc2FsIHByb2Nlc3MuIElmIHRoZSBsaW5rIHRyYXZlcnNhbCBwcm9jZXNzIHJlcXVpcmVzIGEgR0VUIGFzIHRoZSBsYXN0XG4vLyByZXF1ZXN0LCBUcmF2ZXJzb24gdXNlcyBleGVjdHVlSHR0cEdldC5cbmV4cG9ydHMuZXhlY3V0ZUh0dHBSZXF1ZXN0ID0gZnVuY3Rpb24odCwgcmVxdWVzdCwgbWV0aG9kLCBjYWxsYmFjaykge1xuICB2YXIgcmVxdWVzdE9wdGlvbnMgPSBnZXRPcHRpb25zRm9yU3RlcCh0KTtcbiAgaWYgKHQuYm9keSkge1xuICAgIHJlcXVlc3RPcHRpb25zLmJvZHkgPSBKU09OLnN0cmluZ2lmeSh0LmJvZHkpO1xuICB9XG5cbiAgbG9nLmRlYnVnKCdIVFRQICcgKyBtZXRob2QubmFtZSArICcgcmVxdWVzdCB0byAnLCB0LnN0ZXAudXJsKTtcbiAgbG9nLmRlYnVnKCdvcHRpb25zICcsIHJlcXVlc3RPcHRpb25zKTtcbiAgdC5jdXJyZW50UmVxdWVzdCA9XG4gICAgbWV0aG9kLmNhbGwocmVxdWVzdCwgdC5zdGVwLnVybCwgcmVxdWVzdE9wdGlvbnMsXG4gICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICBsb2cuZGVidWcoJ0hUVFAgJyArIG1ldGhvZC5uYW1lICsgJyByZXF1ZXN0IHRvICcgKyB0LnN0ZXAudXJsICtcbiAgICAgICcgcmV0dXJuZWQnKTtcbiAgICB0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcblxuICAgIC8vIHdvcmthcm91bmQgZm9yIGNhc2VzIHdoZXJlIHJlc3BvbnNlIGJvZHkgaXMgZW1wdHkgYnV0IGJvZHkgY29tZXMgaW4gYXNcbiAgICAvLyB0aGUgdGhpcmQgYXJndW1lbnRcbiAgICBpZiAoYm9keSAmJiAhcmVzcG9uc2UuYm9keSkge1xuICAgICAgcmVzcG9uc2UuYm9keSA9IGJvZHk7XG4gICAgfVxuICAgIHQuc3RlcC5yZXNwb25zZSA9IHJlc3BvbnNlO1xuXG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcbiAgfSk7XG4gIGFib3J0VHJhdmVyc2FsLnJlZ2lzdGVyQWJvcnRMaXN0ZW5lcih0LCBjYWxsYmFjayk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ29udGludWF0aW9uKHQpIHtcbiAgcmV0dXJuIHQuY29udGludWF0aW9uICYmIHQuc3RlcCAmJiB0LnN0ZXAucmVzcG9uc2U7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIganNvbnBhdGhMaWIgPSByZXF1aXJlKCdKU09OUGF0aCcpXG4gICwgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIF9zID0gcmVxdWlyZSgndW5kZXJzY29yZS5zdHJpbmcnKTtcblxudmFyIGpzb25wYXRoID0ganNvbnBhdGhMaWIuZXZhbDtcblxuZnVuY3Rpb24gSnNvbkFkYXB0ZXIobG9nKSB7XG4gIHRoaXMubG9nID0gbG9nO1xufVxuXG5Kc29uQWRhcHRlci5wcm90b3R5cGUuZmluZE5leHRTdGVwID0gZnVuY3Rpb24oZG9jLCBsaW5rKSB7XG4gIHRoaXMubG9nLmRlYnVnKCdleHRyYWN0aW5nIGxpbmsgZnJvbSBkb2MnLCBsaW5rLCBkb2MpO1xuICB2YXIgdXJsO1xuICBpZiAodGhpcy50ZXN0SlNPTlBhdGgobGluaykpIHtcbiAgICByZXR1cm4geyB1cmw6IHRoaXMucmVzb2x2ZUpTT05QYXRoKGxpbmssIGRvYykgfTtcbiAgfSBlbHNlIGlmIChkb2NbbGlua10pIHtcbiAgICByZXR1cm4geyB1cmwgOiBkb2NbbGlua10gfTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHByb3BlcnR5ICcgKyBsaW5rICtcbiAgICAgICAgJyBpbiBkb2N1bWVudDpcXG4nLCBkb2MpO1xuICB9XG59O1xuXG5Kc29uQWRhcHRlci5wcm90b3R5cGUudGVzdEpTT05QYXRoID0gZnVuY3Rpb24obGluaykge1xuICByZXR1cm4gX3Muc3RhcnRzV2l0aChsaW5rLCAnJC4nKSB8fCBfcy5zdGFydHNXaXRoKGxpbmssICckWycpO1xufTtcblxuSnNvbkFkYXB0ZXIucHJvdG90eXBlLnJlc29sdmVKU09OUGF0aCA9IGZ1bmN0aW9uKGxpbmssIGRvYykge1xuICB2YXIgbWF0Y2hlcyA9IGpzb25wYXRoKGRvYywgbGluayk7XG4gIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciB1cmwgPSBtYXRjaGVzWzBdO1xuICAgIGlmICghdXJsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT05QYXRoIGV4cHJlc3Npb24gJyArIGxpbmsgK1xuICAgICAgICAnIHdhcyByZXNvbHZlZCBidXQgdGhlIHJlc3VsdCB3YXMgbnVsbCwgdW5kZWZpbmVkIG9yIGFuIGVtcHR5JyArXG4gICAgICAgICcgc3RyaW5nIGluIGRvY3VtZW50OlxcbicgKyBKU09OLnN0cmluZ2lmeShkb2MpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT05QYXRoIGV4cHJlc3Npb24gJyArIGxpbmsgK1xuICAgICAgICAnIHdhcyByZXNvbHZlZCBidXQgdGhlIHJlc3VsdCBpcyBub3QgYSBwcm9wZXJ0eSBvZiB0eXBlIHN0cmluZy4gJyArXG4gICAgICAgICdJbnN0ZWFkIGl0IGhhcyB0eXBlIFwiJyArICh0eXBlb2YgdXJsKSArXG4gICAgICAgICdcIiBpbiBkb2N1bWVudDpcXG4nICsgSlNPTi5zdHJpbmdpZnkoZG9jKSk7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG4gIH0gZWxzZSBpZiAobWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgLy8gYW1iaWdpb3VzIG1hdGNoXG4gICAgdGhyb3cgbmV3IEVycm9yKCdKU09OUGF0aCBleHByZXNzaW9uICcgKyBsaW5rICtcbiAgICAgICcgcmV0dXJuZWQgbW9yZSB0aGFuIG9uZSBtYXRjaCBpbiBkb2N1bWVudDpcXG4nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KGRvYykpO1xuICB9IGVsc2Uge1xuICAgIC8vIG5vIG1hdGNoIGF0IGFsbFxuICAgIHRocm93IG5ldyBFcnJvcignSlNPTlBhdGggZXhwcmVzc2lvbiAnICsgbGluayArXG4gICAgICAnIHJldHVybmVkIG5vIG1hdGNoIGluIGRvY3VtZW50OlxcbicgKyBKU09OLnN0cmluZ2lmeShkb2MpKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBKc29uQWRhcHRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lZGlhVHlwZXMgPSByZXF1aXJlKCcuL21lZGlhX3R5cGVzJyk7XG5cbnZhciByZWdpc3RyeSA9IHt9O1xuXG5leHBvcnRzLnJlZ2lzdGVyID0gZnVuY3Rpb24gcmVnaXN0ZXIoY29udGVudFR5cGUsIGNvbnN0cnVjdG9yKSB7XG4gIHJlZ2lzdHJ5W2NvbnRlbnRUeXBlXSA9IGNvbnN0cnVjdG9yO1xufTtcblxuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbiBnZXQoY29udGVudFR5cGUpIHtcbiAgcmV0dXJuIHJlZ2lzdHJ5W2NvbnRlbnRUeXBlXTtcbn07XG5cbmV4cG9ydHMucmVnaXN0ZXIobWVkaWFUeXBlcy5DT05URU5UX05FR09USUFUSU9OLFxuICAgIHJlcXVpcmUoJy4vbmVnb3RpYXRpb25fYWRhcHRlcicpKTtcbmV4cG9ydHMucmVnaXN0ZXIobWVkaWFUeXBlcy5KU09OLCByZXF1aXJlKCcuL2pzb25fYWRhcHRlcicpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENPTlRFTlRfTkVHT1RJQVRJT046ICdjb250ZW50LW5lZ290aWF0aW9uJyxcbiAgSlNPTjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICBKU09OX0hBTDogJ2FwcGxpY2F0aW9uL2hhbCtqc29uJyxcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFRPRE8gTWF5YmUgcmVwbGFjZSB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9SYXlub3MveHRlbmRcbi8vIGNoZWNrIGJyb3dzZXIgYnVpbGQgc2l6ZSwgdGhvdWdoLlxuZnVuY3Rpb24gbWVyZ2VSZWN1cnNpdmUob2JqMSwgb2JqMikge1xuICBpZiAoIW9iajEgJiYgb2JqMikge1xuICAgIG9iajEgPSB7fTtcbiAgfVxuICBmb3IgKHZhciBrZXkgaW4gb2JqMikge1xuICAgIGlmICghb2JqMi5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgbWVyZ2Uob2JqMSwgb2JqMiwga2V5KTtcbiAgfVxuICByZXR1cm4gb2JqMTtcbn1cblxuZnVuY3Rpb24gbWVyZ2Uob2JqMSwgb2JqMiwga2V5KSB7XG4gIGlmICh0eXBlb2Ygb2JqMltrZXldID09PSAnb2JqZWN0Jykge1xuICAgIC8vIGlmIGl0IGlzIGFuIG9iamVjdCAodGhhdCBpcywgYSBub24tbGVhdmUgaW4gdGhlIHRyZWUpLFxuICAgIC8vIGFuZCBpdCBpcyBub3QgcHJlc2VudCBpbiBvYmoxXG4gICAgaWYgKCFvYmoxW2tleV0gfHwgdHlwZW9mIG9iajFba2V5XSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIC4uLiB3ZSBjcmVhdGUgYW4gZW1wdHkgb2JqZWN0IGluIG9iajFcbiAgICAgIG9iajFba2V5XSA9IHt9O1xuICAgIH1cbiAgICAvLyBhbmQgd2UgcmVjdXJzZSBkZWVwZXIgaW50byB0aGUgc3RydWN0dXJlXG4gICAgbWVyZ2VSZWN1cnNpdmUob2JqMVtrZXldLCBvYmoyW2tleV0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvYmoyW2tleV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBpZiBpdCBpcyBwcmltaXRpdmUgKHN0cmluZywgbnVtYmVyLCBib29sZWFuKSwgd2Ugb3ZlcndyaXRlL2FkZCBpdCB0b1xuICAgIC8vIG9iajFcbiAgICBvYmoxW2tleV0gPSBvYmoyW2tleV07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtZXJnZVJlY3Vyc2l2ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTmVnb3RpYXRpb25BZGFwdGVyKGxvZykge31cblxuTmVnb3RpYXRpb25BZGFwdGVyLnByb3RvdHlwZS5maW5kTmV4dFN0ZXAgPSBmdW5jdGlvbihkb2MsIGxpbmspIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdDb250ZW50IG5lZ290aWF0aW9uIGRpZCBub3QgaGFwcGVuJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5lZ290aWF0aW9uQWRhcHRlcjtcbiIsIi8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG4vKlxuICogQXBwbGllcyBhc3luYyBhbmQgc3luYyB0cmFuc2Zvcm1zLCBvbmUgYWZ0ZXIgYW5vdGhlci5cbiAqL1xuZnVuY3Rpb24gYXBwbHlUcmFuc2Zvcm1zKHRyYW5zZm9ybXMsIHQsIGNhbGxiYWNrKSB7XG4gIGxvZy5kZWJ1ZygnYXBwbHlpbmcnLCB0cmFuc2Zvcm1zLmxlbmd0aCwgJ3RyYW5zZm9ybXMnKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2Zvcm1zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRyYW5zZm9ybSA9IHRyYW5zZm9ybXNbaV07XG4gICAgbG9nLmRlYnVnKCduZXh0IHRyYW5zZm9ybScsIHRyYW5zZm9ybSk7XG4gICAgaWYgKHRyYW5zZm9ybS5pc0FzeW5jKSB7XG4gICAgICBsb2cuZGVidWcoJ3RyYW5zZm9ybSBpcyBhc3luY2hyb25vdXMnKTtcbiAgICAgIC8vIGFzeW5jaHJvbm91cyBjYXNlXG4gICAgICByZXR1cm4gdHJhbnNmb3JtKHQsIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgLy8gdGhpcyBpcyBvbmx5IGNhbGxlZCB3aGVuIHRoZSBhc3luYyB0cmFuc2Zvcm0gd2FzIHN1Y2Nlc3NmdWwsXG4gICAgICAgIC8vIG90aGVyd2lzZSB0LmNhbGxiYWNrIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkIHdpdGggYW4gZXJyb3IuXG4gICAgICAgIGxvZy5kZWJ1ZygnYXN5bmNocm9ub3VzIHRyYW5zZm9ybSBmaW5pc2hlZCBzdWNjZXNzZnVsbHksIGFwcGx5aW5nICcgK1xuICAgICAgICAgICdyZW1haW5pbmcgdHJhbnNmb3Jtcy4nKTtcbiAgICAgICAgYXBwbHlUcmFuc2Zvcm1zKHRyYW5zZm9ybXMuc2xpY2UoaSArIDEpLCB0LCBjYWxsYmFjayk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nLmRlYnVnKCd0cmFuc2Zvcm0gaXMgc3luY2hyb25vdXMnKTtcbiAgICAgIC8vIHN5bmNocm9ub3VzIGNhc2VcbiAgICAgIHZhciByZXN1bHQgPSB0cmFuc2Zvcm0odCk7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICBsb2cuZGVidWcoJ3RyYW5zZm9ybSBoYXMgZmFpbGVkJyk7XG4gICAgICAgIC8vIHN0b3AgcHJvY2Vzc2luZyB0LmNhbGxiYWNrIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZy5kZWJ1ZygndHJhbnNmb3JtIHN1Y2Nlc3NmdWwnKTtcbiAgICB9XG4gIH1cbiAgbG9nLmRlYnVnKCdhbGwgdHJhbnNmb3JtcyBkb25lJyk7XG4gIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgIGNhbGxiYWNrKHQpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseVRyYW5zZm9ybXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4uL2lzX2NvbnRpbnVhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNoZWNrSHR0cFN0YXR1cyh0KSB7XG4gIC8vIHRoaXMgc3RlcCBpcyBvbW1pdHRlZCBmb3IgY29udGludWF0aW9uc1xuICBpZiAoaXNDb250aW51YXRpb24odCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGxvZy5kZWJ1ZygnY2hlY2tpbmcgaHR0cCBzdGF0dXMnKTtcbiAgaWYgKCF0LnN0ZXAucmVzcG9uc2UgJiYgdC5zdGVwLmRvYykge1xuICAgIC8vIExhc3Qgc3RlcCBwcm9iYWJseSBkaWQgbm90IGV4ZWN1dGUgYSBIVFRQIHJlcXVlc3QgYnV0IHVzZWQgYW4gZW1iZWRkZWRcbiAgICAvLyBkb2N1bWVudC5cbiAgICBsb2cuZGVidWcoJ2ZvdW5kIGVtYmVkZGVkIGRvY3VtZW50LCBhc3N1bWluZyBubyBIVFRQIHJlcXVlc3QgaGFzIGJlZW4gJyArXG4gICAgICAgICdtYWRlJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBPbmx5IHByb2Nlc3MgcmVzcG9uc2UgaWYgaHR0cCBzdGF0dXMgd2FzIGluIDIwMCAtIDI5OSByYW5nZS5cbiAgLy8gVGhlIHJlcXVlc3QgbW9kdWxlIGZvbGxvd3MgcmVkaXJlY3RzIGZvciBHRVQgcmVxdWVzdHMgYWxsIGJ5IGl0c2VsZiwgc29cbiAgLy8gd2Ugc2hvdWxkIG5vdCBoYXZlIHRvIGhhbmRsZSB0aGVtIGhlcmUuIElmIGEgM3h4IGh0dHAgc3RhdHVzIGdldCdzIGhlcmVcbiAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmcuIDR4eCBhbmQgNXh4IG9mIGNvdXJzZSBhbHNvIGluZGljYXRlIGFuIGVycm9yXG4gIC8vIGNvbmRpdGlvbi4gMXh4IHNob3VsZCBub3Qgb2NjdXIuXG4gIHZhciBodHRwU3RhdHVzID0gdC5zdGVwLnJlc3BvbnNlLnN0YXR1c0NvZGU7XG4gIGlmIChodHRwU3RhdHVzICYmIChodHRwU3RhdHVzIDwgMjAwIHx8IGh0dHBTdGF0dXMgPj0gMzAwKSkge1xuICAgIHZhciBlcnJvciA9IGh0dHBFcnJvcih0LnN0ZXAudXJsLCBodHRwU3RhdHVzLCB0LnN0ZXAucmVzcG9uc2UuYm9keSk7XG4gICAgbG9nLmVycm9yKCd1bmV4cGVjdGVkIGh0dHAgc3RhdHVzIGNvZGUnKTtcbiAgICBsb2cuZXJyb3IoZXJyb3IpO1xuICAgIHQuY2FsbGJhY2soZXJyb3IpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBsb2cuZGVidWcoJ2h0dHAgc3RhdHVzIGNvZGUgb2sgKCcgKyBodHRwU3RhdHVzICsgJyknKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBodHRwRXJyb3IodXJsLCBodHRwU3RhdHVzLCBib2R5KSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcignSFRUUCBHRVQgZm9yICcgKyB1cmwgK1xuICAgICAgJyByZXN1bHRlZCBpbiBIVFRQIHN0YXR1cyBjb2RlICcgKyBodHRwU3RhdHVzICsgJy4nKTtcbiAgZXJyb3IubmFtZSA9ICdIVFRQRXJyb3InO1xuICBlcnJvci51cmwgPSB1cmw7XG4gIGVycm9yLmh0dHBTdGF0dXMgPSBodHRwU3RhdHVzO1xuICBlcnJvci5ib2R5ID0gYm9keTtcbiAgdHJ5IHtcbiAgICBlcnJvci5kb2MgPSBKU09OLnBhcnNlKGJvZHkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gaWdub3JlXG4gIH1cbiAgcmV0dXJuIGVycm9yO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuLi9pc19jb250aW51YXRpb24nKTtcblxuLypcbiAqIFRoaXMgdHJhbnNmb3JtIGNvdmVycyB0aGUgY2FzZSBvZiBhIGZvbGxvdygpIGNhbGwgKndpdGhvdXQgYW55IGxpbmtzKiBhZnRlclxuICogYSBjb250aW51ZSgpLiBBY3R1YWxseSwgdGhlcmUgaXMgbm90aGluZyB0byBkbyBoZXJlIHNpbmNlIHdlIHNob3VsZCBoYXZlXG4gKiBmZXRjaGVkIGV2ZXJ5dGhpbmcgbGFzdCB0aW1lLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbnRpbnVhdGlvblRvRG9jKHQpIHtcbiAgaWYgKGlzQ29udGludWF0aW9uKHQpKSB7XG4gICAgbG9nLmRlYnVnKCdjb250aW51aW5nIGZyb20gbGFzdCB0cmF2ZXJzYWwgcHJvY2VzcyAoYWN0aW9ucyknKTtcbiAgICB0LmNvbnRpbnVhdGlvbiA9IG51bGw7XG4gICAgdC5jYWxsYmFjayhudWxsLCB0LnN0ZXAuZG9jKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgY29udmVydEVtYmVkZGVkRG9jVG9SZXNwb25zZSA9XG4gICAgICByZXF1aXJlKCcuL2NvbnZlcnRfZW1iZWRkZWRfZG9jX3RvX3Jlc3BvbnNlJylcbiAgLCBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4uL2lzX2NvbnRpbnVhdGlvbicpO1xuXG4vKlxuICogZm9sbG93KCkgY2FsbCB3aXRob3V0IGxpbmtzIGFmdGVyIGNvbnRpbnVlKCkuIEFjdHVhbGx5LCB0aGVyZSBpcyBub3RoaW5nXG4gKiB0byBkbyBoZXJlIHNpbmNlIHdlIHNob3VsZCBoYXZlIGZldGNoZWQgZXZlcnl0aGluZyBsYXN0IHRpbWUuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29udGludWF0aW9uVG9SZXNwb25zZSh0KSB7XG4gIGlmIChpc0NvbnRpbnVhdGlvbih0KSkge1xuICAgIGxvZy5kZWJ1ZygnY29udGludWluZyBmcm9tIGxhc3QgdHJhdmVyc2FsIHByb2Nlc3MgKGFjdGlvbnMpJyk7XG4gICAgdC5jb250aW51YXRpb24gPSBudWxsO1xuICAgIC8vIEhtLCBhIHRyYW5zZm9ybSB1c2luZyBhbm90aGVyIHRyYW5zZm9ybS4gVGhpcyBmZWVscyBhIGJpdCBmaXNoeS5cbiAgICBjb252ZXJ0RW1iZWRkZWREb2NUb1Jlc3BvbnNlKHQpO1xuICAgIHQuY2FsbGJhY2sobnVsbCwgdC5zdGVwLnJlc3BvbnNlKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbnZlcnRFbWJlZGRlZERvY1RvUmVzcG9uc2UodCkge1xuICBpZiAoIXQuc3RlcC5yZXNwb25zZSAmJiB0LnN0ZXAuZG9jKSB7XG4gICAgbG9nLmRlYnVnKCdmYWtpbmcgSFRUUCByZXNwb25zZSBmb3IgZW1iZWRkZWQgcmVzb3VyY2UnKTtcbiAgICB0LnN0ZXAucmVzcG9uc2UgPSB7XG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh0LnN0ZXAuZG9jKSxcbiAgICAgIHJlbWFyazogJ1RoaXMgaXMgbm90IGFuIGFjdHVhbCBIVFRQIHJlc3BvbnNlLiBUaGUgcmVzb3VyY2UgeW91ICcgK1xuICAgICAgICAncmVxdWVzdGVkIHdhcyBhbiBlbWJlZGRlZCByZXNvdXJjZSwgc28gbm8gSFRUUCByZXF1ZXN0IHdhcyAnICtcbiAgICAgICAgJ21hZGUgdG8gYWNxdWlyZSBpdC4nXG4gICAgfTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbnZhciBtZWRpYVR5cGVSZWdpc3RyeSA9IHJlcXVpcmUoJy4uL21lZGlhX3R5cGVfcmVnaXN0cnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZXRlY3RDb250ZW50VHlwZSh0LCBjYWxsYmFjaykge1xuICBpZiAodC5jb250ZW50TmVnb3RpYXRpb24gJiZcbiAgICAgIHQuc3RlcC5yZXNwb25zZSAmJlxuICAgICAgdC5zdGVwLnJlc3BvbnNlLmhlYWRlcnMgJiZcbiAgICAgIHQuc3RlcC5yZXNwb25zZS5oZWFkZXJzWydjb250ZW50LXR5cGUnXSkge1xuICAgIHZhciBjb250ZW50VHlwZSA9IHQuc3RlcC5yZXNwb25zZS5oZWFkZXJzWydjb250ZW50LXR5cGUnXS5zcGxpdCgvWzsgXS8pWzBdO1xuICAgIHZhciBBZGFwdGVyVHlwZSA9IG1lZGlhVHlwZVJlZ2lzdHJ5LmdldChjb250ZW50VHlwZSk7XG4gICAgaWYgKCFBZGFwdGVyVHlwZSkge1xuICAgICAgY2FsbGJhY2sobmV3IEVycm9yKCdVbmtub3duIGNvbnRlbnQgdHlwZSBmb3IgY29udGVudCAnICtcbiAgICAgICAgICAndHlwZSBkZXRlY3Rpb246ICcgKyBjb250ZW50VHlwZSkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBzd2l0Y2ggdG8gbmV3IEFkYXB0ZXIgZGVwZW5kaW5nIG9uIENvbnRlbnQtVHlwZSBoZWFkZXIgb2Ygc2VydmVyXG4gICAgdC5hZGFwdGVyID0gbmV3IEFkYXB0ZXJUeXBlKGxvZyk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgYWJvcnRUcmF2ZXJzYWwgPSByZXF1aXJlKCcuLi9hYm9ydF90cmF2ZXJzYWwnKVxuICAsIGh0dHBSZXF1ZXN0cyA9IHJlcXVpcmUoJy4uL2h0dHBfcmVxdWVzdHMnKTtcblxuLypcbiAqIEV4ZWN1dGUgdGhlIGxhc3QgSFRUUCByZXF1ZXN0IGluIGEgdHJhdmVyc2FsIHRoYXQgZW5kcyBpblxuICogcG9zdC9wdXQvcGF0Y2gvZGVsZXRlLCBidXQgZG8gbm90IGNhbGwgdC5jYWxsYmFjayBpbW1lZGlhdGVseVxuICogKGJlY2F1c2Ugd2Ugc3RpbGwgbmVlZCB0byBkbyByZXNwb25zZSBib2R5IHRvIG9iamVjdCBjb252ZXJzaW9uXG4gKiBhZnRlcndhcmRzLCBmb3IgZXhhbXBsZSlcbiAqL1xuLy8gVE9ETyBXaHkgaXMgdGhpcyBkaWZmZXJlbnQgZnJvbSB3aGVuIGRvIGEgR0VUP1xuLy8gUHJvYmFibHkgb25seSBiZWNhdXNlIHRoZSBIVFRQIG1ldGhvZCBpcyBjb25maWd1cmFibGUgaGVyZSAod2l0aFxuLy8gdC5sYXN0TWV0aG9kKSwgd2UgbWlnaHQgYmUgYWJsZSB0byB1bmlmeSB0aGlzIHdpdGggdGhlXG4vLyBmZXRjaF9yZXNvdXJjZS9mZXRjaF9sYXN0X3Jlc291cmNlIHRyYW5zZm9ybS5cbmZ1bmN0aW9uIGV4ZWN1dGVMYXN0SHR0cFJlcXVlc3QodCwgY2FsbGJhY2spIHtcbiAgLy8gYWx3YXlzIGNoZWNrIGZvciBhYm9ydGVkIGJlZm9yZSBkb2luZyBhbiBIVFRQIHJlcXVlc3RcbiAgaWYgKHQuYWJvcnRlZCkge1xuICAgIHJldHVybiBhYm9ydFRyYXZlcnNhbC5jYWxsQ2FsbGJhY2tPbkFib3J0KHQpO1xuICB9XG4gIC8vIG9ubHkgZGlmZiB0byBleGVjdXRlX2xhc3RfaHR0cF9yZXF1ZXN0OiBwYXNzIGEgbmV3IGNhbGxiYWNrIGZ1bmN0aW9uXG4gIC8vIGluc3RlYWQgb2YgdC5jYWxsYmFjay5cbiAgaHR0cFJlcXVlc3RzLmV4ZWN1dGVIdHRwUmVxdWVzdChcbiAgICAgIHQsIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLCB0Lmxhc3RNZXRob2QsIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBpZiAoIWVyci5hYm9ydGVkKSB7XG4gICAgICAgIGxvZy5kZWJ1ZygnZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBzdGVwICcsIHQuc3RlcCk7XG4gICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHQuY2FsbGJhY2soZXJyKTtcbiAgICB9XG4gICAgY2FsbGJhY2sodCk7XG4gIH0pO1xufVxuXG5leGVjdXRlTGFzdEh0dHBSZXF1ZXN0LmlzQXN5bmMgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWN1dGVMYXN0SHR0cFJlcXVlc3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBhYm9ydFRyYXZlcnNhbCA9IHJlcXVpcmUoJy4uL2Fib3J0X3RyYXZlcnNhbCcpXG4gICwgaHR0cFJlcXVlc3RzID0gcmVxdWlyZSgnLi4vaHR0cF9yZXF1ZXN0cycpO1xuXG4vKlxuICogRXhlY3V0ZSB0aGUgbGFzdCBodHRwIHJlcXVlc3QgaW4gYSB0cmF2ZXJzYWwgdGhhdCBlbmRzIGluXG4gKiBwb3N0L3B1dC9wYXRjaC9kZWxldGUuXG4gKi9cbi8vIFRPRE8gV2h5IGlzIHRoaXMgZGlmZmVyZW50IGZyb20gd2hlbiBkbyBhIEdFVCBhdCB0aGUgZW5kIG9mIHRoZSB0cmF2ZXJzYWw/XG4vLyBQcm9iYWJseSBvbmx5IGJlY2F1c2UgdGhlIEhUVFAgbWV0aG9kIGlzIGNvbmZpZ3VyYWJsZSBoZXJlICh3aXRoXG4vLyB0Lmxhc3RNZXRob2QpLCB3ZSBtaWdodCBiZSBhYmxlIHRvIHVuaWZ5IHRoaXMgd2l0aCB0aGVcbi8vIGZldGNoX3Jlc291cmNlL2ZldGNoX2xhc3RfcmVzb3VyY2UgdHJhbnNmb3JtLlxuZnVuY3Rpb24gZXhlY3V0ZUxhc3RIdHRwUmVxdWVzdCh0LCBjYWxsYmFjaykge1xuICAvLyBhbHdheXMgY2hlY2sgZm9yIGFib3J0ZWQgYmVmb3JlIGRvaW5nIGFuIEhUVFAgcmVxdWVzdFxuICBpZiAodC5hYm9ydGVkKSB7XG4gICAgcmV0dXJuIGFib3J0VHJhdmVyc2FsLmNhbGxDYWxsYmFja09uQWJvcnQodCk7XG4gIH1cbiAgaHR0cFJlcXVlc3RzLmV4ZWN1dGVIdHRwUmVxdWVzdChcbiAgICAgIHQsIHQucmVxdWVzdE1vZHVsZUluc3RhbmNlLCB0Lmxhc3RNZXRob2QsIHQuY2FsbGJhY2spO1xufVxuXG5leGVjdXRlTGFzdEh0dHBSZXF1ZXN0LmlzQXN5bmMgPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWN1dGVMYXN0SHR0cFJlcXVlc3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJyk7XG5cbi8qXG4gKiBUaGlzIHRyYW5zZm9ybSBpcyBtZWFudCB0byBiZSBydW4gYXQgdGhlIHZlcnkgZW5kIG9mIGEgZ2V0UmVzb3VyY2UgY2FsbC4gSXRcbiAqIGp1c3QgZXh0cmFjdHMgdGhlIGxhc3QgZG9jIGZyb20gdGhlIHN0ZXAgYW5kIGNhbGxzIHQuY2FsbGJhY2sgd2l0aCBpdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRyYWN0RG9jKHQpIHtcbiAgbG9nLmRlYnVnKCd3YWxrZXIud2FsayBoYXMgZmluaXNoZWQnKTtcbiAgLypcbiAgVE9ETyBCcmVha3MgYSBsb3Qgb2YgdGVzdHMgYWx0aG91Z2ggaXQgc2VlbXMgdG8gbWFrZSBwZXJmZWN0IHNlbnNlPyE/XG4gIGlmICghdC5kb2MpIHtcbiAgICB0LmNhbGxiYWNrKG5ldyBFcnJvcignTm8gZG9jdW1lbnQgYXZhaWxhYmxlJykpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAqL1xuICB0LmNhbGxiYWNrKG51bGwsIHQuc3RlcC5kb2MpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxuLypcbiAqIFRoaXMgdHJhbnNmb3JtIGlzIG1lYW50IHRvIGJlIHJ1biBhdCB0aGUgdmVyeSBlbmQgb2YgYSBnZXQvcG9zdC9wdXQvcGF0Y2gvXG4gKiBkZWxldGUgY2FsbC4gSXQganVzdCBleHRyYWN0cyB0aGUgbGFzdCByZXNwb25zZSBmcm9tIHRoZSBzdGVwIGFuZCBjYWxsc1xuICogdC5jYWxsYmFjayB3aXRoIGl0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dHJhY3REb2ModCkge1xuICBsb2cuZGVidWcoJ3dhbGtlci53YWxrIGhhcyBmaW5pc2hlZCcpO1xuICAvKlxuICBUT0RPIEJyZWFrcyBhIGxvdCBvZiB0ZXN0cyBhbHRob3VnaCBpdCBzZWVtcyB0byBtYWtlIHBlcmZlY3Qgc2Vuc2U/IT9cbiAgaWYgKCF0LnJlc3BvbnNlKSB7XG4gICAgdC5jYWxsYmFjayhuZXcgRXJyb3IoJ05vIHJlc3BvbnNlIGF2YWlsYWJsZScpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgKi9cbiAgdC5jYWxsYmFjayhudWxsLCB0LnN0ZXAucmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuXG4vKlxuICogVGhpcyB0cmFuc2Zvcm0gaXMgbWVhbnQgdG8gYmUgcnVuIGF0IHRoZSB2ZXJ5IGVuZCBvZiBhIGdldC9wb3N0L3B1dC9wYXRjaC9cbiAqIGRlbGV0ZSBjYWxsLiBJdCBqdXN0IGV4dHJhY3RzIHRoZSBsYXN0IGFjY2Vzc2VkIHVybCBmcm9tIHRoZSBzdGVwIGFuZCBjYWxsc1xuICogdC5jYWxsYmFjayB3aXRoIGl0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dHJhY3REb2ModCkge1xuICBsb2cuZGVidWcoJ3dhbGtlci53YWxrIGhhcyBmaW5pc2hlZCcpO1xuICBpZiAodC5zdGVwLnVybCkge1xuICAgIHJldHVybiB0LmNhbGxiYWNrKG51bGwsIHQuc3RlcC51cmwpO1xuICB9IGVsc2UgaWYgKHQuc3RlcC5kb2MgJiZcbiAgICAvLyBUT0RPIGFjdHVhbGx5IHRoaXMgaXMgdmVyeSBIQUwgc3BlY2lmaWMgOi0vXG4gICAgdC5zdGVwLmRvYy5fbGlua3MgJiZcbiAgICB0LnN0ZXAuZG9jLl9saW5rcy5zZWxmICYmXG4gICAgdC5zdGVwLmRvYy5fbGlua3Muc2VsZi5ocmVmKSB7XG4gICAgcmV0dXJuIHQuY2FsbGJhY2soXG4gICAgICAgIG51bGwsIHVybC5yZXNvbHZlKHQuc3RhcnRVcmwsIHQuc3RlcC5kb2MuX2xpbmtzLnNlbGYuaHJlZikpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0LmNhbGxiYWNrKG5ldyBFcnJvcignWW91IHJlcXVlc3RlZCBhbiBVUkwgYnV0IHRoZSBsYXN0ICcgK1xuICAgICAgICAncmVzb3VyY2UgaXMgYW4gZW1iZWRkZWQgcmVzb3VyY2UgYW5kIGhhcyBubyBVUkwgb2YgaXRzIG93biAnICtcbiAgICAgICAgJyh0aGF0IGlzLCBpdCBoYXMgbm8gbGluayB3aXRoIHJlbD1cXFwic2VsZlxcXCInKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFRPRE8gT25seSBkaWZmZXJlbmNlIHRvIGxpYi90cmFuc2Zvcm0vZmV0Y2hfcmVzb3VyY2UgaXMgdGhlIGNvbnRpbnVhdGlvblxuLy8gY2hlY2tpbmcsIHdoaWNoIGlzIG1pc3NpbmcgaGVyZS4gTWF5YmUgd2UgY2FuIGRlbGV0ZSB0aGlzIHRyYW5zZm9ybSBhbmQgdXNlXG4vLyBmZXRjaF9yZXNvdXJjZSBpbiBpdHMgcGxhY2UgZXZlcnl3aGVyZT9cblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi4vYWJvcnRfdHJhdmVyc2FsJylcbiAgLCBodHRwUmVxdWVzdHMgPSByZXF1aXJlKCcuLi9odHRwX3JlcXVlc3RzJyk7XG5cbi8qXG4gKiBFeGVjdXRlIHRoZSBsYXN0IHN0ZXAgaW4gYSB0cmF2ZXJzYWwgdGhhdCBlbmRzIHdpdGggYW4gSFRUUCBHRVQuXG4gKi9cbi8vIFRoaXMgaXMgc2ltaWxhciB0byBsaWIvdHJhbnNmb3Jtcy9mZXRjaF9yZXNvdXJjZS5qcyAtIHJlZmFjdG9yaW5nIHBvdGVudGlhbD9cbmZ1bmN0aW9uIGZldGNoTGFzdFJlc291cmNlKHQsIGNhbGxiYWNrKSB7XG4gIC8vIGFsd2F5cyBjaGVjayBmb3IgYWJvcnRlZCBiZWZvcmUgZG9pbmcgYW4gSFRUUCByZXF1ZXN0XG4gIGlmICh0LmFib3J0ZWQpIHtcbiAgICByZXR1cm4gYWJvcnRUcmF2ZXJzYWwuY2FsbENhbGxiYWNrT25BYm9ydCh0KTtcbiAgfVxuICBodHRwUmVxdWVzdHMuZmV0Y2hSZXNvdXJjZSh0LCBmdW5jdGlvbihlcnIsIHQpIHtcbiAgICBsb2cuZGVidWcoJ2ZldGNoUmVzb3VyY2UgcmV0dXJuZWQgKGZldGNoTGFzdFJlc291cmNlKS4nKTtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBpZiAoIWVyci5hYm9ydGVkKSB7XG4gICAgICAgIGxvZy5kZWJ1ZygnZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBzdGVwICcsIHQuc3RlcCk7XG4gICAgICAgIGxvZy5lcnJvcihlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHQuY2FsbGJhY2soZXJyKTtcbiAgICB9XG4gICAgY2FsbGJhY2sodCk7XG4gIH0pO1xufVxuXG5mZXRjaExhc3RSZXNvdXJjZS5pc0FzeW5jID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmZXRjaExhc3RSZXNvdXJjZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi4vYWJvcnRfdHJhdmVyc2FsJylcbiAgLCBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4uL2lzX2NvbnRpbnVhdGlvbicpXG4gICwgaHR0cFJlcXVlc3RzID0gcmVxdWlyZSgnLi4vaHR0cF9yZXF1ZXN0cycpO1xuXG4vKlxuICogRXhlY3V0ZSB0aGUgbmV4dCBzdGVwIGluIHRoZSB0cmF2ZXJzYWwuIEluIG1vc3QgY2FzZXMgdGhhdCBpcyBhbiBIVFRQIGdldCB0b1xuICp0aGUgbmV4dCBVUkwuXG4gKi9cblxuZnVuY3Rpb24gZmV0Y2hSZXNvdXJjZSh0LCBjYWxsYmFjaykge1xuICBpZiAoaXNDb250aW51YXRpb24odCkpIHtcbiAgICBjb252ZXJ0Q29udGludWF0aW9uKHQsIGNhbGxiYWNrKTtcbiAgfSBlbHNlIHtcbiAgICBmZXRjaFZpYUh0dHAodCwgY2FsbGJhY2spO1xuICB9XG59XG5cbmZldGNoUmVzb3VyY2UuaXNBc3luYyA9IHRydWU7XG5cbi8qXG4gKiBUaGlzIGlzIGEgY29udGludWF0aW9uIG9mIGFuIGVhcmxpZXIgdHJhdmVyc2FsIHByb2Nlc3MuXG4gKiBXZSBuZWVkIHRvIHNob3J0Y3V0IHRvIHRoZSBuZXh0IHN0ZXAgKHdpdGhvdXQgZXhlY3V0aW5nIHRoZSBmaW5hbCBIVFRQXG4gKiByZXF1ZXN0IG9mIHRoZSBsYXN0IHRyYXZlcnNhbCBhZ2Fpbi5cbiAqL1xuZnVuY3Rpb24gY29udmVydENvbnRpbnVhdGlvbih0LCBjYWxsYmFjaykge1xuICBsb2cuZGVidWcoJ2NvbnRpbnVpbmcgZnJvbSBsYXN0IHRyYXZlcnNhbCBwcm9jZXNzICh3YWxrZXIpJyk7XG4gIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7IC8vIGRlLXphbGdvIGNvbnRpbnVhdGlvbnNcbiAgICBjYWxsYmFjayh0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGZldGNoVmlhSHR0cCh0LCBjYWxsYmFjaykge1xuICAvLyBhbHdheXMgY2hlY2sgZm9yIGFib3J0ZWQgYmVmb3JlIGRvaW5nIGFuIEhUVFAgcmVxdWVzdFxuICBpZiAodC5hYm9ydGVkKSB7XG4gICAgcmV0dXJuIGFib3J0VHJhdmVyc2FsLmNhbGxDYWxsYmFja09uQWJvcnQodCk7XG4gIH1cbiAgaHR0cFJlcXVlc3RzLmZldGNoUmVzb3VyY2UodCwgZnVuY3Rpb24oZXJyLCB0KSB7XG4gICAgbG9nLmRlYnVnKCdmZXRjaFJlc291cmNlIHJldHVybmVkJyk7XG4gICAgaWYgKGVycikge1xuICAgICAgaWYgKCFlcnIuYWJvcnRlZCkge1xuICAgICAgICBsb2cuZGVidWcoJ2Vycm9yIHdoaWxlIHByb2Nlc3Npbmcgc3RlcCAnLCB0LnN0ZXApO1xuICAgICAgICBsb2cuZXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0LmNhbGxiYWNrKGVycik7XG4gICAgfVxuICAgIGNhbGxiYWNrKHQpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmZXRjaFJlc291cmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPcHRpb25zRm9yU3RlcCh0KSB7XG4gIHZhciBvcHRpb25zID0gdC5yZXF1ZXN0T3B0aW9ucztcbiAgaWYgKHV0aWwuaXNBcnJheSh0LnJlcXVlc3RPcHRpb25zKSkge1xuICAgIG9wdGlvbnMgPSB0LnJlcXVlc3RPcHRpb25zW3Quc3RlcC5pbmRleF0gfHwge307XG4gIH1cbiAgbG9nLmRlYnVnKCdvcHRpb25zOiAnLCBvcHRpb25zKTtcbiAgcmV0dXJuIG9wdGlvbnM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgaXNDb250aW51YXRpb24gPSByZXF1aXJlKCcuLi9pc19jb250aW51YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZSh0KSB7XG4gIC8vIFRPRE8gRHVwbGljYXRlZCBpbiBhY3Rpb25zI2FmdGVyR2V0UmVzb3VyY2UgZXRjLlxuICAvLyB0aGlzIHN0ZXAgaXMgb21taXR0ZWQgZm9yIGNvbnRpbnVhdGlvbnMgdGhhdCBwYXJzZSBhdCB0aGUgZW5kXG4gIGlmIChpc0NvbnRpbnVhdGlvbih0KSkge1xuICAgIGxvZy5kZWJ1ZygnY29udGludWluZyBmcm9tIGxhc3QgdHJhdmVyc2FsIHByb2Nlc3MgKHRyYW5zZm9ybXMvcGFyc2UpJyk7XG4gICAgLy8gaWYgbGFzdCB0cmF2ZXJzYWwgZGlkIGEgcGFyc2UgYXQgdGhlIGVuZCB3ZSBkbyBub3QgbmVlZCB0byBwYXJzZSBhZ2FpblxuICAgIC8vICh0aGlzIGNvbmRpdGlvbiB3aWxsIG5lZWQgdG8gY2hhbmdlIHdpdGhcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYmFzdGkxMzAyL3RyYXZlcnNvbi9pc3N1ZXMvNDQpXG4gICAgaWYgKHQuY29udGludWF0aW9uLmFjdGlvbiA9PT0gJ2dldFJlc291cmNlJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIGlmICh0LnN0ZXAuZG9jKSB7XG4gICAgLy8gTGFzdCBzdGVwIHByb2JhYmx5IGRpZCBub3QgZXhlY3V0ZSBhIEhUVFAgcmVxdWVzdCBidXQgdXNlZCBhbiBlbWJlZGRlZFxuICAgIC8vIGRvY3VtZW50LlxuICAgIGxvZy5kZWJ1Zygnbm8gcGFyc2luZyBuZWNlc3NhcnksIHByb2JhYmx5IGFuIGVtYmVkZGVkIGRvY3VtZW50Jyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB0cnkge1xuICAgIGxvZy5kZWJ1ZygncGFyc2luZyByZXNwb25zZSBib2R5Jyk7XG4gICAgdC5zdGVwLmRvYyA9IHQuanNvblBhcnNlcih0LnN0ZXAucmVzcG9uc2UuYm9keSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgZXJyb3IgPSBlO1xuICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgIGVycm9yID0ganNvbkVycm9yKHQuc3RlcC51cmwsIHQuc3RlcC5yZXNwb25zZS5ib2R5KTtcbiAgICB9XG4gICAgbG9nLmVycm9yKCdwYXJzaW5nIGZhaWxlZCcpO1xuICAgIGxvZy5lcnJvcihlcnJvcik7XG4gICAgdC5jYWxsYmFjayhlcnJvcik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBqc29uRXJyb3IodXJsLCBib2R5KSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcignVGhlIGRvY3VtZW50IGF0ICcgKyB1cmwgK1xuICAgICAgJyBjb3VsZCBub3QgYmUgcGFyc2VkIGFzIEpTT046ICcgKyBib2R5KTtcbiAgZXJyb3IubmFtZSA9ICdKU09ORXJyb3InO1xuICBlcnJvci51cmwgPSB1cmw7XG4gIGVycm9yLmJvZHkgPSBib2R5O1xuICByZXR1cm4gZXJyb3I7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4uL2lzX2NvbnRpbnVhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlc2V0TGFzdFN0ZXAodCkge1xuICAvLyB0aGlzIHN0ZXAgaXMgb21taXR0ZWQgZm9yIGNvbnRpbnVhdGlvbnNcbiAgaWYgKGlzQ29udGludWF0aW9uKHQpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB0LmNvbnRpbnVhdGlvbiA9IG51bGw7XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQ29udGludWF0aW9uID0gcmVxdWlyZSgnLi4vaXNfY29udGludWF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVzZXRMYXN0U3RlcCh0KSB7XG4gIC8vIHRoaXMgc3RlcCBpcyBvbW1pdHRlZCBmb3IgY29udGludWF0aW9uc1xuICBpZiAoaXNDb250aW51YXRpb24odCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHQubGFzdFN0ZXAgPSBudWxsO1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtaW5pbG9nID0gcmVxdWlyZSgnbWluaWxvZycpXG4gICwgbG9nID0gbWluaWxvZygndHJhdmVyc29uJylcbiAgLCBfcyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUuc3RyaW5nJylcbiAgLCB1cmwgPSByZXF1aXJlKCd1cmwnKTtcblxudmFyIHByb3RvY29sUmVnRXggPSAvaHR0cHM/OlxcL1xcLy9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlc29sdmVOZXh0VXJsKHQpIHtcbiAgaWYgKHQuc3RlcC51cmwpIHtcbiAgICBpZiAodC5zdGVwLnVybC5zZWFyY2gocHJvdG9jb2xSZWdFeCkgIT09IDApIHtcbiAgICAgIGxvZy5kZWJ1ZygnZm91bmQgbm9uIGZ1bGwgcXVhbGlmaWVkIFVSTCcpO1xuICAgICAgaWYgKHQucmVzb2x2ZVJlbGF0aXZlICYmIHQubGFzdFN0ZXAgJiYgdC5sYXN0U3RlcC51cmwpIHtcbiAgICAgICAgLy8gZWRnZSBjYXNlOiByZXNvbHZlIFVSTCByZWxhdGl2ZWx5IChvbmx5IHdoZW4gcmVxdWVzdGVkIGJ5IGNsaWVudClcbiAgICAgICAgbG9nLmRlYnVnKCdyZXNvbHZpbmcgVVJMIHJlbGF0aXZlJyk7XG4gICAgICAgIGlmIChfcy5zdGFydHNXaXRoKHQuc3RlcC51cmwsICcvJykgJiZcbiAgICAgICAgICBfcy5lbmRzV2l0aCh0Lmxhc3RTdGVwLnVybCwgJy8nKSkge1xuICAgICAgICAgIHQuc3RlcC51cmwgPSBfcy5zcGxpY2UodC5zdGVwLnVybCwgMCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdC5zdGVwLnVybCA9IHQubGFzdFN0ZXAudXJsICsgdC5zdGVwLnVybDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlZmF1bHQgY2FzZSBhbmQgd2hhdCBoYXBwZW5zIG1vc3QgbGlrZWx5IChub3QgYSBmdWxsXG4gICAgICAgIC8vIHF1YWxpZmllZCBVUkwsIG5vdCByZXNvbHZpbmcgcmVsYXRpdmVseSkgYW5kIHdlIHNpbXBseSB1c2UgTm9kZSdzIHVybFxuICAgICAgICAvLyBtb2R1bGUgKG9yIHRoZSBhcHByb3ByaWF0ZSBzaGltKSBoZXJlLlxuICAgICAgICB0LnN0ZXAudXJsID0gdXJsLnJlc29sdmUodC5zdGFydFVybCwgdC5zdGVwLnVybCk7XG4gICAgICB9XG4gICAgfSAvLyBlZGdlIGNhc2U6IGZ1bGwgcXVhbGlmaWVkIFVSTCAtPiBubyBVUkwgcmVzb2x2aW5nIG5lY2Vzc2FyeVxuICB9IC8vIG5vIHQuc3RlcC51cmwgLT4gbm8gVVJMIHJlc29sdmluZyAoc3RlcCBtaWdodCBjb250YWluIGFuIGVtYmVkZGVkIGRvYylcbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIGxvZyA9IG1pbmlsb2coJ3RyYXZlcnNvbicpXG4gICwgX3MgPSByZXF1aXJlKCd1bmRlcnNjb3JlLnN0cmluZycpXG4gICwgdXJpVGVtcGxhdGUgPSByZXF1aXJlKCd1cmwtdGVtcGxhdGUnKVxuICAsIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVzb2x2ZVVyaVRlbXBsYXRlKHQpIHtcbiAgaWYgKHQuc3RlcC51cmwpIHtcbiAgICAvLyBuZXh0IGxpbmsgZm91bmQgaW4gbGFzdCByZXNwb25zZSwgbWlnaHQgYmUgYSBVUkkgdGVtcGxhdGVcbiAgICB2YXIgdGVtcGxhdGVQYXJhbXMgPSB0LnRlbXBsYXRlUGFyYW1ldGVycztcbiAgICBpZiAodXRpbC5pc0FycmF5KHRlbXBsYXRlUGFyYW1zKSkge1xuICAgICAgLy8gaWYgdGVtcGxhdGUgcGFyYW1zIHdlcmUgZ2l2ZW4gYXMgYW4gYXJyYXksIG9ubHkgdXNlIHRoZSBhcnJheSBlbGVtZW50XG4gICAgICAvLyBmb3IgdGhlIGN1cnJlbnQgaW5kZXggZm9yIFVSSSB0ZW1wbGF0ZSByZXNvbHZpbmcuXG4gICAgICB0ZW1wbGF0ZVBhcmFtcyA9IHRlbXBsYXRlUGFyYW1zW3Quc3RlcC5pbmRleF07XG4gICAgfVxuICAgIHRlbXBsYXRlUGFyYW1zID0gdGVtcGxhdGVQYXJhbXMgfHwge307XG5cbiAgICBpZiAoX3MuY29udGFpbnModC5zdGVwLnVybCwgJ3snKSkge1xuICAgICAgbG9nLmRlYnVnKCdyZXNvbHZpbmcgVVJJIHRlbXBsYXRlJyk7XG4gICAgICB2YXIgdGVtcGxhdGUgPSB1cmlUZW1wbGF0ZS5wYXJzZSh0LnN0ZXAudXJsKTtcbiAgICAgIHZhciByZXNvbHZlZCA9IHRlbXBsYXRlLmV4cGFuZCh0ZW1wbGF0ZVBhcmFtcyk7XG4gICAgICBsb2cuZGVidWcoJ3Jlc29sdmVkIHRvICcsIHJlc29sdmVkKTtcbiAgICAgIHQuc3RlcC51cmwgPSByZXNvbHZlZDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzd2l0Y2hUb05leHRTdGVwKHQpIHtcbiAgLy8gZXh0cmFjdCBuZXh0IGxpbmsgdG8gZm9sbG93IGZyb20gbGFzdCByZXNwb25zZVxuICB2YXIgbGluayA9IHQubGlua3NbdC5zdGVwLmluZGV4XTtcbiAgbG9nLmRlYnVnKCduZXh0IGxpbms6ICcgKyBsaW5rKTtcblxuICAvLyBzYXZlIGxhc3Qgc3RlcCBiZWZvcmUgb3ZlcndyaXRpbmcgaXQgd2l0aCB0aGUgbmV4dCBzdGVwIChyZXF1aXJlZCBmb3JcbiAgLy8gcmVsYXRpdmUgVVJMIHJlc29sdXRpb24sIHdoZXJlIHdlIG5lZWQgdGhlIGxhc3QgVVJMKVxuICB0Lmxhc3RTdGVwID0gdC5zdGVwO1xuXG4gIHQuc3RlcCA9IGZpbmROZXh0U3RlcCh0LCB0Lmxhc3RTdGVwLmRvYywgbGluaywgdC5wcmVmZXJFbWJlZGRlZCk7XG4gIGlmICghdC5zdGVwKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gYmFja3dhcmQgY29tcGF0aWJpbGl0eSBmaXggZm9yIG1lZGlhIHR5cGUgcGx1Zy1pbnMgdXNpbmcgc3RlcC51cmkgaW5zdGVhZFxuICAvLyBvZiBzdGVwLnVybCAodW50aWwgMS4wLjApXG4gIHQuc3RlcC51cmwgPSB0LnN0ZXAudXJsIHx8IHQuc3RlcC51cmk7XG5cbiAgdC5zdGVwLmluZGV4ID0gdC5sYXN0U3RlcC5pbmRleCArIDE7XG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gZmluZE5leHRTdGVwKHQsIGRvYywgbGluaywgcHJlZmVyRW1iZWRkZWQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdC5hZGFwdGVyLmZpbmROZXh0U3RlcChkb2MsIGxpbmssIHByZWZlckVtYmVkZGVkKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGxvZy5lcnJvcignY291bGQgbm90IGZpbmQgbmV4dCBzdGVwJyk7XG4gICAgbG9nLmVycm9yKGUpO1xuICAgIHQuY2FsbGJhY2soZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1pbmlsb2cgPSByZXF1aXJlKCdtaW5pbG9nJylcbiAgLCBsb2cgPSBtaW5pbG9nKCd0cmF2ZXJzb24nKVxuICAsIGFib3J0VHJhdmVyc2FsID0gcmVxdWlyZSgnLi9hYm9ydF90cmF2ZXJzYWwnKVxuICAsIGFwcGx5VHJhbnNmb3JtcyA9IHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9hcHBseV90cmFuc2Zvcm1zJylcbiAgLCBpc0NvbnRpbnVhdGlvbiA9IHJlcXVpcmUoJy4vaXNfY29udGludWF0aW9uJylcbiAgLCByZXNvbHZlVXJpVGVtcGxhdGUgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvcmVzb2x2ZV91cmlfdGVtcGxhdGUnKTtcblxudmFyIHRyYW5zZm9ybXMgPSBbXG4gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9mZXRjaF9yZXNvdXJjZScpLFxuICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvcmVzZXRfbGFzdF9zdGVwJyksXG4gIC8vIGNoZWNrIEhUVFAgc3RhdHVzIGNvZGVcbiAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL2NoZWNrX2h0dHBfc3RhdHVzJyksXG4gIC8vIHBhcnNlIEpTT04gZnJvbSBsYXN0IHJlc3BvbnNlXG4gIHJlcXVpcmUoJy4vdHJhbnNmb3Jtcy9wYXJzZScpLFxuICAvLyByZXRyaWV2ZSBuZXh0IGxpbmsgYW5kIHN3aXRjaCB0byBuZXh0IHN0ZXBcbiAgcmVxdWlyZSgnLi90cmFuc2Zvcm1zL3N3aXRjaF90b19uZXh0X3N0ZXAnKSxcbiAgLy8gVVJJIHRlbXBsYXRlIGhhcyB0byBiZSByZXNvbHZlZCBiZWZvcmUgcG9zdCBwcm9jZXNzaW5nIHRoZSBVUkwsXG4gIC8vIGJlY2F1c2Ugd2UgZG8gdXJsLnJlc29sdmUgd2l0aCBpdCAoaW4ganNvbl9oYWwpIGFuZCB0aGlzIHdvdWxkIFVSTC1cbiAgLy8gZW5jb2RlIGN1cmx5IGJyYWNlcy5cbiAgcmVzb2x2ZVVyaVRlbXBsYXRlLFxuICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvcmVzb2x2ZV9uZXh0X3VybCcpLFxuICByZXF1aXJlKCcuL3RyYW5zZm9ybXMvcmVzZXRfY29udGludWF0aW9uJyksXG5dO1xuXG4vKipcbiAqIFdhbGtzIGZyb20gcmVzb3VyY2UgdG8gcmVzb3VyY2UgYWxvbmcgdGhlIHBhdGggZ2l2ZW4gYnkgdGhlIGxpbmsgcmVsYXRpb25zXG4gKiBmcm9tIHRoaXMubGlua3MgdW50aWwgaXQgaGFzIHJlYWNoZWQgdGhlIGxhc3QgVVJMLiBPbiByZWFjaGluZyB0aGlzLCBpdCBjYWxsc1xuICogdGhlIGdpdmVuIGNhbGxiYWNrIHdpdGggdGhlIGxhc3QgcmVzdWx0aW5nIHN0ZXAuXG4gKi9cbmV4cG9ydHMud2FsayA9IGZ1bmN0aW9uKHQsIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwLCBjYWxsYmFjaykge1xuICAvLyBldmVuIHRoZSByb290IFVSTCBtaWdodCBiZSBhIHRlbXBsYXRlLCBzbyB3ZSBhcHBseSB0aGUgcmVzb2x2ZVVyaVRlbXBsYXRlXG4gIC8vIG9uY2UgYmVmb3JlIHN0YXJ0aW5nIHRoZSB3YWxrLlxuICBpZiAoIXJlc29sdmVVcmlUZW1wbGF0ZSh0KSkgcmV0dXJuO1xuXG4gIC8vIHN0YXJ0cyB0aGUgbGluayByZWwgd2Fsa2luZyBwcm9jZXNzXG4gIGxvZy5kZWJ1Zygnc3RhcnRpbmcgdG8gZm9sbG93IGxpbmtzJyk7XG4gIHRyYW5zZm9ybXNBZnRlckxhc3RTdGVwID0gdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAgfHwgW107XG4gIHQuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgcHJvY2Vzc1N0ZXAodCwgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXApO1xufTtcblxuZnVuY3Rpb24gcHJvY2Vzc1N0ZXAodCwgdHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXApIHtcbiAgbG9nLmRlYnVnKCdwcm9jZXNzaW5nIG5leHQgc3RlcCcpO1xuICBpZiAobW9yZUxpbmtzVG9Gb2xsb3codCkgJiYgIWlzQWJvcnRlZCh0KSkge1xuICAgIGFwcGx5VHJhbnNmb3Jtcyh0cmFuc2Zvcm1zLCB0LCBmdW5jdGlvbih0KSB7XG4gICAgICBsb2cuZGVidWcoJ3N1Y2Nlc3NmdWxseSBwcm9jZXNzZWQgc3RlcCcpO1xuICAgICAgLy8gY2FsbCBwcm9jZXNzU3RlcCByZWN1cnNpdmVseSBhZ2FpbiB0byBmb2xsb3cgbmV4dCBsaW5rXG4gICAgICBwcm9jZXNzU3RlcCh0LCB0cmFuc2Zvcm1zQWZ0ZXJMYXN0U3RlcCk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoaXNBYm9ydGVkKHQpKSB7XG4gICAgcmV0dXJuIGFib3J0VHJhdmVyc2FsLmNhbGxDYWxsYmFja09uQWJvcnQodCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gbGluayBhcnJheSBpcyBleGhhdXN0ZWQsIHdlIGFyZSBkb25lIGFuZCByZXR1cm4gdGhlIGxhc3QgcmVzcG9uc2VcbiAgICAvLyBhbmQgVVJMIHRvIHRoZSBjYWxsYmFjayB0aGUgY2xpZW50IHBhc3NlZCBpbnRvIHRoZSB3YWxrIG1ldGhvZC5cbiAgICBsb2cuZGVidWcoJ2xpbmsgYXJyYXkgZXhoYXVzdGVkJyk7XG5cbiAgICBhcHBseVRyYW5zZm9ybXModHJhbnNmb3Jtc0FmdGVyTGFzdFN0ZXAsIHQsIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiB0LmNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbW9yZUxpbmtzVG9Gb2xsb3codCkge1xuICByZXR1cm4gdC5zdGVwLmluZGV4IDwgdC5saW5rcy5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGlzQWJvcnRlZCh0KSB7XG4gIHJldHVybiB0LmFib3J0ZWQ7XG59XG4iLCIvKiBKU09OUGF0aCAwLjguMCAtIFhQYXRoIGZvciBKU09OXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAwNyBTdGVmYW4gR29lc3NuZXIgKGdvZXNzbmVyLm5ldClcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCAoTUlULUxJQ0VOU0UudHh0KSBsaWNlbmNlLlxyXG4gKi9cclxuXHJcbnZhciBpc05vZGUgPSBmYWxzZTtcclxuKGZ1bmN0aW9uKGV4cG9ydHMsIHJlcXVpcmUpIHtcclxuXHJcbi8vIEtlZXAgY29tcGF0aWJpbGl0eSB3aXRoIG9sZCBicm93c2Vyc1xyXG5pZiAoIUFycmF5LmlzQXJyYXkpIHtcclxuICBBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24odkFyZykge1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2QXJnKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xyXG4gIH07XHJcbn1cclxuXHJcbi8vIE1ha2Ugc3VyZSB0byBrbm93IGlmIHdlIGFyZSBpbiByZWFsIG5vZGUgb3Igbm90ICh0aGUgYHJlcXVpcmVgIHZhcmlhYmxlXHJcbi8vIGNvdWxkIGFjdHVhbGx5IGJlIHJlcXVpcmUuanMsIGZvciBleGFtcGxlLlxyXG52YXIgaXNOb2RlID0gdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgISFtb2R1bGUuZXhwb3J0cztcclxuXHJcbnZhciB2bSA9IGlzTm9kZSA/XHJcbiAgICByZXF1aXJlKCd2bScpIDoge1xyXG4gICAgICBydW5Jbk5ld0NvbnRleHQ6IGZ1bmN0aW9uKGV4cHIsIGNvbnRleHQpIHsgd2l0aCAoY29udGV4dCkgcmV0dXJuIGV2YWwoZXhwcik7IH1cclxuICAgIH07XHJcbmV4cG9ydHMuZXZhbCA9IGpzb25QYXRoO1xyXG5cclxudmFyIGNhY2hlID0ge307XHJcblxyXG5mdW5jdGlvbiBwdXNoKGFyciwgZWxlbSkgeyBhcnIgPSBhcnIuc2xpY2UoKTsgYXJyLnB1c2goZWxlbSk7IHJldHVybiBhcnI7IH1cclxuZnVuY3Rpb24gdW5zaGlmdChlbGVtLCBhcnIpIHsgYXJyID0gYXJyLnNsaWNlKCk7IGFyci51bnNoaWZ0KGVsZW0pOyByZXR1cm4gYXJyOyB9XHJcblxyXG5mdW5jdGlvbiBqc29uUGF0aChvYmosIGV4cHIsIGFyZykge1xyXG4gICB2YXIgUCA9IHtcclxuICAgICAgcmVzdWx0VHlwZTogYXJnICYmIGFyZy5yZXN1bHRUeXBlIHx8IFwiVkFMVUVcIixcclxuICAgICAgZmxhdHRlbjogYXJnICYmIGFyZy5mbGF0dGVuIHx8IGZhbHNlLFxyXG4gICAgICB3cmFwOiAoYXJnICYmIGFyZy5oYXNPd25Qcm9wZXJ0eSgnd3JhcCcpKSA/IGFyZy53cmFwIDogdHJ1ZSxcclxuICAgICAgc2FuZGJveDogKGFyZyAmJiBhcmcuc2FuZGJveCkgPyBhcmcuc2FuZGJveCA6IHt9LFxyXG4gICAgICBub3JtYWxpemU6IGZ1bmN0aW9uKGV4cHIpIHtcclxuICAgICAgICAgaWYgKGNhY2hlW2V4cHJdKSByZXR1cm4gY2FjaGVbZXhwcl07XHJcbiAgICAgICAgIHZhciBzdWJ4ID0gW107XHJcbiAgICAgICAgIHZhciBub3JtYWxpemVkID0gZXhwci5yZXBsYWNlKC9bXFxbJ10oXFw/P1xcKC4qP1xcKSlbXFxdJ10vZywgZnVuY3Rpb24oJDAsJDEpe3JldHVybiBcIlsjXCIrKHN1YngucHVzaCgkMSktMSkrXCJdXCI7fSlcclxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyc/XFwuJz98XFxbJz8vZywgXCI7XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oOyk/KFxcXispKDspPy9nLCBmdW5jdGlvbihfLCBmcm9udCwgdXBzLCBiYWNrKSB7IHJldHVybiAnOycgKyB1cHMuc3BsaXQoJycpLmpvaW4oJzsnKSArICc7JzsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzs7O3w7Oy9nLCBcIjsuLjtcIilcclxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzskfCc/XFxdfCckL2csIFwiXCIpO1xyXG4gICAgICAgICB2YXIgZXhwckxpc3QgPSBub3JtYWxpemVkLnNwbGl0KCc7JykubWFwKGZ1bmN0aW9uKGV4cHIpIHtcclxuICAgICAgICAgICAgdmFyIG1hdGNoID0gZXhwci5tYXRjaCgvIyhbMC05XSspLyk7XHJcbiAgICAgICAgICAgIHJldHVybiAhbWF0Y2ggfHwgIW1hdGNoWzFdID8gZXhwciA6IHN1YnhbbWF0Y2hbMV1dO1xyXG4gICAgICAgICB9KVxyXG4gICAgICAgICByZXR1cm4gY2FjaGVbZXhwcl0gPSBleHByTGlzdDtcclxuICAgICAgfSxcclxuICAgICAgYXNQYXRoOiBmdW5jdGlvbihwYXRoKSB7XHJcbiAgICAgICAgIHZhciB4ID0gcGF0aCwgcCA9IFwiJFwiO1xyXG4gICAgICAgICBmb3IgKHZhciBpPTEsbj14Lmxlbmd0aDsgaTxuOyBpKyspXHJcbiAgICAgICAgICAgIHAgKz0gL15bMC05Kl0rJC8udGVzdCh4W2ldKSA/IChcIltcIit4W2ldK1wiXVwiKSA6IChcIlsnXCIreFtpXStcIiddXCIpO1xyXG4gICAgICAgICByZXR1cm4gcDtcclxuICAgICAgfSxcclxuICAgICAgdHJhY2U6IGZ1bmN0aW9uKGV4cHIsIHZhbCwgcGF0aCkge1xyXG4gICAgICAgICAvLyBubyBleHByIHRvIGZvbGxvdz8gcmV0dXJuIHBhdGggYW5kIHZhbHVlIGFzIHRoZSByZXN1bHQgb2YgdGhpcyB0cmFjZSBicmFuY2hcclxuICAgICAgICAgaWYgKCFleHByLmxlbmd0aCkgcmV0dXJuIFt7cGF0aDogcGF0aCwgdmFsdWU6IHZhbH1dO1xyXG5cclxuICAgICAgICAgdmFyIGxvYyA9IGV4cHJbMF0sIHggPSBleHByLnNsaWNlKDEpO1xyXG4gICAgICAgICAvLyB0aGUgcGFyZW50IHNlbCBjb21wdXRhdGlvbiBpcyBoYW5kbGVkIGluIHRoZSBmcmFtZSBhYm92ZSB1c2luZyB0aGVcclxuICAgICAgICAgLy8gYW5jZXN0b3Igb2JqZWN0IG9mIHZhbFxyXG4gICAgICAgICBpZiAobG9jID09PSAnXicpIHJldHVybiBwYXRoLmxlbmd0aCA/IFt7cGF0aDogcGF0aC5zbGljZSgwLC0xKSwgZXhwcjogeCwgaXNQYXJlbnRTZWxlY3RvcjogdHJ1ZX1dIDogW107XHJcblxyXG4gICAgICAgICAvLyB3ZSBuZWVkIHRvIGdhdGhlciB0aGUgcmV0dXJuIHZhbHVlIG9mIHJlY3Vyc2l2ZSB0cmFjZSBjYWxscyBpbiBvcmRlciB0b1xyXG4gICAgICAgICAvLyBkbyB0aGUgcGFyZW50IHNlbCBjb21wdXRhdGlvbi5cclxuICAgICAgICAgdmFyIHJldCA9IFtdO1xyXG4gICAgICAgICBmdW5jdGlvbiBhZGRSZXQoZWxlbXMpIHsgcmV0ID0gcmV0LmNvbmNhdChlbGVtcyk7IH1cclxuXHJcbiAgICAgICAgIGlmICh2YWwgJiYgdmFsLmhhc093blByb3BlcnR5KGxvYykpIC8vIHNpbXBsZSBjYXNlLCBkaXJlY3RseSBmb2xsb3cgcHJvcGVydHlcclxuICAgICAgICAgICAgYWRkUmV0KFAudHJhY2UoeCwgdmFsW2xvY10sIHB1c2gocGF0aCwgbG9jKSkpO1xyXG4gICAgICAgICBlbHNlIGlmIChsb2MgPT09IFwiKlwiKSB7IC8vIGFueSBwcm9wZXJ0eVxyXG4gICAgICAgICAgICBQLndhbGsobG9jLCB4LCB2YWwsIHBhdGgsIGZ1bmN0aW9uKG0sbCx4LHYscCkge1xyXG4gICAgICAgICAgICAgICBhZGRSZXQoUC50cmFjZSh1bnNoaWZ0KG0sIHgpLCB2LCBwKSk7IH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGVsc2UgaWYgKGxvYyA9PT0gXCIuLlwiKSB7IC8vIGFsbCBjaGlkIHByb3BlcnRpZXNcclxuICAgICAgICAgICAgYWRkUmV0KFAudHJhY2UoeCwgdmFsLCBwYXRoKSk7XHJcbiAgICAgICAgICAgIFAud2Fsayhsb2MsIHgsIHZhbCwgcGF0aCwgZnVuY3Rpb24obSxsLHgsdixwKSB7XHJcbiAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdlttXSA9PT0gXCJvYmplY3RcIilcclxuICAgICAgICAgICAgICAgICAgYWRkUmV0KFAudHJhY2UodW5zaGlmdChcIi4uXCIsIHgpLCB2W21dLCBwdXNoKHAsIG0pKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGVsc2UgaWYgKGxvY1swXSA9PT0gJygnKSB7IC8vIFsoZXhwcildXHJcbiAgICAgICAgICAgIGFkZFJldChQLnRyYWNlKHVuc2hpZnQoUC5ldmFsKGxvYywgdmFsLCBwYXRoW3BhdGgubGVuZ3RoXSwgcGF0aCkseCksIHZhbCwgcGF0aCkpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGVsc2UgaWYgKGxvYy5pbmRleE9mKCc/KCcpID09PSAwKSB7IC8vIFs/KGV4cHIpXVxyXG4gICAgICAgICAgICBQLndhbGsobG9jLCB4LCB2YWwsIHBhdGgsIGZ1bmN0aW9uKG0sbCx4LHYscCkge1xyXG4gICAgICAgICAgICAgICBpZiAoUC5ldmFsKGwucmVwbGFjZSgvXlxcP1xcKCguKj8pXFwpJC8sXCIkMVwiKSx2W21dLG0sIHBhdGgpKVxyXG4gICAgICAgICAgICAgICAgICBhZGRSZXQoUC50cmFjZSh1bnNoaWZ0KG0seCksdixwKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGVsc2UgaWYgKGxvYy5pbmRleE9mKCcsJykgPiAtMSkgeyAvLyBbbmFtZTEsbmFtZTIsLi4uXVxyXG4gICAgICAgICAgICBmb3IgKHZhciBwYXJ0cyA9IGxvYy5zcGxpdCgnLCcpLCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICBhZGRSZXQoUC50cmFjZSh1bnNoaWZ0KHBhcnRzW2ldLCB4KSwgdmFsLCBwYXRoKSk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgZWxzZSBpZiAoL14oLT9bMC05XSopOigtP1swLTldKik6PyhbMC05XSopJC8udGVzdChsb2MpKSB7IC8vIFtzdGFydDplbmQ6c3RlcF0gIHB5dGhvbiBzbGljZSBzeW50YXhcclxuICAgICAgICAgICAgYWRkUmV0KFAuc2xpY2UobG9jLCB4LCB2YWwsIHBhdGgpKTtcclxuICAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gd2UgY2hlY2sgdGhlIHJlc3VsdGluZyB2YWx1ZXMgZm9yIHBhcmVudCBzZWxlY3Rpb25zLiBmb3IgcGFyZW50XHJcbiAgICAgICAgIC8vIHNlbGVjdGlvbnMgd2UgZGlzY2FyZCB0aGUgdmFsdWUgb2JqZWN0IGFuZCBjb250aW51ZSB0aGUgdHJhY2Ugd2l0aCB0aGVcclxuICAgICAgICAgLy8gY3VycmVudCB2YWwgb2JqZWN0XHJcbiAgICAgICAgIHJldHVybiByZXQucmVkdWNlKGZ1bmN0aW9uKGFsbCwgZWEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFsbC5jb25jYXQoZWEuaXNQYXJlbnRTZWxlY3RvciA/IFAudHJhY2UoZWEuZXhwciwgdmFsLCBlYS5wYXRoKSA6IFtlYV0pO1xyXG4gICAgICAgICB9LCBbXSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHdhbGs6IGZ1bmN0aW9uKGxvYywgZXhwciwgdmFsLCBwYXRoLCBmKSB7XHJcbiAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdmFsLmxlbmd0aDsgaSA8IG47IGkrKylcclxuICAgICAgICAgICAgICAgZihpLCBsb2MsIGV4cHIsIHZhbCwgcGF0aCk7XHJcbiAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIpXHJcbiAgICAgICAgICAgIGZvciAodmFyIG0gaW4gdmFsKVxyXG4gICAgICAgICAgICAgICBpZiAodmFsLmhhc093blByb3BlcnR5KG0pKVxyXG4gICAgICAgICAgICAgICAgICBmKG0sIGxvYywgZXhwciwgdmFsLCBwYXRoKTtcclxuICAgICAgfSxcclxuICAgICAgc2xpY2U6IGZ1bmN0aW9uKGxvYywgZXhwciwgdmFsLCBwYXRoKSB7XHJcbiAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWwpKSByZXR1cm47XHJcbiAgICAgICAgIHZhciBsZW4gPSB2YWwubGVuZ3RoLCBwYXJ0cyA9IGxvYy5zcGxpdCgnOicpLFxyXG4gICAgICAgICAgICAgc3RhcnQgPSAocGFydHNbMF0gJiYgcGFyc2VJbnQocGFydHNbMF0pKSB8fCAwLFxyXG4gICAgICAgICAgICAgZW5kID0gKHBhcnRzWzFdICYmIHBhcnNlSW50KHBhcnRzWzFdKSkgfHwgbGVuLFxyXG4gICAgICAgICAgICAgc3RlcCA9IChwYXJ0c1syXSAmJiBwYXJzZUludChwYXJ0c1syXSkpIHx8IDE7XHJcbiAgICAgICAgIHN0YXJ0ID0gKHN0YXJ0IDwgMCkgPyBNYXRoLm1heCgwLHN0YXJ0K2xlbikgOiBNYXRoLm1pbihsZW4sc3RhcnQpO1xyXG4gICAgICAgICBlbmQgICA9IChlbmQgPCAwKSAgID8gTWF0aC5tYXgoMCxlbmQrbGVuKSAgIDogTWF0aC5taW4obGVuLGVuZCk7XHJcbiAgICAgICAgIHZhciByZXQgPSBbXTtcclxuICAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IHN0ZXApXHJcbiAgICAgICAgICAgIHJldCA9IHJldC5jb25jYXQoUC50cmFjZSh1bnNoaWZ0KGksZXhwciksIHZhbCwgcGF0aCkpO1xyXG4gICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgICB9LFxyXG4gICAgICBldmFsOiBmdW5jdGlvbihjb2RlLCBfdiwgX3ZuYW1lLCBwYXRoKSB7XHJcbiAgICAgICAgIGlmICghJCB8fCAhX3YpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgaWYgKGNvZGUuaW5kZXhPZihcIkBwYXRoXCIpID4gLTEpIHtcclxuICAgICAgICAgICAgUC5zYW5kYm94W1wiX3BhdGhcIl0gPSBQLmFzUGF0aChwYXRoLmNvbmNhdChbX3ZuYW1lXSkpO1xyXG4gICAgICAgICAgICBjb2RlID0gY29kZS5yZXBsYWNlKC9AcGF0aC9nLCBcIl9wYXRoXCIpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmIChjb2RlLmluZGV4T2YoXCJAXCIpID4gLTEpIHtcclxuICAgICAgICAgICAgUC5zYW5kYm94W1wiX3ZcIl0gPSBfdjtcclxuICAgICAgICAgICAgY29kZSA9IGNvZGUucmVwbGFjZSgvQC9nLCBcIl92XCIpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gdm0ucnVuSW5OZXdDb250ZXh0KGNvZGUsIFAuc2FuZGJveCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJqc29uUGF0aDogXCIgKyBlLm1lc3NhZ2UgKyBcIjogXCIgKyBjb2RlKTtcclxuICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgIH07XHJcblxyXG4gICB2YXIgJCA9IG9iajtcclxuICAgdmFyIHJlc3VsdFR5cGUgPSBQLnJlc3VsdFR5cGUudG9Mb3dlckNhc2UoKTtcclxuICAgaWYgKGV4cHIgJiYgb2JqICYmIChyZXN1bHRUeXBlID09IFwidmFsdWVcIiB8fCByZXN1bHRUeXBlID09IFwicGF0aFwiKSkge1xyXG4gICAgICB2YXIgZXhwckxpc3QgPSBQLm5vcm1hbGl6ZShleHByKTtcclxuICAgICAgaWYgKGV4cHJMaXN0WzBdID09PSBcIiRcIiAmJiBleHByTGlzdC5sZW5ndGggPiAxKSBleHByTGlzdC5zaGlmdCgpO1xyXG4gICAgICB2YXIgcmVzdWx0ID0gUC50cmFjZShleHByTGlzdCwgb2JqLCBbXCIkXCJdKTtcclxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcihmdW5jdGlvbihlYSkgeyByZXR1cm4gZWEgJiYgIWVhLmlzUGFyZW50U2VsZWN0b3I7IH0pO1xyXG4gICAgICBpZiAoIXJlc3VsdC5sZW5ndGgpIHJldHVybiBQLndyYXAgPyBbXSA6IGZhbHNlO1xyXG4gICAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMSAmJiAhUC53cmFwICYmICFBcnJheS5pc0FycmF5KHJlc3VsdFswXS52YWx1ZSkpIHJldHVybiByZXN1bHRbMF1bcmVzdWx0VHlwZV0gfHwgZmFsc2U7XHJcbiAgICAgIHJldHVybiByZXN1bHQucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgZWEpIHtcclxuICAgICAgICAgdmFyIHZhbE9yUGF0aCA9IGVhW3Jlc3VsdFR5cGVdO1xyXG4gICAgICAgICBpZiAocmVzdWx0VHlwZSA9PT0gJ3BhdGgnKSB2YWxPclBhdGggPSBQLmFzUGF0aCh2YWxPclBhdGgpO1xyXG4gICAgICAgICBpZiAoUC5mbGF0dGVuICYmIEFycmF5LmlzQXJyYXkodmFsT3JQYXRoKSkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHZhbE9yUGF0aCk7XHJcbiAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbE9yUGF0aCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfSwgW10pO1xyXG4gICB9XHJcbn1cclxufSkodHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gdGhpc1snanNvblBhdGgnXSA9IHt9IDogZXhwb3J0cywgdHlwZW9mIHJlcXVpcmUgPT0gXCJ1bmRlZmluZWRcIiA/IG51bGwgOiByZXF1aXJlKTtcclxuIiwiLy8gQ29weXJpZ2h0IDIwMTQgU2ltb24gTHlkZWxsXHJcbi8vIFgxMSAo4oCcTUlU4oCdKSBMaWNlbnNlZC4gKFNlZSBMSUNFTlNFLilcclxuXHJcbnZvaWQgKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcclxuICAgIGRlZmluZShmYWN0b3J5KVxyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpXHJcbiAgfSBlbHNlIHtcclxuICAgIHJvb3QucmVzb2x2ZVVybCA9IGZhY3RvcnkoKVxyXG4gIH1cclxufSh0aGlzLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgZnVuY3Rpb24gcmVzb2x2ZVVybCgvKiAuLi51cmxzICovKSB7XHJcbiAgICB2YXIgbnVtVXJscyA9IGFyZ3VtZW50cy5sZW5ndGhcclxuXHJcbiAgICBpZiAobnVtVXJscyA9PT0gMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXNvbHZlVXJsIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBhcmd1bWVudDsgZ290IG5vbmUuXCIpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGJhc2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYmFzZVwiKVxyXG4gICAgYmFzZS5ocmVmID0gYXJndW1lbnRzWzBdXHJcblxyXG4gICAgaWYgKG51bVVybHMgPT09IDEpIHtcclxuICAgICAgcmV0dXJuIGJhc2UuaHJlZlxyXG4gICAgfVxyXG5cclxuICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdXHJcbiAgICBoZWFkLmluc2VydEJlZm9yZShiYXNlLCBoZWFkLmZpcnN0Q2hpbGQpXHJcblxyXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxyXG4gICAgdmFyIHJlc29sdmVkXHJcblxyXG4gICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IG51bVVybHM7IGluZGV4KyspIHtcclxuICAgICAgYS5ocmVmID0gYXJndW1lbnRzW2luZGV4XVxyXG4gICAgICByZXNvbHZlZCA9IGEuaHJlZlxyXG4gICAgICBiYXNlLmhyZWYgPSByZXNvbHZlZFxyXG4gICAgfVxyXG5cclxuICAgIGhlYWQucmVtb3ZlQ2hpbGQoYmFzZSlcclxuXHJcbiAgICByZXR1cm4gcmVzb2x2ZWRcclxuICB9XHJcblxyXG4gIHJldHVybiByZXNvbHZlVXJsXHJcblxyXG59KSk7XHJcbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LnVybHRlbXBsYXRlID0gZmFjdG9yeSgpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBVcmxUZW1wbGF0ZSgpIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIFVybFRlbXBsYXRlLnByb3RvdHlwZS5lbmNvZGVSZXNlcnZlZCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnNwbGl0KC8oJVswLTlBLUZhLWZdezJ9KS9nKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgIGlmICghLyVbMC05QS1GYS1mXS8udGVzdChwYXJ0KSkge1xuICAgICAgICBwYXJ0ID0gZW5jb2RlVVJJKHBhcnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnQ7XG4gICAgfSkuam9pbignJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcGVyYXRvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBVcmxUZW1wbGF0ZS5wcm90b3R5cGUuZW5jb2RlVmFsdWUgPSBmdW5jdGlvbiAob3BlcmF0b3IsIHZhbHVlLCBrZXkpIHtcbiAgICB2YWx1ZSA9IChvcGVyYXRvciA9PT0gJysnIHx8IG9wZXJhdG9yID09PSAnIycpID8gdGhpcy5lbmNvZGVSZXNlcnZlZCh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIFVybFRlbXBsYXRlLnByb3RvdHlwZS5pc0RlZmluZWQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbDtcbiAgfTtcblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBVcmxUZW1wbGF0ZS5wcm90b3R5cGUuaXNLZXlPcGVyYXRvciA9IGZ1bmN0aW9uIChvcGVyYXRvcikge1xuICAgIHJldHVybiBvcGVyYXRvciA9PT0gJzsnIHx8IG9wZXJhdG9yID09PSAnJicgfHwgb3BlcmF0b3IgPT09ICc/JztcbiAgfTtcblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wZXJhdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGlmaWVyXG4gICAqL1xuICBVcmxUZW1wbGF0ZS5wcm90b3R5cGUuZ2V0VmFsdWVzID0gZnVuY3Rpb24gKGNvbnRleHQsIG9wZXJhdG9yLCBrZXksIG1vZGlmaWVyKSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dFtrZXldLFxuICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgIGlmICh0aGlzLmlzRGVmaW5lZCh2YWx1ZSkgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcblxuICAgICAgICBpZiAobW9kaWZpZXIgJiYgbW9kaWZpZXIgIT09ICcqJykge1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHBhcnNlSW50KG1vZGlmaWVyLCAxMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUsIHRoaXMuaXNLZXlPcGVyYXRvcihvcGVyYXRvcikgPyBrZXkgOiBudWxsKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobW9kaWZpZXIgPT09ICcqJykge1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgdmFsdWUuZmlsdGVyKHRoaXMuaXNEZWZpbmVkKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLmVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZSwgdGhpcy5pc0tleU9wZXJhdG9yKG9wZXJhdG9yKSA/IGtleSA6IG51bGwpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZSkuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICBpZiAodGhpcy5pc0RlZmluZWQodmFsdWVba10pKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWVba10sIGspKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0bXAgPSBbXTtcblxuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgdmFsdWUuZmlsdGVyKHRoaXMuaXNEZWZpbmVkKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICB0bXAucHVzaCh0aGlzLmVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZSkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmlzRGVmaW5lZCh2YWx1ZVtrXSkpIHtcbiAgICAgICAgICAgICAgICB0bXAucHVzaChlbmNvZGVVUklDb21wb25lbnQoaykpO1xuICAgICAgICAgICAgICAgIHRtcC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlW2tdLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuaXNLZXlPcGVyYXRvcihvcGVyYXRvcikpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdG1wLmpvaW4oJywnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0bXAubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh0bXAuam9pbignLCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wZXJhdG9yID09PSAnOycpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJycgJiYgKG9wZXJhdG9yID09PSAnJicgfHwgb3BlcmF0b3IgPT09ICc/JykpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goJycpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGVtcGxhdGVcbiAgICogQHJldHVybiB7ZnVuY3Rpb24oT2JqZWN0KTpzdHJpbmd9XG4gICAqL1xuICBVcmxUZW1wbGF0ZS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodGVtcGxhdGUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIG9wZXJhdG9ycyA9IFsnKycsICcjJywgJy4nLCAnLycsICc7JywgJz8nLCAnJiddO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGV4cGFuZDogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlLnJlcGxhY2UoL1xceyhbXlxce1xcfV0rKVxcfXwoW15cXHtcXH1dKykvZywgZnVuY3Rpb24gKF8sIGV4cHJlc3Npb24sIGxpdGVyYWwpIHtcbiAgICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgdmFyIG9wZXJhdG9yID0gbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSBbXTtcblxuICAgICAgICAgICAgaWYgKG9wZXJhdG9ycy5pbmRleE9mKGV4cHJlc3Npb24uY2hhckF0KDApKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgb3BlcmF0b3IgPSBleHByZXNzaW9uLmNoYXJBdCgwKTtcbiAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uc3Vic3RyKDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBleHByZXNzaW9uLnNwbGl0KC8sL2cpLmZvckVhY2goZnVuY3Rpb24gKHZhcmlhYmxlKSB7XG4gICAgICAgICAgICAgIHZhciB0bXAgPSAvKFteOlxcKl0qKSg/OjooXFxkKyl8KFxcKikpPy8uZXhlYyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAgIHZhbHVlcy5wdXNoLmFwcGx5KHZhbHVlcywgdGhhdC5nZXRWYWx1ZXMoY29udGV4dCwgb3BlcmF0b3IsIHRtcFsxXSwgdG1wWzJdIHx8IHRtcFszXSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChvcGVyYXRvciAmJiBvcGVyYXRvciAhPT0gJysnKSB7XG4gICAgICAgICAgICAgIHZhciBzZXBhcmF0b3IgPSAnLCc7XG5cbiAgICAgICAgICAgICAgaWYgKG9wZXJhdG9yID09PSAnPycpIHtcbiAgICAgICAgICAgICAgICBzZXBhcmF0b3IgPSAnJic7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAob3BlcmF0b3IgIT09ICcjJykge1xuICAgICAgICAgICAgICAgIHNlcGFyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiAodmFsdWVzLmxlbmd0aCAhPT0gMCA/IG9wZXJhdG9yIDogJycpICsgdmFsdWVzLmpvaW4oc2VwYXJhdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZXMuam9pbignLCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhhdC5lbmNvZGVSZXNlcnZlZChsaXRlcmFsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIG5ldyBVcmxUZW1wbGF0ZSgpO1xufSkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWluaWxvZyA9IHJlcXVpcmUoJ21pbmlsb2cnKVxuICAsIG1lZGlhVHlwZXMgPSByZXF1aXJlKCcuL2xpYi9tZWRpYV90eXBlcycpXG4gICwgQnVpbGRlciA9IHJlcXVpcmUoJy4vbGliL2J1aWxkZXInKVxuICAsIG1lZGlhVHlwZXMgPSByZXF1aXJlKCcuL2xpYi9tZWRpYV90eXBlcycpXG4gICwgbWVkaWFUeXBlUmVnaXN0cnkgPSByZXF1aXJlKCcuL2xpYi9tZWRpYV90eXBlX3JlZ2lzdHJ5Jyk7XG5cbi8vIGFjdGl2YXRlIHRoaXMgbGluZSB0byBlbmFibGUgbG9nZ2luZ1xuaWYgKHByb2Nlc3MuZW52LlRSQVZFUlNPTl9MT0dHSU5HKSB7XG4gIHJlcXVpcmUoJ21pbmlsb2cnKS5lbmFibGUoKTtcbn1cblxuLy8gZXhwb3J0IGJ1aWxkZXIgZm9yIHRyYXZlcnNvbi1hbmd1bGFyXG5leHBvcnRzLl9CdWlsZGVyID0gQnVpbGRlcjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHJlcXVlc3QgYnVpbGRlciBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0cy5uZXdSZXF1ZXN0ID0gZnVuY3Rpb24gbmV3UmVxdWVzdCgpIHtcbiAgcmV0dXJuIG5ldyBCdWlsZGVyKCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcmVxdWVzdCBidWlsZGVyIGluc3RhbmNlIHdpdGggdGhlIGdpdmVuIHJvb3QgVVJMLlxuICovXG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tKHVybCkge1xuICB2YXIgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCk7XG4gIGJ1aWxkZXIuZnJvbSh1cmwpO1xuICByZXR1cm4gYnVpbGRlcjtcbn07XG5cbi8vIFByb3ZpZGVkIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggcHJlLTEuMC4wIHZlcnNpb25zLlxuLy8gVGhlIHByZWZlcnJlZCB3YXkgaXMgdG8gdXNlIG5ld1JlcXVlc3QoKSBvciBmcm9tKCkgdG8gY3JlYXRlIGEgcmVxdWVzdFxuLy8gYnVpbGRlciBhbmQgZWl0aGVyIHNldCB0aGUgbWVkaWEgdHlwZSBleHBsaWNpdGx5IGJ5IGNhbGxpbmcganNvbigpIG9uIHRoZVxuLy8gcmVxdWVzdCBidWlsZGVyIGluc3RhbmNlIC0gb3IgdXNlIGNvbnRlbnQgbmVnb3RpYXRpb24uXG5leHBvcnRzLmpzb24gPSB7XG4gIGZyb206IGZ1bmN0aW9uKHVybCkge1xuICAgIHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoKTtcbiAgICBidWlsZGVyLmZyb20odXJsKTtcbiAgICBidWlsZGVyLnNldE1lZGlhVHlwZShtZWRpYVR5cGVzLkpTT04pO1xuICAgIHJldHVybiBidWlsZGVyO1xuICB9XG59LFxuXG4vLyBQcm92aWRlZCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3aXRoIHByZS0xLjAuMCB2ZXJzaW9ucy5cbi8vIFRoZSBwcmVmZXJyZWQgd2F5IGlzIHRvIHVzZSBuZXdSZXF1ZXN0KCkgb3IgZnJvbSgpIHRvIGNyZWF0ZSBhIHJlcXVlc3Rcbi8vIGJ1aWxkZXIgYW5kIHRoZW4gZWl0aGVyIHNldCB0aGUgbWVkaWEgdHlwZSBleHBsaWNpdGx5IGJ5IGNhbGxpbmcganNvbkhhbCgpIG9uXG4vLyB0aGUgcmVxdWVzdCBidWlsZGVyIGluc3RhbmNlIC0gb3IgdXNlIGNvbnRlbnQgbmVnb3RpYXRpb24uXG5leHBvcnRzLmpzb25IYWwgPSB7XG4gIGZyb206IGZ1bmN0aW9uKHVybCkge1xuICAgIGlmICghbWVkaWFUeXBlUmVnaXN0cnkuZ2V0KG1lZGlhVHlwZXMuSlNPTl9IQUwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT04gSEFMIGFkYXB0ZXIgaXMgbm90IHJlZ2lzdGVyZWQuIEZyb20gdmVyc2lvbiAnICtcbiAgICAgICAgJzEuMC4wIG9uLCBUcmF2ZXJzb24gaGFzIG5vIGxvbmdlciBidWlsdC1pbiBzdXBwb3J0IGZvciAnICtcbiAgICAgICAgJ2FwcGxpY2F0aW9uL2hhbCtqc29uLiBIQUwgc3VwcG9ydCB3YXMgbW92ZWQgdG8gYSBzZXBhcmF0ZSwgb3B0aW9uYWwgJyArXG4gICAgICAgICdwbHVnLWluLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jhc3RpMTMwMi90cmF2ZXJzb24taGFsJyk7XG4gICAgfVxuICAgIHZhciBidWlsZGVyID0gbmV3IEJ1aWxkZXIoKTtcbiAgICBidWlsZGVyLmZyb20odXJsKTtcbiAgICBidWlsZGVyLnNldE1lZGlhVHlwZShtZWRpYVR5cGVzLkpTT05fSEFMKTtcbiAgICByZXR1cm4gYnVpbGRlcjtcbiAgfVxufTtcblxuLy8gZXhwb3NlIG1lZGlhIHR5cGUgcmVnaXN0cnkgc28gdGhhdCBtZWRpYSB0eXBlIHBsdWctaW5zIGNhbiByZWdpc3RlclxuLy8gdGhlbXNlbHZlc1xuZXhwb3J0cy5yZWdpc3Rlck1lZGlhVHlwZSA9IG1lZGlhVHlwZVJlZ2lzdHJ5LnJlZ2lzdGVyO1xuXG4vLyBleHBvcnQgbWVkaWEgdHlwZSBjb25zdGFudHNcbmV4cG9ydHMubWVkaWFUeXBlcyA9IG1lZGlhVHlwZXM7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBpbmRleE9mID0gcmVxdWlyZSgnaW5kZXhvZicpO1xuXG52YXIgT2JqZWN0X2tleXMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKSByZXR1cm4gT2JqZWN0LmtleXMob2JqKVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgcmVzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHJlcy5wdXNoKGtleSlcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG59O1xuXG52YXIgZm9yRWFjaCA9IGZ1bmN0aW9uICh4cywgZm4pIHtcbiAgICBpZiAoeHMuZm9yRWFjaCkgcmV0dXJuIHhzLmZvckVhY2goZm4pXG4gICAgZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZuKHhzW2ldLCBpLCB4cyk7XG4gICAgfVxufTtcblxudmFyIGRlZmluZVByb3AgPSAoZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnXycsIHt9KTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgb2JqW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH07XG4gICAgfVxufSgpKTtcblxudmFyIGdsb2JhbHMgPSBbJ0FycmF5JywgJ0Jvb2xlYW4nLCAnRGF0ZScsICdFcnJvcicsICdFdmFsRXJyb3InLCAnRnVuY3Rpb24nLFxuJ0luZmluaXR5JywgJ0pTT04nLCAnTWF0aCcsICdOYU4nLCAnTnVtYmVyJywgJ09iamVjdCcsICdSYW5nZUVycm9yJyxcbidSZWZlcmVuY2VFcnJvcicsICdSZWdFeHAnLCAnU3RyaW5nJywgJ1N5bnRheEVycm9yJywgJ1R5cGVFcnJvcicsICdVUklFcnJvcicsXG4nZGVjb2RlVVJJJywgJ2RlY29kZVVSSUNvbXBvbmVudCcsICdlbmNvZGVVUkknLCAnZW5jb2RlVVJJQ29tcG9uZW50JywgJ2VzY2FwZScsXG4nZXZhbCcsICdpc0Zpbml0ZScsICdpc05hTicsICdwYXJzZUZsb2F0JywgJ3BhcnNlSW50JywgJ3VuZGVmaW5lZCcsICd1bmVzY2FwZSddO1xuXG5mdW5jdGlvbiBDb250ZXh0KCkge31cbkNvbnRleHQucHJvdG90eXBlID0ge307XG5cbnZhciBTY3JpcHQgPSBleHBvcnRzLlNjcmlwdCA9IGZ1bmN0aW9uIE5vZGVTY3JpcHQgKGNvZGUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2NyaXB0KSkgcmV0dXJuIG5ldyBTY3JpcHQoY29kZSk7XG4gICAgdGhpcy5jb2RlID0gY29kZTtcbn07XG5cblNjcmlwdC5wcm90b3R5cGUucnVuSW5Db250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBpZiAoIShjb250ZXh0IGluc3RhbmNlb2YgQ29udGV4dCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm5lZWRzIGEgJ2NvbnRleHQnIGFyZ3VtZW50LlwiKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIGlmICghaWZyYW1lLnN0eWxlKSBpZnJhbWUuc3R5bGUgPSB7fTtcbiAgICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgXG4gICAgdmFyIHdpbiA9IGlmcmFtZS5jb250ZW50V2luZG93O1xuICAgIHZhciB3RXZhbCA9IHdpbi5ldmFsLCB3RXhlY1NjcmlwdCA9IHdpbi5leGVjU2NyaXB0O1xuXG4gICAgaWYgKCF3RXZhbCAmJiB3RXhlY1NjcmlwdCkge1xuICAgICAgICAvLyB3aW4uZXZhbCgpIG1hZ2ljYWxseSBhcHBlYXJzIHdoZW4gdGhpcyBpcyBjYWxsZWQgaW4gSUU6XG4gICAgICAgIHdFeGVjU2NyaXB0LmNhbGwod2luLCAnbnVsbCcpO1xuICAgICAgICB3RXZhbCA9IHdpbi5ldmFsO1xuICAgIH1cbiAgICBcbiAgICBmb3JFYWNoKE9iamVjdF9rZXlzKGNvbnRleHQpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHdpbltrZXldID0gY29udGV4dFtrZXldO1xuICAgIH0pO1xuICAgIGZvckVhY2goZ2xvYmFscywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoY29udGV4dFtrZXldKSB7XG4gICAgICAgICAgICB3aW5ba2V5XSA9IGNvbnRleHRba2V5XTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIHZhciB3aW5LZXlzID0gT2JqZWN0X2tleXMod2luKTtcblxuICAgIHZhciByZXMgPSB3RXZhbC5jYWxsKHdpbiwgdGhpcy5jb2RlKTtcbiAgICBcbiAgICBmb3JFYWNoKE9iamVjdF9rZXlzKHdpbiksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgLy8gQXZvaWQgY29weWluZyBjaXJjdWxhciBvYmplY3RzIGxpa2UgYHRvcGAgYW5kIGB3aW5kb3dgIGJ5IG9ubHlcbiAgICAgICAgLy8gdXBkYXRpbmcgZXhpc3RpbmcgY29udGV4dCBwcm9wZXJ0aWVzIG9yIG5ldyBwcm9wZXJ0aWVzIGluIHRoZSBgd2luYFxuICAgICAgICAvLyB0aGF0IHdhcyBvbmx5IGludHJvZHVjZWQgYWZ0ZXIgdGhlIGV2YWwuXG4gICAgICAgIGlmIChrZXkgaW4gY29udGV4dCB8fCBpbmRleE9mKHdpbktleXMsIGtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICBjb250ZXh0W2tleV0gPSB3aW5ba2V5XTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZm9yRWFjaChnbG9iYWxzLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmICghKGtleSBpbiBjb250ZXh0KSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcChjb250ZXh0LCBrZXksIHdpbltrZXldKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgICBcbiAgICByZXR1cm4gcmVzO1xufTtcblxuU2NyaXB0LnByb3RvdHlwZS5ydW5JblRoaXNDb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBldmFsKHRoaXMuY29kZSk7IC8vIG1heWJlLi4uXG59O1xuXG5TY3JpcHQucHJvdG90eXBlLnJ1bkluTmV3Q29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgdmFyIGN0eCA9IFNjcmlwdC5jcmVhdGVDb250ZXh0KGNvbnRleHQpO1xuICAgIHZhciByZXMgPSB0aGlzLnJ1bkluQ29udGV4dChjdHgpO1xuXG4gICAgZm9yRWFjaChPYmplY3Rfa2V5cyhjdHgpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnRleHRba2V5XSA9IGN0eFtrZXldO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbmZvckVhY2goT2JqZWN0X2tleXMoU2NyaXB0LnByb3RvdHlwZSksIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgZXhwb3J0c1tuYW1lXSA9IFNjcmlwdFtuYW1lXSA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgIHZhciBzID0gU2NyaXB0KGNvZGUpO1xuICAgICAgICByZXR1cm4gc1tuYW1lXS5hcHBseShzLCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIH07XG59KTtcblxuZXhwb3J0cy5jcmVhdGVTY3JpcHQgPSBmdW5jdGlvbiAoY29kZSkge1xuICAgIHJldHVybiBleHBvcnRzLlNjcmlwdChjb2RlKTtcbn07XG5cbmV4cG9ydHMuY3JlYXRlQ29udGV4dCA9IFNjcmlwdC5jcmVhdGVDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICB2YXIgY29weSA9IG5ldyBDb250ZXh0KCk7XG4gICAgaWYodHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvckVhY2goT2JqZWN0X2tleXMoY29udGV4dCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGNvcHlba2V5XSA9IGNvbnRleHRba2V5XTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xufTtcbiIsIlxudmFyIGluZGV4T2YgPSBbXS5pbmRleE9mO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgb2JqKXtcbiAgaWYgKGluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiXX0=
