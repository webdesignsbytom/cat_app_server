import path from 'path';
import * as url from 'url';
// Responses
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';
// Errors
import { ServerErrorEvent } from '../event/utils/errorUtils.js';

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video paths
const uploadDirectory = path.join(__dirname, '..', 'media', 'uploads');
const compressedDirectory = path.join(__dirname, '..', 'media', 'compressed');

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

export const getNextVideoToReview = async (req, res) => {
  console.log('getNextVideoToReview');
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Read the uploads directory
    const uploadDirectory = path.join(__dirname, '..', 'media', 'uploads');
    let uploadVideos = fs
      .readdirSync(uploadDirectory)
      .filter((file) => file.endsWith('.mp4'));

    if (uploadVideos.length === 0) {
      return res.status(404).send('No videos found');
    }

    // Get the first video from the uploads directory
    const uploadVideoPath = path.join(uploadDirectory, uploadVideos[0]);
    console.log('upload video path: ', uploadVideoPath);

    if (!fs.existsSync(uploadVideoPath)) {
      return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(uploadVideoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    console.log('fileSize: ', fileSize);
    console.log('range', range);

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

export const deleteVideoToReview = async (req, res) => {
  console.log('deleteVideoToReview');
  try {
    const { videoName } = req.params;
    const videoPath = path.join(uploadDirectory, videoName);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video not found');
    }

    fs.unlinkSync(videoPath);
    return sendDataResponse(res, 200, { message: 'Video deleted successfully' });
  } catch (err) {
    const serverError = new ServerErrorEvent('Error deleting video');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const approveVideoToReview = async (req, res) => {
  console.log('approveVideoToReview');
  try {
    const { videoName } = req.params;
    const uploadVideoPath = path.join(uploadDirectory, videoName);
    const compressedVideoPath = path.join(compressedDirectory, videoName);

    if (!fs.existsSync(uploadVideoPath)) {
      return res.status(404).send('Video not found');
    }

    // Move video to compressed directory
    fs.renameSync(uploadVideoPath, compressedVideoPath);

    // Get video metadata using ffmpeg
    ffmpeg.ffprobe(compressedVideoPath, async (err, metadata) => {
      if (err) {
        const serverError = new ServerErrorEvent('Error getting video metadata');
        myEmitterErrors.emit('error', serverError);
        return sendMessageResponse(res, serverError.code, serverError.message);
      }

      // Save metadata to the database
      const { format, streams } = metadata;
      const videoStream = streams.find(stream => stream.codec_type === 'video');
      
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

      return sendDataResponse(res, 200, { message: 'Video approved and moved successfully' });
    });
  } catch (err) {
    const serverError = new ServerErrorEvent('Error approving video');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};