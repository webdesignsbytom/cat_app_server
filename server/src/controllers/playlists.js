// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
// Domain
import {
  addPlaylistVideos,
  findAllPlaylists,
  findPlaylistByName,
  removePlaylistVideos,
} from '../domain/playlists.js';
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
import { findVideoById } from '../domain/videos.js';

export const getAllPlaylistsHandler = async (req, res) => {
  try {
    const foundPlaylists = await findAllPlaylists();

    if (!foundPlaylists) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.playlistNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { playlists: foundPlaylists });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get all playlists failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const streamPlaylistContentHandler = async (req, res) => {
  const { playlistName } = req.query;

  try {
    const foundPlaylist = await findPlaylistByName(playlistName);

    if (!foundPlaylist) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.playlistNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { playlist: foundPlaylist });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get playlist by name failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const getPlaylistByNameHandler = async (req, res) => {
  const { playlistName } = req.query;

  try {
    const foundPlaylist = await findPlaylistByName(playlistName);

    if (!foundPlaylist) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.playlistNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    return sendDataResponse(res, 200, { playlist: foundPlaylist });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Get playlist by name failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const addVideoToPlaylistHandler = async (req, res) => {
  const { playlistName, videoId } = req.params;

  try {
    const foundPlaylist = await findPlaylistByName(playlistName);

    if (!foundPlaylist) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.playlistNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

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

    // Check if the video is already in the playlist
    const isVideoInPlaylist = foundPlaylist.videos.some(
      (video) => video.id === videoId
    );

    if (isVideoInPlaylist) {
      return sendDataResponse(res, 400, {
        message: 'Video is already in the playlist',
      });
    }

    if (foundVideo.videoStatus !== 'APPROVED') {
      return sendDataResponse(res, 400, {
        message: EVENT_MESSAGES.videoNotApprovedForUse,
      });
    }

    const updatedPlaylist = await addPlaylistVideos(playlistName, videoId);

    if (!updatedPlaylist) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updatePlaylistError
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, { playlist: updatedPlaylist });
  } catch (err) {
    //
    const serverError = new ServerErrorEvent(
      req.user,
      `Add video to playlist failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};


export const removeVideoFromPlaylistHandler = async (req, res) => {
  const { playlistName, videoId } = req.params;

  try {
    const foundPlaylist = await findPlaylistByName(playlistName);

    if (!foundPlaylist) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.playlistNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

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

    // Check if the video is in the playlist
    const isVideoInPlaylist = foundPlaylist.videos.some(
      (video) => video.id === videoId
    );

    if (!isVideoInPlaylist) {
      return sendDataResponse(res, 400, {
        message: EVENT_MESSAGES.videoNotInPlaylist
      });
    }

    const updatedPlaylist = await removePlaylistVideos(playlistName, videoId);

    if (!updatedPlaylist) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.updatePlaylistError
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    return sendDataResponse(res, 200, { playlist: updatedPlaylist });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Remove video from playlist failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};