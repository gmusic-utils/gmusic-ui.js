# gmusic-ui.js
[![Build Status](https://travis-ci.org/gmusic-utils/gmusic-ui.js.svg?branch=master)](https://travis-ci.org/gmusic-utils/gmusic-ui.js)
[![GitHub release](https://img.shields.io/github/tag/gmusic-utils/gmusic-ui.js.svg)]()
[![Code Climate](https://img.shields.io/codeclimate/github/gmusic-utils/gmusic-ui.js.svg)]()
[![GitHub license](https://img.shields.io/github/license/gmusic-utils/gmusic-ui.js.svg)]()

Browser-side JS library for controlling [Google Music][] through UI manipulation.

[Google Music]: https://play.google.com/music/

`gmusic-ui.js` is not created by, affiliated with, or supported by Google Inc.

[Google Music]: https://play.google.com/music/listen

## Getting Started
It's important to note the `gmusic-ui.js` depends on [`gmusic.js`](https://github.com/gmusic-utils/gmusic.js) in order to operate correctly

### npm
Install the module with: `npm install gmusic.js gmusic-ui.js`

Once installed, add it to your HTML and access it via `window.GMusic`.

```html
<script>
  require('gmusic.js')
  require('gmusic-ui.js')
  window.gmusic = new window.GMusic(); // Our Google Music API
</script>
```

### Vanilla
If you are not using a package manager, download the latest script at:

https://raw.githubusercontent.com/gmusic-utils/gmusic-ui.js/master/dist/gmusic-ui.min.js

Then, add it to your HTML and access it via `window.GMusic`.

```html
<script src="gmusic.min.js"></script>
<script src="gmusic-ui.min.js"></script>
<script>
  window.gmusic = new window.GMusic(window); // Our Google Music API
</script>
```

## Documentation
`gmusic-ui.js` **extends** the `GMusic` constructor, `window.GMusic`

### Data Structure

#### Playlist

```js
{
  "id": String,           // Unique ID for this playlist
  "name": String,         // User defined name for this playlist
  "tracks": Track[],      // An array of Track objects that make up the playlist
}
```

#### Track

```js
{
  "id": String,             // Unique ID for this song
  "index": Number,          // The index position (starting at 1) of the track in the object that is storing a collection of tracks E.g. A Playlist
  "title": String,
  "artist": String,
  "album": String,
  "albumArt": String,       // URL to the albumArt for this song
  "duration": Number,       // Duration of song in milliseconds
  "playCount": Number,      // Number of times the user has ever played the song
}
```

### `new GMusic(window)`
Constructor for a new Google Music API.

- window - `Object` -  The global window object

You can read up on the namespaces and methods that `gmusic` natively offers over in the [gmusic.js README](https://github.com/gmusic-utils/gmusic.js/blob/master/README.md#documentation)

Below are the namespaces and methods that `gmusic-ui` **adds** to GMusic

### Playlists

#### `playlists.getAll()`
Retrieves a list of all the playlists in the users GPM library

**Returns:**
- retVal `Playlist[]` - An array of [`Playlist`](#playlist) objects

#### `playlists.play(playlist)`
Navigates to the given playlist and plays it immediately

- playlist `Playlist` - A [`Playlist`](#playlist) object returned from [`getAll()`](#playlistsgetall)

#### `playlists.playWithTrack(playlist, track)`
Navigates to the given playlist and plays it immediately starting at the given track

- playlist `Playlist` - A [`Playlist`](#playlist) object returned from [`getAll()`](#playlistsgetall)
- track `Track` - A [`Track`](#track) object from the `tracks` property of the supplied playlist

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

### Testing
Currently there is no testing framework.  We should probably implement the GMusic.js testing library in this repo aswell
