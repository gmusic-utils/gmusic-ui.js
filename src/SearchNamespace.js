import { GMusicNamespace, Track } from 'gmusic.js';

import Album from './Structs/Album';
import Artist from './Structs/Artist';

import { findContextPath } from './utils/context';

export default class SearchNamespace extends GMusicNamespace {
  static selectors = {
    albumResults: '.lane-content > [data-type=album]',
    artistResults: '.lane-content > [data-type=artist]',
    bestMatch: '[data-type=sr]',
    cardPlayButton: '.play-button-container',
    cardTitle: '.details .title',
    cardSubTitle: '.details .sub-title',
    cardMoreButton: '.menu-anchor',
    inputBox: 'sj-search-box input',
    playButton: '[data-id="play"]',
    moreButton: '[data-id="menu"]',
    trackResults: '.songlist-container .song-table tr.song-row',
    trackColumns: {
      album: '[data-col="album"]',
      artist: '[data-col="artist"]',
      duration: '[data-col="duration"]',
      playCount: '[data-col="play-count"]',
      title: '[data-col="title"]',
    },
    songMenu: '.song-menu',
    menuItems: {
      playNext: '#\\:6 .goog-menuitem-content',
      removeFromQueue: '#\\:7 .goog-menuitem-content',
      addToQueue: '#\\:8 .goog-menuitem-content'
    }
  };

  constructor(...args) {
    super(...args);
    this.path = findContextPath();
    if (this.path) {
      this._watchForSearches();
    }

    this.addMethod('getSearchText', this.getSearchText.bind(this));
    this.addMethod('getCurrentResults', this.getCurrentResults.bind(this));
    this.addMethod('isSearching', this.isSearching.bind(this));
    this.addMethod('performSearch', this.performSearch.bind(this));
    this.addMethod('playResult', this.playResult.bind(this));
    this.addMethod('queueTrackResult', this.queueTrackResult.bind(this));
  }

  _text(elem, def) {
    if (elem) {
      return elem.textContent.trim();
    }
    return def;
  }

  _watchForSearches() {
    const that = this;
    let searchChanged = 0;

    window.addEventListener('hashchange', () => {
      if (!/^#\/sr\//g.test(window.location.hash)) return;
      searchChanged = 2;
    });

    window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', () => {
      if (searchChanged > 0) {
        searchChanged -= 1;
        if (searchChanged === 0) {
          // DEV: We need to wait for GPM's own hooks to finish before scanning the UI
          //      If we push this function to the end of the execution queue, the render
          //      will complete syncronously before calling
          setTimeout(() => {
            that.emit('change:search-results', that.getCurrentResults());
          }, 0);
        }
      }
    });
  }

  getSearchText() {
    return document.querySelector(SearchNamespace.selectors.inputBox).value;
  }

  getCurrentResults() {
    if (!this.isSearching()) {
      throw new Error('Can\'t get search results when the user is not searching');
    }

    let bestMatch;
    const bestMatchNode = document.querySelector(SearchNamespace.selectors.bestMatch);
    const isBestMatch = (node) => (bestMatchNode ? bestMatchNode.contains(node) : false);

    const albumElems = document.querySelectorAll(SearchNamespace.selectors.albumResults);
    const albums = [];

    Array.prototype.forEach.call(albumElems, (elem) => {
      const album = new Album(
        elem.getAttribute('data-id'),
        elem.querySelector(SearchNamespace.selectors.cardTitle).textContent,
        elem.querySelector(SearchNamespace.selectors.cardSubTitle).textContent,
        // DEV: Remove trailing path params from image with path such as
        //      https://lh3.googleusercontent.com/4Yht2ETGQNme6QgQi-imsOK788OEHEhldqgBjeR8hWi8YsUMbn_AY0c5COHB4wK5C3Hjiw-y3Q=w220-c-h220-e100
        elem.querySelector('img').src.replace('=w220-c-h220-e100', '')
      );
      isBestMatch(elem) ? bestMatch = { type: 'album', value: album } : albums.push(album); // eslint-disable-line
    });

    const artistElems = document.querySelectorAll(SearchNamespace.selectors.artistResults);
    const artists = [];

    Array.prototype.forEach.call(artistElems, (elem) => {
      let image = elem.querySelector('img');
      if (image) {
        // DEV: Remove trailing path params from image with path such as
        //      https://lh3.googleusercontent.com/4Yht2ETGQNme6QgQi-imsOK788OEHEhldqgBjeR8hWi8YsUMbn_AY0c5COHB4wK5C3Hjiw-y3Q=w190-c-h190-e100
        image = image.src.replace('=w190-c-h190-e100', '');
      } else {
        image = null;
      }
      const artist = new Artist(
        elem.getAttribute('data-id'),
        elem.querySelector(SearchNamespace.selectors.cardTitle).textContent,
        image
      );
      isBestMatch(elem) ? bestMatch = { type: 'artist', value: artist } : artists.push(artist); // eslint-disable-line
    });

    const trackElems = document.querySelectorAll(SearchNamespace.selectors.trackResults);
    const tracks = [];
    Array.prototype.forEach.call(trackElems, (elem, index) => {
      const durationParts = elem.querySelector(SearchNamespace.selectors.trackColumns.duration).textContent.trim().split(':');
      const track = new Track({
        id: elem.getAttribute('data-id'),
        title: this._text(elem.querySelector(SearchNamespace.selectors.trackColumns.title), 'Unknown Title'),
        albumArt: elem.querySelector(`${SearchNamespace.selectors.trackColumns.title} img`).src.replace('=s60-e100-c', ''),
        artist: this._text(elem.querySelector(SearchNamespace.selectors.trackColumns.artist), 'Unknown Artist'),
        album: this._text(elem.querySelector(SearchNamespace.selectors.trackColumns.album), 'Unknown Album'),
        index,
        duration: (parseInt(durationParts[0], 10) * 60) + parseInt(durationParts[1], 10),
        playCount: parseInt(this._text(elem.querySelector(SearchNamespace.selectors.trackColumns.playCount), '0'), 10),
      });
      isBestMatch(elem) ? bestMatch = { type: 'track', value: track } : tracks.push(track); // eslint-disable-line
    });

    return {
      searchText: this.getSearchText(),
      albums,
      artists,
      bestMatch,
      tracks,
    };
  }

  isSearching() {
    return /^#\/sr\//g.test(window.location.hash);
  }

  playResult(resultObject) {
    const trackPlay = document.querySelector(`[data-id="${resultObject.id}"] ${SearchNamespace.selectors.playButton}`);
    const otherPlay = document.querySelector(`[data-id="${resultObject.id}"] ${SearchNamespace.selectors.cardPlayButton}`);
    if (!trackPlay && !otherPlay) {
      throw new Error('Failed to play result, it must not be in this search');
    }
    (trackPlay || otherPlay).click();
  }


  queueTrackResult(resultObject) {
    // First, open the menu so we can get at the menu items
    const trackMore = document.querySelector(`[data-id="${resultObject.id}"] ${SearchNamespace.selectors.moreButton}`);
    if (!trackMore) {
      throw new Error('Failed to locate the menu button for result; it may not be in this search');
    }

    (trackMore || otherMore).click();

    // Make sure the menu is open, then click the 'add to queue' button
    const waitForMenuOpen = setInterval(() => {
      var menu = document.querySelector(SearchNamespace.selectors.songMenu);
      if (menu.style.display !== 'none') {
        const queueButton = document.querySelector(`${SearchNamespace.selectors.songMenu} ${SearchNamespace.selectors.menuItems.addToQueue}`);
        if (!queueButton) {
          throw new Error('Failed to add result to queue; it may not be possible');
        }
        dispatchEvent(queueButton, 'click');
      }
    });
  }

  performSearch(text) {
    const newHash = `/sr/${encodeURIComponent(text).replace(/%20/g, '+')}`;
    if (window.location.hash === `#${newHash}`) {
      return Promise.resolve(this.getCurrentResults());
    }
    window.location.hash = newHash;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject('Search timed out'), 10000);
      let once = false;
      this.on('change:search-results', (newResults) => {
        if (once) return;
        once = true;
        clearTimeout(timeout);
        resolve(newResults);
      });
    });
  }
}
