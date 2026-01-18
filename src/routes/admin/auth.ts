import { Router } from 'express';
import { AdminAuthController } from '../../controllers/admin/AuthController';
import { validateRequest } from '../../middleware/validateRequest';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { loginSchema } from '../../types/validation/auth';

const router = Router();
const authController = new AdminAuthController();

// Public routes
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected admin routes
router.get('/profile', authenticateAdmin, authController.getProfile);

export default router;

