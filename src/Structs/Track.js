export default class Track {
  constructor(index, trackArr) {
    this.id = trackArr[0];
    this.title = trackArr[1];
    this.albumArt = trackArr[2];
    this.artist = trackArr[3];
    this.album = trackArr[4];
    this.index = index;

    this.duration = trackArr[13];
    this.playCount = trackArr[22];
  }
}
