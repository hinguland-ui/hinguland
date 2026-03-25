import express from 'express';
import { 
  getClients, 
  getAdminClients, 
  createClient, 
  updateClient, 
  deleteClient 
} from '../controllers/clientController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(getClients)
  .post(protect, admin, upload.single('logo'), createClient);

router.get('/admin', protect, admin, getAdminClients);

router.route('/:id')
  .put(protect, admin, upload.single('logo'), updateClient)
  .delete(protect, admin, deleteClient);

export default router;
