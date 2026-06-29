import { Router, Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { handleImageUploadIfBase64 } from '../utils/s3';

const router = Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
// Returns all products. Supports ?category=<name> and ?search=<text> filters.
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, search } = req.query;

        const filter: Record<string, unknown> = {};

        if (category && typeof category === 'string') {
            filter.category = { $regex: new RegExp(category, 'i') };
        }

        if (search && typeof search === 'string') {
            filter.$text = { $search: search };
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/products ──────────────────────────────────────────── (admin)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.image) {
            req.body.image = await handleImageUploadIfBase64(req.body.image, 'products');
        }
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/products/:id ─────────────────────────────────────── (admin)
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.image) {
            req.body.image = await handleImageUploadIfBase64(req.body.image, 'products');
        }
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
});

// ─── DELETE /api/products/:id ─────────────────────────────────────── (admin)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
