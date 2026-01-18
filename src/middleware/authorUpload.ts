import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
import {
  convertToWebP,
  generateWebPFilename,
  isSupportedImageFormat,
  processLowQualityImage,
  processImageFast,
} from '../utils/imageProcessor';

// Ensure upload directory exists
const uploadDir = 'uploads/authors';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `author-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new CustomError('Only image files are allowed', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

export const uploadAuthorImage = upload.single('image');

/**
 * Middleware to process uploaded author images (compress and convert to WebP)
 * This should be used after multer upload middleware
 */
export const processAuthorImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const uploadPath = 'uploads/authors';

    // Process single file
    if (req.file) {
      const originalPath = req.file.path;
      const originalFilename = req.file.filename;

      if (isSupportedImageFormat(originalFilename)) {
        const webpFilename = generateWebPFilename(originalFilename);
        const webpPath = path.join(uploadPath, webpFilename);

        try {
          // Check if it's a low quality image by file size
          const fileSize = fs.statSync(originalPath).size;
          const isLowQuality = fileSize < 50000; // Less than 50KB
          const isLargeFile = fileSize > 2000000; // More than 2MB

          if (isLowQuality) {
            await processLowQualityImage(originalPath, webpPath);
          } else if (isLargeFile) {
            await processImageFast(originalPath, webpPath);
          } else {
            await convertToWebP(originalPath, webpPath);
          }

          // Update filename to WebP version
          req.file.filename = webpFilename;
          req.file.path = webpPath;

          // Remove original file
          fs.unlinkSync(originalPath);
        } catch (error) {
          console.error('Error processing author image:', error);
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const getAuthorImageUrl = (req: Request, filename: string): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  const protocol = isProduction ? 'https' : req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/authors/${filename}`;
};

