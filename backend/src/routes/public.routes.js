const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

/**
 * @swagger
 * /api/public/about-us:
 *   get:
 *     summary: Get About Us information
 *     tags: [Public]
 *     description: Returns company information, mission, vision, and statistics
 *     responses:
 *       200:
 *         description: About Us information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: AI Banking
 *                     founded:
 *                       type: string
 *                       example: 2020
 *                     mission:
 *                       type: string
 *                       example: To provide innovative banking solutions powered by AI
 *                     vision:
 *                       type: string
 *                       example: To be the leading digital banking platform
 *                 statistics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                         example: Active Users
 *                       value:
 *                         type: string
 *                         example: 1M+
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/about-us', publicController.getAboutUs);

/**
 * @swagger
 * /api/public/contact-us:
 *   get:
 *     summary: Get Contact Us information
 *     tags: [Public]
 *     description: Returns contact details, office locations, and social media links
 *     responses:
 *       200:
 *         description: Contact information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contact:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: support@aibanking.com
 *                     phone:
 *                       type: string
 *                       example: +1-800-123-4567
 *                     address:
 *                       type: string
 *                       example: 123 Banking St, Financial District, NY 10001
 *                 branches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Main Branch
 *                       address:
 *                         type: string
 *                         example: 123 Banking St, NY 10001
 *                       phone:
 *                         type: string
 *                         example: +1-800-123-4567
 *                 social_media:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       platform:
 *                         type: string
 *                         example: Facebook
 *                       url:
 *                         type: string
 *                         example: https://facebook.com/aibanking
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/contact-us', publicController.getContactUs);

/**
 * @swagger
 * /api/public/services:
 *   get:
 *     summary: Get available banking services
 *     tags: [Public]
 *     description: Returns list of all available banking services with descriptions
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: savings
 *                       name:
 *                         type: string
 *                         example: Savings Account
 *                       description:
 *                         type: string
 *                         example: High-yield savings account with competitive interest rates
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: No minimum balance
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/services', publicController.getServices);

/**
 * @swagger
 * /api/public/faq:
 *   get:
 *     summary: Get Frequently Asked Questions
 *     tags: [Public]
 *     description: Returns FAQ organized by categories
 *     responses:
 *       200:
 *         description: FAQ retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: General
 *                       questions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             question:
 *                               type: string
 *                               example: How do I open an account?
 *                             answer:
 *                               type: string
 *                               example: You can open an account by clicking the Register button
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/faq', publicController.getFAQ);

module.exports = router;
