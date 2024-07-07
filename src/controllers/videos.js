import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import * as url from 'url';
// Constants
import { approvedVideoUrl, uploadVideoUrl } from '../utils/constants.js';

// Get the directory name
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Set the path to the ffmpeg binary
// ffmpeg.setFfmpegPath(path.join('C:', 'ffmpeg', 'bin', 'ffmpeg.exe')); // Adjust the path as necessary

export const getMainVideo = async (req, res) => {
  console.log('getMainVideo');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const videoPath = getVideoPath(currentVideoIndex);
  console.log('video path: ', videoPath);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  console.log('fileSize: ', fileSize);
  console.log('range', range);

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
  res.redirect('/videos/video');
};

export const getPreviousMainVideo = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (currentVideoIndex > 0) {
    currentVideoIndex--;
  } else {
    currentVideoIndex = videos.length - 1; // Loop back to the last video
  }
  res.redirect('/videos/video');
};

export const uploadMainVideo = async (req, res) => {
  console.log('uploadMainVideo');

  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading video' });
    }

    console.log('req.file', req.file);

    const filePath = req.file.path;
    console.log('filePath', filePath);

    let random = Math.floor(Math.random() * 100000);

    const outputPath = path.join(
      uploadDirectory,
      `${Date.now()}-${random}-compressed.mp4`
    );

    console.log('outputPath', outputPath);

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
        res.json({
          message: 'Video uploaded and compressed successfully',
          url: outputPath,
        });
      })
      .on('error', (err) => {
        console.error(err);
        res.status(500).json({ message: 'Error compressing video' });
      })
      .run();
  });
};
