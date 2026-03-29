import { Router } from 'express';

import adminRoutes from './admin/index';
import userRoutes from './user/blogs';
import sitemapRoutes from './common/sitemap';
import contactRoutes from './common/contact';

const router = Router();

router.use('/sitemap', sitemapRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

export default router;

