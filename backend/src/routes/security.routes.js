const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { requireProfileCompleted } = require('../middleware/auth');

router.post('/set-pin', requireProfileCompleted, securityController.setTransactionPin);
router.post('/verify-pin', requireProfileCompleted, securityController.verifyTransactionPin);

module.exports = router;
