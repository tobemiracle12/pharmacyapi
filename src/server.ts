import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import blogRoutes from './routes/blog';
import contactRoutes from './routes/contact';
import emailTemplateRoutes from './routes/emailTemplates';
import notificationTemplateRoutes from './routes/notificationTemplates';

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ─── Create Express App ────────────────────────────────────────────────────────
const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Hi-Health API is running 🏥',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/notification-templates', notificationTemplateRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => {
    console.log(`\n🚀  Server running on http://localhost:${PORT}`);
    console.log(`📋  Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
