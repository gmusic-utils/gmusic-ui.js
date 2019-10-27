import { GMusicNamespace } from 'gmusic.js';
import Playlist from './Structs/Playlist';

import changeSpy from './utils/changeSpy';
import { findContextPath } from './utils/context';

const trackMenu = {
  radio: ':3',
  // automix: ":4",
  showMiniPlayer: ':5',
  playNext: ':6',
  deleteFromQueue: ':7',
  // addToQueue: ":8",
  addToLibrary: ':a',
  // deleteFromLibrary: ":b",
  // showVideo: ":c",
  // addToPlaylist: ":d",
  share: ':f',
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
  buy: ':r',
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

    Object(trackMenu).map((x) => this.addMethod(x, (track) => {
      this.openTrackDetails(track);
      document.querySelector(`[id="${trackMenu[x]}"]`).click();
    }));
  }

  _watchQueue() {
    const that = this;

    let queue = this.getTracks();
    changeSpy(window.APPCONTEXT[this.path[0]][this.path[1]][0], () => {
      const newQueue = this.getTracks();
      let changed = newQueue.length !== queue.length;

      changed = changed || queue
        .some((x, i) => !x || newQueue[i].id !== x.id);

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
  // eslint-disable-next-line class-methods-use-this
  scrollToTrack(track) {
    const songQueryString = `.song-row[data-id="${track.id}"] [data-id="play"]`;

    if (document.querySelector('#queue-overlay').style.display === 'none') {
      document.querySelector('#queue[data-id="queue"]').click();
    }
    if (document.querySelector(songQueryString)) {
      return;
    }

    const container = document.querySelector('#queueContainer');
    const tbody = document.querySelector('#queueContainer tbody');
    const start = Number(tbody.getAttribute('data-start-index'));
    const end = Number(tbody.getAttribute('data-end-index'));
    const h = document.querySelector('tr.song-row').getBoundingClientRect().height;
    if (track.index < start) {
      container.scrollTop -= ((start - track.index) * h) + h;
      return;
    }
    if (track.index > end) {
      container.scrollTop += ((track.index - end) * h) + h;
      return;
    }
    throw new Error(`Failed to find song with id ("${track.id}") in queue`);
  }

  openTrackDetails(track) {
    this.scrollToTrack(track);
    document.querySelector(`song-row[data-id="${track.id}"] [data-id="menu"]`);
  }

  playTrack(track) {
    const songQueryString = `.song-row[data-id="${track.id}"] [data-id="play"]`;
    this.scrollToTrack(track);
    document.querySelector(songQueryString).click();
  }
}
