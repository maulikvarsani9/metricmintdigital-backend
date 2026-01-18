import express from 'express';
import { uploadBlogImage as uploadBlogImageMiddleware, processBlogImages } from '../../middleware/blogUpload';
import { uploadBlogImage } from '../../controllers/admin/UploadController';

const router = express.Router();

// Upload blog image with processing
router.post('/', uploadBlogImageMiddleware, processBlogImages, uploadBlogImage);

export default router;

