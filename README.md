# gmusic-ui.js
[![Build Status](https://travis-ci.org/gmusic-utils/gmusic-ui.js.svg?branch=master)](https://travis-ci.org/gmusic-utils/gmusic-ui.js)
[![GitHub release](https://img.shields.io/github/tag/gmusic-utils/gmusic-ui.js.svg)]()
[![Code Climate](https://img.shields.io/codeclimate/github/gmusic-utils/gmusic-ui.js.svg)]()
[![GitHub license](https://img.shields.io/github/license/gmusic-utils/gmusic-ui.js.svg)]()

Browser-side JS library for controlling [Google Music][] through UI manipulation.

[Google Music]: https://play.google.com/music/

`gmusic-ui.js` is not created by, affiliated with, or supported by Google Inc.

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

### Data Structures
#### Album
```js
{
  "id": String,           // Unique ID for this album
  "name": String,         // The name of the album
  "artist": String,       // The name of the artist for the album
  "albumArt": String,     // URL to the albumArt for this album
}
```
#### Artist
```js
{
  "id": String,           // Unique ID for this artist
  "name": String,         // The name of the artist
  "image": String,        // URL to an image of this artist
}
```
#### Playlist
```js
{
  "id": String,           // Unique ID for this playlist
  "name": String,         // User defined name for this playlist
  "tracks": Track[],      // An array of Track objects that make up the playlist
}
```
#### SearchResults
```js
{
  "searchText": String,   // The text the user searched for to get these results
  "albums": Album[],      // An array of albums that are part of these search results
  "artists": Artist[],    // An array of artists that are part of these search results
  "tracks": Track[],      // An array of tracks taht are part of these search results
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

**Returns:**
- retVal `Promise` - A promise that resolves when the playlist starts playing.  This promise can be rejected so you need to handle any errors with `.catch`

#### `playlists.playWithTrack(playlist, track)`
Navigates to the given playlist and plays it immediately starting at the given track

- playlist `Playlist` - A [`Playlist`](#playlist) object returned from [`getAll()`](#playlistsgetall)
- track `Track` - A [`Track`](#track) object from the `tracks` property of the supplied playlist

**Returns:**
- retVal `Promise` - A promise that resolves when the track starts playing.  This promise can be rejected so you need to handle any errors with `.catch`


### Queue
#### `queue.clear()`
Clears the current queue

#### `queue.getTracks()`
Retrieves a list of all the tracks in the users current queue

**Returns:**
- retVal `Track[]` - An array of [`Track`](#track) objects

#### `queue.playTrack(track)`
Attempts to play a given track in the queue.  If this track is not in the queue an error will be thrown

- track `Track` A [`Track`](#track) object returned from [`getTracks()`](#queuegettracks)

**Returns:**
- retVal `Promise` - A promise that resolves when the track starts playing.  This promise can be rejected so you need to handle any errors with `.catch`

### Search
#### `search.getCurrentResults()`
Retrieves a [`SearchResults`](#searchresults) object representing the current search results.  Will
throw an error if the user is not currently searching

**Returns:**
- retVal `SearchResults` - An object of the structure of a [`SearchResults`](#searchresults) object

#### `search.getSearchText()`
Retrieves the current string that the user is searching for or the most recent string
the user searched for.  Basically whatever is in the search input field at the moment.

**Returns:**
- retVal `String` - The value of the search input field

#### `search.isSearching()`
Determines if the user is currently searching or not

**Returns:**
- retVal `Boolean` - True if the user is searching, False otherwise

#### `search.performSearch(text)`
Immediately triggers a new search for the given text

- text `String` A word of sequence of words to search for

**Returns:**
- retVal `Promise` - A promise that will resolve with the results of the search you just performed.
The promise will be rejected with a timeout error if the search takes too long.

#### `search.playResult(result)`
Immediately attempts to play the given result.  If we fail to play the given result
an error will be thrown.

- result [`Album`](#album) | [`Artist`](#artist) | [`Track`](#track) - An object returned from `getResults()` that you wish to play

## Hooks
Hooks are bound the same way as the [gmusic.js](https://github.com/gmusic-utils/gmusic.js#hooks) hooks.

###.on('change:playlists')
Triggers when the content of any playlist or the list of playlists changes in any way.

```js
gmusic.on('change:playlists', function (playlists) {
})
```

- playlists `Playlist[]` - A list of [`Playlist`](#playlist) objects

###.on('change:queue')
Triggers when the contents of the queue is changes in any way

```js
gmusic.on('change:queue', function (queue) {
})
```

###.on('change:search-results')
Triggers when a new search is performed and the results change

```js
gmusic.on('change:search-results', function (newResults) {
})
```

- queue `Track[]` - A list of [`Track`](#track) objects

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

### Testing
Currently there is no testing framework.  We should probably implement the GMusic.js testing library in this repo aswell
