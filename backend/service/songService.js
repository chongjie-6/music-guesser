/**
 * @param query Query to search albums from iTunes
 * @param albumLimit Number of albums to return
 * @param songsPerAlbum Number of songs to include per album
 * @returns Array of album objects including song lists
 */
const getAlbumsWithSongsByQuery = async (query, albumLimit, songsPerAlbum = 5) => {
  const encodedQuery = encodeURIComponent(query);

  const albumResponse = await fetch(
    `https://itunes.apple.com/search?term=${encodedQuery}&entity=album&limit=${albumLimit}`
  );
  const albumData = await albumResponse.json();

  if (!albumResponse.ok) {
    throw new Error(albumData.error || "Failed to fetch albums from iTunes API");
  }

  const albums = albumData.results || [];

  const albumsWithSongs = await Promise.all(
    albums.map(async (album) => {
      const tracksResponse = await fetch(
        `https://itunes.apple.com/lookup?id=${album.collectionId}&entity=song&limit=${songsPerAlbum + 1}`
      );
      const tracksData = await tracksResponse.json();

      if (!tracksResponse.ok) {
        throw new Error(tracksData.error || "Failed to fetch album tracks from iTunes API");
      }

      const songs = (tracksData.results || [])
        .filter((item) => item.wrapperType === "track" && item.kind === "song")
        .slice(0, songsPerAlbum)
        .map((song) => ({
          trackId: song.trackId,
          trackName: song.trackName,
          previewUrl: song.previewUrl,
          trackNumber: song.trackNumber,
          trackTimeMillis: song.trackTimeMillis,
        }));

      return {
        collectionId: album.collectionId,
        collectionName: album.collectionName,
        artistName: album.artistName,
        artworkUrl100: album.artworkUrl100,
        releaseDate: album.releaseDate,
        primaryGenreName: album.primaryGenreName,
        trackCount: album.trackCount,
        songs,
      };
    })
  );

  return albumsWithSongs;
};

module.exports = {
  getAlbumsWithSongsByQuery,
};
