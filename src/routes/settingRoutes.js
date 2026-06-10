import express from 'express';
import { getSettings, getSettingsByGroup, updateSettings, uploadLogo, uploadFavicon, getPublicSettings, testSmtp } from '../controllers/settingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Note: /settings/public is mapped via server.js later, but let's handle admin part here
router.route('/')
  .get(protect, admin, getSettings)
  .post(protect, admin, updateSettings);

router.post('/logo', protect, admin, upload.single('logo'), uploadLogo);
router.post('/favicon', protect, admin, upload.single('favicon'), uploadFavicon);
router.post('/test-smtp', protect, admin, testSmtp);

router.get('/:group', protect, admin, getSettingsByGroup);

export default router;
