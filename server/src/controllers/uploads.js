// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
// Domain
import { createVideoItem } from '../domain/uploads.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { join } from 'path';
import * as url from 'url';
import { uploadFileToMinIO } from '../middleware/minio.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const uploadCatVideoHelper = async (req, res) => {
  console.log('uploadCatVideoHelper');

  const file = req.file; // Get the uploaded video file from multer
  console.log('file', file);

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Create a temporary file path for storing the uploaded video
    const tempVideoPath = path.join(
      __dirname,
      `../temp/${Date.now()}-${file.originalname}`
    );
    console.log('tempVideoPath', tempVideoPath);

    // Write the file buffer to disk temporarily
    fs.writeFileSync(tempVideoPath, file.buffer);

    // Define the output path for the compressed video
    const compressedVideoPath = path.join(
      __dirname,
      `../temp/${Date.now()}.mp4`
    );

    console.log('compressedVideoPath', compressedVideoPath);

    // Compress the video using ffmpeg
    ffmpeg(tempVideoPath)
      .noAudio() // Remove audio if desired
      .videoCodec('libx264')
      .size('640x?') // Compress to desired size
      .format('mp4')
      .output(compressedVideoPath) // Compress and output to this path
      .on('end', async () => {
        console.log('Compression finished successfully');

        // Read the compressed video into memory (buffer)
        const compressedVideoBuffer = fs.readFileSync(compressedVideoPath);

        // Replace the original file buffer with the compressed one
        req.file.buffer = compressedVideoBuffer;
        req.file.size = compressedVideoBuffer.length;
        req.file.mimetype = 'video/mp4'; // Update mimetype if changed

        // Upload the compressed video to MinIO
        const videoUploadResult = await uploadFileToMinIO(
          req.file, // The modified multer file object
          `videos/cotd/${Date.now()}.mp4`
        );
        console.log('videoUploadResult', videoUploadResult);

        // Clean up temp files
        fs.unlinkSync(tempVideoPath);
        fs.unlinkSync(compressedVideoPath);

        if (videoUploadResult) {
          // Respond with the uploaded video's URL
          return res.status(200).json({
            message: 'Video uploaded and compressed successfully',
            videoUrl: videoUploadResult,
          });
        } else {
          return res.status(500).json({
            message: 'Error uploading the video to MinIO',
          });
        }
      })
      .on('error', (err) => {
        console.error('Error during compression:', err);
        res.status(500).json({ message: 'Error compressing video' });
      })
      .run();
  } catch (err) {
    console.error('Error in video upload and compression:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
export const uploadNewCatVideoHelper = async (req, res) => {
  console.log('uploadCatVideoHelper');

  const file = req.file; // Get the uploaded video file from multer
  console.log('file', file);

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Create a temporary file path for storing the uploaded video
    const tempVideoPath = path.join(
      __dirname,
      `../temp/${Date.now()}-${file.originalname}`
    );
    console.log('tempVideoPath', tempVideoPath);

    // Write the file buffer to disk temporarily
    fs.writeFileSync(tempVideoPath, file.buffer);

    // Use ffprobe to get the video duration
    ffmpeg.ffprobe(tempVideoPath, async (err, metadata) => {
      if (err) {
        console.error('Error during ffprobe:', err);
        return res
          .status(500)
          .json({ message: 'Error retrieving video metadata.' });
      }

      // Extract the video duration in seconds
      const duration = metadata.format.duration;
      console.log('Video duration:', duration);

      // Extract the codec from the video stream
      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === 'video'
      );
      const codec = videoStream ? videoStream.codec_name : 'unknown';
      console.log('Video codec:', codec);

      // Define the output path for the compressed video
      const compressedVideoPath = path.join(
        __dirname,
        `../temp/${Date.now()}.mp4`
      );

      console.log('compressedVideoPath', compressedVideoPath);

      // Compress the video using ffmpeg
      ffmpeg(tempVideoPath)
        .noAudio() // Remove audio if desired
        .videoCodec('libx264')
        .size('640x?') // Compress to desired size
        .format('mp4')
        .output(compressedVideoPath) // Compress and output to this path
        .on('end', async () => {
          console.log('Compression finished successfully');

          // Read the compressed video into memory (buffer)
          const compressedVideoBuffer = fs.readFileSync(compressedVideoPath);

          // Replace the original file buffer with the compressed one
          req.file.buffer = compressedVideoBuffer;
          req.file.size = compressedVideoBuffer.length;
          req.file.mimetype = 'video/mp4'; // Update mimetype if changed

          // Upload the compressed video to MinIO
          const videoUploadResult = await uploadFileToMinIO(
            req.file, // The modified multer file object
            `videos/review/${Date.now()}.mp4`
          );
          console.log('videoUploadResult', videoUploadResult);

          // Clean up temp files
          fs.unlinkSync(tempVideoPath);
          fs.unlinkSync(compressedVideoPath);

          if (videoUploadResult) {
            // Respond with the uploaded video's URL and duration
            const fileNameExtracted = path.basename(
              file.originalname,
              path.extname(file.originalname)
            );

            console.log(
              'Original name without extension:',
              fileNameExtracted.toLowerCase()
            );
            console.log('file.size', compressedVideoBuffer.length);

            // Include video duration in your database or response
            const createdVideoItem = await createVideoItem(
              fileNameExtracted,
              fileNameExtracted.toLowerCase(),
              videoUploadResult,
              compressedVideoBuffer.length,
              duration,
              codec
            );
            console.log('createdVideoItem', createdVideoItem);

            return res.status(200).json({
              message: 'Video uploaded and compressed successfully',
              videoUrl: videoUploadResult,
              duration: duration, // Include duration in the response
            });
          } else {
            return res.status(500).json({
              message: 'Error uploading the video to MinIO',
            });
          }
        })
        .on('error', (err) => {
          console.error('Error during compression:', err);
          res.status(500).json({ message: 'Error compressing video' });
        })
        .run();
    });
  } catch (err) {
    console.error('Error in video upload and compression:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
