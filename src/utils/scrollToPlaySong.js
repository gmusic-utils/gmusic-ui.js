const selectors = {
  mainContainer: '#mainContainer',
  playButton: '[data-id="play"]',
};

const scrollToPlaySong = (track) =>
  new Promise((resolve, reject) => {
    const container = document.querySelector(selectors.mainContainer);
    const songQueryString = `.song-row[data-id="${track.id}"] ${selectors.playButton}`;
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
        reject(`Failed to find song with id ("${track.id}") in current view`);
      }
    };
    setTimeout(scrolDownAndSearch, 0);
  });

export default scrollToPlaySong;
