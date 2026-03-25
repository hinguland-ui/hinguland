import express from 'express';
import { getMedia, getMediaFolders, createMediaFolder, deleteMediaFolder, uploadMedia, replaceMedia, deleteMedia, syncCloudinaryMedia } from '../controllers/mediaController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', protect, admin, getMedia);
router.get('/sync', protect, admin, syncCloudinaryMedia);
router.post('/upload', protect, admin, upload.single('file'), uploadMedia);

router.route('/folders')
  .get(protect, admin, getMediaFolders)
  .post(protect, admin, createMediaFolder);

router.delete('/folders/:id', protect, admin, deleteMediaFolder);

router.post('/:id/replace', protect, admin, upload.single('file'), replaceMedia);
router.delete('/:id', protect, admin, deleteMedia);

export default router;
