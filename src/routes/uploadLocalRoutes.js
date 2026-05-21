import express from 'express';
import { getLocalUploads, deleteLocalUpload, uploadDirectLocal, localMulterUpload } from '../controllers/uploadLocalController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getLocalUploads);
router.route('/upload').post(protect, admin, localMulterUpload.single('file'), uploadDirectLocal);
router.route('/:filename').delete(protect, admin, deleteLocalUpload);

export default router;
