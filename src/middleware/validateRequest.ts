import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware to validate request data using Joi schema
 */
export const validateRequest = (schema: Joi.ObjectSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(errorMessages, 400);
    }

    // Replace request data with validated and sanitized data
    req[target] = value;
    next();
  };
};

/**
 * Middleware to validate query parameters
 */
export const validateQueryRequest = (schema: Joi.ObjectSchema) => {
  return validateRequest(schema, 'query');
};

/**
 * Middleware to validate route parameters
 */
export const validateParamsRequest = (schema: Joi.ObjectSchema) => {
  return validateRequest(schema, 'params');
};

