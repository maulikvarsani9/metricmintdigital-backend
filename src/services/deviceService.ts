import { Device } from "../models";
import { IDevice } from "../models/Device";
import { JwtUtils } from "../utils/jwt";

export class DeviceService {
  /**
   * Create a new device session
   * Creates a new device record for each login, allowing multiple devices per user
   */
  static async createDeviceSession(
    userId: string,
    userType: "user" | "merchant" | "admin",
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string; device: IDevice }> {
    const { accessToken, refreshToken } = JwtUtils.generateTokenPair(
      userId,
      email,
      userType,
    );

    // Always create a new device record instead of updating existing one
    // This allows multiple devices to be logged in simultaneously
    const device = new Device({
      userId,
      userType,
      accessToken,
      refreshToken,
    });

    await device.save();

    return { accessToken, refreshToken, device };
  }

  /**
   * Find device by access token
   */
  static async findDeviceByAccessToken(token: string): Promise<IDevice | null> {
    const device = await Device.findByAccessToken(token);
    return device;
  }

  /**
   * Find device by refresh token
   */
  static async findDeviceByRefreshToken(
    token: string,
  ): Promise<IDevice | null> {
    return await Device.findByRefreshToken(token);
  }

  /**
   * Delete device by access token
   */
  static async deleteDeviceByToken(accessToken: string): Promise<boolean> {
    const result = await Device.deleteOne({ accessToken });
    return result.deletedCount > 0;
  }

  /**
   * Delete all devices for a user
   */
  static async deleteUserDevices(
    userId: string,
    userType: string,
  ): Promise<number> {
    const result = await Device.deleteUserDevices(userId, userType);
    return result.deletedCount;
  }

  /**
   * Get user's devices
   */
  static async getUserDevices(
    userId: string,
    userType: string,
  ): Promise<IDevice[]> {
    return await Device.find({ userId, userType }).sort({ createdAt: -1 });
  }

  /**
   * Refresh device tokens
   */
  static async refreshDeviceTokens(
    refreshToken: string,
    userId: string,
    userType: "user" | "merchant" | "admin",
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    // Find device by refresh token
    const device = await Device.findByRefreshToken(refreshToken);
    if (!device) {
      return null;
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      JwtUtils.generateTokenPair(userId, email, userType);

    // Update device with new tokens
    device.accessToken = newAccessToken;
    device.refreshToken = newRefreshToken;
    await device.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
