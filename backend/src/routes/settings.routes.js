const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { requireEmailVerified } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireEmailVerified);

/**
 * @swagger
 * /api/settings/security:
 *   get:
 *     summary: Get security settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/security', settingsController.getSecuritySettings);

/**
 * @swagger
 * /api/settings/security:
 *   put:
 *     summary: Update security settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               two_factor_enabled:
 *                 type: boolean
 *               sms_alerts:
 *                 type: boolean
 *               email_alerts:
 *                 type: boolean
 *               login_notifications:
 *                 type: boolean
 *               session_timeout:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Security settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/security', settingsController.updateSecuritySettings);

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: Get notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/notifications', settingsController.getNotificationSettings);

/**
 * @swagger
 * /api/settings/notifications:
 *   put:
 *     summary: Update notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_transactions:
 *                 type: boolean
 *               sms_transactions:
 *                 type: boolean
 *               email_promotions:
 *                 type: boolean
 *               sms_promotions:
 *                 type: boolean
 *               push_notifications:
 *                 type: boolean
 *               weekly_summary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/notifications', settingsController.updateNotificationSettings);

/**
 * @swagger
 * /api/settings/privacy:
 *   get:
 *     summary: Get privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/privacy', settingsController.getPrivacySettings);

/**
 * @swagger
 * /api/settings/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_sharing:
 *                 type: boolean
 *               analytics_consent:
 *                 type: boolean
 *               marketing_consent:
 *                 type: boolean
 *               public_profile:
 *                 type: boolean
 *               location_tracking:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/privacy', settingsController.updatePrivacySettings);

/**
 * @swagger
 * /api/settings/limits:
 *   get:
 *     summary: Get transaction limits
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction limits retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/limits', settingsController.getTransactionLimits);

/**
 * @swagger
 * /api/settings/limits:
 *   put:
 *     summary: Update transaction limits
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daily_limit:
 *                 type: integer
 *               weekly_limit:
 *                 type: integer
 *               monthly_limit:
 *                 type: integer
 *               single_transaction_limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Transaction limits updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/limits', settingsController.updateTransactionLimits);

/**
 * @swagger
 * /api/settings/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/preferences', settingsController.getUserPreferences);

/**
 * @swagger
 * /api/settings/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               date_format:
 *                 type: string
 *               theme:
 *                 type: string
 *     responses:
 *       200:
 *         description: User preferences updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/preferences', settingsController.updateUserPreferences);

module.exports = router;
