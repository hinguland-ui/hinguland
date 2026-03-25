import express from 'express';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/teamController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/public', getTeamMembers);

router.route('/')
  .get(getTeamMembers)
  .post(protect, admin, upload.single('image'), createTeamMember);

router.route('/:id')
  .put(protect, admin, upload.single('image'), updateTeamMember)
  .delete(protect, admin, deleteTeamMember);

export default router;
