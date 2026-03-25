import express from 'express';
import { getPayments, createPayment, updatePayment, deletePayment, getPaymentStats } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getPaymentStats);

router.route('/')
  .get(protect, admin, getPayments)
  .post(protect, admin, createPayment);

router.route('/:id')
  .put(protect, admin, updatePayment)
  .delete(protect, admin, deletePayment);

export default router;
