import express from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public', getFaqs);

router.route('/')
  .get(getFaqs)
  .post(protect, admin, createFaq);

router.route('/:id')
  .put(protect, admin, updateFaq)
  .delete(protect, admin, deleteFaq);

export default router;
