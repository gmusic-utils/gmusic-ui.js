import LibraryNamespace from './LibraryNamespace';
import PlaylistNamespace from './PlaylistNamespace';
import QueueNamespace from './QueueNamespace';
import SearchNamespace from './SearchNamespace';

import Album from './Structs/Album';
import Artist from './Structs/Artist';
import Playlist from './Structs/Playlist';

const wrap = (GMusic) => {
  GMusic.Album = Album;
  GMusic.Artist = Artist;
  GMusic.Playlist = Playlist;

  GMusic.addNamespace('library', LibraryNamespace);
  GMusic.addNamespace('playlists', PlaylistNamespace);
  GMusic.addNamespace('queue', QueueNamespace);
  GMusic.addNamespace('search', SearchNamespace);
};

if (typeof window !== 'undefined' && window.GMusic) {
  wrap(window.GMusic);
}

module.exports = wrap;
