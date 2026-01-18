import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../utils/response';
import { getBlogImageUrl } from '../../middleware/blogUpload';
import { getAuthorImageUrl } from '../../middleware/authorUpload';

// Upload blog image
export const uploadBlogImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No image file provided', 400);
  }

  const imageUrl = getBlogImageUrl(req, req.file.filename);

  return sendSuccess(res, { imageUrl }, 'Blog image uploaded successfully', 201);
});

// Upload author image
export const uploadAuthorImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No image file provided', 400);
  }

  const imageUrl = getAuthorImageUrl(req, req.file.filename);

  return sendSuccess(res, { imageUrl }, 'Author image uploaded successfully', 201);
});

