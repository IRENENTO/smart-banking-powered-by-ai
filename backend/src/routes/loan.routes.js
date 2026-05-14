const express = require('express');
const router = express.Router();
const { requireProfileCompleted } = require('../middleware/auth');
const auth = require('../middleware/auth.middleware');
const loanController = require('../controllers/loan.controller');

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
router.post('/apply', requireProfileCompleted, loanController.applyForLoan);

/**
 * @swagger
 * /api/loans/check-eligibility:
 *   post:
 *     summary: Check loan eligibility
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
 *               - monthlyIncome
 *               - existingDebt
 *             properties:
 *               monthlyIncome:
 *                 type: number
 *               existingDebt:
 *                 type: number
 *     responses:
 *       200:
 *         description: Eligibility checked
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/check-eligibility', requireProfileCompleted, loanController.checkEligibility);

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

module.exports = router;
