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

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'", process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000', 'http://localhost:4000'],
        },
    },
}));

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
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/auth'),
    message: { error: { statusCode: 429, message: 'Too many requests, please try again later.' } },
});

app.use(generalLimiter);

// CORS — restrict in production
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'http://localhost:8081',
    'http://localhost:19000',
    'http://localhost:19006',
    'http://127.0.0.1:19000',
    'http://127.0.0.1:19006',
    'http://10.0.2.2:3000',
    'http://10.0.2.2:8081',
    'https://smartbankingpoweredbyai.netlify.app',  
    'https://smart-banking-frontend.netlify.app',
    'https://smart-banking-powered-by-ai.onrender.com'
];

if (process.env.VERCEL_URL) ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_URL}`);
if (process.env.RENDER_EXTERNAL_URL) ALLOWED_ORIGINS.push(process.env.RENDER_EXTERNAL_URL);
if (process.env.CLIENT_URL) {
    const origins = process.env.CLIENT_URL.split(',').map(o => o.trim());
    ALLOWED_ORIGINS.push(...origins);
}

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        
        const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
        
        if (ALLOWED_ORIGINS.includes(origin) || (process.env.NODE_ENV !== 'production' && isLocalhost)) {
            callback(null, true);
        } else {
            // In production, block. In dev, log and allow.
            if (process.env.NODE_ENV === 'production') {
                logger.warn(`CORS blocked for origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            } else {
                callback(null, true);
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(compression());
app.use(cors(corsOptions));
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
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
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
app.use('/api/auth', require('./routes/oauth.routes'));
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

// ==================== HEALTH CHECK ENDPOINT (FIXED FOR TiDB) ====================
app.get('/api/health', async (req, res) => {
    const { query } = require('./config/db');
    try {
        // Simple query that works with TiDB Cloud (MySQL protocol)
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
            session_store: 'PostgreSQL (TiDB Cloud)',
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

// ==================== DETAILED HEALTH CHECK (Optional) ====================
app.get('/api/health/detailed', async (req, res) => {
    const { query } = require('./config/db');
    try {
        // Test connection
        await query('SELECT 1');
        
        // Get version info
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
            session_store: 'PostgreSQL (TiDB Cloud)',
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
        documentation: `http://localhost:${PORT}/api-docs`,
        database: 'TiDB Cloud (PostgreSQL compatible with SSL)',
        session_store: 'PostgreSQL (TiDB Cloud)',
        endpoints: {
            health: '/api/health',
            health_detailed: '/api/health/detailed',
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
        logger.info(`🔒 Database: TiDB Cloud (SSL enabled)`);
        logger.info(`💾 Session Store: PostgreSQL (TiDB Cloud)`);
        
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