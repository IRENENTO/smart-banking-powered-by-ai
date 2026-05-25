const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const paypack = require('../services/paypack.service');
const aiService = require('../services/ai.service');

// Deposit money
exports.deposit = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user.id;
        const amountValue = parseFloat(amount);
        const sourcePhone = (req.body.phoneNumber || req.user.phone || '').toString().trim();

        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            return res.status(400).json({ msg: 'Amount must be greater than 0' });
        }

        const currentBalance = await User.getBalance(userId);

        // Credit balance immediately (works for both phone and internal deposits)
        const newBalance = parseFloat(currentBalance) + amountValue;
        await User.updateBalance(userId, newBalance);

        // Try PayPack cashin if phone provided (non-blocking - balance already credited)
        if (sourcePhone) {
            let providerRef = null;
            try {
                const paypackRes = await paypack.initiateCashin(sourcePhone, amountValue);
                providerRef = paypackRes?.ref || null;
            } catch (err) {
                console.warn('PayPack cashin initiation failed (balance already credited):', err.message);
            }

            const transaction = await Transaction.create({
                user_id: userId,
                type: 'deposit',
                amount: amountValue,
                description: description || `Mobile money deposit from ${sourcePhone}`,
                balance_before: parseFloat(currentBalance),
                balance_after: parseFloat(newBalance),
                status: 'completed'
            });

            const payment = await Payment.create({
                user_id: userId,
                payment_type: 'deposit',
                provider: 'paypack',
                provider_reference: providerRef,
                account_or_phone: sourcePhone,
                amount: amountValue,
                status: providerRef ? 'completed' : 'pending',
                description: description || `Mobile money deposit from ${sourcePhone}`,
                transaction_reference: transaction.reference_number,
                balance_before: parseFloat(currentBalance),
                balance_after: parseFloat(newBalance)
            });

            return res.status(201).json({
                msg: 'Deposit successful. Your balance has been updated.',
                transaction: {
                    id: transaction.id,
                    reference_number: transaction.reference_number,
                    amount: transaction.amount,
                    description: transaction.description,
                    status: transaction.status,
                    provider_reference: providerRef,
                    created_at: transaction.created_at
                },
                payment: {
                    id: payment.id,
                    payment_type: payment.payment_type,
                    provider: payment.provider,
                    provider_reference: providerRef,
                    amount: payment.amount,
                    status: payment.status,
                    created_at: payment.created_at
                },
                new_balance: parseFloat(newBalance)
            });
        }

        // Internal deposit (no phone) - instant
        const transaction = await Transaction.create({
            user_id: userId,
            type: 'deposit',
            amount: amountValue,
            description: description || 'Deposit',
            balance_before: parseFloat(currentBalance),
            balance_after: parseFloat(newBalance),
            status: 'completed'
        });

        res.status(201).json({
            msg: 'Deposit successful',
            transaction: {
                id: transaction.id,
                reference_number: transaction.reference_number,
                amount: transaction.amount,
                description: transaction.description,
                balance_before: transaction.balance_before,
                balance_after: transaction.balance_after,
                created_at: transaction.created_at
            },
            new_balance: parseFloat(newBalance)
        });
    } catch (err) {
        console.error('Deposit error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Withdraw money
exports.withdraw = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user.id;
        const amountValue = parseFloat(amount);
        const phoneNumber = (req.body.phoneNumber || req.user.phone || '').toString().trim();

        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            return res.status(400).json({ msg: 'Amount must be greater than 0' });
        }

        const currentBalance = await User.getBalance(userId);

        if (parseFloat(currentBalance) < amountValue) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        // Fraud detection before withdrawal
        try {
            const fraudResult = await aiService.detectFraud({
                amount: amountValue,
                location: req.ip || 'unknown',
                device: req.headers['user-agent'] || 'unknown',
                frequency: 1,
                transaction_time: new Date().toISOString()
            });

            if (fraudResult.action_required) {
                const connection = global.dbConnection;
                await connection.execute(
                    `INSERT INTO fraud_alerts (user_id, transaction_type, amount, risk_level, risk_score, status, description, created_at)
                     VALUES (?, 'withdrawal', ?, ?, ?, 'pending', ?, NOW())`,
                    [userId, amountValue, fraudResult.fraud_risk, fraudResult.risk_percentage,
                     `Suspicious withdrawal flagged by AI. Risk: ${fraudResult.risk_percentage}%`]
                );

                return res.status(403).json({
                    msg: 'Withdrawal blocked due to suspicious activity. Please contact support.',
                    fraud_alert: true,
                    risk_level: fraudResult.fraud_risk,
                    risk_percentage: fraudResult.risk_percentage
                });
            }
        } catch (fraudErr) {
            console.warn('[Fraud Detection] Skipped — AI Engine unavailable');
        }

        // External withdrawal via PayPack (send to mobile money)
        if (phoneNumber) {
            const transaction = await Transaction.create({
                user_id: userId,
                type: 'withdrawal',
                amount: amountValue,
                description: description || `Withdrawal to ${phoneNumber}`,
                balance_before: parseFloat(currentBalance),
                balance_after: parseFloat(currentBalance),
                status: 'pending'
            });

            const payment = await Payment.create({
                user_id: userId,
                payment_type: 'withdrawal',
                provider: 'paypack',
                provider_reference: null,
                account_or_phone: phoneNumber,
                amount: amountValue,
                status: 'pending',
                description: description || `Withdrawal to ${phoneNumber}`,
                transaction_reference: transaction.reference_number,
                balance_before: parseFloat(currentBalance),
                balance_after: parseFloat(currentBalance)
            });

            let providerRef = null;
            try {
                const paypackRes = await paypack.initiateCashout(phoneNumber, amountValue);
                providerRef = paypackRes?.ref || null;
                if (providerRef) {
                    await global.dbConnection.execute(
                        'UPDATE payments SET provider_reference = ? WHERE id = ?',
                        [providerRef, payment.id]
                    );
                }
            } catch (err) {
                console.error('PayPack cashout initiation failed:', err.message);
            }

            return res.status(201).json({
                msg: 'Withdrawal initiated. Money will be sent to your mobile money.',
                transaction: {
                    id: transaction.id,
                    reference_number: transaction.reference_number,
                    amount: transaction.amount,
                    description: transaction.description,
                    status: transaction.status,
                    provider_reference: providerRef,
                    created_at: transaction.created_at
                },
                payment: {
                    id: payment.id,
                    payment_type: payment.payment_type,
                    provider: payment.provider,
                    provider_reference: providerRef,
                    amount: payment.amount,
                    status: payment.status,
                    created_at: payment.created_at
                }
            });
        }

        // Internal withdrawal (instant)
        const newBalance = parseFloat(currentBalance) - amountValue;

        await User.updateBalance(userId, newBalance);

        const transaction = await Transaction.create({
            user_id: userId,
            type: 'withdrawal',
            amount: amountValue,
            description: description || 'Withdrawal',
            balance_before: parseFloat(currentBalance),
            balance_after: parseFloat(newBalance),
            status: 'completed'
        });

        res.status(201).json({
            msg: 'Withdrawal successful',
            transaction: {
                id: transaction.id,
                reference_number: transaction.reference_number,
                amount: transaction.amount,
                description: transaction.description,
                balance_before: transaction.balance_before,
                balance_after: transaction.balance_after,
                created_at: transaction.created_at
            },
            new_balance: parseFloat(newBalance)
        });
    } catch (err) {
        console.error('Withdrawal error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Make payment
exports.payment = async (req, res) => {
    try {
        const { amount, description, recipient_account_number, recipient_name } = req.body;
        const userId = req.user.id;
        const amountValue = parseFloat(amount);

        // Validate input
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            return res.status(400).json({ msg: 'Amount must be greater than 0' });
        }

        if (!recipient_account_number) {
            return res.status(400).json({ msg: 'Recipient account number is required' });
        }

        // Get current user balance
        const currentBalance = await User.getBalance(userId);

        // Check if sufficient balance
        if (parseFloat(currentBalance) < amountValue) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        // Check if recipient exists (try account number first, then phone)
        let recipient = await User.findByAccountNumber(recipient_account_number);
        if (!recipient) {
            recipient = await User.findByPhone(recipient_account_number);
        }
        if (!recipient) {
            return res.status(404).json({ msg: 'Recipient not found' });
        }

        if (recipient.id === userId) {
            return res.status(400).json({ msg: 'Cannot pay your own account' });
        }

        // Fraud detection before processing payment
        try {
            const fraudResult = await aiService.detectFraud({
                amount: amountValue,
                location: req.ip || 'unknown',
                device: req.headers['user-agent'] || 'unknown',
                frequency: 1,
                transaction_time: new Date().toISOString()
            });

            if (fraudResult.action_required) {
                const connection = global.dbConnection;
                await connection.execute(
                    `INSERT INTO fraud_alerts (user_id, transaction_type, amount, risk_level, risk_score, status, description, created_at)
                     VALUES (?, 'payment', ?, ?, ?, 'pending', ?, NOW())`,
                    [userId, amountValue, fraudResult.fraud_risk, fraudResult.risk_percentage,
                     `Suspicious payment flagged by AI. Risk: ${fraudResult.risk_percentage}%`]
                );

                return res.status(403).json({
                    msg: 'Payment blocked due to suspicious activity. Please contact support.',
                    fraud_alert: true,
                    risk_level: fraudResult.fraud_risk,
                    risk_percentage: fraudResult.risk_percentage
                });
            }
        } catch (fraudErr) {
            console.warn('[Fraud Detection] Skipped — AI Engine unavailable');
        }

        const newBalance = parseFloat(currentBalance) - amountValue;
        const recipientNewBalance = parseFloat(recipient.balance) + amountValue;

        // Update both sender and recipient balances
        await User.updateBalance(userId, newBalance);
        await User.updateBalance(recipient.id, recipientNewBalance);

        // Create sender payment transaction record
        const transaction = await Transaction.create({
            user_id: userId,
            type: 'payment',
            amount: amountValue,
            description: description || 'Payment',
            recipient_account_number: recipient.account_number,
            recipient_name: recipient_name || recipient.name,
            balance_before: parseFloat(currentBalance),
            balance_after: parseFloat(newBalance),
            status: 'completed'
        });

        // Create recipient credit transaction record
        await Transaction.create({
            user_id: recipient.id,
            type: 'transfer',
            amount: amountValue,
            description: `Payment received from ${req.user.name}`,
            recipient_account_number: req.user.account_number,
            recipient_name: req.user.name,
            balance_before: parseFloat(recipient.balance),
            balance_after: parseFloat(recipientNewBalance),
            status: 'completed'
        });

        res.status(201).json({
            msg: 'Payment successful',
            transaction: {
                id: transaction.id,
                reference_number: transaction.reference_number,
                amount: transaction.amount,
                description: transaction.description,
                recipient_account_number: transaction.recipient_account_number,
                recipient_name: transaction.recipient_name,
                balance_before: transaction.balance_before,
                balance_after: transaction.balance_after,
                created_at: transaction.created_at
            },
            new_balance: parseFloat(newBalance)
        });
    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Transfer money
exports.transfer = async (req, res) => {
    try {
        const { amount, description, recipient_account_number } = req.body;
        const userId = req.user.id;
        const amountValue = parseFloat(amount);

        // Validate input
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            return res.status(400).json({ msg: 'Amount must be greater than 0' });
        }

        if (!recipient_account_number) {
            return res.status(400).json({ msg: 'Recipient account number is required' });
        }

        // Get current user balance
        const currentBalance = await User.getBalance(userId);

        // Check if sufficient balance
        if (parseFloat(currentBalance) < amountValue) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        // Check if recipient exists
        const recipient = await User.findByAccountNumber(recipient_account_number);
        if (!recipient) {
            return res.status(404).json({ msg: 'Recipient account not found' });
        }

        // Check if transferring to own account
        if (recipient.id === userId) {
            return res.status(400).json({ msg: 'Cannot transfer to your own account' });
        }

        // Fraud detection before processing transfer
        try {
            const fraudResult = await aiService.detectFraud({
                amount: amountValue,
                location: req.ip || 'unknown',
                device: req.headers['user-agent'] || 'unknown',
                frequency: 1,
                transaction_time: new Date().toISOString()
            });

            if (fraudResult.action_required) {
                const connection = global.dbConnection;
                await connection.execute(
                    `INSERT INTO fraud_alerts (user_id, transaction_type, amount, risk_level, risk_score, status, description, created_at)
                     VALUES (?, 'transfer', ?, ?, ?, 'pending', ?, NOW())`,
                    [userId, amountValue, fraudResult.fraud_risk, fraudResult.risk_percentage,
                     `Suspicious transfer flagged by AI. Risk: ${fraudResult.risk_percentage}%`]
                );

                return res.status(403).json({
                    msg: 'Transaction blocked due to suspicious activity. Please contact support.',
                    fraud_alert: true,
                    risk_level: fraudResult.fraud_risk,
                    risk_percentage: fraudResult.risk_percentage
                });
            }
        } catch (fraudErr) {
            console.warn('[Fraud Detection] Skipped — AI Engine unavailable');
        }

        const newBalance = parseFloat(currentBalance) - amountValue;
        const recipientNewBalance = parseFloat(recipient.balance) + amountValue;

        // Update both users' balances
        await User.updateBalance(userId, newBalance);
        await User.updateBalance(recipient.id, recipientNewBalance);

        // Create sender transaction record
        const senderTransaction = await Transaction.create({
            user_id: userId,
            type: 'transfer',
            amount: amountValue,
            description: description || `Transfer to ${recipient.name}`,
            recipient_account_number,
            recipient_name: recipient.name,
            balance_before: parseFloat(currentBalance),
            balance_after: parseFloat(newBalance),
            status: 'completed'
        });

        // Create receiver transaction record
        const receiverTransaction = await Transaction.create({
            user_id: recipient.id,
            type: 'transfer',
            amount: amountValue,
            description: `Transfer from ${req.user.name}`,
            recipient_account_number: req.user.account_number,
            recipient_name: req.user.name,
            balance_before: parseFloat(recipient.balance),
            balance_after: parseFloat(recipientNewBalance),
            status: 'completed'
        });

        res.status(201).json({
            msg: 'Transfer successful',
            transaction: {
                id: senderTransaction.id,
                reference_number: senderTransaction.reference_number,
                amount: senderTransaction.amount,
                description: senderTransaction.description,
                recipient_account_number: senderTransaction.recipient_account_number,
                recipient_name: senderTransaction.recipient_name,
                balance_before: senderTransaction.balance_before,
                balance_after: senderTransaction.balance_after,
                created_at: senderTransaction.created_at
            },
            new_balance: parseFloat(newBalance)
        });
    } catch (err) {
        console.error('Transfer error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Get users for transfer
exports.getUsersForTransfer = async (req, res) => {
    try {
        const userId = req.user.id;
        const connection = global.dbConnection;
        // Get all users except the current user
        const [users] = await connection.execute(
            'SELECT name, account_number FROM users WHERE id != ? AND account_number IS NOT NULL',
            [userId]
        );
        res.json({ users });
    } catch (err) {
        console.error('Get users for transfer error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Get balance
exports.getBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        const balance = await User.getBalance(userId);
        const user = await User.findById(userId);

        res.json({
            balance: parseFloat(balance),
            account_number: user.account_number,
            currency: 'RWF'
        });
    } catch (err) {
        console.error('Get balance error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, status, limit = 50, offset = 0 } = req.query;

        let transactions;
        if (type) {
            transactions = await Transaction.findByType(userId, type, parseInt(limit), parseInt(offset));
        } else if (status) {
            transactions = await Transaction.findByStatus(userId, status, parseInt(limit), parseInt(offset));
        } else {
            transactions = await Transaction.findByUserId(userId, parseInt(limit), parseInt(offset));
        }

        res.json({
            transactions: transactions.map(t => ({
                id: t.id,
                reference_number: t.reference_number,
                type: t.type,
                amount: t.amount,
                description: t.description,
                recipient_account_number: t.recipient_account_number,
                recipient_name: t.recipient_name,
                status: t.status,
                balance_before: t.balance_before,
                balance_after: t.balance_after,
                created_at: t.created_at
            }))
        });
    } catch (err) {
        console.error('Get transaction history error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await Transaction.getTransactionStats(userId);
        const balance = await User.getBalance(userId);

        res.json({
            current_balance: parseFloat(balance),
            total_transactions: parseInt(stats.total_transactions) || 0,
            total_deposits: parseFloat(stats.total_deposits) || 0,
            total_withdrawals: parseFloat(stats.total_withdrawals) || 0,
            total_payments: parseFloat(stats.total_payments) || 0,
            total_transfers: parseFloat(stats.total_transfers) || 0,
            pending_transactions: parseInt(stats.pending_transactions) || 0
        });
    } catch (err) {
        console.error('Get transaction stats error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;
        const transactions = await Transaction.getRecentTransactions(userId, parseInt(limit));

        res.json({
            transactions: transactions.map(t => ({
                id: t.id,
                reference_number: t.reference_number,
                type: t.type,
                amount: t.amount,
                description: t.description,
                recipient_account_number: t.recipient_account_number,
                recipient_name: t.recipient_name,
                created_at: t.created_at
            }))
        });
    } catch (err) {
        console.error('Get recent transactions error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.makeBillPayment = async (req, res) => {
    try {
        const { provider, amount, account_or_phone, description } = req.body;
        const userId = req.user.id;
        const amountValue = parseFloat(amount);

        if (!provider || !Number.isFinite(amountValue) || amountValue <= 0 || !account_or_phone) {
            return res.status(400).json({ msg: 'Provider, amount, and account/phone are required' });
        }

        const currentBalance = await User.getBalance(userId);
        if (parseFloat(currentBalance) < amountValue) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        const newBalance = parseFloat(currentBalance) - amountValue;

        const transaction = await Transaction.create({
            user_id: userId,
            type: 'payment',
            amount: amountValue,
            description: description || `Payment to ${provider}`,
            balance_before: parseFloat(currentBalance),
            balance_after: parseFloat(newBalance),
            status: 'completed'
        });

        const payment = await Payment.create({
            user_id: userId,
            payment_type: 'bill',
            provider,
            account_or_phone,
            amount: amountValue,
            status: 'completed',
            description: description || `Payment to ${provider}`,
            transaction_reference: transaction.reference_number,
            balance_before: parseFloat(currentBalance),
            balance_after: parseFloat(newBalance)
        });

        res.status(201).json({
            msg: 'Bill payment successful',
            payment: {
                id: payment.id,
                provider: payment.provider,
                amount: payment.amount,
                status: payment.status,
                transaction_reference: payment.transaction_reference,
                created_at: payment.created_at
            },
            new_balance: parseFloat(newBalance)
        });
    } catch (err) {
        console.error('Bill payment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getPaymentMethods = async (req, res) => {
    try {
        const userId = req.user.id;
        const connection = global.dbConnection;
        const [rows] = await connection.execute(
            'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [userId]
        );
        const methods = rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });

        res.json({ payment_methods: methods });
    } catch (err) {
        console.error('Get payment methods error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.savePaymentMethod = async (req, res) => {
    try {
        const { method_type, provider_name, account_identifier, is_default } = req.body;
        const userId = req.user.id;

        if (!method_type || !provider_name || !account_identifier) {
            return res.status(400).json({ msg: 'Method type, provider name, and account identifier are required' });
        }

        const validTypes = ['card', 'mobile_money', 'bank_account', 'wallet'];
        if (!validTypes.includes(method_type)) {
            return res.status(400).json({ msg: 'Invalid method type' });
        }

        const connection = global.dbConnection;

        if (is_default) {
            await connection.execute('UPDATE payment_methods SET is_default = FALSE WHERE user_id = ?', [userId]);
        }

        const [result] = await connection.execute(`
            INSERT INTO payment_methods (user_id, method_type, provider_name, account_identifier, is_default)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, method_type, provider_name, account_identifier, is_default || false]);

        const [rows] = await connection.execute('SELECT * FROM payment_methods WHERE id = ?', [result.insertId]);

        res.status(201).json({
            msg: 'Payment method saved successfully',
            payment_method: rows[0]
        });
    } catch (err) {
        console.error('Save payment method error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deletePaymentMethod = async (req, res) => {
    try {
        const { methodId } = req.params;
        const userId = req.user.id;

        const connection = global.dbConnection;
        const [result] = await connection.execute(
            'DELETE FROM payment_methods WHERE id = ? AND user_id = ?',
            [methodId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Payment method not found' });
        }

        res.json({ msg: 'Payment method deleted successfully' });
    } catch (err) {
        console.error('Delete payment method error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;

        const payment = await Payment.findById(paymentId);
        if (!payment || payment.user_id !== userId) {
            return res.status(404).json({ msg: 'Payment record not found' });
        }

        res.json({ payment });
    } catch (err) {
        console.error('Get payment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { payment_type, status, limit = 50, offset = 0 } = req.query;

        let payments;
        if (payment_type) {
            payments = await Payment.findByUserIdAndType(userId, payment_type, parseInt(limit), parseInt(offset));
        } else if (status) {
            payments = await Payment.findByUserIdAndStatus(userId, status, parseInt(limit), parseInt(offset));
        } else {
            payments = await Payment.findByUserId(userId, parseInt(limit), parseInt(offset));
        }

        res.json({ payments });
    } catch (err) {
        console.error('Get payment history error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getPendingPaypackPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;

        const payments = await Payment.findPendingPaypackByUserId(userId, parseInt(limit), parseInt(offset));

        res.json({
            payments,
            count: payments.length
        });
    } catch (err) {
        console.error('Get pending PayPack payments error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getPaymentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await Payment.getPaymentStats(userId);

        res.json({
            total_payments: parseInt(stats.total_payments) || 0,
            total_amount: parseFloat(stats.total_amount) || 0,
            total_bills: parseFloat(stats.total_bills) || 0,
            total_merchant: parseFloat(stats.total_merchant) || 0,
            total_subscriptions: parseFloat(stats.total_subscriptions) || 0,
            total_top_ups: parseFloat(stats.total_top_ups) || 0,
            pending_payments: parseInt(stats.pending_payments) || 0,
            failed_payments: parseInt(stats.failed_payments) || 0
        });
    } catch (err) {
        console.error('Get payment stats error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;

        const payment = await Payment.findById(paymentId);
        if (!payment || payment.user_id !== userId) {
            return res.status(404).json({ msg: 'Payment record not found' });
        }

        if (!['pending', 'failed', 'cancelled'].includes(payment.status)) {
            return res.status(400).json({ msg: 'Can only delete pending, failed, or cancelled payments' });
        }

        const deleted = await Payment.delete(paymentId, userId);
        if (!deleted) {
            return res.status(404).json({ msg: 'Payment record not found or already deleted' });
        }

        res.json({ msg: 'Payment record deleted successfully' });
    } catch (err) {
        console.error('Delete payment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getPaymentProviders = async (req, res) => {
    try {
        const { category } = req.query;
        const connection = global.dbConnection;

        let query = `
            SELECT pp.*, pc.name as category_name, pc.icon as category_icon
            FROM payment_providers pp
            LEFT JOIN payment_categories pc ON pp.category_id = pc.id
            WHERE pp.is_active = TRUE
        `;
        const params = [];

        if (category) {
            query += ' AND pc.name = ?';
            params.push(category);
        }

        query += ' ORDER BY pc.sort_order, pp.name';

        const [rows] = await connection.execute(query, params);
        const providers = rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });

        res.json({ providers });
    } catch (err) {
        console.error('Get payment providers error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
