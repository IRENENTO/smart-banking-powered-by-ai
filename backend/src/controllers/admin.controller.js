const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * Get dashboard statistics
 */
const getStats = async (req, res) => {
    try {
        const connection = global.dbConnection;

        // Total users
        const [usersCount] = await connection.execute(
            'SELECT COUNT(*) as total FROM users'
        );

        // Total transactions
        const [transactionsData] = await connection.execute(
            'SELECT COUNT(*) as total, SUM(amount) as total_amount FROM transactions'
        );

        // Active users (logged in today)
        const [activeUsers] = await connection.execute(
            `SELECT COUNT(DISTINCT user_id) as total 
             FROM login_history 
             WHERE DATE(created_at) = CURDATE()`
        );

        // Total accounts
        const [accountsCount] = await connection.execute(
            'SELECT COUNT(*) as total FROM accounts'
        );

        // Pending loans
        const [pendingLoans] = await connection.execute(
            `SELECT COUNT(*) as total, SUM(amount) as total_amount 
             FROM loans WHERE status = 'pending'`
        );

        // Total savings
        const [savingsData] = await connection.execute(
            'SELECT SUM(current_amount) as total FROM savings_goals'
        );

        // KYC pending
        const [kycPending] = await connection.execute(
            `SELECT COUNT(*) as total FROM users WHERE kyc_status = 'pending'`
        );

        // Fraud alerts
        const [fraudAlerts] = await connection.execute(
            `SELECT COUNT(*) as total FROM fraud_alerts WHERE status = 'pending'`
        );

        // Monthly transactions growth
        const [monthlyGrowth] = await connection.execute(
            `SELECT 
                DATE_TRUNC(DATE(created_at), MONTH) as month,
                COUNT(*) as count,
                SUM(amount) as total
             FROM transactions
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY month
             ORDER BY month DESC
             LIMIT 1`
        );

        // Revenue (sum of successful transactions)
        const [revenueData] = await connection.execute(
            `SELECT SUM(amount) as total FROM transactions WHERE status = 'completed'`
        );

        res.json({
            success: true,
            data: {
                total_users: usersCount[0].total,
                total_transactions: transactionsData[0].total,
                total_transactions_amount: transactionsData[0].total_amount || 0,
                active_users_today: activeUsers[0].total,
                total_accounts: accountsCount[0].total,
                pending_loans: pendingLoans[0].total,
                pending_loans_amount: pendingLoans[0].total_amount || 0,
                total_savings: savingsData[0].total || 0,
                kyc_pending: kycPending[0].total,
                fraud_alerts_pending: fraudAlerts[0].total,
                total_revenue: revenueData[0].total || 0,
                monthly_growth: monthlyGrowth[0] || {}
            }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

/**
 * Get all users with pagination and filtering
 */
const getUsers = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        if (search) {
            query += ` AND (email LIKE ? OR name LIKE ? OR phone_number LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [users] = await connection.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];

        if (search) {
            countQuery += ` AND (email LIKE ? OR name LIKE ? OR phone_number LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            countQuery += ` AND status = ?`;
            countParams.push(status);
        }

        const [countResult] = await connection.execute(countQuery, countParams);

        res.json({
            success: true,
            data: {
                users: users,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * Get user details
 */
const getUserDetails = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const userId = req.params.id;

        const [users] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Get user accounts
        const [accounts] = await connection.execute(
            'SELECT * FROM accounts WHERE user_id = ?',
            [userId]
        );

        // Get user transactions
        const [transactions] = await connection.execute(
            `SELECT * FROM transactions 
             WHERE sender_id = ? OR receiver_id = ? 
             ORDER BY created_at DESC LIMIT 10`,
            [userId, userId]
        );

        // Get user loans
        const [loans] = await connection.execute(
            'SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            data: {
                user,
                accounts,
                transactions,
                loans
            }
        });
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
};

/**
 * Update user status
 */
const updateUserStatus = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const userId = req.params.id;
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await connection.execute(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId]
        );

        res.json({
            success: true,
            message: `User status updated to ${status}`
        });
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

/**
 * Get all transactions
 */
const getTransactions = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || '';
        const type = req.query.type || '';
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM transactions WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [transactions] = await connection.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE 1=1';
        const countParams = [];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        if (type) {
            countQuery += ' AND type = ?';
            countParams.push(type);
        }

        const [countResult] = await connection.execute(countQuery, countParams);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

/**
 * Get all payments
 */
const getPayments = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [payments] = await connection.execute(
            `SELECT * FROM payments ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM payments'
        );

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

/**
 * Get all loans
 */
const getLoans = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [loans] = await connection.execute(
            `SELECT l.*, u.email, u.name FROM loans l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM loans'
        );

        res.json({
            success: true,
            data: {
                loans,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching loans:', err);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};

/**
 * Get savings goals
 */
const getSavings = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [savings] = await connection.execute(
            `SELECT s.*, u.email, u.name FROM savings_goals s
             LEFT JOIN users u ON s.user_id = u.id
             ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM savings_goals'
        );

        res.json({
            success: true,
            data: {
                savings,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching savings:', err);
        res.status(500).json({ error: 'Failed to fetch savings' });
    }
};

/**
 * Get KYC submissions
 */
const getKYC = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [kyc] = await connection.execute(
            `SELECT k.*, u.email, u.name FROM kyc_submissions k
             LEFT JOIN users u ON k.user_id = u.id
             ORDER BY k.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM kyc_submissions'
        );

        res.json({
            success: true,
            data: {
                kyc,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching KYC:', err);
        res.status(500).json({ error: 'Failed to fetch KYC submissions' });
    }
};

/**
 * Verify KYC submission
 */
const verifyKYC = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const kycId = req.params.id;
        const { status, notes } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Get KYC record
        const [kyc] = await connection.execute(
            'SELECT user_id FROM kyc_submissions WHERE id = ?',
            [kycId]
        );

        if (kyc.length === 0) {
            return res.status(404).json({ error: 'KYC not found' });
        }

        // Update KYC
        await connection.execute(
            `UPDATE kyc_submissions SET status = ?, verified_by = ?, verified_at = NOW(), notes = ? WHERE id = ?`,
            [status, req.admin.id, notes || null, kycId]
        );

        // Update user KYC status
        await connection.execute(
            'UPDATE users SET kyc_status = ? WHERE id = ?',
            [status === 'verified' ? 'verified' : 'rejected', kyc[0].user_id]
        );

        res.json({
            success: true,
            message: `KYC ${status} successfully`
        });
    } catch (err) {
        console.error('Error verifying KYC:', err);
        res.status(500).json({ error: 'Failed to verify KYC' });
    }
};

/**
 * Get AI insights
 */
const getAIInsights = async (req, res) => {
    try {
        const connection = global.dbConnection;

        const [insights] = await connection.execute(
            `SELECT * FROM ai_market_insights ORDER BY created_at DESC LIMIT 50`
        );

        res.json({
            success: true,
            data: {
                insights
            }
        });
    } catch (err) {
        console.error('Error fetching AI insights:', err);
        res.status(500).json({ error: 'Failed to fetch AI insights' });
    }
};

/**
 * Get fraud alerts
 */
const getFraudAlerts = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [alerts] = await connection.execute(
            `SELECT f.*, u.email, u.name FROM fraud_alerts f
             LEFT JOIN users u ON f.user_id = u.id
             ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM fraud_alerts'
        );

        res.json({
            success: true,
            data: {
                alerts,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching fraud alerts:', err);
        res.status(500).json({ error: 'Failed to fetch fraud alerts' });
    }
};

/**
 * Review fraud alert
 */
const reviewFraudAlert = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const alertId = req.params.id;
        const { status, action_taken } = req.body;

        if (!['resolved', 'false_positive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await connection.execute(
            `UPDATE fraud_alerts SET status = ?, reviewed_by = ?, reviewed_at = NOW(), action_taken = ? WHERE id = ?`,
            [status, req.admin.id, action_taken || null, alertId]
        );

        res.json({
            success: true,
            message: 'Fraud alert reviewed successfully'
        });
    } catch (err) {
        console.error('Error reviewing fraud alert:', err);
        res.status(500).json({ error: 'Failed to review fraud alert' });
    }
};

/**
 * Get activity logs
 */
const getActivityLogs = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [logs] = await connection.execute(
            `SELECT l.*, u.email FROM user_activity_logs l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM user_activity_logs'
        );

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching activity logs:', err);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
};

/**
 * Get login history
 */
const getLoginHistory = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [history] = await connection.execute(
            `SELECT l.*, u.email FROM login_history l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM login_history'
        );

        res.json({
            success: true,
            data: {
                history,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching login history:', err);
        res.status(500).json({ error: 'Failed to fetch login history' });
    }
};

/**
 * Get audit logs
 */
const getAuditLogs = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [logs] = await connection.execute(
            `SELECT l.*, a.name FROM audit_logs l
             LEFT JOIN admins a ON l.admin_id = a.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM audit_logs'
        );

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

/**
 * Get analytics data
 */
const getAnalytics = async (req, res) => {
    try {
        const connection = global.dbConnection;

        // User growth over time
        const [userGrowth] = await connection.execute(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as users_created
             FROM users
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date`
        );

        // Transaction trends
        const [transactionTrends] = await connection.execute(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as transaction_count,
                SUM(amount) as transaction_amount
             FROM transactions
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date`
        );

        // Loan distribution
        const [loanDistribution] = await connection.execute(
            `SELECT status, COUNT(*) as count FROM loans GROUP BY status`
        );

        // Savings distribution
        const [savingsDistribution] = await connection.execute(
            `SELECT status, COUNT(*) as count FROM savings_goals GROUP BY status`
        );

        res.json({
            success: true,
            data: {
                user_growth: userGrowth,
                transaction_trends: transactionTrends,
                loan_distribution: loanDistribution,
                savings_distribution: savingsDistribution
            }
        });
    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

/**
 * Get notifications
 */
const getNotifications = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [notifications] = await connection.execute(
            `SELECT * FROM notifications WHERE admin_id = ?
             ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [req.admin.id, limit, offset]
        );

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page,
                    limit
                }
            }
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const notifId = req.params.id;

        await connection.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [notifId]
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (err) {
        console.error('Error updating notification:', err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

/**
 * Create new admin (super admin only)
 */
const createAdmin = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if admin already exists
        const [existing] = await connection.execute(
            'SELECT id FROM admins WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        await connection.execute(
            'INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, role || 'admin']
        );

        res.json({
            success: true,
            message: 'Admin created successfully'
        });
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).json({ error: 'Failed to create admin' });
    }
};

/**
 * Get all admins
 */
const getAdmins = async (req, res) => {
    try {
        const connection = global.dbConnection;

        const [admins] = await connection.execute(
            'SELECT id, email, name, role, status, last_login, created_at FROM admins'
        );

        res.json({
            success: true,
            data: {
                admins
            }
        });
    } catch (err) {
        console.error('Error fetching admins:', err);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
};

/**
 * Update admin role
 */
const updateAdminRole = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const adminId = req.params.id;
        const { role } = req.body;

        if (!['super_admin', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        await connection.execute(
            'UPDATE admins SET role = ? WHERE id = ?',
            [role, adminId]
        );

        res.json({
            success: true,
            message: 'Admin role updated successfully'
        });
    } catch (err) {
        console.error('Error updating admin role:', err);
        res.status(500).json({ error: 'Failed to update admin role' });
    }
};

module.exports = {
    getStats,
    getUsers,
    getUserDetails,
    updateUserStatus,
    getTransactions,
    getPayments,
    getLoans,
    getSavings,
    getKYC,
    verifyKYC,
    getAIInsights,
    getFraudAlerts,
    reviewFraudAlert,
    getActivityLogs,
    getLoginHistory,
    getAuditLogs,
    getAnalytics,
    getNotifications,
    markNotificationAsRead,
    createAdmin,
    getAdmins,
    updateAdminRole
};
