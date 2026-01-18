import { Request, Response } from 'express';
import { Blog } from '../../models';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../utils/response';

// Get all blogs (public - no content field)
export const getAllBlogsPublic = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 9, search = '' } = req.query;

    const query = search
      ? { title: { $regex: search as string, $options: 'i' } }
      : {};

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select('-content') // Exclude content field
        .populate('author', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Blog.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      {
        blogs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
      'Blogs fetched successfully'
    );
  }
);

// Get blog by slug (public - with full content)
export const getBlogBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug })
      .populate('author', 'name image')
      .lean();

    if (!blog) {
      return sendError(res, 'Blog not found', 404);
    }

    return sendSuccess(res, { blog }, 'Blog fetched successfully');
  }
);

