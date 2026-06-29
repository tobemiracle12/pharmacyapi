import mongoose, { Schema, Document } from 'mongoose';
import { IOrderDocument, IOrderItem, IPaymentMethod } from '../types';

export interface IOrder extends IOrderDocument, Document { }

const OrderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: String,  // stored as string id for flexibility with seeded data
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        productImage: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
    },
    { _id: false }
);

// Payment Method sub-schema
const PaymentMethodSchema = new Schema<IPaymentMethod>(
    {
        method: {
            type: String,
            enum: ['Cash', 'Transfer', 'POS'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        deliveryAddress: {
            type: String,
            required: [true, 'Delivery address is required'],
            trim: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (v: IOrderItem[]) => v.length > 0,
                message: 'Order must contain at least one item',
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentReceiptUrl: {
            type: String,
            default: '',
        },
        paymentMethods: {
            type: [PaymentMethodSchema],
            default: [],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        staffName: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for customer lookups
OrderSchema.index({ email: 1 });
OrderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
