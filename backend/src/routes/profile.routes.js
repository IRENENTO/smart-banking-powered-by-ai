const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { requireEmailVerified } = require('../middleware/auth');

/**
 * @swagger
 * /api/profile/complete:
 *   post:
 *     summary: Complete user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateOfBirth
 *               - address
 *               - nationalId
 *             properties:
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               address:
 *                 type: string
 *                 example: 123 Main St, City, State
 *               nationalId:
 *                 type: string
 *                 example: ABC123456789
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - email verification required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/complete', requireEmailVerified, profileController.completeProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateOfBirth:
 *                 type: string
 *               address:
 *                 type: string
 *               nationalId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       500:
 *         description: Server error
 */
router.put('/', requireEmailVerified, profileController.completeProfile);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 profile:
 *                   type: object
 *                   properties:
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     address:
 *                       type: string
 *                     national_id:
 *                       type: string
 *       401:
 *         description: Unauthorized - token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - email verification required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', requireEmailVerified, profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete user account
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - email verification required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', requireEmailVerified, profileController.deleteProfile);

/**
 * @swagger
 * /api/profile/identification:
 *   get:
 *     summary: Get user identification details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Identification details retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/identification', requireEmailVerified, profileController.getIdentification);

/**
 * @swagger
 * /api/profile/identification:
 *   put:
 *     summary: Update user identification details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nationalId
 *               - dateOfBirth
 *               - address
 *             properties:
 *               nationalId:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *               idType:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               idExpiry:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Identification updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/identification', requireEmailVerified, profileController.updateIdentification);

module.exports = router;
