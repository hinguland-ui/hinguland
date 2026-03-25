import express from 'express';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/public', getReviews);

router.route('/')
  .get(getReviews)
  .post(protect, admin, upload.single('image'), createReview);

router.route('/:id')
  .put(protect, admin, upload.single('image'), updateReview)
  .delete(protect, admin, deleteReview);

export default router;
