import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Convert image to WebP format with compression
 */
export const convertToWebP = async (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(inputPath)
    .resize(1920, 1080, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85, effort: 3 })
    .toFile(outputPath);
};

/**
 * Process low quality images with higher quality settings
 */
export const processLowQualityImage = async (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(inputPath)
    .resize(1920, 1080, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 95, effort: 4 })
    .toFile(outputPath);
};

/**
 * Fast processing for large files
 */
export const processImageFast = async (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await sharp(inputPath)
    .resize(1920, 1080, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80, effort: 2 })
    .toFile(outputPath);
};

/**
 * Check if image format is supported
 */
export const isSupportedImageFormat = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
};

/**
 * Generate WebP filename
 */
export const generateWebPFilename = (filename: string): string => {
  const ext = path.extname(filename);
  return filename.replace(ext, '.webp');
};

