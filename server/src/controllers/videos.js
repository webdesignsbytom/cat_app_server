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

    const updatedVideo = await updateVideoStatus(videoId, 'DELETED', updatedBucket);
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
