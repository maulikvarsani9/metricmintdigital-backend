import { Router } from 'express';

import adminRoutes from './admin/index';
import userRoutes from './user/blogs';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

export default router;

