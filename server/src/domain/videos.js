import dbClient from '../utils/dbClient.js';

export const findAllVideos = () =>
  dbClient.video.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

export const findVideoById = (id) =>
  dbClient.video.findUnique({
    where: { id: id },
  });

export const findAllVideosByStatus = (status) =>
  dbClient.video.findMany({
    where: {
      videoStatus: status, // Ensure the field name matches the schema
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

export const updateVideoStatus = (id, status, newPath) =>
  dbClient.video.update({
    where: {
      id: id,
    },
    data: { videoStatus: status, path: newPath },
  });

export const deleteVideoById = (id) =>
  dbClient.video.delete({
    where: {
      id: id,
    },
  });
