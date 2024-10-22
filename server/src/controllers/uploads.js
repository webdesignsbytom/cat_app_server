// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
// Domain
import { createVideoItem } from '../domain/uploads.js';
// Middleware
import { uploadFileToMinIO } from '../middleware/minio.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
// Errors
import {
  BadRequestEvent,
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
// Packages
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const uploadNewCatVideoHelper = async (req, res) => {
  console.log('uploadCatVideoHelper');

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Create a temporary file path for storing the uploaded video
    const tempVideoPath = path.join(
      __dirname,
      `../temp/${Date.now()}-${file.originalname}`
    );

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

      // Extract the codec from the video stream
      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === 'video'
      );
      const codec = videoStream ? videoStream.codec_name : 'unknown';

      // Define the output path for the compressed video
      const compressedVideoPath = path.join(
        __dirname,
        `../temp/${Date.now()}.mp4`
      );

      // Compress the video using ffmpeg
      ffmpeg(tempVideoPath)
        .noAudio()
        .videoCodec('libx264')
        .size('640x?')
        .format('mp4')
        .output(compressedVideoPath)
        .on('end', async () => {
          console.log('Compression finished successfully');

          const compressedVideoBuffer = fs.readFileSync(compressedVideoPath);

          req.file.buffer = compressedVideoBuffer;
          req.file.size = compressedVideoBuffer.length;
          req.file.mimetype = 'video/mp4';

          const videoUploadResult = await uploadFileToMinIO(
            req.file,
            `videos/review/${Date.now()}.mp4`
          );

          fs.unlinkSync(tempVideoPath);
          fs.unlinkSync(compressedVideoPath);

          if (videoUploadResult) {
            const fileNameExtracted = path.basename(
              file.originalname,
              path.extname(file.originalname)
            );

            // Include video duration in your database or response
            const createdVideoItem = await createVideoItem(
              fileNameExtracted,
              fileNameExtracted.toLowerCase(),
              videoUploadResult,
              compressedVideoBuffer.length,
              duration,
              codec
            );

            if (!createdVideoItem) {
              const badRequest = new BadRequestEvent(
                req.user,
                EVENT_MESSAGES.badRequest,
                EVENT_MESSAGES.createVideoFail
              );
              myEmitterErrors.emit('error', badRequest);
              return sendMessageResponse(
                res,
                badRequest.code,
                badRequest.message
              );
            }

            return sendDataResponse(res, 200, {
              message: 'Video uploaded and compressed successfully',
              videoUrl: videoUploadResult,
              duration: duration,
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
    const serverError = new ServerErrorEvent(
      req.user,
      `Server error uploading video`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
