import express from 'express';
import { 
  getPublicProjects, 
  getPublicProject,
  getHomeProjects, 
  getAdminProjects,
  createProject, 
  updateProject,
  deleteProject,
  uploadProjectAsset,
  getProjectCategories
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicProjects);
router.get('/categories', getProjectCategories);
router.get('/public/home', getHomeProjects);
router.get('/public/:slug', getPublicProject);

// Admin routes
router.get('/', protect, admin, getAdminProjects);
router.post('/', protect, admin, createProject);
router.put('/:id', protect, admin, updateProject);
router.delete('/:id', protect, admin, deleteProject);

// Specialized upload route
router.post('/upload', protect, admin, upload.single('image'), uploadProjectAsset);

export default router;
