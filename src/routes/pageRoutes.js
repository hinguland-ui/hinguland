import express from 'express';
import { getPages, getPage, createPage, updatePage, deletePage, getPublicPages } from '../controllers/pageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicPages);

router.route('/')
  .get(protect, admin, getPages)
  .post(protect, admin, createPage);

router.route('/:id')
  .get(protect, admin, getPage)
  .put(protect, admin, updatePage)
  .delete(protect, admin, deletePage);

export default router;
