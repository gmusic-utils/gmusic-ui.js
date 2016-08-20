export default class Artist {
  constructor(id, name, image) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.albums = [];
  }
}
