// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
// Domain
import {
  deleteVideoById,
  findAllVideos,
  findAllVideosByStatus,
  findVideoById,
  updateVideoStatus,
} from '../domain/videos.js';
// Response messages
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../utils/responses.js';
import { NotFoundEvent, ServerErrorEvent } from '../event/utils/errorUtils.js';
import {
  moveVideoToApprovedBucket,
  moveVideoToDeletedBucket,
  removeVideoFromBucket,
} from '../middleware/minio.js';
import { minioClient } from '../utils/minioConfig.js';

export const getVideoStreamHelper = async (req, res) => {
  console.log('');
  console.log('req.headers', req.headers);

  res.setHeader(
    'Content-Security-Policy',
    "media-src 'self' *; default-src 'self';"
  );
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('X-Frame-Options', 'DENY'); // Prevent clickjacking
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  ); // Enforce HTTPS
  res.setHeader('Connection', 'keep-alive');

  const { bucket, folder, videoName } = req.query;

  try {
    // Ensure there is a range request
    const range = req.headers.range;
    if (!range) {
      return res.status(400).send('Requires Range header');
    }

    // Construct the full video path in MinIO
    const objectName = `${folder}/${videoName}`;

    console.log('>> Range', range);
    const CHUNK_SIZE = 512 * 1024; // 512 KB per chunk, adjust as needed

    const stat = await minioClient.statObject(bucket, objectName);
    const videoSize = stat.size;
    console.log('>> Video Size', videoSize);

    // Correctly parse the range header
    const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
    console.log('>> RangeMactch', rangeMatch);

    const start = rangeMatch ? parseInt(rangeMatch[1], 10) : 0;
    const end =
      rangeMatch && rangeMatch[2]
        ? parseInt(rangeMatch[2], 10)
        : Math.min(start + CHUNK_SIZE, videoSize - 1);

    console.log('>> Start:', start);
    console.log('>> End', end);

    // Get object stats (size) from MinIO
    console.log('>> Video size:', videoSize);

    // Create response headers
    const contentLength = end - start + 1;
    console.log('>> Content length', contentLength);

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': stat.metaData['content-type'] || 'video/mp4',
      'Cache-Control': 'public, max-age=31536000', // Cache for one year
      'Last-Modified': stat.lastModified, // Include last modified date
    };

    console.log('>> Headers:', headers);
    // Send headers for partial content
    res.writeHead(206, headers);

    // Stream the video chunk from MinIO
    const videoStream = await minioClient.getPartialObject(
      bucket,
      objectName,
      start,
      contentLength
    );

    // Listen for the 'close' event to handle early client disconnection
    res.on('close', () => {
      console.log('Client disconnected early.');
      videoStream.destroy(); // Clean up the stream if the client disconnects
    });

    // Pipe the stream to the response
    videoStream.on('data', (chunk) => {
      console.log('Sending chunk:', chunk.length);
    });

    videoStream
      .pipe(res)
      .on('finish', () => {
        console.log('Video stream finished sending');
      })
      .on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error streaming video');
        }
      });
  } catch (err) {
    console.error('Error fetching video stream:', err);
    if (!res.headersSent) {
      res.status(500).send('Error streaming video');
    }
  }
};

export const getAllVideosHelper = async (req, res) => {
  console.log('get all Videos');

  try {
    const foundVideos = await findAllVideos();
    console.log('found Videos:', foundVideos);

    if (!foundVideos) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { videos: foundVideos });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(req.user, `Get all videos failed`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getAllVideosToReviewHelper = async (req, res) => {
  console.log('getAllVideosToReviewHelper');

  try {
    const foundVideos = await findAllVideosByStatus('PENDING');
    console.log('found Videos:', foundVideos);

    if (!foundVideos) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { videos: foundVideos });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all videos to review failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getAllApprovedVideosHelper = async (req, res) => {
  console.log('getAllApprovedVideosHelper');

  try {
    const foundVideos = await findAllVideosByStatus('APPROVED');
    console.log('found Videos:', foundVideos);

    if (!foundVideos) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { videos: foundVideos });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all videos to review failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getAllDeletedVideosHelper = async (req, res) => {
  console.log('getAllDeletedVideosHelper');

  try {
    const foundVideos = await findAllVideosByStatus('DELETED');
    console.log('found Videos:', foundVideos);

    if (!foundVideos) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { videos: foundVideos });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all deleted videos failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getVideoByIdHelper = async (req, res) => {
  console.log('getVideoByIdHelper');
  const { videoId } = req.params;

  if (!videoId) {
    return sendDataResponse(res, 400, {
      message: 'Missing videoId.',
    });
  }

  try {
    const foundVideo = await findVideoById(videoId);
    console.log('found Videos:', foundVideo);

    if (!foundVideo) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { videos: foundVideo });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all deleted videos failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const approvePendingVideoHelper = async (req, res) => {
  console.log('approvePendingVideoHelper');

  const { videoId } = req.params;
  console.log('videoId: ' + videoId);

  try {
    const foundVideo = await findVideoById(videoId);
    console.log('found Videos:', foundVideo);

    if (!foundVideo) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    // Parse the video URL to extract bucket and object name
    const videoUrl = foundVideo.path;
    const urlParts = new URL(videoUrl);
    const sourceBucket = 'videos'; // The bucket is 'videos'
    const objectName = `review/${urlParts.pathname.split('/').pop()}`; // Extract filename and prepend 'review/'

    console.log('videoUrl', videoUrl);
    console.log('urlParts', urlParts);
    console.log('sourceBucket', sourceBucket);
    console.log('objectName', objectName);

    const destinationBucket = 'videos'; // Same bucket, just moving to approved folder

    const newBucket = await moveVideoToApprovedBucket(
      sourceBucket,
      destinationBucket,
      objectName
    );
    console.log('newBucket', newBucket);

    const updatedVideo = await updateVideoStatus(
      videoId,
      'APPROVED',
      newBucket
    );

    return sendDataResponse(res, 200, { updatedVideo: updatedVideo });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Set video to approved status failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const setVideoAsDeletedHelper = async (req, res) => {
  console.log('setVideoAsDeletedHelper');

  const { videoId } = req.params;
  console.log('videoId: ' + videoId);

  if (!videoId) {
    return sendDataResponse(res, 400, {
      message: 'Missing videoId.',
    });
  }

  try {
    const foundVideo = await findVideoById(videoId);

    console.log('found Videos:', foundVideo);
    if (!foundVideo) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    // Parse the video URL to extract bucket and object name
    const videoUrl = foundVideo.path;
    const urlParts = new URL(videoUrl);

    // Remove '/catapp' from the start of the pathname
    const updatedPathname = urlParts.pathname.replace('/catapp', '');

    // Extract the full path after '/catapp', keeping directories and filename
    const objectName = updatedPathname.startsWith('/')
      ? updatedPathname.slice(1)
      : updatedPathname;

    console.log('>>> objectName', objectName);

    const updatedBucket = await moveVideoToDeletedBucket(objectName);
    console.log('updatedBUCKWR', updatedBucket);

    const updatedVideo = await updateVideoStatus(
      videoId,
      'DELETED',
      updatedBucket
    );
    console.log('updated Video:', updatedVideo);

    return sendDataResponse(res, 200, { updatedVideo: updatedVideo });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Set video as deleted status failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const permanentlyDeleteVideoHelper = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return sendDataResponse(res, 400, {
      message: 'Missing videoId.',
    });
  }

  try {
    const foundVideo = await findVideoById(videoId);

    if (!foundVideo) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.videoNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    // Parse the video URL to extract bucket and object name
    const videoUrl = foundVideo.path;
    const urlParts = new URL(videoUrl);

    // Remove '/catapp' from the start of the pathname
    const updatedPathname = urlParts.pathname.replace('/catapp', '');

    // Extract the full path after '/catapp', keeping directories and filename
    const objectName = updatedPathname.startsWith('/')
      ? updatedPathname.slice(1)
      : updatedPathname;

    console.log('>>> objectName', objectName);
    await removeVideoFromBucket(objectName);
    const deletedVideo = await deleteVideoById(videoId);

    return sendDataResponse(res, 200, { deletedVideo: deletedVideo });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all deleted videos failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
