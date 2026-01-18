import { Request, Response } from 'express';
import { Author } from '../../models';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../utils/response';

// Get all authors
export const getAllAuthors = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 100, search = '' } = req.query;

    const query = search
      ? { name: { $regex: search as string, $options: 'i' } }
      : {};

    const skip = (Number(page) - 1) * Number(limit);

    const [authors, total] = await Promise.all([
      Author.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Author.countDocuments(query),
    ]);

    sendSuccess(
      res,
      {
        authors,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
      'Authors fetched successfully'
    );
  }
);

// Get single author
export const getAuthorById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const author = await Author.findById(id).lean();

    if (!author) {
      return sendError(res, 'Author not found', 404);
    }

    return sendSuccess(res, { author }, 'Author fetched successfully');
  }
);

// Create author
export const createAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, image } = req.body;

    const authorData: any = {
      name,
    };

    // Only add image if it's provided and not empty
    if (image && image.trim() !== '') {
      authorData.image = image.trim();
    }

    const author = await Author.create(authorData);

    return sendSuccess(res, { author }, 'Author created successfully', 201);
  }
);

// Update author
export const updateAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, image } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    // Handle image: if provided and not empty, set it; if empty string, remove it
    if (image !== undefined) {
      if (image && image.trim() !== '') {
        updateData.image = image.trim();
      } else {
        updateData.image = null; // Remove image if empty string
      }
    }

    const author = await Author.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!author) {
      return sendError(res, 'Author not found', 404);
    }

    return sendSuccess(res, { author }, 'Author updated successfully');
  }
);

// Delete author
export const deleteAuthor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const author = await Author.findByIdAndDelete(id);

    if (!author) {
      return sendError(res, 'Author not found', 404);
    }

    return sendSuccess(res, null, 'Author deleted successfully');
  }
);

