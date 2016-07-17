export default class Track {
  static fromTrackArray = (trackArr, index) =>
    new Track({
      id: trackArr[0],
      title: trackArr[1],
      albumArt: trackArr[2],
      artist: trackArr[3],
      album: trackArr[4],
      index,
      duration: trackArr[13],
      playCount: trackArr[22],
    });

  /**
   * @param {String} id
   * @param {String} title
   * @param {String} albumArt
   * @param {String} artist
   * @param {String} album
   * @param {String} artist
   * @param {Number} [index=0]
   * @param {Number} duration
   * @param {Number} [playCount=1]
   */
  constructor({
    id,
    title,
    albumArt,
    artist,
    album,
    index = 1,
    duration,
    playCount = 0,
  }) {
    /**
     * Unique ID for this track
     * @type {String}
     */
    this.id = id;
    /**
     * The title of the track
     * @type {String}
     */
    this.title = title;
    /**
     * The URL to the albumArt for the track
     * @type {String}
     */
    this.albumArt = albumArt;
    /**
     * The name of the Artist for the track
     * @type {String}
     */
    this.artist = artist;
    /**
     * The name of the Album for the track
     * @type {String}
     */
    this.album = album;
    /**
     * The index position (starting at 1) of the track in the object that is storing a collection of tracks
     * @type {Number}
     */
    this.index = index;

    /**
     * Length of this track in milliseconds
     * @type {Number}
     */
    this.duration = duration;
    /**
     * Amount of times the user has played this track
     * @type {Number}
     */
    this.playCount = playCount;
  }

  /**
   * Checks equality between two tracks
   * @param {Track} other The track to compare this one to
   * @return {Boolean}
   */
  equals(other) {
    return this.id === other.id &&
      this.title === other.title &&
      this.albumArt === other.albumArt &&
      this.artist === other.artist &&
      this.album === other.album &&
      this.index === other.index &&
      this.duration === other.duration &&
      this.playCount === other.playCount;
  }
}
