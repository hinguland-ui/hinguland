import express from 'express';
import { 
  getAdminBlogs, 
  getPublicBlogs, 
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog,
  uploadBlogAsset
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicBlogs);
router.get('/public/:slug', getBlogBySlug);

// Admin routes
router.get('/', protect, admin, getAdminBlogs);
router.post('/', protect, admin, createBlog);
router.put('/:id', protect, admin, updateBlog);
router.delete('/:id', protect, admin, deleteBlog);

// Specialized upload route
router.post('/upload', protect, admin, upload.single('image'), uploadBlogAsset);

export default router;
