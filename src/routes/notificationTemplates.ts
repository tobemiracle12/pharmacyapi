import { Router, Request, Response, NextFunction } from 'express';
import NotificationTemplate from '../models/NotificationTemplate';

const router = Router();

const DEFAULT_NOTIFICATION_TEMPLATES = [
    {
        name: "Order-Received",
        title: "Order Confirmation",
        greetings: "0",
        content: "Thank you for your order! We have received your purchase request for your medications and are reviewing your prescription."
    },
    {
        name: "Prescription-Approved",
        title: "Prescription Verification",
        greetings: "0",
        content: "Good news! Your uploaded prescription has been verified and approved by our licensed pharmacist."
    },
    {
        name: "Order-Dispatched",
        title: "Medication Delivery",
        greetings: "0",
        content: "Your package containing your medical items has been dispatched and is currently on its way to your delivery address."
    },
    {
        name: "Refill-Reminder",
        title: "Medication Refill Alert",
        greetings: "0",
        content: "It is time for your medication refill reminder. Please visit Medilazar to reorder your monthly prescription."
    },
    {
        name: "Out-Of-Stock",
        title: "Inventory Delay Notification",
        greetings: "0",
        content: "We write to notify you that the requested drug is currently out of stock. We will notify you once restocked."
    },
    {
        name: "Restocked-Alert",
        title: "Product Restock Alert",
        greetings: "0",
        content: "Great news! The medication you requested is now back in stock. Place your order now before it sells out again."
    },
    {
        name: "Account-Verified",
        title: "Customer Profile Verification",
        greetings: "0",
        content: "Your customer profile and identity documents have been verified. You can now purchase prescription-only drugs on Medilazar."
    }
];

const formatTemplate = (t: any) => ({
    id: t._id.toString(),
    name: t.name,
    title: t.title,
    greetings: t.greetings,
    content: t.content
});

// ─── GET /api/notification-templates ─────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let templates = await NotificationTemplate.find({});
        if (templates.length === 0) {
            await NotificationTemplate.insertMany(DEFAULT_NOTIFICATION_TEMPLATES);
            templates = await NotificationTemplate.find({});
        }
        res.json({
            success: true,
            data: templates.map(formatTemplate),
        });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/notification-templates ────────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, title, greetings, content } = req.body;
        const newTemplate = await NotificationTemplate.create({
            name,
            title,
            greetings: greetings || '0',
            content
        });
        res.status(201).json({
            success: true,
            data: formatTemplate(newTemplate),
        });
    } catch (error) {
        next(error);
    }
});

// ─── PUT /api/notification-templates/:id ─────────────────────────────────────
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, title, greetings, content } = req.body;
        const updated = await NotificationTemplate.findByIdAndUpdate(
            req.params.id,
            { name, title, greetings: greetings || '0', content },
            { new: true, runValidators: true }
        );

        if (!updated) {
            res.status(404).json({ success: false, message: 'Template not found' });
            return;
        }

        res.json({
            success: true,
            data: formatTemplate(updated),
        });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/notification-templates ──────────────────────────────────────
// Bulk delete by ids in body
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            res.status(400).json({ success: false, message: 'Invalid or missing ids array' });
            return;
        }

        await NotificationTemplate.deleteMany({ _id: { $in: ids } });
        res.json({
            success: true,
            message: 'Templates deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
