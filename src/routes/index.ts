import { Router } from 'express';

import adminRoutes from './admin/index';
import userRoutes from './user/blogs';
import sitemapRoutes from './common/sitemap';

const router = Router();

router.use('/sitemap', sitemapRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

export default router;

