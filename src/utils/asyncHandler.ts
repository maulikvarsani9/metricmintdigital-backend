import { Request, Response, NextFunction } from 'express';

// Type for async controller functions
type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates the need for try-catch blocks in controllers
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(error => {
      console.error('Async Error:', error);
      next(error);
    });
  };
};

export default asyncHandler;

