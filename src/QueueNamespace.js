import assert from 'assert';
import GMusicNamespace from './GMusicNamespace';
import Playlist from './Structs/Playlist';

import { findContextPath } from './utils/context';

const dispatchEvent = (el, etype) => {
  const evt = document.createEvent('Events');
  evt.initEvent(etype, true, false);
  el.dispatchEvent(evt);
};

export default class QueueNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);
    this.tracks = [];
    this.path = findContextPath();

    if (this.path) {
      this._watchQueue();
    }

    this.addMethod('clear', this.clear.bind(this));
    this.addMethod('getTracks', this.getTracks.bind(this));
    this.addMethod('playTrack', this.playTrack.bind(this));
  }

  _watchQueue() {
    const that = this;

    let queue = this.getTracks();
    window.APPCONTEXT[this.path[0]][this.path[1]][0].addEventListener('E', () => {
      const newQueue = this.getTracks();
      let changed = false;
      for (let i = 0; i < newQueue.length; i++) {
        if (!queue[i]) {
          changed = true; break;
        }
        if (newQueue[i].id !== queue[i].id) {
          changed = true; break;
        }
      }
      queue = newQueue;
      if (changed) that.emitter.emit('change:queue', newQueue);
    });
  }

  clear(cb) {
    const clearButton = document.querySelector('#queue-overlay [data-id="clear-queue"]');
    if (clearButton) {
      clearButton.click();
      setTimeout(() => {
        this._render(document.querySelector('#queue-overlay'), true);
        if (cb) {
          cb();
        }
      }, 200);
    } else if (cb) {
      cb();
    }
  }

  getTracks() {
    return Playlist.fromPlaylistObject('_', window.APPCONTEXT[this.path[0]][this.path[1]][0][this.path[2]].queue).tracks;
  }

  playTrack(track) {
    if (document.querySelector('#queue-overlay').style.display === 'none') {
      dispatchEvent(document.querySelector('#queue[data-id="queue"]'), 'click');
    }
    return new Promise((resolve) => {
      const waitForQueueOpen = setInterval(() => {
        if (document.querySelector('#queue[data-id="queue"]').classList.contains('opened')) {
          clearInterval(waitForQueueOpen);
          resolve();
        }
      });
    }).then(() => {
      assert(track.id, 'Expected track to have a property "id" but it did not');
      const container = document.querySelector('#queueContainer');
      const songQueryString = `.song-row[data-id="${track.id}"] [data-id="play"]`;
      let songPlayButton = document.querySelector(songQueryString);
      const initial = container.scrollTop;

      if (songPlayButton) {
        songPlayButton.click();
        return;
      }

      container.scrollTop = 0;
      // DEV: In order to save memory GPM only renders the songs currently on screen
      //      and a few above and a few below.  This means the song we want to play
      //      might not be visible.  We need to QUICKLY "scan" through the page making
      //      GPM render all songs till we find the one we want
      const scrolDownAndSearch = () => {
        songPlayButton = document.querySelector(songQueryString);
        if (songPlayButton) {
          songPlayButton.click();
          return;
        }
        if (container.scrollTop < container.scrollHeight - container.getBoundingClientRect().height) {
          container.scrollTop += container.getBoundingClientRect().height;
          // DEV: Changing the scrollTop and rerendering is an asyncronous response
          //      If we wait for next tick the rerender will be complete
          setTimeout(scrolDownAndSearch, 10);
        } else {
          container.scrollTop = initial;
          throw new Error(`Failed to find song with id ("${track.id}") in queue`);
        }
      };
      setTimeout(scrolDownAndSearch, 0);
    });
  }
}
