// import assert from 'assert';
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
      console.error('Could not listen to playlist changes in the expected location'); // eslint-disable-line
    }

    this.addMethod('getAll', this.getAll.bind(this));
    this.addMethod('play', this.play.bind(this));
    this.addMethod('playWithTrack', this.playWithTrack.bind(this));
  }

  _navigate(playlist) {
    return new Promise((resolve) => {
      window.location.hash = `/pl/${escape(playlist.id)}`;
      const waitForPage = setInterval(() => {
        const info = document.querySelector('.material-container-details');
        if (info && info.querySelector('.title').innerText === playlist.name) {
          clearInterval(waitForPage);
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
      return new Playlist(playlist, key);
    });
  }

  play(playlist) {
    this._navigate(playlist)
      .then(() => {
        document.querySelector('.material-container-details [data-id="play"]').click();
      });
  }

  playWithTrack(playlist, track) {
    this._navigate(playlist)
      .then(() => {
        const songPlayButton = document.querySelector(`.song-row[data-id="${track.id}"] [data-id="play"]`);
        if (songPlayButton) songPlayButton.click();
      });
  }

  // getController() {
  //   const that = this;
  //   return {
  //     getAll: function() { // eslint-disable-line
  //       return that.getAll();
  //     },
  //     hook: function() { // eslint-disable-line
  //       that.emitter = this;
  //     },
  //     _navigate: function(playlist, cb) { // eslint-disable-line
  //       window.location.hash = `/pl/${escape(playlist.id)}`;
  //       const waitForPage = setInterval(() => {
  //         const info = document.querySelector('.material-container-details');
  //         if (info && info.querySelector('.title').innerText === playlist.name) {
  //           clearInterval(waitForPage);
  //           if (cb && typeof cb === 'function') cb();
  //         }
  //       }, 10);
  //     },
  //     play: function(playlist, cb) { // eslint-disable-line
  //       this.playlists._navigate(playlist, () => {
  //         document.querySelector('.material-container-details [data-id="play"]').click();
  //       });
  //     },
  //     playWithTrack: function(playlist, track) { // eslint-disable-line
  //       this.playlists._navigate(playlist, () => {
  //         const songPlayButton = document.querySelector(`.song-row[data-id="${track.id}"] [data-id="play"]`);
  //         if (songPlayButton) songPlayButton.click();
  //       });
  //     },
  //   };
  // }
}
