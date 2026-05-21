const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

router.post('/predict', marketController.predictMarket);
router.get('/trends', marketController.getMarketTrends);
router.get('/sectors', marketController.getSectors);
router.get('/recommendations', marketController.getRecommendations);
router.get('/risk-analysis', marketController.getRiskAnalysis);
router.get('/fraud-alerts', marketController.getFraudAlerts);

module.exports = router;
