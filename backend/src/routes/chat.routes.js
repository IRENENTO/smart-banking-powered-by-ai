const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to the AI chatbot
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What is my balance?"
 *     responses:
 *       200:
 *         description: Chat reply returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', auth, chatController.chat);

module.exports = router;
