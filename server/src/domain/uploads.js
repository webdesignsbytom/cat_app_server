import dbClient from '../utils/dbClient.js';

export const createVideoItem = (label, name, path, size, duration, codec) =>
  dbClient.video.create({
    data: {
      label: label,
      name: name,
      path: path,
      size: size,
      duration: duration,
      codec: codec
    }
  });
