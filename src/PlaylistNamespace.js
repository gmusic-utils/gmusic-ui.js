import assert from 'assert';
import { GMusicNamespace } from 'gmusic.js';
import Playlist from './Structs/Playlist';

import changeSpy from './utils/changeSpy';
import { findContextPath } from './utils/context';
import scrollToPlaySong from './utils/scrollToPlaySong';

export default class PlaylistNamespace extends GMusicNamespace {
  static selectors = {
    mainContainer: '#mainContainer',
    playButton: '#playButton',
    playlistInfoContainer: '.gpm-detail-page-header.detail-wrapper',
    playlistTitle: '[slot="title"]',
  };

  constructor(...args) {
    super(...args);
    this.path = findContextPath();
    if (this.path) {
      this._playlists = Object.assign({}, window.APPCONTEXT[this.path[0]][this.path[1]][0][this.path[2]]);
      this._watchPlaylistObject();
    } else {
      this._playlists = {};
    }

    this.addMethod('getAll', this.getAll.bind(this));
    this.addMethod('play', this.play.bind(this));
    this.addMethod('playWithTrack', this.playWithTrack.bind(this));
  }

  _navigate(playlist) {
    return new Promise((resolve, reject) => {
      window.location.hash = `/pl/${escape(playlist.id)}`;
      let waitForPageInterval;
      let waitTimeout;
      const clearTimeouts = () => clearTimeout(waitForPageInterval) && clearTimeout(waitTimeout);
      waitTimeout = setTimeout(() => clearTimeouts() && reject('Playlist took too long to load, it might not exist'), 10000);
      waitForPageInterval = setInterval(() => {
        const info = document.querySelector(PlaylistNamespace.selectors.playlistInfoContainer);
        if (info && info.querySelector(PlaylistNamespace.selectors.playlistTitle).innerText.trim() === playlist.name) {
          clearTimeouts();
          resolve();
        }
      }, 10);
    });
  }

  _watchPlaylistObject() {
    const that = this;
    let previous = this.getAll();

    changeSpy(window.APPCONTEXT[this.path[0]][this.path[1]][0], () => {
      this._playlists = Object.assign({}, this._playlists, window.APPCONTEXT[this.path[0]][this.path[1]][0][this.path[2]]);
      const current = this.getAll();
      let changed = false;
      Object.keys(current).forEach((key) => {
        if (!previous[key]) {
          changed = true;
          return;
        }
        if (previous[key].tracks.length !== current[key].tracks.length) {
          changed = true;
          return;
        }
        for (let i = 0; i < current[key].tracks.length; i++) {
          if (!current[key].tracks[i].equals(previous[key].tracks[i])) {
            changed = true;
            return;
          }
        }
      });
      previous = current;
      if (!changed) return;
      that.emit('change:playlists', current);
    });
  }

  getAll() {
    return Object.keys(this._playlists).filter((key) =>
      key !== 'queue' && key !== 'all' && Object.keys(this._playlists[key]).some(
        (plKey) => this._playlists[key][plKey] && typeof this._playlists[key][plKey] === 'object' && this._playlists[key][plKey].type === 'pl'
      )
    ).map((key) => {
      const playlist = this._playlists[key];
      return Playlist.fromPlaylistObject(key, playlist);
    });
  }

  play(playlist) {
    return this._navigate(playlist)
      .then(() => {
        document.querySelector(`${PlaylistNamespace.selectors.playlistInfoContainer} ${PlaylistNamespace.selectors.playButton}`).click();
      });
  }

  playWithTrack(playlist = {}, track) {
    assert(playlist.id, 'Expected playlist to have a property "id" but it did not');
    assert(playlist.name, 'Expected playlist to have a property "name" but it did not');
    assert(track.id, 'Expected track to have a property "id" but it did not');
    return this._navigate(playlist)
      .then(() => scrollToPlaySong(track));
  }
}
