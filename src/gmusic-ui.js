import assert from 'assert';
import PlaylistController from './PlaylistController';

class GMusicUIController {
  constructor() {
    this.controllers = {};
    assert(window.GMusic && window.GMusic._protoObj, 'GMusicUI relies on "window.GMusic" existing in the global scope, we couldn\'t find it');
  }

  addController(namespace, controller) {
    this.controllers[namespace] = controller.getController();
    window.GMusic._protoObj[namespace] = controller.getController();
  }
}

const controller = new GMusicUIController();
controller.addController('playlists', new PlaylistController());
