import { Router, Request, Response, NextFunction } from 'express';
import BlogPost from '../models/BlogPost';
import { handleImageUploadIfBase64 } from '../utils/s3';

const router = Router();

const DEFAULT_BLOG_POSTS = [
    {
        title: 'How to Write a Blog Post Your Readers Will Love in 5 Steps',
        slug: 'how-to-write-a-blog-post',
        author: 'Editor',
        date: 'February 9, 2026',
        excerpt: 'Why the world would end without travel coupons. The 16 worst songs about spa deals. How daily me person...',
        image: '/blog_pharmacy_workspace.png',
        categories: ['HEALTH', 'PHARMACY', 'WELLNESS'],
        blocks: [
            { type: 'paragraph', text: 'Why the world would end without travel coupons. The 16 worst songs about spa deals. How daily me person.' },
            { type: 'divider' },
            { type: 'paragraph', text: 'The 11 worst business software in history. Why latest electronic gadgets will make you question everything.' },
            { type: 'heading', text: 'How carnival cruises can help you live a better life.' },
            { type: 'list', items: ['Smart people learn from everything', 'Average people from their experiences', 'Stupid people already have all the answers'] },
            { type: 'blockquote', text: 'Smart people learn from everything and everyone, average people from their experiences, stupid people already have all the answers.', author: 'Socrates' },
        ],
    },
    {
        title: '9 Content Marketing Trends and Ideas to Increase Traffic',
        slug: 'content-marketing-trends',
        author: 'Editor',
        date: 'February 7, 2026',
        excerpt: 'Why do people think wholesale accessories are a good idea? Unbelievable cool tech gadget success stories...',
        image: '/blog_health_supplements.png',
        categories: ['SUPPLEMENTS', 'INFORMATION', 'PROMOTIONS'],
        blocks: [
            { type: 'paragraph', text: 'Why do people think wholesale accessories are a good idea? Unbelievable cool tech gadget success stories.' },
            { type: 'divider' },
            { type: 'heading', text: 'The Unconventional Guide to Wholesale Accessories' },
            { type: 'paragraph', text: 'Many pharmacists and wellness centers overlook the power of accessory items and health devices in their content marketing.' },
            { type: 'list', items: ['Track local health trends using pharmacy dispensing metrics.', 'Focus on high-quality, scientifically backed visual materials.', 'Deliver clear advice rather than just selling products.'] },
            { type: 'blockquote', text: 'Content is king, but context and clinical value are the actual keys to health-related engagement.', author: 'Marketing Strategist' },
        ],
    },
    {
        title: 'Understanding Your Prescriptions: A Complete Guide for Patients',
        slug: 'understanding-prescriptions-guide',
        author: 'Dr. Amara',
        date: 'January 28, 2026',
        excerpt: 'Navigating the world of prescriptions can feel overwhelming. From understanding dosage instructions to knowing when to take your medications...',
        image: '/blog_medications_wellness.png',
        categories: ['MEDICATIONS', 'HEALTH', 'TIPS'],
        blocks: [
            { type: 'paragraph', text: 'Navigating the world of prescriptions can feel overwhelming. From understanding dosage instructions to knowing when to take your medications, this guide breaks down everything you need to know.' },
            { type: 'divider' },
            { type: 'heading', text: 'De-coding the Sig: Standard Prescription Abbreviations' },
            { type: 'list', items: ['QD: Once daily', 'BID: Twice a day', 'TID: Three times a day', 'QID: Four times a day', 'PRN: As needed'] },
            { type: 'blockquote', text: 'Always check the pharmacy label twice. If the label details do not match what your doctor told you, ask the pharmacist immediately.', author: 'Dr. Amara, Clinical Pharmacist' },
        ],
    },
    {
        title: 'Why Regular Pharmacist Consultations Can Save Your Life',
        slug: 'pharmacist-consultations-benefits',
        author: 'Editor',
        date: 'January 20, 2026',
        excerpt: 'Most people only visit a pharmacist when they need to fill a prescription. But regular consultations can help identify potential health risks early...',
        image: '/blog_pharmacist_consult.png',
        categories: ['PHARMACY', 'CONSULTATION', 'CARE'],
        blocks: [
            { type: 'paragraph', text: "Most people only visit a pharmacist when they need to fill a prescription. But regular consultations can help identify potential health risks early." },
            { type: 'divider' },
            { type: 'heading', text: 'The Role of the Modern Pharmacist' },
            { type: 'blockquote', text: "A consultation is a two-way street. Bring your bottles, your questions, and your health journals to every visit.", author: 'Health Care Advocate' },
            { type: 'list', items: ['What is the main goal of this medication?', 'Are there any foods or supplements I should avoid?', 'What should I do if I miss a dose?', 'How should I store this medication?'] },
        ],
    },
    {
        title: 'Top 10 Herbal Remedies That Actually Work According to Science',
        slug: 'herbal-remedies-that-work',
        author: 'Dr. Nkechi',
        date: 'January 15, 2026',
        excerpt: 'From turmeric to ginger, herbal remedies have been used for centuries across cultures. But which ones are backed by modern science?...',
        image: '/blog_herbal_remedies.png',
        categories: ['HERBAL', 'NATURAL', 'WELLNESS'],
        blocks: [
            { type: 'paragraph', text: 'From turmeric to ginger, herbal remedies have been used for centuries across cultures. But which ones are backed by modern science?' },
            { type: 'divider' },
            { type: 'heading', text: 'Science-Backed Herbal Solutions' },
            { type: 'list', items: ['Turmeric (Curcumin): Powerful anti-inflammatory and antioxidant properties.', 'Ginger: Outstanding for nausea reduction and digestive comfort.', 'Garlic: Supports cardiovascular health.', 'Echinacea: May shorten the common cold duration.'] },
            { type: 'blockquote', text: 'Herbal supplements can have potent active ingredients. They should be integrated carefully and discussed with your physician.', author: 'Dr. Nkechi' },
        ],
    },
    {
        title: 'Home Health Monitoring: Essential Devices Every Family Needs',
        slug: 'home-health-monitoring-devices',
        author: 'Editor',
        date: 'March 10, 2026',
        excerpt: 'With the rise of telemedicine and home health care, having the right monitoring devices at home is more important than ever...',
        image: '/blog_blood_pressure.png',
        categories: ['HEALTH', 'MONITORING', 'HOME CARE'],
        blocks: [
            { type: 'paragraph', text: 'With the rise of telemedicine and home health care, having the right monitoring devices at home is more important than ever.' },
            { type: 'divider' },
            { type: 'heading', text: 'Key Monitoring Tools for Your Home' },
            { type: 'list', items: ['Digital Blood Pressure Monitor: Ideal for tracking hypertension.', 'Pulse Oximeter: Measures blood oxygen saturation levels.', 'Digital Thermometer: Fast, accurate temperature readings.'] },
            { type: 'blockquote', text: 'Do not self-diagnose based on home readings. Use the records as a basis for consultations with medical professionals.', author: 'Telehealth Specialist' },
        ],
    },
];

// ─── GET /api/blog ────────────────────────────────────────────────────────────
// Returns all blog posts, sorted newest first.
// Supports ?category=<name> filter.
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.query;

        const count = await BlogPost.countDocuments();
        if (count === 0) {
            await BlogPost.insertMany(DEFAULT_BLOG_POSTS);
        }

        const filter: Record<string, unknown> = {};

        if (category && typeof category === 'string') {
            filter.categories = { $elemMatch: { $regex: new RegExp(category, 'i') } };
        }

        const posts = await BlogPost.find(filter)
            .select('-blocks')   // exclude heavy blocks in list view
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: posts.length,
            data: posts,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/blog/:slug ──────────────────────────────────────────────────────
// Returns a single blog post with its full blocks content.
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });

        if (!post) {
            res.status(404).json({ success: false, message: 'Blog post not found' });
            return;
        }

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/blog ───────────────────────────────────────────────── (admin)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.image) {
            req.body.image = await handleImageUploadIfBase64(req.body.image, 'blog');
        }
        const post = await BlogPost.create(req.body);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/blog/:slug ────────────────────────────────────────── (admin)
router.patch('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.image) {
            req.body.image = await handleImageUploadIfBase64(req.body.image, 'blog');
        }
        const post = await BlogPost.findOneAndUpdate(
            { slug: req.params.slug },
            req.body,
            { new: true, runValidators: true }
        );

        if (!post) {
            res.status(404).json({ success: false, message: 'Blog post not found' });
            return;
        }

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/blog ──────────────────────────────────────────────── (admin)
// Bulk delete by ids
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            res.status(400).json({ success: false, message: 'Invalid ids provided' });
            return;
        }
        await BlogPost.deleteMany({ _id: { $in: ids } });
        res.json({ success: true, message: 'Blog posts deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/blog/:slug ───────────────────────────────────────── (admin)
router.delete('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await BlogPost.findOneAndDelete({ slug: req.params.slug });

        if (!post) {
            res.status(404).json({ success: false, message: 'Blog post not found' });
            return;
        }

        res.json({ success: true, message: 'Blog post deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
