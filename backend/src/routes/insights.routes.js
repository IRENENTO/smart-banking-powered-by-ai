const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const insightsController = require('../controllers/insights.controller');

/**
 * @swagger
 * /api/insights:
 *   get:
 *     summary: Get AI insights for user
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [risk, investment, alert, recommendation]
 *                       is_read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, insightsController.getInsights);

/**
 * @swagger
 * /api/insights/generate:
 *   post:
 *     summary: Generate new AI insights
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insights generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 insights:
 *                   type: array
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/generate', auth, insightsController.generateInsights);

/**
 * @swagger
 * /api/insights/{insightId}/read:
 *   put:
 *     summary: Mark insight as read
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: insightId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Insight marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Insight not found
 *       500:
 *         description: Server error
 */
router.put('/:insightId/read', auth, insightsController.markAsRead);

/**
 * @swagger
 * /api/insights/{insightId}:
 *   delete:
 *     summary: Delete an insight
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: insightId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Insight deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Insight not found
 *       500:
 *         description: Server error
 */
router.delete('/:insightId', auth, insightsController.deleteInsight);

module.exports = router;
