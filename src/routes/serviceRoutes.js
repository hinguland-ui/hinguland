import express from 'express';
import { 
  getServices, 
  getAdminServices, 
  createService, 
  updateService,
  deleteService 
} from '../controllers/serviceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getServices);

// Admin routes
router.get('/admin', protect, admin, getAdminServices); // fallback for /api/services/admin
router.route('/')
  .get(getServices)
  .post(protect, admin, upload.single('image'), createService);

// Better to use mounting from server.js for /api/admin/services
// But keeping these for direct /api/services calls
router.route('/:id')
  .put(protect, admin, upload.single('image'), updateService)
  .delete(protect, admin, deleteService);

export default router;
