import assert from 'assert';
import { GMusicNamespace } from 'gmusic.js';
import Playlist from './Structs/Playlist';

import { findContextPath } from './utils/context';

export default class PlaylistNamespace extends GMusicNamespace {
  static selectors = {
    mainContainer: '#mainContainer',
    playButton: '[data-id="play"]',
    playlistInfoContainer: '.material-container-details',
    playlistTitle: '.title',
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
        if (info && info.querySelector(PlaylistNamespace.selectors.playlistTitle).innerText === playlist.name) {
          clearTimeouts();
          resolve();
        }
      }, 10);
    });
  }

  _watchPlaylistObject() {
    const that = this;
    let previous = this.getAll();

    window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', () => {
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
        (plKey) => typeof this._playlists[key][plKey] === 'object' && this._playlists[key][plKey].type === 'pl'
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
      .then(() => {
        const container = document.querySelector(PlaylistNamespace.selectors.mainContainer);
        const songQueryString = `.song-row[data-id="${track.id}"] ${PlaylistNamespace.selectors.playButton}`;
        let songPlayButton = document.querySelector(songQueryString);
        const initial = container.scrollTop;

        if (songPlayButton) {
          songPlayButton.click();
          return;
        }

        container.scrollTop = 0;
        // DEV: In order to save memory GPM only renders the songs currently on screen
        //      and a few above and a few below.  This means the song we want to play
        //      might not be visible.  We need to QUICKLY "scan" through the page making
        //      GPM render all songs till we find the one we want
        const scrolDownAndSearch = () => {
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
            throw new Error(`Failed to find song with id ("${track.id}") in playlist with id ("${playlist.id}")`);
          }
        };
        setTimeout(scrolDownAndSearch, 0);
      });
  }
}
