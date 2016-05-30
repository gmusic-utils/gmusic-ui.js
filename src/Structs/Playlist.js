import Track from './Track';

export default class Playlist {
  constructor(playlistObject, id) {
    this.id = id;
    this.name = playlistObject.Oh.replace(/ playlist$/g, '');
    this.tracks = playlistObject.items.map((track) => new Track(track.Pf.Lc));
  }
}
