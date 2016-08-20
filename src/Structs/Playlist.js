import { Track } from 'gmusic.js';

let songArrayPath;

export default class Playlist {
  static fromPlaylistObject = (id, playlistObject, useAlbumIndex = false) => {
    const playlist = new Playlist(id, playlistObject.getTitle().replace(/ playlist$/g, ''));
    let items;
    if (playlistObject.items) {
      items = playlistObject.items;
    } else {
      Object.keys(playlistObject).forEach((key) => {
        if (playlistObject[key] && playlistObject[key].items) {
          items = playlistObject[key].items;
        }
      });
    }
    if (items && items.length > 0 && !songArrayPath) {
      Object.keys(items[0]).forEach((trackKey) => {
        if (typeof items[0][trackKey] === 'object') {
          Object.keys(items[0][trackKey]).forEach((trackArrKey) => {
            if (Array.isArray(items[0][trackKey][trackArrKey])) {
              songArrayPath = [trackKey, trackArrKey];
            }
          });
        }
      });
    }
    if (!songArrayPath) return playlist;
    playlist.addTracks(items.map((track, index) => Track.fromTrackArray(
      track[songArrayPath[0]][songArrayPath[1]], track.index || (useAlbumIndex ? null : index + 1)
    )));
    return playlist;
  };

  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.tracks = [];
  }

  addTracks(tracks) {
    this.tracks = this.tracks.concat(tracks);
    this._sort();
  }

  addTrack(track) {
    this.tracks.push(track);
    this._sort();
  }

  _sort() {
    this.tracks.sort((t1, t2) => t1.index - t2.index);
  }
}
