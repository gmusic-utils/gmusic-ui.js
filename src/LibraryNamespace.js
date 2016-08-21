import { GMusicNamespace } from 'gmusic.js';
import Album from './Structs/Album';
import Artist from './Structs/Artist';
import Playlist from './Structs/Playlist';

import { findContextPath } from './utils/context';
import scrollToPlaySong from './utils/scrollToPlaySong';

export default class LibraryNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);
    this.tracks = [];
    this.path = findContextPath();

    if (this.path) {
      this._watchTracks();
    }

    this.addMethod('getTracks', this.getTracks.bind(this));
    this.addMethod('getAlbums', this.getAlbums.bind(this));
    this.addMethod('getArtists', this.getArtists.bind(this));
    this.addMethod('getLibrary', this.getLibrary.bind(this));
    this.addMethod('playAlbum', this.playAlbum.bind(this));
    this.addMethod('playTrack', this.playTrack.bind(this));
  }

  _watchTracks() {
    const that = this;

    let tracks = this.getTracks();
    window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', () => {
      const newTracks = this.getTracks();
      let changed = false;
      for (let i = 0; i < newTracks.length; i++) {
        if (!tracks[i]) {
          changed = true; break;
        }
        if (newTracks[i].id !== tracks[i].id) {
          changed = true; break;
        }
      }
      tracks = newTracks;
      if (changed) that.emit('change:library', this.getLibrary());
    });
  }

  getLibrary() {
    return {
      tracks: this.getTracks(),
      artists: this.getArtists(),
      albums: this.getAlbums(),
    };
  }

  getTracks() {
    return Playlist.fromPlaylistObject('_', window.APPCONTEXT[this.path[0]][this.path[1]][0][this.path[2]].all).tracks;
  }

  getArtists() {
    const artists = {};
    this.getAlbums().forEach((album) => {
      if (album.artist === 'Various Artists') return;
      const artistId = album.tracks[0].artistId;
      if (!artists[artistId]) artists[artistId] = new Artist(artistId, album.artist, album.tracks[0].artistImage);
      artists[artistId].albums.push(album);
    });
    return Object.keys(artists).map((artistId) => {
      artists[artistId].albums.sort((a, b) => b.name.localeCompare(a.name));
      return artists[artistId];
    });
  }

  getAlbums() {
    const albums = {};
    this.getTracks().forEach((track) => {
      const uniq = `${track.albumArt}_${track.album}`;
      albums[uniq] = albums[uniq] || new Album(track.albumId, track.album, track.albumArtist || track.artist, track.albumArt);
      if (track.albumArtist) {
        albums[uniq].isAlbumArtist = true;
      }
      if (!track.albumArtist && albums[uniq].artist !== track.artist) {
        albums[uniq].artist = 'Various Artists';
      }
      albums[uniq].tracks.push(track);
    });
    return Object.keys(albums).map((albumID) => {
      albums[albumID].tracks.sort((a, b) => b.index - a.index);
      return albums[albumID];
    });
  }

  _navigateToAlbum(album) {
    return new Promise((resolve, reject) => {
      let timer;
      let checker;
      const clearTimers = () => {
        clearTimeout(timer);
        clearInterval(checker);
      };
      timer = setTimeout(() => {
        clearTimers();
        reject(`Timed out while loading album - ${album.name}`);
      }, 4000);
      checker = setInterval(() => {
        const elem = document.querySelector('.material-album-container .title-text');
        if (elem && elem.innerText.trim() === album.name) {
          clearTimers();
          resolve();
        }
      }, 10);
      window.location.hash = `/album/${album.id}`;
    });
  }

  playAlbum(album) {
    return this._navigateToAlbum(album)
      .then(() => {
        const button = document.querySelector('.material-album-container [data-id=play]');
        if (button) button.click();
      });
  }

  playTrack(track) {
    return this._navigateToAlbum({
      id: track.albumId,
      name: track.album,
    })
      .then(() => scrollToPlaySong(track));
  }
}
