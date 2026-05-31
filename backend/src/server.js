require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('./config/passport');
const { connectDB, pool } = require('./config/db');
const { PORT } = require('./config/env');
const { swaggerUi, specs } = require('./config/swagger');
const logger = require('./services/logger');
const errorHandler = require('./middleware/error.middleware');

const { startPaymentStatusChecker } = require('./services/paymentStatusChecker');
const { startDeductionScheduler } = require('./services/deductionScheduler');

// Disable MongoDB connection attempts
process.env.MONGODB_URI = 'disabled';

const app = express();

// Trust proxy — required for rate limiting behind Render/Vercel
app.set('trust proxy', 1);

// Connect Database
connectDB();

// ==================== UPDATED CORS CONFIGURATION ====================
// Allow all Netlify domains and local development
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'http://localhost:5000',
    'http://localhost:8080',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4000',
    'http://10.0.2.2:3000',
    'http://10.0.2.2:8081',
    'https://chipper-starlight-301049.netlify.app',
    'https://smartbankingpoweredbyai.netlify.app',
    'https://smart-banking-frontend.netlify.app',
    'https://*.netlify.app',
    'https://smart-banking-powered-by-ai.onrender.com'
];

// Dynamic CORS origin function
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if origin is allowed (exact match or wildcard for Netlify)
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
                const pattern = allowed.replace('*', '.*');
                const regex = new RegExp(pattern);
                return regex.test(origin);
            }
            return allowed === origin;
        });
        
        // Also allow any localhost in development
        const isLocalhost = origin.startsWith('http://localhost:') || 
                           origin.startsWith('http://127.0.0.1:') ||
                           origin.startsWith('http://10.0.2.2:');
        
        if (isAllowed || isLocalhost || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Authorization', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware BEFORE all other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
// ==================== END CORS CONFIGURATION ====================

// ==================== UPDATED HELMET CONFIGURATION ====================
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: [
                "'self'", 
                'https://smart-banking-powered-by-ai.onrender.com',
                'https://chipper-starlight-301049.netlify.app',
                'https://smartbankingpoweredbyai.netlify.app',
                'https://*.netlify.app',
                'http://localhost:3000',
                'http://localhost:4000'
            ],
        },
    },
}));
// ==================== END HELMET CONFIGURATION ====================

// Rate limiting — auth limiter applied before general so stricter rules apply
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { statusCode: 429, message: 'Too many login attempts, please try again later.' } },
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/auth'),
    message: { error: { statusCode: 429, message: 'Too many requests, please try again later.' } },
});

app.use(generalLimiter);
app.use(compression());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Apply stricter rate limit to auth routes
app.use('/api/auth', authLimiter);

// Format Responses
const responseFormatter = require('./middleware/response.middleware');
app.use(responseFormatter);

// Session Middleware with MySQL store
const dbName = process.env.TIDB_DB_NAME || process.env.DB_NAME;
app.use(session({
    store: new MySQLStore({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName,
        ssl: { rejectUnauthorized: false },
        createDatabaseTable: true,
        schema: {
            tableName: 'session',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        }
    }),
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AI Banking API Documentation'
}));

// Define Routes
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin/auth', require('./routes/admin-auth.routes'));
app.use('/api/otp', require('./routes/otp.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/security', require('./routes/security.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/account', require('./routes/account.routes'));
app.use('/api/loans', require('./routes/loan.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/insights', require('./routes/insights.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/investments', require('./routes/investment.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/goals', require('./routes/goals.routes'));
app.use('/api/schedules', require('./routes/schedules.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/market', require('./routes/market.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// ==================== CORS TEST ENDPOINT ====================
app.get('/api/cors-test', (req, res) => {
    res.json({
        success: true,
        message: 'CORS is working!',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// ==================== AI ENGINE TEST ENDPOINTS (NO AUTH) ====================

// Test AI Engine connection directly (no auth required)
app.get('/api/ai-engine/status', async (req, res) => {
    const { getAIEngineHealth } = require('./services/ai.service');
    try {
        const health = await getAIEngineHealth();
        res.json({
            success: true,
            ai_engine: health,
            config: {
                url: process.env.AI_ENGINE_URL,
                has_api_key: !!process.env.AI_ENGINE_API_KEY
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            ai_engine_url: process.env.AI_ENGINE_URL
        });
    }
});

// Simple AI Engine connection test (direct HTTP)
app.get('/api/test-ai-connection', async (req, res) => {
    const axios = require('axios');
    
    const AI_URL = process.env.AI_ENGINE_URL || 'https://smart-banking-ai-engine1.onrender.com';
    const AI_KEY = process.env.AI_ENGINE_API_KEY || 'smart-banking-ai-key-2024';
    
    console.log(`Testing AI Engine connection to: ${AI_URL}`);
    
    try {
        const response = await axios.get(`${AI_URL}/api/ai/model-status`, {
            headers: {
                'X-API-Key': AI_KEY
            },
            timeout: 10000
        });
        
        res.json({
            success: true,
            message: '✅ AI Engine is connected and responding!',
            ai_engine_status: response.data,
            config: {
                url: AI_URL,
                has_api_key: !!AI_KEY,
                api_key_preview: AI_KEY ? AI_KEY.substring(0, 10) + '...' : 'none'
            }
        });
    } catch (error) {
        console.error('AI Engine test failed:', error.message);
        res.status(500).json({
            success: false,
            message: '❌ AI Engine connection failed',
            error: error.message,
            config: {
                url: AI_URL,
                has_api_key: !!AI_KEY
            }
        });
    }
});

// Test prediction without auth (for debugging)
app.post('/api/ai-engine/test-prediction', async (req, res) => {
    const { predictLoan } = require('./services/ai.service');
    try {
        const result = await predictLoan(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EMAIL DIAGNOSTIC ENDPOINT ====================
app.get('/api/health/email', async (req, res) => {
    const sendOTPEmail = require('./services/email.service');
    const testEmail = req.query.email || process.env.EMAIL_USER;
    const hasEmailUser = !!process.env.EMAIL_USER;
    const hasEmailPass = !!process.env.EMAIL_PASS;
    const emailUser = process.env.EMAIL_USER || 'NOT SET';

    const result = {
        env: {
            EMAIL_USER: hasEmailUser ? `${emailUser.substring(0, 3)}****@${emailUser.split('@')[1] || '...'}` : 'NOT SET',
            EMAIL_PASS_SET: hasEmailPass,
            NODE_ENV: process.env.NODE_ENV || 'not set',
        },
        test: null,
        error: null,
    };

    if (!hasEmailUser || !hasEmailPass) {
        result.error = 'EMAIL_USER or EMAIL_PASS environment variables are not set';
        return res.status(200).json(result);
    }

    try {
        const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
        await sendOTPEmail(testEmail, testOtp);
        result.test = {
            sent_to: testEmail,
            otp: testOtp,
            message: 'Test email sent successfully. Check your inbox (and spam folder).',
        };
    } catch (err) {
        result.error = err.message;
        console.error('Email diagnostic failed:', err);
    }

    res.json(result);
});

// ==================== HEALTH CHECK ENDPOINT ====================
app.get('/api/health', async (req, res) => {
    const { query } = require('./config/db');
    try {
        const result = await query('SELECT 1 as connected, NOW() as server_time');
        const row = result.rows[0];
        res.json({
            success: true,
            message: '✅ Connected to TiDB Cloud successfully!',
            connected: true,
            server_time: row.server_time,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            environment: process.env.NODE_ENV || 'production',
            session_store: 'MySQL (TiDB Cloud)',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ==================== DETAILED HEALTH CHECK ====================
app.get('/api/health/detailed', async (req, res) => {
    const { query } = require('./config/db');
    try {
        await query('SELECT 1');
        const versionResult = await query('SELECT VERSION() as version');
        
        res.json({
            success: true,
            message: '✅ Connected to TiDB Cloud successfully!',
            status: 'healthy',
            database: {
                name: process.env.DB_NAME,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                version: versionResult.rows[0]?.version || 'TiDB Cloud',
                connected: true,
                ssl: true
            },
            server: {
                port: PORT,
                environment: process.env.NODE_ENV || 'production',
                start_time: new Date().toISOString()
            },
            session_store: 'MySQL (TiDB Cloud)',
            uptime: process.uptime(),
            memory_usage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Database connection failed',
            error: error.message,
            status: 'unhealthy',
            timestamp: new Date().toISOString()
        });
    }
});

// ==================== API INFO ====================
app.get('/', (req, res) => {
    res.json({
        msg: 'AI Banking API is running',
        version: '1.0.0',
        documentation: `https://smart-banking-powered-by-ai.onrender.com/api-docs`,
        database: 'TiDB Cloud (MySQL compatible with SSL)',
        session_store: 'MySQL (TiDB Cloud)',
        endpoints: {
            health: '/api/health',
            health_detailed: '/api/health/detailed',
            health_email: '/api/health/email?email=you@test.com',
            cors_test: '/api/cors-test',
            test_ai: '/api/test-ai-connection',
            ai_status: '/api/ai-engine/status',
            auth: '/api/auth',
            public: '/api/public',
            profile: '/api/profile',
            security: '/api/security',
            account: '/api/account',
            transactions: '/api/transactions',
            loans: '/api/loans',
            insights: '/api/insights',
            ai: '/api/ai'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: {
            statusCode: 404,
            message: `Route ${req.method} ${req.path} not found`
        }
    });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

if (require.main === module) {
    const server = app.listen(PORT, () => {
        logger.info(`✅ Server started on port ${PORT}`);
        logger.info(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
        logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
        logger.info(`🔍 Detailed Health: http://localhost:${PORT}/api/health/detailed`);
        logger.info(`🤖 AI Test: http://localhost:${PORT}/api/test-ai-connection`);
        logger.info(`🔒 Database: TiDB Cloud (SSL enabled)`);
        logger.info(`💾 Session Store: MySQL (TiDB Cloud)`);
        logger.info(`🌐 CORS enabled for Netlify and localhost`);
        
        startPaymentStatusChecker();
        startDeductionScheduler();
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger.error(`Port ${PORT} is already in use`);
        } else {
            logger.error('Server failed to start', { error: err.message });
        }
        process.exit(1);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
        logger.info(`${signal} received — shutting down gracefully`);
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;