const express = require('express');
const router = express.Router();
const { adminAuth, superAdminOnly, auditLog } = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');

// Apply auth middleware to all admin routes
router.use(adminAuth);
router.use(auditLog);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', adminController.getStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Admin Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         type: integer
 *       - in: query
 *         name: limit
 *         type: integer
 *       - in: query
 *         name: search
 *         type: string
 *       - in: query
 *         name: status
 *         type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: integer
 */
router.get('/users/:id', adminController.getUserDetails);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Admin Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: integer
 */
router.patch('/users/:id/status', adminController.updateUserStatus);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions with pagination
 *     tags: [Admin Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         type: integer
 *       - in: query
 *         name: limit
 *         type: integer
 *       - in: query
 *         name: status
 *         type: string
 *       - in: query
 *         name: type
 *         type: string
 */
router.get('/transactions', adminController.getTransactions);

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all payments with pagination
 *     tags: [Admin Payments]
 */
router.get('/payments', adminController.getPayments);

/**
 * @swagger
 * /api/admin/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Admin Loans]
 */
router.get('/loans', adminController.getLoans);

/**
 * @swagger
 * /api/admin/savings:
 *   get:
 *     summary: Get savings information
 *     tags: [Admin Savings]
 */
router.get('/savings', adminController.getSavings);

/**
 * @swagger
 * /api/admin/kyc:
 *   get:
 *     summary: Get KYC submissions
 *     tags: [Admin KYC]
 */
router.get('/kyc', adminController.getKYC);

/**
 * @swagger
 * /api/admin/kyc/{id}/verify:
 *   patch:
 *     summary: Verify KYC submission
 *     tags: [Admin KYC]
 */
router.patch('/kyc/:id/verify', adminController.verifyKYC);

/**
 * @swagger
 * /api/admin/ai-insights:
 *   get:
 *     summary: Get AI insights and predictions
 *     tags: [Admin AI]
 */
router.get('/ai-insights', adminController.getAIInsights);

/**
 * @swagger
 * /api/admin/fraud-alerts:
 *   get:
 *     summary: Get fraud alerts
 *     tags: [Admin Security]
 */
router.get('/fraud-alerts', adminController.getFraudAlerts);

/**
 * @swagger
 * /api/admin/fraud-alerts/{id}/review:
 *   patch:
 *     summary: Review fraud alert
 *     tags: [Admin Security]
 */
router.patch('/fraud-alerts/:id/review', adminController.reviewFraudAlert);

/**
 * @swagger
 * /api/admin/activity-logs:
 *   get:
 *     summary: Get user activity logs
 *     tags: [Admin Logs]
 */
router.get('/activity-logs', adminController.getActivityLogs);

/**
 * @swagger
 * /api/admin/login-history:
 *   get:
 *     summary: Get login history
 *     tags: [Admin Logs]
 */
router.get('/login-history', adminController.getLoginHistory);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs (admin actions)
 *     tags: [Admin Logs]
 */
router.get('/audit-logs', superAdminOnly, adminController.getAuditLogs);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get detailed analytics
 *     tags: [Admin Analytics]
 */
router.get('/analytics', adminController.getAnalytics);

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Get admin notifications
 *     tags: [Admin Notifications]
 */
router.get('/notifications', adminController.getNotifications);

/**
 * @swagger
 * /api/admin/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Admin Notifications]
 */
router.patch('/notifications/:id/read', adminController.markNotificationAsRead);

// Super admin only routes
router.post('/admins', superAdminOnly, adminController.createAdmin);
router.get('/admins', superAdminOnly, adminController.getAdmins);
router.patch('/admins/:id/role', superAdminOnly, adminController.updateAdminRole);

module.exports = router;
