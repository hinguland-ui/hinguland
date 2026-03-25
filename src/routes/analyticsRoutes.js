import express from 'express';
import { getDashboardStats, getRevenueData, getClientStats, getServiceStats, getRecentActivity } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/revenue', protect, admin, getRevenueData);
router.get('/clients', protect, admin, getClientStats);
router.get('/services', protect, admin, getServiceStats);
router.get('/activity', protect, admin, getRecentActivity);

export default router;
