import path from 'path';
import * as url from 'url';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
// Responses
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';
// Errors
import { ServerErrorEvent } from '../event/utils/errorUtils.js';
// Constants
import { approvedVideoUrl, uploadVideoUrl } from '../utils/constants.js';
import { myEmitterErrors } from '../event/errorEvents.js';
// Logging
import { logger } from '../log/utils/loggerUtil.js';

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video paths
const approvedVideoDirectory = path.join(
  __dirname,
  '..',
  'media',
  approvedVideoUrl
);

const uploadVideoDirectory = path.join(
  __dirname,
  '..',
  'media',
  uploadVideoUrl
);

let reviewVideos = fs
  .readdirSync(uploadVideoDirectory)
  .filter((file) => file.endsWith('.mp4'));

let currentReviewVideoIndex = 0;

export const getTestData = async (req, res) => {
  try {
    return sendDataResponse(res, 200, {
      message: 'The Tulips bloom in Paris on Thursdays',
    });
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(`Get admin test data`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getVideoToReview = async (req, res) => {
  console.log('getVideoToReview');
  logger.info('getVideoToReview called');

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Read the uploads directory
    let uploadVideos = fs
      .readdirSync(uploadVideoDirectory)
      .filter((file) => file.endsWith('.mp4'));

    if (uploadVideos.length === 0) {
      return res.status(404).send('No videos found to review');
    }

    // Get the first video from the uploads directory
    const uploadVideoPath = path.join(uploadVideoDirectory, uploadVideos[0]);
    console.log('upload video path: ', uploadVideoPath);

    if (!fs.existsSync(uploadVideoPath)) {
      return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(uploadVideoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    console.log('fileSize: ', fileSize);
    console.log('range', range);

    // TODO: set range on front end
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(uploadVideoPath, { start, end });
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
      fs.createReadStream(uploadVideoPath).pipe(res);
    }
  } catch (err) {
    // Error
    const serverError = new ServerErrorEvent(
      `Error getting next video to review`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getNextReviewVideo = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (currentReviewVideoIndex < reviewVideos.length - 1) {
    currentReviewVideoIndex++;
  } else {
    currentReviewVideoIndex = 0; // Loop back to the first video
  }
  logger.info(
    `getNextReviewVideo: currentReviewVideoIndex is now ${currentReviewVideoIndex}`
  );
  res.redirect('/video-uploads/video-review/get-video');
};

export const getPreviousReviewVideo = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (currentReviewVideoIndex > 0) {
    currentReviewVideoIndex--;
  } else {
    currentReviewVideoIndex = reviewVideos.length - 1; // Loop back to the last video
  }
  logger.info(
    `getPreviousReviewVideo: currentReviewVideoIndex is now ${currentReviewVideoIndex}`
  );
  res.redirect('/video-uploads/video-review/get-video');
};

export const deleteVideoToReview = async (req, res) => {
  console.log('deleteVideoToReview');
  logger.info('deleteVideoToReview called');

  try {
    const { videoName } = req.params;
    const videoPath = path.join(uploadVideoDirectory, videoName);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video not found');
    }

    fs.unlinkSync(videoPath);
    return sendDataResponse(res, 200, {
      message: 'Video deleted successfully',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent('Error deleting video');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const approveVideoToReview = async (req, res) => {
  console.log('approveVideoToReview');
  logger.info('approveVideoToReview called');

  try {
    const { videoName } = req.params;
    const uploadVideoPath = path.join(uploadVideoDirectory, videoName);
    const compressedVideoPath = path.join(approvedVideoDirectory, videoName);

    if (!fs.existsSync(uploadVideoPath)) {
      return res.status(404).send('Video not found');
    }

    // Move video to compressed directory
    fs.renameSync(uploadVideoPath, compressedVideoPath);

    // Get video metadata using ffmpeg
    ffmpeg.ffprobe(compressedVideoPath, async (err, metadata) => {
      if (err) {
        const serverError = new ServerErrorEvent(
          'Error getting video metadata'
        );
        myEmitterErrors.emit('error', serverError);
        return sendMessageResponse(res, serverError.code, serverError.message);
      }

      // Save metadata to the database
      const { format, streams } = metadata;
      const videoStream = streams.find(
        (stream) => stream.codec_type === 'video'
      );

      await dbClient.video.create({
        data: {
          name: videoName,
          path: compressedVideoPath,
          size: format.size,
          duration: format.duration,
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
        },
      });

      return sendDataResponse(res, 200, {
        message: 'Video approved and moved successfully',
      });
    });
  } catch (err) {
    const serverError = new ServerErrorEvent('Error approving video');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
