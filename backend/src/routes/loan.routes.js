const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { requireProfileCompleted } = require('../middleware/auth');
const auth = require('../middleware/auth.middleware');
const loanController = require('../controllers/loan.controller');
const validate = require('../middleware/validate');

/**
 * @swagger
 * /api/loans/apply:
 *   post:
 *     summary: Apply for a loan
 *     tags: [Loans]
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
 *               - duration
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50000
 *               duration:
 *                 type: integer
 *                 example: 12
 *               purpose:
 *                 type: string
 *                 example: Business expansion
 *               monthlyIncome:
 *                 type: number
 *                 example: 10000
 *               existingDebt:
 *                 type: number
 *                 example: 5000
 *               deductionAmount:
 *                 type: number
 *                 example: 5000
 *               deductionPeriod:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 example: monthly
 *     responses:
 *       201:
 *         description: Loan application submitted
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/apply', [
    body('amount').isFloat({ min: 1 }).withMessage('Loan amount must be a positive number'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 month'),
    body('purpose').optional().trim().isLength({ max: 500 }),
], validate, requireProfileCompleted, loanController.applyForLoan);

router.post('/check-eligibility', [
    body('monthlyIncome').isFloat({ min: 0 }).withMessage('Monthly income must be a non-negative number'),
    body('existingDebt').optional().isFloat({ min: 0 }),
], validate, requireProfileCompleted, loanController.checkEligibility);

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get user loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Loans retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, loanController.getLoans);

/**
 * @swagger
 * /api/loans/{loanId}:
 *   get:
 *     summary: Get loan details
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loan details retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.get('/:loanId', auth, loanController.getLoanById);

/**
 * @swagger
 * /api/loans/status:
 *   put:
 *     summary: Admin - Update loan status
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loanId
 *               - status
 *             properties:
 *               loanId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               riskScore:
 *                 type: number
 *     responses:
 *       200:
 *         description: Loan status updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.put('/status', auth, loanController.updateLoanStatus);

/**
 * @swagger
 * /api/loans/{loanId}:
 *   delete:
 *     summary: Delete a pending loan application
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The loan ID
 *     responses:
 *       200:
 *         description: Loan application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Can only delete pending loan applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this loan
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.delete('/:loanId', auth, loanController.deleteLoan);

/**
 * @swagger
 * /api/loans/{loanId}/extend:
 *   post:
 *     summary: Request loan extension
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - extraDays
 *             properties:
 *               extraDays:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Extension decision returned
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.post('/:loanId/extend', auth, loanController.requestExtension);

/**
 * @swagger
 * /api/loans/{loanId}/progress:
 *   get:
 *     summary: Get loan progress with payment info
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loan progress retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.get('/:loanId/progress', auth, loanController.getLoanProgress);

/**
 * @swagger
 * /api/loans/{loanId}/payments:
 *   get:
 *     summary: Get payment history for a loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment history retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan not found
 *       500:
 *         description: Server error
 */
router.get('/:loanId/payments', auth, loanController.getPaymentHistory);

module.exports = router;
