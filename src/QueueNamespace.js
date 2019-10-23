import assert from 'assert';
import { GMusicNamespace } from 'gmusic.js';
import Playlist from './Structs/Playlist';

import changeSpy from './utils/changeSpy';
import { findContextPath } from './utils/context';

const dispatchEvent = (el, etype) => {
  const evt = document.createEvent('Events');
  evt.initEvent(etype, true, false);
  el.dispatchEvent(evt);
};

var trackMenu = {
  radio: ":3",
  // automix: ":4",
  showMiniPlayer: ":5",
  playNext: ":6",
  deleteFromQueue: ":7",
  // addToQueue: ":8",
  addToLibrary: ":a",
  // deleteFromLibrary: ":b",
  // showVideo: ":c",
  // addToPlaylist: ":d",
  share: ":f",
  // changeData: ":g",
  // download: ":h",
  // remove: ":i",
  // deleteFromPlaylist: ":j",
  // rate: ":k",
  // artistPage: ":l",
  // restore: ":m",
  // remove: ":n",
  // chooseAll: ":o",
  // cleanQueue: ":p",
  // report: ":q",
  buy: ":r"
}

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

    Object(trackMenu).map(x => this.addMethod(x, (track) => {
      this._openTrackDetails(track);
      document.querySelector(`[id="${trackMenu[x]}"]`).click();
    }))
  }

  _watchQueue() {
    const that = this;

    let queue = this.getTracks();
    changeSpy(window.APPCONTEXT[this.path[0]][this.path[1]][0], () => {
      const newQueue = this.getTracks();
      let changed = newQueue.length !== queue.length;
      for (let i = 0; i < newQueue.length; i++) {
        if (!queue[i]) {
          changed = true; break;
        }
        if (newQueue[i].id !== queue[i].id) {
          changed = true; break;
        }
      }
      queue = newQueue;
      if (changed) that.emit('change:queue', newQueue);
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

  // DEV: In order to save memory GPM only renders the songs currently on screen
  //      and a few above and a few below.  This means the song we want to play
  //      might not be visible.  We need to QUICKLY "scan" through the page making
  //      GPM render all songs till we find the one we want
  _scrollToTrack(track) {
    if (document.querySelector('#queue-overlay').style.display === 'none') {
      document.querySelector('#queue[data-id="queue"]').click();
    }
    var songQueryString = `.song-row[data-id="${track.id}"] [data-id="play"]`;
    if (document.querySelector(songQueryString)) {
      return;
    }
    var container = document.querySelector('#queueContainer');
    var tbody = document.querySelector('#queueContainer tbody');
    var start = Number(tbody.getAttribute('data-start-index'));
    var end = Number(tbody.getAttribute('data-end-index'));
    var h = document.querySelector('tr.song-row').getBoundingClientRect().height;
    if (track.index < start) {
      return container.scrollTop -= ((start - track.index) * h) + h;
    } else if (track.index > end) {
      return container.scrollTop += ((track.index - end) * h) + h;
    }
    throw new Error(`Failed to find song with id ("${track.id}") in queue`);
  }

  _openTrackDetails(track) {
    this._scrollToTrack(track);
    document.querySelector(`song-row[data-id="${track.id}"] [data-id="menu"]`)
  }

  playTrack(track) {
    this._scrollToTrack(track)
    document.querySelector(songQueryString).click()
  }
}
