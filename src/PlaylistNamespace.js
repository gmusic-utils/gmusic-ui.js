import assert from 'assert';
import GMusicNamespace from './GMusicNamespace';
import Playlist from './Structs/Playlist';

export default class PlaylistNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);
    this.path = this._findContextPath();
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

  _findContextPath() {
    let path;
    Object.keys(window.APPCONTEXT).forEach((key1) => {
      if (typeof window.APPCONTEXT[key1] === 'object') {
        const firstLevel = window.APPCONTEXT[key1] || {};
        Object.keys(firstLevel).forEach((key2) => {
          if (Array.isArray(firstLevel[key2]) && firstLevel[key2].length > 0) {
            const secondLevel = firstLevel[key2][0] || {};
            Object.keys(secondLevel).forEach((key3) => {
              if (secondLevel[key3] && typeof secondLevel[key3] === 'object'
                  && secondLevel[key3].queue && secondLevel[key3].all) {
                path = [key1, key2, key3];
              }
            });
          }
        });
      }
    });

    return path;
  }

  _navigate(playlist) {
    return new Promise((resolve, reject) => {
      window.location.hash = `/pl/${escape(playlist.id)}`;
      let waitForPageInterval;
      let waitTimeout;
      const clearTimeouts = () => clearTimeout(waitForPageInterval) && clearTimeout(waitTimeout);
      waitTimeout = setTimeout(() => clearTimeouts() && reject('Playlist took too long to load, it might not exist'), 10000);
      waitForPageInterval = setInterval(() => {
        const info = document.querySelector('.material-container-details');
        if (info && info.querySelector('.title').innerText === playlist.name) {
          clearTimeouts();
          resolve();
        }
      }, 10);
    });
  }

  _watchPlaylistObject() {
    const that = this;

    window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', () => {
      this._playlists = Object.assign({}, this._playlists, window.APPCONTEXT[this.path[0]][this.path[1]][0][this.path[2]]);
      that.emitter.emit('change:playlists', this.getAll());
    });
  }

  getAll() {
    return Object.keys(this._playlists).filter((key) =>
      key !== 'queue' && key !== 'all' && this._playlists[key].ha.type === 'pl'
    ).map((key) => {
      const playlist = this._playlists[key];
      return Playlist.fromPlaylistObject(key, playlist);
    });
  }

  play(playlist) {
    return this._navigate(playlist)
      .then(() => {
        document.querySelector('.material-container-details [data-id="play"]').click();
      });
  }

  playWithTrack(playlist = {}, track) {
    assert(playlist.id, 'Expected playlist to have a property "id" but it did not');
    assert(playlist.name, 'Expected playlist to have a property "name" but it did not');
    assert(track.id, 'Expected track to have a property "id" but it did not');
    return this._navigate(playlist)
      .then(() => {
        const container = document.querySelector('#mainContainer');
        const songQueryString = `.song-row[data-id="${track.id}"] [data-id="play"]`;
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
