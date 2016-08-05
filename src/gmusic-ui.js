import PlaylistNamespace from './PlaylistNamespace';
import QueueNamespace from './QueueNamespace';
import SearchNamespace from './SearchNamespace';

import Album from './structs/Album';
import Artist from './structs/Artist';
import Playlist from './structs/Playlist';

const wrap = (GMusic) => {
  GMusic.Album = Album;
  GMusic.Artist = Artist;
  GMusic.Playlist = Playlist;

  GMusic.addNamespace('playlists', PlaylistNamespace);
  GMusic.addNamespace('queue', QueueNamespace);
  GMusic.addNamespace('search', SearchNamespace);
}

if (typeof window !== 'undefined' && window.GMusic) {
  wrap(window.GMusic);
}

module.exports = wrap;
