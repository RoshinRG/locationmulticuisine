/**
 * Location Multi Cuisine Restaurant - Main Server
 * Node.js + Express backend with MongoDB
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { connectDB, sequelize } = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const reservationRoutes = require('./routes/reservations');
const billRoutes = require('./routes/bills');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

// Connect to SQLite
connectDB();

// Sync Models
sequelize.sync({ alter: true }).then(() => {
  console.log('✅  Database Tables Synced');
}).catch(err => {
  console.error('❌  Database Sync Failed:', err);
});

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1', // Skip for local dev
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth-specific stricter rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased for local testing
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

// ─── General Middleware ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'null' // for file:// protocol during development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ─── Static Files ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Location Restaurant API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ─── Serve Frontend (SPA fallback) ──────────────────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🍽️  Location Restaurant Server running on port ${PORT}`);
  console.log(`🌐  Frontend: http://localhost:${PORT}`);
  console.log(`📡  API Base: http://localhost:${PORT}/api`);
  console.log(`🔧  Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
