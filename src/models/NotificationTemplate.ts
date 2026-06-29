import mongoose, { Schema, Document } from 'mongoose';
import { INotificationTemplateDocument } from '../types';

export interface INotificationTemplate extends INotificationTemplateDocument, Document {}

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
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
            default: '0',
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

export default mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);
