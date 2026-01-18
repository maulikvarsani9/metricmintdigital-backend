import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): Response {
    const pages = Math.ceil(pagination.total / pagination.limit);

    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination: {
        ...pagination,
        pages,
      },
    };

    return res.status(200).json(response);
  }
}

// Helper functions for easier use
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  return ResponseHelper.success(res, data, message, statusCode);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400
): Response => {
  return ResponseHelper.error(res, message, statusCode);
};

