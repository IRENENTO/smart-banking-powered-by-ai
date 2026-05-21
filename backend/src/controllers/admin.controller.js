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
        const [usersCount] = await connection.query(
            'SELECT COUNT(*) as total FROM users'
        );

        // Total transactions
        const [transactionsData] = await connection.query(
            'SELECT COUNT(*) as total, SUM(amount) as total_amount FROM transactions'
        );

        // Active users (logged in today)
        const [activeUsers] = await connection.query(
            `SELECT COUNT(DISTINCT user_id) as total 
             FROM login_history 
             WHERE DATE(created_at) = CURDATE()`
        );

        // Total accounts
        const [accountsCount] = await connection.query(
            'SELECT COUNT(*) as total FROM accounts'
        );

        // Pending loans
        const [pendingLoans] = await connection.query(
            `SELECT COUNT(*) as total, SUM(amount) as total_amount 
             FROM loans WHERE status = 'pending'`
        );

        // Total savings
        const [savingsData] = await connection.query(
            'SELECT SUM(current_amount) as total FROM savings_goals'
        );

        // Fraud alerts
        const [fraudAlerts] = await connection.query(
            `SELECT COUNT(*) as total FROM fraud_alerts WHERE status = 'pending'`
        );

        // Monthly transactions growth
        const [monthlyGrowth] = await connection.query(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m-01') as month,
                COUNT(*) as count,
                SUM(amount) as total
             FROM transactions
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY month
             ORDER BY month DESC
             LIMIT 1`
        );

        // Revenue (sum of successful transactions)
        const [revenueData] = await connection.query(
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

        const [users] = await connection.query(query, params);

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

        const [countResult] = await connection.query(countQuery, countParams);

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
        console.error('Error fetching users:', err.message, err.sqlMessage || '');
        res.status(500).json({ error: 'Failed to fetch users: ' + (err.sqlMessage || err.message) });
    }
};

/**
 * Get user details
 */
const getUserDetails = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const userId = req.params.id;

        const [users] = await connection.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Get user accounts
        const [accounts] = await connection.query(
            'SELECT * FROM accounts WHERE user_id = ?',
            [userId]
        );

        // Get user transactions
        const [transactions] = await connection.query(
            `SELECT * FROM transactions 
             WHERE sender_id = ? OR receiver_id = ? 
             ORDER BY created_at DESC LIMIT 10`,
            [userId, userId]
        );

        // Get user loans
        const [loans] = await connection.query(
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

        await connection.query(
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

        const [transactions] = await connection.query(query, params);

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

        const [countResult] = await connection.query(countQuery, countParams);

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

        const [payments] = await connection.query(
            `SELECT * FROM payments ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.query(
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

        const [loans] = await connection.query(
            `SELECT l.*, u.email, u.name FROM loans l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.query(
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

        const [savings] = await connection.query(
            `SELECT s.*, u.email, u.name FROM savings_goals s
             LEFT JOIN users u ON s.user_id = u.id
             ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.query(
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
 * Get AI insights
 */
const getAIInsights = async (req, res) => {
    try {
        const connection = global.dbConnection;

        const [insights] = await connection.query(
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

        const [alerts] = await connection.query(
            `SELECT f.*, u.email, u.name FROM fraud_alerts f
             LEFT JOIN users u ON f.user_id = u.id
             ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.query(
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

        await connection.query(
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

        const [logs] = await connection.query(
            `SELECT l.*, u.email FROM user_activity_logs l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.query(
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

        const [history] = await connection.query(
            `SELECT l.*, u.email FROM login_history l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.query(
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

        const [logs] = await connection.query(
            `SELECT l.*, a.name FROM audit_logs l
             LEFT JOIN admins a ON l.admin_id = a.id
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await connection.query(
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
        const [userGrowth] = await connection.query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as users_created
             FROM users
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date`
        );

        // Transaction trends
        const [transactionTrends] = await connection.query(
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
        const [loanDistribution] = await connection.query(
            `SELECT status, COUNT(*) as count FROM loans GROUP BY status`
        );

        // Savings distribution
        const [savingsDistribution] = await connection.query(
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

        // Check if admin_id column exists in notifications table
        const [columns] = await connection.query(
            "SHOW COLUMNS FROM notifications LIKE 'admin_id'"
        );
        let columnExists = columns.length > 0;

        let notificationsQuery, notificationsParams;
        if (columnExists) {
            notificationsQuery = 'SELECT * FROM notifications WHERE admin_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
            notificationsParams = [req.admin.id, limit, offset];
        } else {
            // Fallback: get all notifications
            notificationsQuery = 'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ? OFFSET ?';
            notificationsParams = [limit, offset];
        }

        const [notifications] = await connection.query(notificationsQuery, notificationsParams);

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

        await connection.query(
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
        const [existing] = await connection.query(
            'SELECT id FROM admins WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        await connection.query(
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

        const [admins] = await connection.query(
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

        await connection.query(
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

/**
 * Get AI analytics dashboard data
 */
const getAIAnalytics = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const aiService = require('../services/ai.service');

        const [predictionCounts] = await connection.query(`
            SELECT 
                COUNT(*) as total_predictions,
                SUM(CASE WHEN JSON_EXTRACT(ai_decision, '$.approval_status') = 'APPROVED' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN JSON_EXTRACT(ai_decision, '$.approval_status') = 'REJECTED' THEN 1 ELSE 0 END) as rejected_count
            FROM loans WHERE ai_decision IS NOT NULL
        `);

        const [fraudAlertCounts] = await connection.query(`
            SELECT status, COUNT(*) as count FROM fraud_alerts GROUP BY status
        `);

        const [recentAiActivity] = await connection.query(`
            SELECT id, user_id, amount, risk_score, ai_decision, created_at 
            FROM loans 
            WHERE ai_decision IS NOT NULL 
            ORDER BY created_at DESC 
            LIMIT 20
        `);

        const modelStatus = await aiService.getModelStatus().catch(() => ({
            success: false,
            models: [],
            status: 'offline'
        }));

        res.json({
            success: true,
            data: {
                prediction_counts: predictionCounts[0] || { total_predictions: 0, approved_count: 0, rejected_count: 0 },
                fraud_alert_counts: fraudAlertCounts,
                recent_ai_activity: recentAiActivity,
                model_status: modelStatus
            }
        });
    } catch (err) {
        console.error('Error fetching AI analytics:', err);
        res.status(500).json({ error: 'Failed to fetch AI analytics' });
    }
};

/**
 * Get risk analysis summary
 */
const getRiskAnalysis = async (req, res) => {
    try {
        const connection = global.dbConnection;

        const [loanRiskDistribution] = await connection.query(`
            SELECT 
                CASE 
                    WHEN risk_score < 30 THEN 'low'
                    WHEN risk_score < 60 THEN 'medium'
                    ELSE 'high'
                END as risk_level,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM loans 
            WHERE risk_score IS NOT NULL
            GROUP BY risk_level
        `);

        const [highRiskLoans] = await connection.query(`
            SELECT l.*, u.email, u.name 
            FROM loans l
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.risk_score > 60
            ORDER BY l.risk_score DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                risk_distribution: loanRiskDistribution,
                high_risk_loans: highRiskLoans
            }
        });
    } catch (err) {
        console.error('Error fetching risk analysis:', err);
        res.status(500).json({ error: 'Failed to fetch risk analysis' });
    }
};

/**
 * Get financial insights summary from AI predictions
 */
const getFinancialInsights = async (req, res) => {
    try {
        const connection = global.dbConnection;

        const [totalSavings] = await connection.query(
            'SELECT COALESCE(SUM(current_amount), 0) as total FROM savings_goals'
        );
        const [totalLoans] = await connection.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM loans WHERE status IN (\'approved\', \'disbursed\')'
        );
        const [totalDeposits] = await connection.query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'deposit' AND status = 'completed'"
        );
        const [avgTransaction] = await connection.query(
            'SELECT COALESCE(AVG(amount), 0) as average FROM transactions WHERE status = \'completed\''
        );

        res.json({
            success: true,
            data: {
                total_savings: totalSavings[0].total,
                total_active_loans: totalLoans[0].total,
                total_deposits: totalDeposits[0].total,
                average_transaction: avgTransaction[0].average,
                generated_at: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('Error fetching financial insights:', err);
        res.status(500).json({ error: 'Failed to fetch financial insights' });
    }
};

// ===== CRUD: Users =====

const createUser = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { name, email, phone, password, role, status, balance } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

        const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'User with this email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const account_number = 'ACC' + Math.floor(100000 + Math.random() * 900000).toString();
        const [result] = await connection.query(
            'INSERT INTO users (name, email, phone, password, role, status, balance, account_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone || null, hashedPassword, role || 'user', status || 'active', balance || 0, account_number]
        );

        res.json({ success: true, message: 'User created successfully', data: { id: result.insertId } });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

const updateUser = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const userId = req.params.id;
        const { name, email, phone, role, status, balance } = req.body;

        const [existing] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

        const fields = [];
        const params = [];
        if (name !== undefined) { fields.push('name = ?'); params.push(name); }
        if (email !== undefined) { fields.push('email = ?'); params.push(email); }
        if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
        if (role !== undefined) { fields.push('role = ?'); params.push(role); }
        if (status !== undefined) { fields.push('status = ?'); params.push(status); }
        if (balance !== undefined) { fields.push('balance = ?'); params.push(balance); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(userId);
        await connection.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const userId = req.params.id;

        const [existing] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

        await connection.query('DELETE FROM transactions WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
        await connection.query('DELETE FROM loans WHERE user_id = ?', [userId]);
        await connection.query('DELETE FROM accounts WHERE user_id = ?', [userId]);
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ success: true, message: 'User and all associated data deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// ===== CRUD: Transactions =====

const createTransaction = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { sender_id, receiver_id, amount, type, status, description } = req.body;
        if (!amount || !type) return res.status(400).json({ error: 'Amount and type are required' });

        const reference_number = 'TXN' + Date.now().toString();
        const [result] = await connection.query(
            'INSERT INTO transactions (sender_id, receiver_id, amount, type, status, description, reference_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sender_id || null, receiver_id || null, amount, type, status || 'completed', description || null, reference_number]
        );

        res.json({ success: true, message: 'Transaction created successfully', data: { id: result.insertId, reference_number } });
    } catch (err) {
        console.error('Error creating transaction:', err);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const txId = req.params.id;

        const [existing] = await connection.query('SELECT id FROM transactions WHERE id = ?', [txId]);
        if (existing.length === 0) return res.status(404).json({ error: 'Transaction not found' });

        await connection.query('DELETE FROM transactions WHERE id = ?', [txId]);
        res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
};

// ===== CRUD: Loans =====

const createLoan = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { user_id, amount, duration, interest_rate, status, purpose } = req.body;
        if (!user_id || !amount) return res.status(400).json({ error: 'User ID and amount are required' });

        const [result] = await connection.query(
            'INSERT INTO loans (user_id, amount, duration, interest_rate, status, purpose) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, amount, duration || 12, interest_rate || 5.0, status || 'pending', purpose || null]
        );

        res.json({ success: true, message: 'Loan created successfully', data: { id: result.insertId } });
    } catch (err) {
        console.error('Error creating loan:', err);
        res.status(500).json({ error: 'Failed to create loan' });
    }
};

const updateLoan = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const loanId = req.params.id;
        const { amount, duration, interest_rate, status, purpose } = req.body;

        const [existing] = await connection.query('SELECT id FROM loans WHERE id = ?', [loanId]);
        if (existing.length === 0) return res.status(404).json({ error: 'Loan not found' });

        const fields = [];
        const params = [];
        if (amount !== undefined) { fields.push('amount = ?'); params.push(amount); }
        if (duration !== undefined) { fields.push('duration = ?'); params.push(duration); }
        if (interest_rate !== undefined) { fields.push('interest_rate = ?'); params.push(interest_rate); }
        if (status !== undefined) { fields.push('status = ?'); params.push(status); }
        if (purpose !== undefined) { fields.push('purpose = ?'); params.push(purpose); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(loanId);
        await connection.query(`UPDATE loans SET ${fields.join(', ')} WHERE id = ?`, params);

        res.json({ success: true, message: 'Loan updated successfully' });
    } catch (err) {
        console.error('Error updating loan:', err);
        res.status(500).json({ error: 'Failed to update loan' });
    }
};

const deleteLoan = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const loanId = req.params.id;

        const [existing] = await connection.query('SELECT id FROM loans WHERE id = ?', [loanId]);
        if (existing.length === 0) return res.status(404).json({ error: 'Loan not found' });

        await connection.query('DELETE FROM loans WHERE id = ?', [loanId]);
        res.json({ success: true, message: 'Loan deleted successfully' });
    } catch (err) {
        console.error('Error deleting loan:', err);
        res.status(500).json({ error: 'Failed to delete loan' });
    }
};

// ===== CRUD: Fraud Alerts =====

const createFraudAlert = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { user_id, alert_type, description, severity, status } = req.body;
        if (!user_id || !alert_type) return res.status(400).json({ error: 'User ID and alert type are required' });

        const [result] = await connection.query(
            'INSERT INTO fraud_alerts (user_id, alert_type, description, severity, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, alert_type, description || null, severity || 'medium', status || 'pending']
        );

        res.json({ success: true, message: 'Fraud alert created successfully', data: { id: result.insertId } });
    } catch (err) {
        console.error('Error creating fraud alert:', err);
        res.status(500).json({ error: 'Failed to create fraud alert' });
    }
};

const deleteFraudAlert = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const alertId = req.params.id;

        const [existing] = await connection.query('SELECT id FROM fraud_alerts WHERE id = ?', [alertId]);
        if (existing.length === 0) return res.status(404).json({ error: 'Fraud alert not found' });

        await connection.query('DELETE FROM fraud_alerts WHERE id = ?', [alertId]);
        res.json({ success: true, message: 'Fraud alert deleted successfully' });
    } catch (err) {
        console.error('Error deleting fraud alert:', err);
        res.status(500).json({ error: 'Failed to delete fraud alert' });
    }
};

// ===== CMS: Website Content Management =====

const getCmsSections = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const [sections] = await connection.query(
            'SELECT * FROM cms_sections ORDER BY page, section'
        );
        res.json({ success: true, data: { sections } });
    } catch (err) {
        console.error('Error fetching CMS sections:', err);
        res.status(500).json({ error: 'Failed to fetch CMS sections' });
    }
};

const getCmsByPage = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { page } = req.params;
        const [sections] = await connection.query(
            'SELECT * FROM cms_sections WHERE page = ?',
            [page]
        );
        res.json({ success: true, data: { sections } });
    } catch (err) {
        console.error('Error fetching CMS page:', err);
        res.status(500).json({ error: 'Failed to fetch CMS page' });
    }
};

const updateCmsSection = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { page, section } = req.params;
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: 'Content is required' });

        await connection.query(
            `INSERT INTO cms_sections (page, section, content, updated_by) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE content = VALUES(content), updated_by = VALUES(updated_by)`,
            [page, section, JSON.stringify(content), req.admin.id]
        );

        res.json({ success: true, message: 'Content updated successfully' });
    } catch (err) {
        console.error('Error updating CMS section:', err);
        res.status(500).json({ error: 'Failed to update CMS section' });
    }
};

const bulkUpdateCms = async (req, res) => {
    try {
        const connection = global.dbConnection;
        const { sections } = req.body;

        if (!sections || !Array.isArray(sections)) return res.status(400).json({ error: 'Sections array is required' });

        for (const item of sections) {
            if (!item.page || !item.section || !item.content) continue;
            await connection.query(
                `INSERT INTO cms_sections (page, section, content, updated_by) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE content = VALUES(content), updated_by = VALUES(updated_by)`,
                [item.page, item.section, JSON.stringify(item.content), req.admin.id]
            );
        }

        res.json({ success: true, message: 'All sections updated successfully' });
    } catch (err) {
        console.error('Error bulk updating CMS:', err);
        res.status(500).json({ error: 'Failed to bulk update CMS' });
    }
};

module.exports = {
    getStats,
    getUsers,
    getUserDetails,
    updateUserStatus,
    createUser,
    updateUser,
    deleteUser,
    getTransactions,
    getPayments,
    createTransaction,
    deleteTransaction,
    getLoans,
    getSavings,
    createLoan,
    updateLoan,
    deleteLoan,
    getAIInsights,
    getFraudAlerts,
    reviewFraudAlert,
    createFraudAlert,
    deleteFraudAlert,
    getActivityLogs,
    getLoginHistory,
    getAuditLogs,
    getAnalytics,
    getNotifications,
    markNotificationAsRead,
    createAdmin,
    getAdmins,
    updateAdminRole,
    getAIAnalytics,
    getRiskAnalysis,
    getFinancialInsights,
    getCmsSections,
    getCmsByPage,
    updateCmsSection,
    bulkUpdateCms
};
