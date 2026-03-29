import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { submitContactInquiry } from '../../controllers/common/ContactController';
import { validateRequest } from '../../middleware/validateRequest';
import { contactInquirySchema } from '../../types/validation/contact';
import { CustomError } from '../../middleware/errorHandler';

const router = Router();

const honeypot = (req: Request, res: Response, next: NextFunction) => {
  const w = (req.body as { website?: string })?.website;
  if (typeof w === 'string' && w.length > 0) {
    return next(new CustomError('Invalid submission', 400));
  }
  delete (req.body as { website?: string }).website;
  return next();
};

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many submissions. Please try again later.' },
  },
});

router.post(
  '/',
  contactLimiter,
  honeypot,
  validateRequest(contactInquirySchema),
  submitContactInquiry
);

export default router;
