import { Schema, Document, Types } from 'mongoose';
import { mongoose } from '../config/database';

export interface IContactInquiry extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  mobile?: string;
  services: string[];
  budget?: string;
  notes?: string;
  source: 'dialog' | 'footer';
  createdAt: Date;
  updatedAt: Date;
}

const contactInquirySchema = new Schema<IContactInquiry>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    mobile: { type: String, required: false, trim: true, maxlength: 40 },
    services: [{ type: String, trim: true }],
    budget: { type: String, trim: true, maxlength: 120 },
    notes: { type: String, trim: true, maxlength: 5000 },
    source: { type: String, enum: ['dialog', 'footer'], required: true },
  },
  { timestamps: true, collection: 'contact_inquiries' }
);

contactInquirySchema.index({ createdAt: -1 });
contactInquirySchema.index({ email: 1 });

export const ContactInquiry =
  mongoose.models.ContactInquiry ||
  mongoose.model<IContactInquiry>('ContactInquiry', contactInquirySchema);
