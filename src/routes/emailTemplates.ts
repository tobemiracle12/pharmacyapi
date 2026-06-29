import { Router, Request, Response, NextFunction } from 'express';
import EmailTemplate from '../models/EmailTemplate';

const router = Router();

const DEFAULT_EMAIL_TEMPLATES = [
    {
        name: "Bill-Request-Approved",
        title: "Clean Bill Certification Approval!!!",
        greetings: "0",
        content: "Congratulations!!! This to notify you that your Clean Bill Certification has been successfully processed and approved. Here is your Clean Bill Code {{bill-code}} Thanks."
    },
    {
        name: "Decline",
        title: "Declined Transaction",
        greetings: "0",
        content: "We write to notify you that your transfer of {{amount}} EUR was declined by your bank, you may contact customer service for solutions. Thanks"
    },
    {
        name: "Receiver",
        title: "Credit Alert",
        greetings: "0",
        content: "We write to notify you that you have received a sum of {{amount}} {{currency}} from {{receiver}} to your Access National Account."
    },
    {
        name: "Tax-Request-Approved",
        title: "Tax Clearance Certification Approval!!!",
        greetings: "0",
        content: "Congratulations!!! This to notify you that your Tax Clearance Certification has been successfully processed and approved. Here is your TAX Clearance Code {{tax-code}} Thanks."
    },
    {
        name: "IMF-Request-Approved",
        title: "IMF Clearance Certification Approval!!!",
        greetings: "0",
        content: "We write to notify you that your IMF Clearance Certification has been successfully processed and approved, Here is your IMF Clearance Code {{imf-code}} Thanks."
    }
];

const formatTemplate = (t: any) => ({
    id: t._id.toString(),
    name: t.name,
    title: t.title,
    greetings: t.greetings,
    content: t.content
});

// ─── GET /api/email-templates ────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let templates = await EmailTemplate.find({});
        if (templates.length === 0) {
            await EmailTemplate.insertMany(DEFAULT_EMAIL_TEMPLATES);
            templates = await EmailTemplate.find({});
        }
        res.json({
            success: true,
            data: templates.map(formatTemplate),
        });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/email-templates ───────────────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, title, greetings, content } = req.body;
        const newTemplate = await EmailTemplate.create({
            name,
            title,
            greetings,
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

// ─── PUT /api/email-templates/:id ────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, title, greetings, content } = req.body;
        const updated = await EmailTemplate.findByIdAndUpdate(
            req.params.id,
            { name, title, greetings, content },
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

// ─── DELETE /api/email-templates ─────────────────────────────────────────────
// Bulk delete by ids in body, or query
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            res.status(400).json({ success: false, message: 'Invalid or missing ids array' });
            return;
        }

        await EmailTemplate.deleteMany({ _id: { $in: ids } });
        res.json({
            success: true,
            message: 'Templates deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
