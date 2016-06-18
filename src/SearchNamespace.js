import GMusicNamespace from './GMusicNamespace';

import Album from './Structs/Album';
import Artist from './Structs/Artist';
import Track from './Structs/Track';

import { findContextPath } from './utils/context';

export default class SearchNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);
    this.path = findContextPath();
    if (this.path) {
      this._watchForSearches();
    }

    this.addMethod('getSearchText', this.getSearchText.bind(this));
    this.addMethod('getResults', this.getResults.bind(this));
    this.addMethod('isSearching', this.isSearching.bind(this));
    this.addMethod('playResult', this.playResult.bind(this));
    this.addMethod('search', this.search.bind(this));
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
      this.emitter.emit('change:search:text', this.getSearchText());
      searchChanged = 2;
    });

    window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', () => {
      if (searchChanged > 0) {
        searchChanged -= 1;
        if (searchChanged === 0) {
          that.emitter.emit('change:search:results', that.getResults());
        }
      }
    });
  }

  getSearchText() {
    return document.querySelector('sj-search-box input').value;
  }

  getResults() {
    if (!this.isSearching()) {
      throw new Error('Can\'t get search results when the user is not searching');
    }

    const albumElems = document.querySelectorAll('.lane-content > [data-type=album]');
    const albums = [];

    Array.prototype.forEach.call(albumElems, (elem) => {
      albums.push(new Album(
        elem.getAttribute('data-id'),
        elem.querySelector('.details .title').textContent,
        elem.querySelector('.details .sub-title').textContent,
        elem.querySelector('img').src.replace('=w220-c-h220-e100', '')
      ));
    });

    const artistElems = document.querySelectorAll('.lane-content > [data-type=artist]');
    const artists = [];

    Array.prototype.forEach.call(artistElems, (elem) => {
      let image = elem.querySelector('img');
      if (image) {
        image = image.src.replace('=w220-c-h220-e100', '');
      } else {
        image = null;
      }
      artists.push(new Artist(
        elem.getAttribute('data-id'),
        elem.querySelector('.details .title').textContent,
        image
      ));
    });

    const trackElems = document.querySelectorAll('.songlist-container .song-table tr.song-row');
    const tracks = [];
    Array.prototype.forEach.call(trackElems, (elem, index) => {
      const durationParts = elem.querySelector('[data-col="duration"]').textContent.trim().split(':');
      tracks.push(new Track({
        id: elem.getAttribute('data-id'),
        title: this._text(elem.querySelector('[data-col="title"]'), 'Unknown Title'),
        albumArt: elem.querySelector('[data-col="title"] img').src.replace('=s60-e100-c', ''),
        artist: this._text(elem.querySelector('[data-col="artist"]'), 'Unknown Artist'),
        album: this._text(elem.querySelector('[data-col="album"]'), 'Unknown Album'),
        index,
        duration: parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10),
        playCount: parseInt(this._text(elem.querySelector('[data-col="play-count"]'), '0'), 10),
      }));
    });

    return {
      albums,
      artists,
      tracks,
    };
  }

  isSearching() {
    return /^#\/sr\//g.test(window.location.hash);
  }

  playResult(resultObject) {
    const trackPlay = document.querySelector(`[data-id="${resultObject.id}"] [data-id="play"]`);
    const otherPlay = document.querySelector(`[data-id="${resultObject.id}"] .play-button-container`);
    if (!trackPlay && !otherPlay) {
      throw new Error('Failed to play result, it must not be in this search');
    }
    (trackPlay || otherPlay).click();
  }

  search(text) {
    window.location.hash = `/sr/${escape(text.replace(/ /g, '+'))}`;
  }
}
