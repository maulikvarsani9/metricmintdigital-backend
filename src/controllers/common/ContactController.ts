import { Request, Response } from 'express';
import { ContactInquiry } from '../../models';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { sendContactInquiryAlert, isMailConfigured } from '../../services/mailService';
import { CustomError } from '../../middleware/errorHandler';

export const submitContactInquiry = asyncHandler(
  async (req: Request, res: Response) => {
    if (!isMailConfigured()) {
      throw new CustomError(
        'Contact form is temporarily unavailable. Please try again later.',
        503
      );
    }

    const {
      fullName,
      email,
      mobile,
      services,
      budget,
      notes,
      source,
    } = req.body as {
      fullName: string;
      email: string;
      mobile?: string;
      services: string[];
      budget?: string;
      notes?: string;
      source: 'dialog' | 'footer';
    };

    const mobileTrimmed = mobile?.trim();
    const inquiry = await ContactInquiry.create({
      fullName,
      email,
      ...(mobileTrimmed ? { mobile: mobileTrimmed } : {}),
      services,
      budget: budget || undefined,
      notes: notes || undefined,
      source,
    });

    try {
      await sendContactInquiryAlert(inquiry);
    } catch (err) {
      console.error('Contact inquiry email failed:', err);
    }

    return sendSuccess(
      res,
      { id: inquiry._id },
      'Thank you — your inquiry was received.',
      201
    );
  }
);
