import Joi from 'joi';

export const createBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  content: Joi.string().min(50).required().messages({
    'string.min': 'Content must be at least 50 characters',
    'any.required': 'Content is required',
  }),
  mainImage: Joi.string().uri().required().messages({
    'string.uri': 'Invalid main image URL',
    'any.required': 'Main image is required',
  }),
  coverImage: Joi.string().uri().required().messages({
    'string.uri': 'Invalid cover image URL',
    'any.required': 'Cover image is required',
  }),
  author: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid author ID',
    'any.required': 'Author is required',
  }),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title must not exceed 200 characters',
  }),
  content: Joi.string().min(50).optional().messages({
    'string.min': 'Content must be at least 50 characters',
  }),
  mainImage: Joi.string().uri().optional().messages({
    'string.uri': 'Invalid main image URL',
  }),
  coverImage: Joi.string().uri().optional().messages({
    'string.uri': 'Invalid cover image URL',
  }),
  author: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'Invalid author ID',
  }),
});

