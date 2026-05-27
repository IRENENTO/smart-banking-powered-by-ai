const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { auth, requireProfileCompleted } = require('../middleware/auth');

router.post('/set-pin', requireProfileCompleted, securityController.setTransactionPin);
router.post('/verify-pin', requireProfileCompleted, securityController.verifyTransactionPin);

router.post('/forgot-pin-send-otp', auth, securityController.forgotPinSendOTP);
router.post('/forgot-pin-reset', auth, securityController.forgotPinReset);

module.exports = router;
