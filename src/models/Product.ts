import mongoose, { Schema, Document } from 'mongoose';
import { IProductDocument } from '../types';

export interface IProduct extends IProductDocument, Document {}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        unitPrice: {
            type: Number,
            required: [true, 'Unit price is required'],
            min: [0, 'Unit price cannot be negative'],
            default: 0,
        },
        image: {
            type: String,
            required: [true, 'Product image path is required'],
        },
        description: {
            type: String,
            default: '',
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },
        upc: {
            type: String,
            default: '',
        },
        expDate: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast category filtering
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
