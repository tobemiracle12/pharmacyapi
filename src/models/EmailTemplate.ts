import mongoose, { Schema, Document } from 'mongoose';
import { IEmailTemplateDocument } from '../types';

export interface IEmailTemplate extends IEmailTemplateDocument, Document {}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
    {
        name: {
            type: String,
            required: [true, 'Template name is required'],
            unique: true,
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Template title is required'],
            trim: true,
        },
        greetings: {
            type: String,
            required: [true, 'Template greetings are required'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Template content is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
