import mongoose, { Schema, Document } from 'mongoose';
import { IBlogPostDocument, BlogBlockType } from '../types';

export interface IBlogPost extends IBlogPostDocument, Document {}

// Generic block schema — stores any block shape as a Mixed type
const BlockSchema = new Schema<BlogBlockType>({}, { strict: false, _id: false });

const BlogPostSchema = new Schema<IBlogPost>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        author: {
            type: String,
            required: [true, 'Author is required'],
            trim: true,
        },
        date: {
            type: String,
            required: true,
        },
        excerpt: {
            type: String,
            required: [true, 'Excerpt is required'],
        },
        image: {
            type: String,
            required: [true, 'Image path is required'],
        },
        categories: {
            type: [String],
            default: [],
        },
        blocks: {
            type: [BlockSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Note: slug index is already created by unique: true above
BlogPostSchema.index({ categories: 1 });

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
