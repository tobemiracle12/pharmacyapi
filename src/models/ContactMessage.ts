import mongoose, { Schema, Document } from 'mongoose';
import { IContactMessageDocument } from '../types';

export interface IContactMessage extends IContactMessageDocument, Document {}

const ContactMessageSchema = new Schema<IContactMessage>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

ContactMessageSchema.index({ email: 1 });

export default mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
