import jwt, { SignOptions } from 'jsonwebtoken';
import { CustomError } from '../middleware/errorHandler';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export class JwtUtils {
  private static readonly ACCESS_TOKEN_SECRET = config.jwt.secret;
  private static readonly REFRESH_TOKEN_SECRET = config.jwt.refreshSecret;
  private static readonly ACCESS_TOKEN_EXPIRE = config.jwt.expiresIn;
  private static readonly REFRESH_TOKEN_EXPIRE = config.jwt.refreshExpiresIn;

  /**
   * Generate access token
   */
  static generateAccessToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRE,
      } as SignOptions);
    } catch (error) {
      throw new CustomError(
        `Failed to generate access token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: RefreshTokenPayload): string {
    try {
      return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRE,
      } as SignOptions);
    } catch (error) {
      throw new CustomError(
        `Failed to generate refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Access token has expired', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid access token', 401);
      } else {
        throw new CustomError('Token verification failed', 401);
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(
        token,
        this.REFRESH_TOKEN_SECRET
      ) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Refresh token has expired', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid refresh token', 401);
      } else {
        throw new CustomError('Refresh token verification failed', 401);
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new CustomError('Authorization header is required', 401);
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new CustomError('Invalid authorization header format', 401);
    }

    return parts[1];
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(
    userId: string,
    email: string,
    role: string
  ): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken({ userId, email, role });
    const refreshToken = this.generateRefreshToken({ userId });

    return { accessToken, refreshToken };
  }
}

export default JwtUtils;

