import Track from './Track';

let songArrayPath;

export default class Playlist {
  static fromPlaylistObject = (id, playlistObject) => {
    const playlist = new Playlist(id, playlistObject.getTitle().replace(/ playlist$/g, ''));
    if (playlistObject.items.length > 0 && !songArrayPath) {
      Object.keys(playlistObject.items[0]).forEach((trackKey) => {
        if (typeof playlistObject.items[0][trackKey] === 'object') {
          Object.keys(playlistObject.items[0][trackKey]).forEach((trackArrKey) => {
            if (Array.isArray(playlistObject.items[0][trackKey][trackArrKey])) {
              songArrayPath = [trackKey, trackArrKey];
            }
          });
        }
      });
    }
    if (!songArrayPath) return playlist;
    playlist.addTracks(playlistObject.items.map((track) => Track.fromTrackArray(track.Pf.Lc, track.index)));
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
