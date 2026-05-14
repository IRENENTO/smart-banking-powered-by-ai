const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { requireProfileCompleted } = require('../middleware/auth');

/**
 * @swagger
 * /api/payment/deposit:
 *   post:
 *     summary: Deposit money into account
 *     tags: [Payment]
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
 *                 minimum: 0.01
 *                 description: Amount to deposit
 *               phoneNumber:
 *                 type: string
 *                 description: Source telephone number for mobile money deposits
 *                 example: "0787654321"
 *               description:
 *                 type: string
 *                 description: Optional description for the deposit
 *     responses:
 *       201:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Deposit successful
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *                 new_balance:
 *                   type: number
 *                   description: New account balance
 *       400:
 *         description: Bad request - invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/deposit', requireProfileCompleted, paymentController.deposit);

/**
 * @swagger
 * /api/payment/withdraw:
 *   post:
 *     summary: Withdraw money from account
 *     tags: [Payment]
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
 *                 minimum: 0.01
 *                 description: Amount to withdraw
 *               phoneNumber:
 *                 type: string
 *                 description: Optional phone number. Defaults to registered number.
 *                 example: "0787654321"
 *               description:
 *                 type: string
 *                 description: Optional description for the withdrawal
 *     responses:
 *       201:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Withdrawal successful
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *                 new_balance:
 *                   type: number
 *                   description: New account balance
 *       400:
 *         description: Bad request - insufficient balance or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/withdraw', requireProfileCompleted, paymentController.withdraw);

/**
 * @swagger
 * /api/payment/payment:
 *   post:
 *     summary: Make a payment to another account
 *     tags: [Payment]
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
 *               - recipient_account_number
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Payment amount
 *               description:
 *                 type: string
 *                 description: Payment description
 *               recipient_account_number:
 *                 type: string
 *                 description: Recipient's account number
 *               recipient_name:
 *                 type: string
 *                 description: Recipient's name (optional)
 *     responses:
 *       201:
 *         description: Payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Payment successful
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *                 new_balance:
 *                   type: number
 *                   description: New account balance
 *       400:
 *         description: Bad request - insufficient balance or invalid recipient
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipient account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/payment', requireProfileCompleted, paymentController.payment);

/**
 * @swagger
 * /api/payment/transfer:
 *   post:
 *     summary: Transfer money to another account
 *     tags: [Payment]
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
 *               - recipient_account_number
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Transfer amount
 *               description:
 *                 type: string
 *                 description: Transfer description
 *               recipient_account_number:
 *                 type: string
 *                 description: Recipient's account number
 *     responses:
 *       201:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Transfer successful
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *                 new_balance:
 *                   type: number
 *                   description: New account balance
 *       400:
 *         description: Bad request - insufficient balance, invalid recipient, or self-transfer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipient account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/transfer', requireProfileCompleted, paymentController.transfer);

/**
 * @swagger
 * /api/payment/users:
 *   get:
 *     summary: Get available users to transfer money to
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       account_number:
 *                         type: string
 */
router.get('/users', requireProfileCompleted, paymentController.getUsersForTransfer);

/**
 * @swagger
 * /api/payment/balance:
 *   get:
 *     summary: Get account balance
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: Current account balance
 *                 account_number:
 *                   type: string
 *                   description: Account number
 *                 currency:
 *                   type: string
 *                   example: USD
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/balance', requireProfileCompleted, paymentController.getBalance);

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     summary: Get transaction history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, payment, transfer]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         description: Filter by transaction status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of transactions to skip
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/history', requireProfileCompleted, paymentController.getTransactionHistory);

/**
 * @swagger
 * /api/payment/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 current_balance:
 *                   type: number
 *                   description: Current account balance
 *                 total_transactions:
 *                   type: integer
 *                   description: Total number of transactions
 *                 total_deposits:
 *                   type: number
 *                   description: Total amount deposited
 *                 total_withdrawals:
 *                   type: number
 *                   description: Total amount withdrawn
 *                 total_payments:
 *                   type: number
 *                   description: Total amount paid
 *                 total_transfers:
 *                   type: number
 *                   description: Total amount transferred
 *                 pending_transactions:
 *                   type: integer
 *                   description: Number of pending transactions
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', requireProfileCompleted, paymentController.getTransactionStats);

/**
 * @swagger
 * /api/payment/recent:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent transactions to return
 *     responses:
 *       200:
 *         description: Recent transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/recent', requireProfileCompleted, paymentController.getRecentTransactions);

/**
 * @swagger
 * /api/payment/bill:
 *   post:
 *     summary: Make a bill payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - amount
 *               - account_or_phone
 *             properties:
 *               provider:
 *                 type: string
 *                 example: DSTV
 *                 description: Payment provider name
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Payment amount
 *               account_or_phone:
 *                 type: string
 *                 description: Account number, phone number, or subscriber ID
 *               description:
 *                 type: string
 *                 description: Optional payment description
 *     responses:
 *       201:
 *         description: Bill payment successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/bill', requireProfileCompleted, paymentController.makeBillPayment);

/**
 * @swagger
 * /api/payment/methods:
 *   get:
 *     summary: Get user's saved payment methods
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/methods', requireProfileCompleted, paymentController.getPaymentMethods);

/**
 * @swagger
 * /api/payment/methods:
 *   post:
 *     summary: Save a new payment method
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method_type
 *               - provider_name
 *               - account_identifier
 *             properties:
 *               method_type:
 *                 type: string
 *                 enum: [card, mobile_money, bank_account, wallet]
 *               provider_name:
 *                 type: string
 *                 example: MTN MoMo
 *               account_identifier:
 *                 type: string
 *                 example: +250781234567
 *               is_default:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Payment method saved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/methods', requireProfileCompleted, paymentController.savePaymentMethod);

/**
 * @swagger
 * /api/payment/methods/{methodId}:
 *   delete:
 *     summary: Delete a saved payment method
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: methodId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The payment method ID
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment method not found
 *       500:
 *         description: Server error
 */
router.delete('/methods/:methodId', requireProfileCompleted, paymentController.deletePaymentMethod);

/**
 * @swagger
 * /api/payment/records/{paymentId}:
 *   get:
 *     summary: Get payment record by ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The payment record ID
 *     responses:
 *       200:
 *         description: Payment record retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment record not found
 *       500:
 *         description: Server error
 */
router.get('/records/:paymentId', requireProfileCompleted, paymentController.getPaymentById);

/**
 * @swagger
 * /api/payment/records:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: payment_type
 *         schema:
 *           type: string
 *           enum: [bill, merchant, subscription, invoice, top_up, other]
 *         description: Filter by payment type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded, cancelled]
 *         description: Filter by payment status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/records', requireProfileCompleted, paymentController.getPaymentHistory);

/**
 * @swagger
 * /api/payment/pending:
 *   get:
 *     summary: Get pending PayPack payments for the authenticated user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of pending payments to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of pending payments to skip
 *     responses:
 *       200:
 *         description: Pending PayPack payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 count:
 *                   type: integer
 *                   description: Number of pending payments returned
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/pending', requireProfileCompleted, paymentController.getPendingPaypackPayments);

/**
 * @swagger
 * /api/payment/records/stats:
 *   get:
 *     summary: Get payment statistics
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/records/stats', requireProfileCompleted, paymentController.getPaymentStats);

/**
 * @swagger
 * /api/payment/records/{paymentId}:
 *   delete:
 *     summary: Delete a payment record (only pending/failed/cancelled)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The payment record ID
 *     responses:
 *       200:
 *         description: Payment record deleted successfully
 *       400:
 *         description: Cannot delete completed payments
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment record not found
 *       500:
 *         description: Server error
 */
router.delete('/records/:paymentId', requireProfileCompleted, paymentController.deletePayment);

/**
 * @swagger
 * /api/payment/providers:
 *   get:
 *     summary: Get available payment providers
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *     responses:
 *       200:
 *         description: Payment providers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/providers', paymentController.getPaymentProviders);

module.exports = router;
