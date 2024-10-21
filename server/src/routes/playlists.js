import { Router } from 'express';
import {
  addVideoToPlaylistHandler,
  getAllPlaylistsHandler,
  getPlaylistByNameHandler,
  removeVideoFromPlaylistHandler,
  streamPlaylistContentHandler,
} from '../controllers/playlists.js';
import {
  validateAuthentication,
  validateDeveloperRole,
} from '../middleware/auth.js';

const router = Router();

router.get('/get-all-playlists', getAllPlaylistsHandler);
router.get('/stream-playlist-content', streamPlaylistContentHandler);
router.get('/admin/get-playlist-by-name', getPlaylistByNameHandler);
router.patch('/admin/add-video-to-playlist/:playlistName/:videoId', addVideoToPlaylistHandler);
router.patch('/admin/remove-video-from-playlist/:playlistName/:videoId', removeVideoFromPlaylistHandler);


export default router;
