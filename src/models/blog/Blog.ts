import { Schema, Document, Types } from 'mongoose';
import { mongoose } from '../../config/database';

// TypeScript interface
export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  mainImage: string;
  coverImage: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 50,
    },
    mainImage: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'blogs',
  }
);

// Auto-generate slug from title
blogSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    // Generate base slug
    let baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs
    const BlogModel = this.constructor as any;
    while (await BlogModel.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

