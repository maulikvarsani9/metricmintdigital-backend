import { Router } from 'express';
import authRoutes from './auth';
import blogRoutes from './blogs';
import blogUploadRoutes from './blogUpload';
import authorRoutes from './authors';
import authorUploadRoutes from './authorUpload';
import { authenticateAdmin } from '../../middleware/adminAuth';

const router = Router();

router.use('/auth', authRoutes);

// Blog routes (protected by admin auth)
router.use('/blogs', authenticateAdmin, blogRoutes);
router.use('/blog-upload', authenticateAdmin, blogUploadRoutes);

// Author routes (protected by admin auth)
router.use('/authors', authenticateAdmin, authorRoutes);
router.use('/author-upload', authenticateAdmin, authorUploadRoutes);

export default router;

