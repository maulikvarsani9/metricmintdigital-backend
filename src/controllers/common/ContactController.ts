import { Request, Response } from 'express';
import { ContactInquiry } from '../../models';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendContactInquiryAlert, isMailConfigured } from '../../services/mailService';

export const submitContactInquiry = asyncHandler(
  async (req: Request, res: Response) => {
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

    if (isMailConfigured()) {
      void sendContactInquiryAlert(inquiry).catch(err => {
        console.error('Contact inquiry email failed (non-blocking):', err);
      });
    } else {
      console.warn(
        'Contact inquiry saved but SMTP not configured — alert email skipped.'
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you — your inquiry was received.',
      id: inquiry._id,
    });
  }
);
