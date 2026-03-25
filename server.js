import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import clientRoutes from './src/routes/clientRoutes.js';
import brandRoutes from './src/routes/brandRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';
import faqRoutes from './src/routes/faqRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import inquiryRoutes from './src/routes/inquiryRoutes.js';
import pageRoutes from './src/routes/pageRoutes.js';
import settingRoutes from './src/routes/settingRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import mediaRoutes from './src/routes/mediaRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import { getPublicSettings } from './src/controllers/settingController.js';

import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Security Middleware ---
// 1. Set Security Headers (Anti-XSS, Anti-Clickjacking)
app.use(helmet({
    contentSecurityPolicy: false,
}));

// 1.1 Global SEO Stealth Guard: Block search engines from indexing the backend (Anti-SEO)
app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    next();
});

// 2. Data Sanitization AGAINST NoSQL Injection (Anti-Hack)
app.use(mongoSanitize());

// 3. Prevent HTTP Parameter Pollution
app.use(hpp());

// --- Performance Middleware ---
// 1. Gzip Compression (Zips responses for 2x-3x faster loading)
app.use(compression());

// 2. Rate Limiting (Prevents DDoS and Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 2000 : 200, // More lenient in dev for hot-reloads
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// --- Standard Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Body parser, expanded for rich content blogs
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Public API Routes
app.use('/api/contact', contactRoutes);
app.get('/api/settings/public', getPublicSettings);
app.use('/api/auth', authRoutes);

// Shared Public Data Routes
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/reviews', reviewRoutes);

// --- Admin API Routes (Aligned with Frontend) ---
app.use('/api/admin/projects', projectRoutes);
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/clients', clientRoutes);
app.use('/api/admin/brands', brandRoutes);
app.use('/api/admin/team', teamRoutes);
app.use('/api/admin/faqs', faqRoutes);
app.use('/api/admin/reviews', reviewRoutes);
app.use('/api/admin/inquiries', inquiryRoutes);
app.use('/api/admin/pages', pageRoutes);
app.use('/api/admin/blogs', blogRoutes);
app.use('/api/blogs', blogRoutes); // Mount at /api/blogs for simpler public access if needed
app.use('/api/admin/settings', settingRoutes);
app.use('/api/admin/payments', paymentRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Compatibility fallback for direct /api/pages calls
app.use('/api/pages', pageRoutes); 

// SEO Stealth Route: Robots.txt to disallow all crawlers
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /");
});

// Basic Health Check
app.get('/', (req, res) => {
  res.send('Hinguland Node.js API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
