import { GMusicNamespace } from 'gmusic.js';
import Playlist from './Structs/Playlist';

import changeSpy from './utils/changeSpy';
import { findContextPath } from './utils/context';
import { click } from './utils/mouseEvents';

const delay = (t, v) => new Promise((resolve) => setTimeout(() => resolve(v), t));

const trackMenu = {
  startRadio: ':3',
  // automix: ":4",
  showMiniPlayer: ':5',
  playNext: ':6',
  deleteFromQueue: ':7',
  // addToQueue: ":8",
  addToLibrary: ':a',
  // deleteFromLibrary: ":b",
  // showVideo: ":c",
  // addToPlaylist: ":d",
  // shareTrack: ':f',
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
  // buy: ':r',
};

const $ = (query, throwError = false) => {
  const e = document.querySelector(query);
  if (throwError && !e) throw new Error(`Element ${query} not found in queue`);
  return e;
};

const validateTrack = (track) => {
  if (!track || (!track.index && track.index !== 0) || !track.id) throw new Error('Track have no index and id');
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

    Object.keys(trackMenu).map((x) => {
      this[x] = (track) => {
        validateTrack(track);

        this.scrollTo(track);
        delay(500)
          .then(() => {
            click($(`#queueContainer .song-row[data-id="${track.id}"] [data-id="menu"]`, true));
            click($(`[id="${trackMenu[x]}"]`, true));
          });
        // DEV: Changing the scrollTop and rerendering is an asyncronous response
        //      If we wait for next tick the rerender will be complete
        // setTimeout(() => {
        //   $(`#queueContainer .song-row[data-id="${track.id}"] [data-id="menu"]`, true).click();
        //   click($(`[id="${trackMenu[x]}"]`, true));
        // }, 500);
      };
      this.addMethod(x, this[x]);
      return this[x];
    });
  }

  // DEV: In order to save memory GPM only renders the songs currently on screen
  //      and a few above and a few below.  This means the song we want to play
  //      might not be visible.  We need to QUICKLY "scan" through the page making
  //      GPM render all songs till we find the one we want
  scrollTo(track) {
    validateTrack(track);
    const t = this.getTracks().find((x) => x.id === track.id);
    track.index = t ? t.index : track.index;
    const songQueryString = `#queueContainer .song-row[data-id="${track.id}"] [data-id="menu"]`;

    if ($('#queue-overlay').style.display === 'none') {
      $('#queue[data-id="queue"]', true).click();
    }
    if ($(songQueryString)) return;
    const container = $('#queueContainer', true);
    const hTrack = $('#queueContainer tr.song-row', true).getBoundingClientRect().height;
    container.scrollTop = track.index * hTrack;
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
    const clearButton = $('#queue-overlay [data-id="clear-queue"]', true);
    if (clearButton) {
      clearButton.click();
      setTimeout(() => {
        this._render($('#queue-overlay'), true);
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
    validateTrack(track);
    const songQueryString = `#queueContainer .song-row[data-id="${track.id}"] [data-id="play"]`;
    this.scrollTo(track);

    setTimeout(() => $(songQueryString, true).click(), 100);
  }
}
