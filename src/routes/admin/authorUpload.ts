import express from 'express';
import { uploadAuthorImage as uploadAuthorImageMiddleware, processAuthorImages } from '../../middleware/authorUpload';
import { uploadAuthorImage } from '../../controllers/admin/UploadController';

const router = express.Router();

// Upload author image with processing
router.post('/', uploadAuthorImageMiddleware, processAuthorImages, uploadAuthorImage);

export default router;

