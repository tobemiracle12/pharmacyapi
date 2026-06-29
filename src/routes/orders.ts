import { Router, Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { protect } from '../middleware/auth';
import { handleImageUploadIfBase64 } from '../utils/s3';

const router = Router();

// Helper function to deduct product stock for an order
async function deductOrderStock(items: any[]) {
    for (const item of items) {
        try {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock = Math.max(0, (product.stock || 0) - item.quantity);
                await product.save();
            }
        } catch (err) {
            console.error(`Failed to deduct stock for product ${item.product}:`, err);
        }
    }
}

// Helper function to restore product stock for an order
async function restoreOrderStock(items: any[]) {
    for (const item of items) {
        try {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock = (product.stock || 0) + item.quantity;
                await product.save();
            }
        } catch (err) {
            console.error(`Failed to restore stock for product ${item.product}:`, err);
        }
    }
}


// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Guest and authenticated users can place orders — no JWT required.
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            fullName,
            email,
            phone,
            deliveryAddress,
            items,
            subtotal,
            shippingFee,
            totalAmount,
            paymentReceiptUrl,
            paymentMethods,
            staffName,
        } = req.body;

        // Basic validation
        if (!fullName || !email || !phone || !deliveryAddress) {
            res.status(400).json({
                success: false,
                message: 'fullName, email, phone, and deliveryAddress are required',
            });
            return;
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Order must contain at least one item',
            });
            return;
        }

        let processedReceiptUrl = paymentReceiptUrl ?? '';
        if (processedReceiptUrl) {
            processedReceiptUrl = await handleImageUploadIfBase64(processedReceiptUrl, 'receipts');
        }

        const orderStatus = req.body.status || 'pending';
        const isNewSuccessful = ['confirmed', 'processing', 'shipped', 'delivered'].includes(orderStatus);

        const order = await Order.create({
            fullName,
            email,
            phone,
            deliveryAddress,
            items,
            subtotal: subtotal ?? 0,
            shippingFee: shippingFee ?? 0,
            totalAmount: totalAmount ?? 0,
            paymentReceiptUrl: processedReceiptUrl,
            paymentMethods: paymentMethods ?? [],
            status: orderStatus,
            staffName: staffName ?? '',
        });

        if (isNewSuccessful) {
            await deductOrderStock(order.items);
        }


        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/orders ─────────────────────────────────────────── (public access)
// Returns ALL orders — the frontend admin panel handles its own auth.
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/orders/:id ──────────────────────────────────────── (protected)
router.get('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        // Ensure non-admin can only view their own order
        if (req.user?.role !== 'admin' && order.email !== req.user?.email) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/orders/:id/status ────────────────────────────── (public access)
// Update order status — the frontend admin panel handles its own auth.
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, staffName } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            return;
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        const oldStatus = order.status;
        const newStatus = status;

        const isOldSuccessful = ['confirmed', 'processing', 'shipped', 'delivered'].includes(oldStatus);
        const isNewSuccessful = ['confirmed', 'processing', 'shipped', 'delivered'].includes(newStatus);

        order.status = newStatus;
        if (staffName) {
            order.staffName = staffName;
        }
        await order.save();

        if (isNewSuccessful && !isOldSuccessful) {
            await deductOrderStock(order.items);
        } else if (!isNewSuccessful && isOldSuccessful) {
            await restoreOrderStock(order.items);
        }


        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/orders/:id ───────────────────────────────────────── (protected)
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required' });
            return;
        }

        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }

        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
