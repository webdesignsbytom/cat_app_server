import path from 'path';
import fs from 'fs';
import * as url from 'url';
// Constants 
import { approvedVideoUrl } from '../utils/constants.js';
// Logging
import { logger } from '../log/utils/loggerUtil.js';

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video paths
const compressedDirectory = path.join(__dirname, '..', 'media', approvedVideoUrl);

const selectedDirectory = compressedDirectory;

let approvedVideos = fs
  .readdirSync(selectedDirectory)
  .filter((file) => file.endsWith('.mp4'));

  
// Helper function to get video path
const getVideoPath = (index) => path.join(selectedDirectory, approvedVideos[index]);

export const getMainVideo = async (req, res) => {
  console.log('get main video');
  logger.info('getMainVideo called');

  const { videoId } = req.params
  console.log('videoId', videoId); 

  res.setHeader('Access-Control-Allow-Origin', '*');

  const videoPath = getVideoPath(videoId);
  logger.info(`video path: ${videoPath}`);
  
  if (!fs.existsSync(videoPath)) {
    logger.error('Video not found');
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  logger.info(`fileSize: ${fileSize}`);
  logger.info(`range: ${range}`);

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
};

// export const getNextMainVideo = async (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   const { videoId } = req.params
//   console.log('videoId', videoId); 

//   logger.info(`getNextMainVideo: currentVideoIndex is now ${currentVideoIndex}`);
//   res.redirect(`/videos/video/${videoId}`);
// };

// export const getPreviousMainVideo = async (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   const { videoId } = req.params
//   console.log('videoId', videoId); 

//   logger.info(`getPreviousMainVideo: currentVideoIndex is now ${currentVideoIndex}`);
//   res.redirect(`/videos/video/${videoId}`);
// };


export const getVideoPreview = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const index = parseInt(req.params.index, 10);
  if (index >= approvedVideos.length || index < 0) {
    return res.status(404).send('Video not found');
  }

  const videoPath = getVideoPath(index);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;

  // Assuming the video has a bitrate of 1MBps, 5 seconds would be roughly 5MB
  const previewSize = 5 * 1024 * 1024; // 5MB
  const start = 0;
  const end = Math.min(previewSize, fileSize - 1);
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
};