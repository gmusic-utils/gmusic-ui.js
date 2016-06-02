import Track from './Track';

export default class Playlist {
  static fromPlaylistObject = (id, playlistObject) => {
    const playlist = new Playlist(id, playlistObject.Oh.replace(/ playlist$/g, ''));
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
