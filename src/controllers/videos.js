import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import * as url from 'url';
// Constants 
import { approvedVideoUrl, uploadVideoUrl } from '../utils/constants.js';
// Logging
import { logger } from '../log/utils/loggerUtil.js';

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video paths
const compressedDirectory = path.join(__dirname, '..', 'media', approvedVideoUrl);
const uploadDirectory = path.join(__dirname, '..', 'media', uploadVideoUrl);

const selectedDirectory = compressedDirectory;

let videos = fs
  .readdirSync(selectedDirectory)
  .filter((file) => file.endsWith('.mp4'));
let currentVideoIndex = 0;

// Helper function to get video path
const getVideoPath = (index) => path.join(selectedDirectory, videos[index]);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single('video');

export const getMainVideo = async (req, res) => {
  logger.info('getMainVideo called');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const videoPath = getVideoPath(currentVideoIndex);
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

export const getNextMainVideo = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (currentVideoIndex < videos.length - 1) {
    currentVideoIndex++;
  } else {
    currentVideoIndex = 0; // Loop back to the first video
  }
  logger.info(`getNextMainVideo: currentVideoIndex is now ${currentVideoIndex}`);
  res.redirect('/videos/video');
};

export const getPreviousMainVideo = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (currentVideoIndex > 0) {
    currentVideoIndex--;
  } else {
    currentVideoIndex = videos.length - 1; // Loop back to the last video
  }
  logger.info(`getPreviousMainVideo: currentVideoIndex is now ${currentVideoIndex}`);
  res.redirect('/videos/video');
};

export const uploadMainVideo = async (req, res) => {
  logger.info('uploadMainVideo called');

  upload(req, res, (err) => {
    if (err) {
      logger.error(`Error uploading video: ${err.message}`);
      return res.status(500).json({ message: 'Error uploading video' });
    }

    logger.info(`req.file: ${JSON.stringify(req.file)}`);

    const filePath = req.file.path;
    logger.info(`filePath: ${filePath}`);

    let random = Math.floor(Math.random() * 100000);

    const outputPath = path.join(
      uploadDirectory,
      `${Date.now()}-compressed.mp4`
    );

    logger.info(`outputPath: ${outputPath}`);

    // Use ffmpeg to compress the video
    ffmpeg(filePath)
      .noAudio()
      .output(outputPath)
      .videoCodec('libx264')
      .size('640x?')
      .format('mp4')
      .on('end', () => {
        // Delete the original file
        fs.unlinkSync(filePath);
        // Refresh the video list
        videos = fs
          .readdirSync(uploadDirectory)
          .filter((file) => file.endsWith('.mp4'));
        logger.info('Video uploaded and compressed successfully');
        res.json({
          message: 'Video uploaded and compressed successfully',
          url: outputPath,
        });
      })
      .on('error', (err) => {
        logger.error(`Error compressing video: ${err.message}`);
        res.status(500).json({ message: 'Error compressing video' });
      })
      .run();
  });
};
