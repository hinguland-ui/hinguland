import express from 'express';
import { getInquiries, createInquiry, deleteInquiry } from '../controllers/inquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getInquiries)
  .post(createInquiry); // Usually public can create inquiries

router.route('/:id')
  .delete(protect, admin, deleteInquiry);

export default router;
