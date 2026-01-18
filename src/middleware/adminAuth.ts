import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
import { JwtUtils } from '../utils/jwt';
import { DeviceService } from '../services/deviceService';
import { Admin } from '../models';

export interface AdminAuthRequest extends Request {
  admin?: {
    adminId: string;
    email: string;
    role: 'admin' | 'superadmin';
    permissions?: string[];
  };
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate admin users
 * Checks the Admin collection and verifies admin/superadmin role
 */
const authenticateAdminAsync = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JwtUtils.extractTokenFromHeader(req.headers['authorization']);

    const decoded = JwtUtils.verifyAccessToken(token);

    // Verify device session exists
    const device = await DeviceService.findDeviceByAccessToken(token);

    if (!device) {
      throw new CustomError('Invalid or revoked token', 401);
    }

    // Verify token matches device
    if (device.userId.toString() !== decoded.userId) {
      throw new CustomError('Token user mismatch', 401);
    }

    // Check if user exists in Admin collection
    const admin = await Admin.findById(decoded.userId);

    if (!admin) {
      throw new CustomError('Admin not found', 401);
    }

    // Verify the user has admin or superadmin role
    if (admin.role !== 'admin' && admin.role !== 'superadmin') {
      throw new CustomError('Access denied. Admin privileges required.', 403);
    }

    // Verify admin is active
    if (!admin.isActive) {
      throw new CustomError('Admin account is deactivated', 401);
    }

    // Attach admin info to request
    req.admin = {
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    };

    // Also set user for backward compatibility with existing middleware
    req.user = {
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateAdmin = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  authenticateAdminAsync(req, res, next).catch(next);
};

/**
 * Middleware to require superadmin role
 */
export const requireSuperAdmin = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.admin) {
    throw new CustomError('Authentication required', 401);
  }

  if (req.admin.role !== 'superadmin') {
    throw new CustomError('Superadmin access required', 403);
  }

  next();
};

