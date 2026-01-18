import express from 'express';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../../controllers/admin/AuthorController';
import { validateRequest } from '../../middleware/validateRequest';
import { createAuthorSchema, updateAuthorSchema } from '../../types/validation/author';

const router = express.Router();

router.get('/', getAllAuthors);
router.get('/:id', getAuthorById);
router.post('/', validateRequest(createAuthorSchema), createAuthor);
router.put('/:id', validateRequest(updateAuthorSchema), updateAuthor);
router.delete('/:id', deleteAuthor);

export default router;

