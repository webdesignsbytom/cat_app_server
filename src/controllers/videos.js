import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dbClient from '../utils/dbClient.js';
// File paths
import fs from 'fs'; // Make sure fs is imported
import { join, dirname } from 'path'; // Import join and dirname
import { fileURLToPath } from 'url'; // Import fileURLToPath for __dirname
// Components
// Emitters
import { myEmitterUsers } from '../event/userEvents.js';
import { myEmitterErrors } from '../event/errorEvents.js';
// Domain
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  NotFoundEvent,
  ServerErrorEvent,
  MissingFieldEvent,
  RegistrationServerErrorEvent,
  ServerConflictError,
  BadRequestEvent,
} from '../event/utils/errorUtils.js';
// Dir
const __dirname = dirname(fileURLToPath(import.meta.url));

export const getCatOfTheDayVideo = async (req, res) => {
  const videoName = 'test.mp4';

  try {
    // Construct an absolute path for the video file
    const videoPath = join(
      __dirname,
      '..',
      'assets',
      'videos',
      'cotd',
      videoName
    );

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    // Enhanced error handling
    if (err.code === 'ENOENT') {
      console.error('File not found:', videoPath);
      return res.status(404).send('File not found');
    } else {
      const serverError = new ServerErrorEvent(
        req.user,
        'Cat of the day server error'
      );
      myEmitterErrors.emit('error', serverError);
      sendMessageResponse(res, serverError.code, serverError.message);
      throw err;
    }
  }
};

export const uploadNewCatOfTheDayVideo = async (req, res) => {
  console.log('uploadNewCatOfTheDayVideo');

  try {
    return sendDataResponse(res, 200, {  });
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(req.user, `Video server error`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
