const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('./config/passport');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const { swaggerUi, specs } = require('./config/swagger');
const errorHandler = require('./middleware/error.middleware');

const { startPaymentStatusChecker } = require('./services/paymentStatusChecker');
const { startDeductionScheduler } = require('./services/deductionScheduler');

// Disable MongoDB connection attempts
process.env.MONGODB_URI = 'disabled';

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://10.0.2.2:3000'], credentials: true }));
app.use(express.json());

// Format Responses
const responseFormatter = require('./middleware/response.middleware');
app.use(responseFormatter);

// Session Store
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'irene2003',
    database: process.env.DB_NAME || 'smart_banking_powered_by_ai',
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000
});

// Session Middleware
app.use(session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
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
app.use('/api/account', require('./routes/account.routes'));
app.use('/api/loans', require('./routes/loan.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/insights', require('./routes/insights.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/investments', require('./routes/investment.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/goals', require('./routes/goals.routes'));
app.use('/api/schedules', require('./routes/schedules.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// API Info endpoint
app.get('/', (req, res) => {
    res.json({
        msg: 'AI Banking API is running',
        version: '1.0.0',
        documentation: `http://localhost:${PORT}/api-docs`,
        endpoints: {
            auth: '/api/auth',
            public: '/api/public',
            profile: '/api/profile',
            security: '/api/security',
            account: '/api/account',
            transactions: '/api/transactions',
            loans: '/api/loans',
            insights: '/api/insights'
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
        console.log(`Server started on port ${PORT}`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
        startPaymentStatusChecker();
        startDeductionScheduler();
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Stop the process using that port or start the server with a different port via PORT=<port> npm start.`);
        } else {
            console.error('Server failed to start:', err);
        }
        process.exit(1);
    });
}

module.exports = app;
