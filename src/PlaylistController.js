import assert from 'assert';
import GenericController from './GenericController';
import Playlist from './Structs/Playlist';

export default class PlaylistController extends GenericController {
  constructor(...args) {
    super(...args);
    if (window.APPCONTEXT && window.APPCONTEXT.Go && window.APPCONTEXT.Go.h && window.APPCONTEXT.Go.h.length) {
      this._playlists = Object.assign({}, window.APPCONTEXT.Go.h[0].Hi);
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
      let waitForPage;
      const waitTimeout = setTimeout(() => clearInterval(waitForPage) && reject('Playlist took too long to load, it might not exist'), 10000);
      waitForPage = setInterval(() => {
        const info = document.querySelector('.material-container-details');
        if (info && info.querySelector('.title').innerText === playlist.name) {
          clearInterval(waitForPage);
          clearTimeout(waitTimeout);
          resolve();
        }
      }, 10);
    });
  }

  _watchPlaylistObject() {
    const that = this;

    window.APPCONTEXT.Go.h[0].addEventListener('E', () => {
      this._playlists = Object.assign({}, this._playlists, window.APPCONTEXT.Go.h[0].Hi);
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
    this._navigate(playlist)
      .then(() => {
        document.querySelector('.material-container-details [data-id="play"]').click();
      })
      .catch(() => {});
  }

  playWithTrack(playlist = {}, track) {
    assert(playlist.id, 'Expected playlist to have a property "id" but it did not');
    assert(playlist.name, 'Expected playlist to have a property "name" but it did not');
    assert(track.id, 'Expected track to have a property "id" but it did not');
    this._navigate(playlist)
      .then(() => {
        const container = document.querySelector('#mainContainer');
        const songQueryString = `.song-row[data-id=${track.id}"] [data-id="play"]`;
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
            setTimeout(scrolDownAndSearch, 0);
          } else {
            container.scrollTop = initial;
            throw new Error(`Failed to find song with id ("${track.id}") in playlist with id ("${playlist.id}")`);
          }
        };
        setTimeout(scrolDownAndSearch, 0);
      })
      .catch(() => {});
  }
}
