const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const aiController = require('../controllers/ai.controller');
const { getAIEngineHealth, getModelStatus } = require('../services/ai.service');

// Public routes
router.get('/engine-status', async (req, res) => {
    try {
        const status = await getAIEngineHealth();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/public-model-status', async (req, res) => {
    try {
        const status = await getModelStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Authenticated AI Endpoints =====

/**
 * POST /api/ai/predict-loan — AI-powered loan prediction
 */
router.post('/predict-loan', auth, aiController.predictLoanController);

/**
 * POST /api/ai/detect-fraud — Real-time fraud detection
 */
router.post('/detect-fraud', auth, aiController.detectFraudController);

/**
 * POST /api/ai/predict-savings — Financial health scoring
 */
router.post('/predict-savings', auth, aiController.predictSavingsController);

/**
 * POST /api/ai/spending-analysis — ML-powered spending analysis
 */
router.post('/spending-analysis', auth, aiController.analyzeSpendingController);

/**
 * POST /api/ai/recommendations — Personalized financial recommendations
 */
router.post('/recommendations', auth, aiController.recommendationController);

/**
 * GET /api/ai/model-status — Check AI model availability
 */
router.get('/model-status', auth, aiController.modelStatusController);

/**
 * POST /api/ai/retrain — Retrain all or specific AI models
 */
router.post('/retrain', auth, aiController.retrainModelController);

/**
 * POST /api/ai/market-intelligence — Rwanda sector market predictions
 */
router.post('/market-intelligence', auth, aiController.marketIntelligenceController);

/**
 * GET /api/ai/ai-dashboard — AI model metrics dashboard
 */
router.get('/ai-dashboard', auth, aiController.aiDashboardController);

module.exports = router;
