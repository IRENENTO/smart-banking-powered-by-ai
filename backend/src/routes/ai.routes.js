const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const aiController = require('../controllers/ai.controller');

/**
 * @swagger
 * /api/ai/predict-loan:
 *   post:
 *     summary: Get AI-powered loan prediction
 *     tags: [AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loan_amount
 *             properties:
 *               income:
 *                 type: number
 *               expenses:
 *                 type: number
 *               savings:
 *                 type: number
 *               loan_amount:
 *                 type: number
 *               credit_score:
 *                 type: number
 *               employment_status:
 *                 type: string
 *               transaction_history:
 *                 type: array
 *     responses:
 *       200:
 *         description: Loan prediction result
 *       500:
 *         description: AI Engine unavailable
 */
router.post('/predict-loan', auth, aiController.predictLoanController);

/**
 * @swagger
 * /api/ai/detect-fraud:
 *   post:
 *     summary: Detect fraudulent transactions
 *     tags: [AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               location:
 *                 type: string
 *               device:
 *                 type: string
 *               frequency:
 *                 type: integer
 *               transaction_time:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fraud detection result
 *       500:
 *         description: AI Engine unavailable
 */
router.post('/detect-fraud', auth, aiController.detectFraudController);

/**
 * @swagger
 * /api/ai/predict-savings:
 *   post:
 *     summary: Get AI savings prediction and financial health score
 *     tags: [AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               income:
 *                 type: number
 *               expenses:
 *                 type: number
 *               savings:
 *                 type: number
 *               age:
 *                 type: integer
 *               dependents:
 *                 type: integer
 *               employment_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Savings prediction result
 *       500:
 *         description: AI Engine unavailable
 */
router.post('/predict-savings', auth, aiController.predictSavingsController);

/**
 * @swagger
 * /api/ai/spending-analysis:
 *   post:
 *     summary: Analyze spending patterns
 *     tags: [AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactions
 *             properties:
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                     category:
 *                       type: string
 *                     description:
 *                       type: string
 *                     date:
 *                       type: string
 *                     type:
 *                       type: string
 *               monthly_income:
 *                 type: number
 *     responses:
 *       200:
 *         description: Spending analysis result
 *       500:
 *         description: AI Engine unavailable
 */
router.post('/spending-analysis', auth, aiController.analyzeSpendingController);

/**
 * @swagger
 * /api/ai/recommendations:
 *   post:
 *     summary: Get personalized AI financial recommendations
 *     tags: [AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               income:
 *                 type: number
 *               expenses:
 *                 type: number
 *               savings:
 *                 type: number
 *               age:
 *                 type: integer
 *               risk_tolerance:
 *                 type: string
 *               goals:
 *                 type: array
 *               dependents:
 *                 type: integer
 *               employment_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recommendations result
 *       500:
 *         description: AI Engine unavailable
 */
router.post('/recommendations', auth, aiController.recommendationController);

/**
 * @swagger
 * /api/ai/model-status:
 *   get:
 *     summary: Get AI model status and health
 *     tags: [AI Engine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Model status
 *       500:
 *         description: AI Engine unavailable
 */
router.get('/model-status', auth, aiController.modelStatusController);

/**
 * @swagger
 * /api/ai/retrain:
 *   post:
 *     summary: Retrain AI models
 *     tags: [AI Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: Model name to retrain, or 'all'
 *     responses:
 *       200:
 *         description: Retraining initiated
 *       500:
 *         description: AI Engine unavailable
 */
router.post('/retrain', auth, aiController.retrainModelController);

module.exports = router;
