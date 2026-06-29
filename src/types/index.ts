// ─── Shared TypeScript interfaces for the PHARM API ───────────────────────────

export interface IProductDocument {
    name: string;
    category: string;
    price: number;
    unitPrice?: number;
    image: string;
    description: string;
    stock: number;
    upc?: string;
    expDate?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IOrderItem {
    product: string;        // Product ObjectId ref
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
}

export interface IPaymentMethod {
    method: 'Cash' | 'Transfer' | 'POS';
    amount: number;
}

export interface IOrderDocument {
    fullName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    items: IOrderItem[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    paymentReceiptUrl?: string;
    paymentMethods?: IPaymentMethod[];
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    staffName?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument {
    fullName: string;
    email: string;
    passwordHash: string;
    phone?: string;
    role: 'customer' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
}

export type BlogBlockType =
    | { type: 'paragraph'; text: string }
    | { type: 'heading'; text: string }
    | { type: 'blockquote'; text: string; author?: string }
    | { type: 'list'; items: string[] }
    | { type: 'divider' };

export interface IBlogPostDocument {
    title: string;
    slug: string;
    author: string;
    date: string;
    excerpt: string;
    image: string;
    categories: string[];
    blocks: BlogBlockType[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IContactMessageDocument {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    read?: boolean;
    createdAt?: Date;
}

export interface IEmailTemplateDocument {
    name: string;
    title: string;
    greetings: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotificationTemplateDocument {
    name: string;
    title: string;
    greetings?: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// ─── Express request extensions ───────────────────────────────────────────────
export interface AuthPayload {
    id: string;
    email: string;
    role: string;
}
