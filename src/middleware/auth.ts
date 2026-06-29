import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

// Extend Express Request to carry the decoded user
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Not authorised — no token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({ success: false, message: 'Server configuration error' });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as AuthPayload;
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Optional auth — attaches user if token exists but does NOT block the request
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (secret) {
            try {
                req.user = jwt.verify(token, secret) as AuthPayload;
            } catch {
                // ignore invalid tokens in optional auth
            }
        }
    }
    next();
};
