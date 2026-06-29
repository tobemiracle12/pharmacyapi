import { Router, Request, Response, NextFunction } from 'express';
import ContactMessage from '../models/ContactMessage';
import { protect } from '../middleware/auth';

const router = Router();

// ─── POST /api/contact ────────────────────────────────────────────────────────
// Accepts and stores a contact form submission.
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            res.status(400).json({
                success: false,
                message: 'name, email, subject, and message are required',
            });
            return;
        }

        const contact = await ContactMessage.create({
            name,
            email,
            phone: phone ?? '',
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been received. We will be in touch shortly.',
            data: contact,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/contact ─────────────────────────────────────────────── (admin)
// Returns all contact messages.
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: messages.length,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/contact/:id ────────────────────────────────────────── (protected)
// Mark message as read/unread or update other fields.
router.patch('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { read } = req.body;
        const contact = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { read },
            { new: true, runValidators: true }
        );

        if (!contact) {
            res.status(404).json({ success: false, message: 'Message not found' });
            return;
        }

        res.json({
            success: true,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/contact/:id ───────────────────────────────────────── (protected)
// Delete a message.
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contact = await ContactMessage.findByIdAndDelete(req.params.id);

        if (!contact) {
            res.status(404).json({ success: false, message: 'Message not found' });
            return;
        }

        res.json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
