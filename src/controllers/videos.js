import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dbClient from '../utils/dbClient.js';
// Components
import { createVerificationInDB, createPasswordResetInDB } from './utils.js';
// Emitters
import { myEmitterUsers } from '../event/userEvents.js';
import { myEmitterErrors } from '../event/errorEvents.js';
import {
  findAllUsers,
  findUserByEmail,
  createUser,
  findVerification,
  findResetRequest,
  findUserById,
  resetUserPassword,
  deleteUserById,
  updateUserById,
  findUsersByRole,
} from '../domain/users.js';
import { createAccessToken } from '../utils/tokens.js';
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
// Time
import { v4 as uuid } from 'uuid';

// Password hash
const hashRate = 8;

export const getCatOfTheDayVideo = async (req, res) => {
  console.log('getCatOfTheDayVideo');
  const { videoName } = req.body;

  try {
    const videoPath = join(__dirname, 'assets', 'videos', videoName);

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

    return sendDataResponse(res, 200, { video: foundVideo });
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(req.user, `Get all users`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
