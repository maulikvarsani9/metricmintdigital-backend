import { Request, Response } from 'express';
import { Blog } from '../../models';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../utils/response';

// Get all blogs (admin)
export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  const query = search
    ? { title: { $regex: search as string, $options: 'i' } }
    : {};

  const skip = (Number(page) - 1) * Number(limit);

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .populate('author', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Blog.countDocuments(query),
  ]);

  sendSuccess(
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
});

// Get single blog
export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const blog = await Blog.findById(id)
    .populate('author', 'name image')
    .lean();

  if (!blog) {
    return sendError(res, 'Blog not found', 404);
  }

  return sendSuccess(res, { blog }, 'Blog fetched successfully');
});

// Create blog
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, mainImage, coverImage, author } = req.body;

  const blog = await Blog.create({
    title,
    content,
    mainImage,
    coverImage,
    author,
  });

  const populatedBlog = await Blog.findById(blog._id)
    .populate('author', 'name image')
    .lean();

  sendSuccess(res, { blog: populatedBlog }, 'Blog created successfully', 201);
});

// Update blog
export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, mainImage, coverImage, author } = req.body;

  const blog = await Blog.findByIdAndUpdate(
    id,
    { title, content, mainImage, coverImage, author },
    { new: true, runValidators: true }
  ).populate('author', 'name image');

  if (!blog) {
    return sendError(res, 'Blog not found', 404);
  }

  return sendSuccess(res, { blog }, 'Blog updated successfully');
});

// Delete blog
export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const blog = await Blog.findByIdAndDelete(id);

  if (!blog) {
    return sendError(res, 'Blog not found', 404);
  }

  return sendSuccess(res, null, 'Blog deleted successfully');
});

