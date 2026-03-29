import Joi from 'joi';

export const contactInquirySchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(200).required(),
  email: Joi.string().trim().email().max(320).required(),
  mobile: Joi.string().trim().max(40).allow('', null).optional(),
  services: Joi.array().items(Joi.string().trim().min(1).max(200)).min(1).max(50).required(),
  budget: Joi.string().trim().max(120).allow('', null).optional(),
  notes: Joi.string().trim().max(5000).allow('', null).optional(),
  source: Joi.string().valid('dialog', 'footer').required(),
});
