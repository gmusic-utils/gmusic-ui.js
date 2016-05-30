import assert from 'assert';
import PlaylistNamespace from './PlaylistNamespace';

class GMusicExtender {
  constructor() {
    this.controllers = {};
    assert(window.GMusic && window.GMusic._protoObj, 'GMusicUI relies on "window.GMusic" existing in the global scope, we couldn\'t find it');
  }

  addNamespace(namespaceName, namespace) {
    Object.assign(window.controllers, { [namespaceName]: namespace.getPrototype() });
    Object.assign(window.GMusic._protoObj, { [namespaceName]: namespace.getPrototype() });
  }
}

const controller = new GMusicExtender();
controller.addNamespace('playlists', new PlaylistNamespace());
