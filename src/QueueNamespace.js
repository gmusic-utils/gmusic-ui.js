import assert from 'assert';
import GMusicNamespace from './GMusicNamespace';
import Track from './Structs/Track';

const dispatchEvent = (el, etype) => {
  const evt = document.createEvent('Events');
  evt.initEvent(etype, true, false);
  el.dispatchEvent(evt);
};

export default class QueueNamespace extends GMusicNamespace {
  constructor(...args) {
    super(...args);
    this.tracks = [];
    this._watchQueue();

    this.addMethod('clear', this.clear.bind(this));
    this.addMethod('getTracks', this.getTracks.bind(this));
    this.addMethod('playTrack', this.playTrack.bind(this));
  }

  _watchQueue() {
    let lastQueue = [];
    const queueObserver = new MutationObserver(() => {
      const newQueue = this.getTracks();
      let changed = false;

      const checkSongs = (lastItem, newItem) => {
        Object.keys(newItem).forEach((key) => {
          if (newItem[key] !== lastItem[key]) {
            changed = true;
          }
        });
      };

      for (let i = 0; i < newQueue.length; i++) {
        if (!lastQueue[i]) {
          changed = true;
          break;
        }
        checkSongs(lastQueue[i], newQueue[i]);
      }

      if (changed) {
        lastQueue = newQueue;
        this.emitter.emit('change:queue', newQueue);
      }
    });
    queueObserver.observe(document.querySelector('#queue-overlay'), {
      childList: true,
      subtree: true,
    });
  }

  _render(container, force) {
    // DEV: The queue isn't rendered till a click event is fired on this element
    //      We must hide the queue during the 400ms animation and then reveal it
    //      once both the 400ms in and 400ms out animations are complete
    const table = container.querySelector('.queue-song-table');
    if (container.style.display === 'none' && (!table || force)) {
      // DEV: Hide the queue elements while we rapidly "render" the queue element
      //      We have to use a style element because inline styles are saved by GPM
      const style = document.createElement('style');
      style.innerHTML = '#queue-overlay {left: 10000px !important}';
      document.body.appendChild(style);

      // Render queue
      dispatchEvent(document.querySelector('#queue[data-id="queue"]'), 'click');
      setTimeout(() => {
        // Return queue to intitial state
        dispatchEvent(document.querySelector('#queue[data-id="queue"]'), 'click');
        // Set interval in this cased is less resource intensive than running a MutationObserver for about 20ms
        const waitForQueueToHide = setInterval(() => {
          if (container.style.display === 'none') {
            clearInterval(waitForQueueToHide);
            document.body.removeChild(style);
          }
        }, 2);
      }, 20);
    }
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
    const container = document.querySelector('#queue-overlay');
    this._render(container);

    return Array.prototype.slice.call(
      container.querySelectorAll('.queue-song-table tbody > .song-row')
    ).map((row, index) => {
      const timeString = row.querySelector('[data-col="duration"]').textContent.trim().split(':');
      const details = row.querySelector('.song-details-wrapper');
      const defaultString = {
        textContent: null,
      };
      return new Track({
        id: row.getAttribute('data-id'),
        title: (details.querySelector('.song-title') || defaultString).textContent,
        albumArt: row.querySelector('[data-col="song-details"] img').src.replace('=s60-e100-c', ''),
        artist: (details.querySelector('.song-artist') || defaultString).textContent,
        album: (details.querySelector('.song-album') || defaultString).textContent,
        index: index + 1,
        duration: 1000 * (parseInt(timeString[0], 10) * 60 + parseInt(timeString[1], 10)),
        playCount: parseInt(row.querySelector('[data-col="play-count"]').textContent, 10),
      });
    });
  }

  playTrack(track) {
    const songRow = document.querySelector('[data-id="' + track.id + '"]');
    assert(songRow, 'Failed to find song with ID: ' + track.id);
    songRow.querySelector('[data-id="play"]').click();
  }
}
