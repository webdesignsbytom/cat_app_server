import dbClient from '../utils/dbClient.js';

export const findAllPlaylists = () =>
  dbClient.playlist.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findPlaylistByName = (playlistName) =>
  dbClient.playlist.findUnique({
    where: {
      name: playlistName,
    },
    include: {
      videos: true,
    },
  });

export const addPlaylistVideos = (playlistName, videoId) =>
  dbClient.playlist.update({
    where: { name: playlistName },
    data: {
      videos: {
        connect: { id: videoId }, 
      },
    },
    include: {
      videos: true, 
    },
  });


export const removePlaylistVideos = (playlistName, videoId) =>
  dbClient.playlist.update({
      where: { name: playlistName },
      data: {
        videos: {
          disconnect: { id: videoId }, 
        },
      },
      include: {
        videos: true, 
      },
    });

