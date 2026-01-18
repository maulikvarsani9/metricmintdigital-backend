import Joi from 'joi';

export const createAuthorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  image: Joi.string().optional().allow('', null).messages({
    'string.base': 'Image must be a string',
  }),
});

export const updateAuthorSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
  }),
  image: Joi.string().optional().allow('', null).messages({
    'string.base': 'Image must be a string',
  }),
});

