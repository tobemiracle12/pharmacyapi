import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = Router();

// Helper — sign a JWT
const signToken = (id: string, email: string, role: string): string => {
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ id, email, role }, secret, { expiresIn } as jwt.SignOptions);
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'fullName, email, and password are required',
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters',
            });
            return;
        }

        // Check for existing user
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
            });
            return;
        }

        // Check if this is the first user
        const isFirstUser = (await User.countDocuments({})) === 0;
        const role = isFirstUser ? 'admin' : 'customer';

        // Create user — passwordHash field gets hashed by the pre-save hook
        const user = await User.create({
            fullName,
            email,
            passwordHash: password,
            phone: phone ?? '',
            role,
        });

        const token = signToken(user.id as string, user.email, user.role);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }

        // Explicitly select passwordHash (excluded by default)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }

        const token = signToken(user.id as string, user.email, user.role);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the current authenticated user's profile
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Not authorised' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as { id: string };

        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/auth/users ────────────────────────────────────────────── (admin only)
// Returns all registered users
router.get('/users', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required' });
            return;
        }

        const users = await User.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users.map(u => ({
                id: u._id,
                fullName: u.fullName,
                email: u.email,
                phone: u.phone,
                role: u.role,
                createdAt: u.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
});

// ─── PATCH /api/auth/users/:id/role ─────────────────────────────────── (admin only)
// Toggle or update a user's role
router.patch('/users/:id/role', protect, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required' });
            return;
        }

        const { role } = req.body;
        if (role !== 'admin' && role !== 'customer') {
            res.status(400).json({ success: false, message: 'Invalid role. Must be admin or customer' });
            return;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
