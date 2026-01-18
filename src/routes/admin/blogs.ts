import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../../controllers/admin/BlogController';
import { validateRequest } from '../../middleware/validateRequest';
import { createBlogSchema, updateBlogSchema } from '../../types/validation/blog';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', validateRequest(createBlogSchema), createBlog);
router.put('/:id', validateRequest(updateBlogSchema), updateBlog);
router.delete('/:id', deleteBlog);

export default router;

