export default class Album {
  /**
   * @param {String} id
   * @param {String} name
   * @param {String} artistName
   * @param {String} albumArt
   */
  constructor(id, name, artistName, albumArt) {
    /**
     * Unique ID for this album
     * @type {String}
     */
    this.id = id;
    /**
     * The name of the album
     * @type {String}
     */
    this.name = name;
    /**
     * The name of the artist for the album
     * @type {String}
     */
    this.artist = artistName;
    /**
     * URL to the albumArt for this album
     * @type {String}
     */
    this.albumArt = albumArt;
  }
}
