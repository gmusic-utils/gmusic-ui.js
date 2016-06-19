(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GMusicNamespace = function () {
  function GMusicNamespace() {
    _classCallCheck(this, GMusicNamespace);

    this.prototype = {};
    var that = this;
    this.addMethod('init', function init() {
      that.emitter = this;
    });
  }

  _createClass(GMusicNamespace, [{
    key: 'addMethod',
    value: function addMethod(methodName, method) {
      this.prototype[methodName] = method;
    }
  }, {
    key: 'getPrototype',
    value: function getPrototype() {
      return this.prototype;
    }
  }]);

  return GMusicNamespace;
}();

exports.default = GMusicNamespace;


},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _GMusicNamespace2 = require('./GMusicNamespace');

var _GMusicNamespace3 = _interopRequireDefault(_GMusicNamespace2);

var _Playlist = require('./Structs/Playlist');

var _Playlist2 = _interopRequireDefault(_Playlist);

var _context = require('./utils/context');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PlaylistNamespace = function (_GMusicNamespace) {
  _inherits(PlaylistNamespace, _GMusicNamespace);

  function PlaylistNamespace() {
    var _Object$getPrototypeO;

    _classCallCheck(this, PlaylistNamespace);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(PlaylistNamespace)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    _this.path = (0, _context.findContextPath)();
    if (_this.path) {
      _this._playlists = Object.assign({}, window.APPCONTEXT[_this.path[0]][_this.path[1]][0][_this.path[2]]);
      _this._watchPlaylistObject();
    } else {
      _this._playlists = {};
    }

    _this.addMethod('getAll', _this.getAll.bind(_this));
    _this.addMethod('play', _this.play.bind(_this));
    _this.addMethod('playWithTrack', _this.playWithTrack.bind(_this));
    return _this;
  }

  _createClass(PlaylistNamespace, [{
    key: '_navigate',
    value: function _navigate(playlist) {
      return new Promise(function (resolve, reject) {
        window.location.hash = '/pl/' + escape(playlist.id);
        var waitForPageInterval = void 0;
        var waitTimeout = void 0;
        var clearTimeouts = function clearTimeouts() {
          return clearTimeout(waitForPageInterval) && clearTimeout(waitTimeout);
        };
        waitTimeout = setTimeout(function () {
          return clearTimeouts() && reject('Playlist took too long to load, it might not exist');
        }, 10000);
        waitForPageInterval = setInterval(function () {
          var info = document.querySelector('.material-container-details');
          if (info && info.querySelector('.title').innerText === playlist.name) {
            clearTimeouts();
            resolve();
          }
        }, 10);
      });
    }
  }, {
    key: '_watchPlaylistObject',
    value: function _watchPlaylistObject() {
      var _this2 = this;

      var that = this;
      var previous = this.getAll();

      window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', function () {
        _this2._playlists = Object.assign({}, _this2._playlists, window.APPCONTEXT[_this2.path[0]][_this2.path[1]][0][_this2.path[2]]);
        var current = _this2.getAll();
        var changed = false;
        Object.keys(current).forEach(function (key) {
          if (!previous[key]) {
            changed = true;
            return;
          }
          if (previous[key].tracks.length !== current[key].tracks.length) {
            changed = true;
            return;
          }
          for (var i = 0; i < current[key].tracks.length; i++) {
            if (!current[key].tracks[i].equals(previous[key].tracks[i])) {
              changed = true;
              return;
            }
          }
        });
        previous = current;
        if (!changed) return;
        that.emitter.emit('change:playlists', current);
      });
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      var _this3 = this;

      return Object.keys(this._playlists).filter(function (key) {
        return key !== 'queue' && key !== 'all' && _this3._playlists[key].ha.type === 'pl';
      }).map(function (key) {
        var playlist = _this3._playlists[key];
        return _Playlist2.default.fromPlaylistObject(key, playlist);
      });
    }
  }, {
    key: 'play',
    value: function play(playlist) {
      return this._navigate(playlist).then(function () {
        document.querySelector('.material-container-details [data-id="play"]').click();
      });
    }
  }, {
    key: 'playWithTrack',
    value: function playWithTrack() {
      var playlist = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var track = arguments[1];

      (0, _assert2.default)(playlist.id, 'Expected playlist to have a property "id" but it did not');
      (0, _assert2.default)(playlist.name, 'Expected playlist to have a property "name" but it did not');
      (0, _assert2.default)(track.id, 'Expected track to have a property "id" but it did not');
      return this._navigate(playlist).then(function () {
        var container = document.querySelector('#mainContainer');
        var songQueryString = '.song-row[data-id="' + track.id + '"] [data-id="play"]';
        var songPlayButton = document.querySelector(songQueryString);
        var initial = container.scrollTop;

        if (songPlayButton) {
          songPlayButton.click();
          return;
        }

        container.scrollTop = 0;
        // DEV: In order to save memory GPM only renders the songs currently on screen
        //      and a few above and a few below.  This means the song we want to play
        //      might not be visible.  We need to QUICKLY "scan" through the page making
        //      GPM render all songs till we find the one we want
        var scrolDownAndSearch = function scrolDownAndSearch() {
          songPlayButton = document.querySelector(songQueryString);
          if (songPlayButton) {
            songPlayButton.click();
            return;
          }
          if (container.scrollTop < container.scrollHeight - container.getBoundingClientRect().height) {
            container.scrollTop += container.getBoundingClientRect().height;
            // DEV: Changing the scrollTop and rerendering is an asyncronous response
            //      If we wait for next tick the rerender will be complete
            setTimeout(scrolDownAndSearch, 10);
          } else {
            container.scrollTop = initial;
            throw new Error('Failed to find song with id ("' + track.id + '") in playlist with id ("' + playlist.id + '")');
          }
        };
        setTimeout(scrolDownAndSearch, 0);
      });
    }
  }]);

  return PlaylistNamespace;
}(_GMusicNamespace3.default);

exports.default = PlaylistNamespace;


},{"./GMusicNamespace":1,"./Structs/Playlist":7,"./utils/context":10,"assert":11}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _GMusicNamespace2 = require('./GMusicNamespace');

var _GMusicNamespace3 = _interopRequireDefault(_GMusicNamespace2);

var _Playlist = require('./Structs/Playlist');

var _Playlist2 = _interopRequireDefault(_Playlist);

var _context = require('./utils/context');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dispatchEvent = function dispatchEvent(el, etype) {
  var evt = document.createEvent('Events');
  evt.initEvent(etype, true, false);
  el.dispatchEvent(evt);
};

var QueueNamespace = function (_GMusicNamespace) {
  _inherits(QueueNamespace, _GMusicNamespace);

  function QueueNamespace() {
    var _Object$getPrototypeO;

    _classCallCheck(this, QueueNamespace);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(QueueNamespace)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    _this.tracks = [];
    _this.path = (0, _context.findContextPath)();

    if (_this.path) {
      _this._watchQueue();
    }

    _this.addMethod('clear', _this.clear.bind(_this));
    _this.addMethod('getTracks', _this.getTracks.bind(_this));
    _this.addMethod('playTrack', _this.playTrack.bind(_this));
    return _this;
  }

  _createClass(QueueNamespace, [{
    key: '_watchQueue',
    value: function _watchQueue() {
      var _this2 = this;

      var that = this;

      var queue = this.getTracks();
      window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', function () {
        var newQueue = _this2.getTracks();
        var changed = false;
        for (var i = 0; i < newQueue.length; i++) {
          if (!queue[i]) {
            changed = true;break;
          }
          if (newQueue[i].id !== queue[i].id) {
            changed = true;break;
          }
        }
        queue = newQueue;
        if (changed) that.emitter.emit('change:queue', newQueue);
      });
    }
  }, {
    key: 'clear',
    value: function clear(cb) {
      var _this3 = this;

      var clearButton = document.querySelector('#queue-overlay [data-id="clear-queue"]');
      if (clearButton) {
        clearButton.click();
        setTimeout(function () {
          _this3._render(document.querySelector('#queue-overlay'), true);
          if (cb) {
            cb();
          }
        }, 200);
      } else if (cb) {
        cb();
      }
    }
  }, {
    key: 'getTracks',
    value: function getTracks() {
      return _Playlist2.default.fromPlaylistObject('_', window.APPCONTEXT[this.path[0]][this.path[1]][0][this.path[2]].queue).tracks;
    }
  }, {
    key: 'playTrack',
    value: function playTrack(track) {
      if (document.querySelector('#queue-overlay').style.display === 'none') {
        dispatchEvent(document.querySelector('#queue[data-id="queue"]'), 'click');
      }
      return new Promise(function (resolve) {
        var waitForQueueOpen = setInterval(function () {
          if (document.querySelector('#queue[data-id="queue"]').classList.contains('opened')) {
            clearInterval(waitForQueueOpen);
            resolve();
          }
        });
      }).then(function () {
        (0, _assert2.default)(track.id, 'Expected track to have a property "id" but it did not');
        var container = document.querySelector('#queueContainer');
        var songQueryString = '.song-row[data-id="' + track.id + '"] [data-id="play"]';
        var songPlayButton = document.querySelector(songQueryString);
        var initial = container.scrollTop;

        if (songPlayButton) {
          songPlayButton.click();
          return;
        }

        container.scrollTop = 0;
        // DEV: In order to save memory GPM only renders the songs currently on screen
        //      and a few above and a few below.  This means the song we want to play
        //      might not be visible.  We need to QUICKLY "scan" through the page making
        //      GPM render all songs till we find the one we want
        var scrolDownAndSearch = function scrolDownAndSearch() {
          songPlayButton = document.querySelector(songQueryString);
          if (songPlayButton) {
            songPlayButton.click();
            return;
          }
          if (container.scrollTop < container.scrollHeight - container.getBoundingClientRect().height) {
            container.scrollTop += container.getBoundingClientRect().height;
            // DEV: Changing the scrollTop and rerendering is an asyncronous response
            //      If we wait for next tick the rerender will be complete
            setTimeout(scrolDownAndSearch, 10);
          } else {
            container.scrollTop = initial;
            throw new Error('Failed to find song with id ("' + track.id + '") in queue');
          }
        };
        setTimeout(scrolDownAndSearch, 0);
      });
    }
  }]);

  return QueueNamespace;
}(_GMusicNamespace3.default);

exports.default = QueueNamespace;


},{"./GMusicNamespace":1,"./Structs/Playlist":7,"./utils/context":10,"assert":11}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _GMusicNamespace2 = require('./GMusicNamespace');

var _GMusicNamespace3 = _interopRequireDefault(_GMusicNamespace2);

var _Album = require('./Structs/Album');

var _Album2 = _interopRequireDefault(_Album);

var _Artist = require('./Structs/Artist');

var _Artist2 = _interopRequireDefault(_Artist);

var _Track = require('./Structs/Track');

var _Track2 = _interopRequireDefault(_Track);

var _context = require('./utils/context');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SearchNamespace = function (_GMusicNamespace) {
  _inherits(SearchNamespace, _GMusicNamespace);

  function SearchNamespace() {
    var _Object$getPrototypeO;

    _classCallCheck(this, SearchNamespace);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(SearchNamespace)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    _this.path = (0, _context.findContextPath)();
    if (_this.path) {
      _this._watchForSearches();
    }

    _this.addMethod('getSearchText', _this.getSearchText.bind(_this));
    _this.addMethod('getCurrentResults', _this.getCurrentResults.bind(_this));
    _this.addMethod('isSearching', _this.isSearching.bind(_this));
    _this.addMethod('performSearch', _this.performSearch.bind(_this));
    _this.addMethod('playResult', _this.playResult.bind(_this));
    return _this;
  }

  _createClass(SearchNamespace, [{
    key: '_text',
    value: function _text(elem, def) {
      if (elem) {
        return elem.textContent.trim();
      }
      return def;
    }
  }, {
    key: '_watchForSearches',
    value: function _watchForSearches() {
      var _this2 = this;

      var that = this;
      var searchChanged = 0;

      window.addEventListener('hashchange', function () {
        if (!/^#\/sr\//g.test(window.location.hash)) return;
        _this2.emitter.emit('change:search-text', _this2.getSearchText());
        searchChanged = 2;
      });

      window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', function () {
        if (searchChanged > 0) {
          searchChanged -= 1;
          if (searchChanged === 0) {
            // DEV: We need to wait for GPM's own hooks to finish before scanning the UI
            //      If we push this function to the end of the execution queue, the render
            //      will complete syncronously before calling
            setTimeout(function () {
              that.emitter.emit('change:search-results', that.getCurrentResults());
            }, 0);
          }
        }
      });
    }
  }, {
    key: 'getSearchText',
    value: function getSearchText() {
      return document.querySelector(SearchNamespace.selectors.inputBox).value;
    }
  }, {
    key: 'getCurrentResults',
    value: function getCurrentResults() {
      var _this3 = this;

      if (!this.isSearching()) {
        throw new Error('Can\'t get search results when the user is not searching');
      }

      var albumElems = document.querySelectorAll(SearchNamespace.selectors.albumResults);
      var albums = [];

      Array.prototype.forEach.call(albumElems, function (elem) {
        albums.push(new _Album2.default(elem.getAttribute('data-id'), elem.querySelector(SearchNamespace.selectors.cardTitle).textContent, elem.querySelector(SearchNamespace.selectors.cardSubTitle).textContent,
        // DEV: Remove trailing path params from image with path such as
        //      https://lh3.googleusercontent.com/4Yht2ETGQNme6QgQi-imsOK788OEHEhldqgBjeR8hWi8YsUMbn_AY0c5COHB4wK5C3Hjiw-y3Q=w220-c-h220-e100
        elem.querySelector('img').src.replace('=w220-c-h220-e100', '')));
      });

      var artistElems = document.querySelectorAll(SearchNamespace.selectors.artistResults);
      var artists = [];

      Array.prototype.forEach.call(artistElems, function (elem) {
        var image = elem.querySelector('img');
        if (image) {
          // DEV: Remove trailing path params from image with path such as
          //      https://lh3.googleusercontent.com/4Yht2ETGQNme6QgQi-imsOK788OEHEhldqgBjeR8hWi8YsUMbn_AY0c5COHB4wK5C3Hjiw-y3Q=w190-c-h190-e100
          image = image.src.replace('=w190-c-h190-e100', '');
        } else {
          image = null;
        }
        artists.push(new _Artist2.default(elem.getAttribute('data-id'), elem.querySelector(SearchNamespace.selectors.cardTitle).textContent, image));
      });

      var trackElems = document.querySelectorAll(SearchNamespace.selectors.trackResults);
      var tracks = [];
      Array.prototype.forEach.call(trackElems, function (elem, index) {
        var durationParts = elem.querySelector(SearchNamespace.selectors.trackColumns.duration).textContent.trim().split(':');
        tracks.push(new _Track2.default({
          id: elem.getAttribute('data-id'),
          title: _this3._text(elem.querySelector(SearchNamespace.selectors.trackColumns.title), 'Unknown Title'),
          albumArt: elem.querySelector(SearchNamespace.selectors.trackColumns.title + ' img').src.replace('=s60-e100-c', ''),
          artist: _this3._text(elem.querySelector(SearchNamespace.selectors.trackColumns.artist), 'Unknown Artist'),
          album: _this3._text(elem.querySelector(SearchNamespace.selectors.trackColumns.album), 'Unknown Album'),
          index: index,
          duration: parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10),
          playCount: parseInt(_this3._text(elem.querySelector(SearchNamespace.selectors.trackColumns.playCount), '0'), 10)
        }));
      });

      return {
        albums: albums,
        artists: artists,
        tracks: tracks
      };
    }
  }, {
    key: 'isSearching',
    value: function isSearching() {
      return (/^#\/sr\//g.test(window.location.hash)
      );
    }
  }, {
    key: 'playResult',
    value: function playResult(resultObject) {
      var trackPlay = document.querySelector('[data-id="' + resultObject.id + '"] ' + SearchNamespace.selectors.playButton);
      var otherPlay = document.querySelector('[data-id="' + resultObject.id + '"] ' + SearchNamespace.selectors.cardPlayButton);
      if (!trackPlay && !otherPlay) {
        throw new Error('Failed to play result, it must not be in this search');
      }
      (trackPlay || otherPlay).click();
    }
  }, {
    key: 'performSearch',
    value: function performSearch(text) {
      var _this4 = this;

      window.location.hash = '/sr/' + encodeURIComponent(text.replace(/ /g, '+'));
      return new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
          return reject('Search timed out');
        }, 10000);
        _this4.emitter.once('change:search-results', function (newResults) {
          clearTimeout(timeout);
          resolve(newResults);
        });
      });
    }
  }]);

  return SearchNamespace;
}(_GMusicNamespace3.default);

SearchNamespace.selectors = {
  albumResults: '.lane-content > [data-type=album]',
  artistResults: '.lane-content > [data-type=artist]',
  cardPlayButton: '.play-button-container',
  cardTitle: '.details .title',
  cardSubTitle: '.details .sub-title',
  inputBox: 'sj-search-box input',
  playButton: '[data-id="play"]',
  trackResults: '.songlist-container .song-table tr.song-row',
  trackColumns: {
    album: '[data-col="album"]',
    artist: '[data-col="artist"]',
    duration: '[data-col="duration"]',
    playCount: '[data-col="play-count"]',
    title: '[data-col="title"]'
  }
};
exports.default = SearchNamespace;


},{"./GMusicNamespace":1,"./Structs/Album":5,"./Structs/Artist":6,"./Structs/Track":8,"./utils/context":10}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Album = function Album(id, name, artistName, albumArt) {
  _classCallCheck(this, Album);

  this.id = id;
  this.name = name;
  this.artist = artistName;
  this.albumArt = albumArt;
};

exports.default = Album;


},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Artist = function Artist(id, name, image) {
  _classCallCheck(this, Artist);

  this.id = id;
  this.name = name;
  this.image = image;
};

exports.default = Artist;


},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Track = require('./Track');

var _Track2 = _interopRequireDefault(_Track);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var songArrayPath = void 0;

var Playlist = function () {
  function Playlist(id, name) {
    _classCallCheck(this, Playlist);

    this.id = id;
    this.name = name;
    this.tracks = [];
  }

  _createClass(Playlist, [{
    key: 'addTracks',
    value: function addTracks(tracks) {
      this.tracks = this.tracks.concat(tracks);
      this._sort();
    }
  }, {
    key: 'addTrack',
    value: function addTrack(track) {
      this.tracks.push(track);
      this._sort();
    }
  }, {
    key: '_sort',
    value: function _sort() {
      this.tracks.sort(function (t1, t2) {
        return t1.index - t2.index;
      });
    }
  }]);

  return Playlist;
}();

Playlist.fromPlaylistObject = function (id, playlistObject) {
  var playlist = new Playlist(id, playlistObject.getTitle().replace(/ playlist$/g, ''));
  var items = void 0;
  if (playlistObject.items) {
    items = playlistObject.items;
  } else {
    Object.keys(playlistObject).forEach(function (key) {
      if (playlistObject[key] && playlistObject[key].items) {
        items = playlistObject[key].items;
      }
    });
  }
  if (items && items.length > 0 && !songArrayPath) {
    Object.keys(items[0]).forEach(function (trackKey) {
      if (_typeof(items[0][trackKey]) === 'object') {
        Object.keys(items[0][trackKey]).forEach(function (trackArrKey) {
          if (Array.isArray(items[0][trackKey][trackArrKey])) {
            songArrayPath = [trackKey, trackArrKey];
          }
        });
      }
    });
  }
  if (!songArrayPath) return playlist;
  playlist.addTracks(items.map(function (track, index) {
    return _Track2.default.fromTrackArray(track[songArrayPath[0]][songArrayPath[1]], track.index || index + 1);
  }));
  return playlist;
};

exports.default = Playlist;


},{"./Track":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Track = function () {
  function Track(_ref) {
    var id = _ref.id;
    var title = _ref.title;
    var albumArt = _ref.albumArt;
    var artist = _ref.artist;
    var album = _ref.album;
    var _ref$index = _ref.index;
    var index = _ref$index === undefined ? 1 : _ref$index;
    var duration = _ref.duration;
    var _ref$playCount = _ref.playCount;
    var playCount = _ref$playCount === undefined ? 0 : _ref$playCount;

    _classCallCheck(this, Track);

    this.id = id;
    this.title = title;
    this.albumArt = albumArt;
    this.artist = artist;
    this.album = album;
    this.index = index;

    this.duration = duration;
    this.playCount = playCount;
  }

  _createClass(Track, [{
    key: "equals",
    value: function equals(other) {
      return this.id === other.id && this.title === other.title && this.albumArt === other.albumArt && this.artist === other.artist && this.album === other.album && this.index === other.index && this.duration === other.duration && this.playCount === other.playCount;
    }
  }]);

  return Track;
}();

Track.fromTrackArray = function (trackArr, index) {
  return new Track({
    id: trackArr[0],
    title: trackArr[1],
    albumArt: trackArr[2],
    artist: trackArr[3],
    album: trackArr[4],
    index: index,
    duration: trackArr[13],
    playCount: trackArr[22]
  });
};

exports.default = Track;


},{}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _PlaylistNamespace = require('./PlaylistNamespace');

var _PlaylistNamespace2 = _interopRequireDefault(_PlaylistNamespace);

var _QueueNamespace = require('./QueueNamespace');

var _QueueNamespace2 = _interopRequireDefault(_QueueNamespace);

var _SearchNamespace = require('./SearchNamespace');

var _SearchNamespace2 = _interopRequireDefault(_SearchNamespace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GMusicExtender = function () {
  function GMusicExtender() {
    _classCallCheck(this, GMusicExtender);

    this.controllers = {};
    (0, _assert2.default)(window.GMusic && window.GMusic._protoObj, 'GMusicUI relies on "window.GMusic" existing in the global scope, we couldn\'t find it');
  }

  _createClass(GMusicExtender, [{
    key: 'addNamespace',
    value: function addNamespace(namespaceName, namespace) {
      this.controllers[namespaceName] = Object.assign(window.GMusic._protoObj[namespaceName] || {}, namespace.getPrototype());
      window.GMusic._protoObj[namespaceName] = Object.assign(window.GMusic._protoObj[namespaceName] || {}, namespace.getPrototype());
    }
  }]);

  return GMusicExtender;
}();

var controller = new GMusicExtender();
controller.addNamespace('playlists', new _PlaylistNamespace2.default());
controller.addNamespace('queue', new _QueueNamespace2.default());
controller.addNamespace('search', new _SearchNamespace2.default());


},{"./PlaylistNamespace":2,"./QueueNamespace":3,"./SearchNamespace":4,"assert":11}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var findContextPath = exports.findContextPath = function findContextPath() {
  var path = void 0;
  Object.keys(window.APPCONTEXT).forEach(function (key1) {
    if (_typeof(window.APPCONTEXT[key1]) === 'object') {
      (function () {
        var firstLevel = window.APPCONTEXT[key1] || {};
        Object.keys(firstLevel).forEach(function (key2) {
          if (Array.isArray(firstLevel[key2]) && firstLevel[key2].length > 0) {
            (function () {
              var secondLevel = firstLevel[key2][0] || {};
              Object.keys(secondLevel).forEach(function (key3) {
                if (secondLevel[key3] && _typeof(secondLevel[key3]) === 'object' && secondLevel[key3].queue && secondLevel[key3].all) {
                  path = [key1, key2, key3];
                }
              });
            })();
          }
        });
      })();
    }
  });

  return path;
};


},{}],11:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":15}],12:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],13:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
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
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
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

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],14:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],15:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":14,"_process":13,"inherits":12}]},{},[9]);
