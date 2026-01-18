import { Schema, Document, Types } from 'mongoose';
import { mongoose } from '../../config/database';

// TypeScript interface
export interface IAuthor extends Document {
  _id: Types.ObjectId;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const authorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'authors',
  }
);

export const Author = mongoose.models.Author || mongoose.model<IAuthor>('Author', authorSchema);

