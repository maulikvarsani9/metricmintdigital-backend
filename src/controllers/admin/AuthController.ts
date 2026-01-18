import { Request, Response } from 'express';
import { ResponseHelper } from '../../utils/response';
import { CustomError } from '../../middleware/errorHandler';
import { Admin } from '../../models';
import { asyncHandler } from '../../utils/asyncHandler';
import { DeviceService } from '../../services/deviceService';
import { AdminAuthRequest } from '../../middleware/adminAuth';

export class AdminAuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email) {
      throw new CustomError('Email is required', 400);
    }

    // Find admin by email
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      throw new CustomError('Invalid email or password', 401);
    }

    if (!admin.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid credentials', 401);
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const { accessToken, refreshToken } =
      await DeviceService.createDeviceSession(
        admin._id.toString(),
        'admin',
        admin.email
      );

    return ResponseHelper.success(
      res,
      {
        user: {
          id: admin._id,
          name: `${admin.firstName} ${admin.lastName}`,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          isActive: admin.isActive,
        },
        token: accessToken,
        refreshToken,
      },
      'Login successful'
    );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await DeviceService.deleteDeviceByToken(token);
    }

    ResponseHelper.success(
      res,
      { message: 'Logout successful' },
      'Logout successful'
    );
  });

  // Get current user profile
  getProfile = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new CustomError('User information not found', 401);
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      throw new CustomError('Admin not found', 404);
    }

    ResponseHelper.success(
      res,
      {
        user: {
          id: admin._id,
          name: `${admin.firstName} ${admin.lastName}`,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          phone: admin.phone,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
        },
      },
      'Profile retrieved successfully'
    );
  });
}

