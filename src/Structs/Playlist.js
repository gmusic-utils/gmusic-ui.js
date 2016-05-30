import Track from './Track';

export default class Playlist {
  static fromPlaylistObject = (id, playlistObject) => {
    const playlist = new Playlist(id, playlistObject.Oh.replace(/ playlist$/g, ''));
    playlistObject.items.map((track) => Track.fromTrackArray(track.Pf.Lc, track.index)).forEach((track) => {
      playlist.addTrack(track);
    });
    return playlist;
  };

  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.tracks = [];
  }

  addTrack(track) {
    this.tracks.append(track);
    this.tracks.sort((t1, t2) => t1.index - t2.index);
  }
}
