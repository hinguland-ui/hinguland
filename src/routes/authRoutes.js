import express from 'express';
import { login, createDefaultAdmin, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/create-admin', createDefaultAdmin);
router.get('/me', protect, getMe);
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
