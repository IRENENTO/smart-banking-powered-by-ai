const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investment.controller');
const { requireEmailVerified } = require('../middleware/auth');

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get all user investments
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Investments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireEmailVerified, investmentController.getInvestments);

/**
 * @swagger
 * /api/investments:
 *   post:
 *     summary: Create new investment
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - duration
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [stocks, bonds, startups, realestate]
 *               amount:
 *                 type: number
 *               duration:
 *                 type: number
 *               risk_level:
 *                 type: string
 *                 enum: [low, medium, high]
 *               expected_return:
 *                 type: number
 *     responses:
 *       201:
 *         description: Investment created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', requireEmailVerified, investmentController.createInvestment);

/**
 * @swagger
 * /api/investments/{id}:
 *   get:
 *     summary: Get investment by ID
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Investment retrieved successfully
 *       404:
 *         description: Investment not found
 */
/**
 * @swagger
 * /api/investments/types:
 *   get:
 *     summary: Get available investment types
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: Investment types retrieved successfully
 */
router.get('/types', investmentController.getInvestmentTypes);

/**
 * @swagger
 * /api/investments/calculate-returns:
 *   post:
 *     summary: Calculate investment returns
 *     tags: [Investments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - duration
 *             properties:
 *               type:
 *                 type: string
 *               amount:
 *                 type: number
 *               duration:
 *                 type: number
 *               risk_level:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns calculated successfully
 */
router.post('/calculate-returns', investmentController.calculateReturns);

router.get('/:id', requireEmailVerified, investmentController.getInvestmentById);

/**
 * @swagger
 * /api/investments/{id}:
 *   put:
 *     summary: Update investment
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               duration:
 *                 type: number
 *               risk_level:
 *                 type: string
 *               expected_return:
 *                 type: number
 *     responses:
 *       200:
 *         description: Investment updated successfully
 *       404:
 *         description: Investment not found
 */
router.put('/:id', requireEmailVerified, investmentController.updateInvestment);

/**
 * @swagger
 * /api/investments/{id}:
 *   delete:
 *     summary: Delete investment
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Investment deleted successfully
 *       404:
 *         description: Investment not found
 */
router.delete('/:id', requireEmailVerified, investmentController.deleteInvestment);

/**
 * @swagger
 * /api/investments/calculate-returns:
 *   post:
 *     summary: Calculate investment returns
 *     tags: [Investments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - duration
 *             properties:
 *               type:
 *                 type: string
 *               amount:
 *                 type: number
 *               duration:
 *                 type: number
 *               risk_level:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns calculated successfully
 */
router.post('/calculate-returns', investmentController.calculateReturns);

module.exports = router;
