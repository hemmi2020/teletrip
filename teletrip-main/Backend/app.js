const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const connectToDb = require('./db/db');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.route');
const hotelRoutes = require('./routes/hotel.route.js');   
const paymentRoutes = require('./routes/payment.route');
const bookingRoutes = require('./routes/booking.route');
const { globalErrorHandler } = require('./middlewares/errorHandler.middleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const userDashboardRoutes = require('./routes/userdashboard.route');
const adminDashboardRoutes = require('./routes/admindashboard.route');
require('./models/blacklistToken.model');
require('./models/notification.model');
require('./models/review.model');

dotenv.config();   
connectToDb();
const app = express();

// Trust proxy - IMPORTANT for rate limiting on Render
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS - Must be early in middleware chain
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:5173',
        'https://telitrip.onrender.com',
        'https://www.telitrip.com',
        'https://telitrip.com',
        'https://telitrip-frontend.onrender.com',
        'www.telitrip.com',
        'telitrip.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Compression
app.use(compression());

// General API rate limiting (more lenient)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for geocoding API (the problematic endpoint)
const geocodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many geocoding requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health' || req.path === '/'
});

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

// Static files
app.use('/uploads', express.static('./uploads'));

// Root route (no rate limit)
app.get('/', (req, res) => {
    res.json({ 
        message: 'TeleTrip Backend API is running!',
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

// Health check route (no rate limit)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes 
app.use('/users', userRoutes); 
app.use('/api', hotelRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user', userDashboardRoutes);
app.use('/api/admin', adminDashboardRoutes);

console.log('userRoutes:', typeof userRoutes);
console.log('hotelRoutes:', typeof hotelRoutes);
console.log('paymentRoutes:', typeof paymentRoutes);
console.log('bookingRoutes:', typeof bookingRoutes);

// Error handling middleware (MUST be last)
app.use(globalErrorHandler);

module.exports = app;