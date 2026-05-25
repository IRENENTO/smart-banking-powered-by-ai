const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const User = require('../models/User');

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findByUserId(req.user.id);
        res.json({
            transactions: transactions.map((t) => ({
                id: t.id,
                reference_number: t.reference_number,
                type: t.type,
                amount: parseFloat(t.amount),
                description: t.description,
                recipient_account_number: t.recipient_account_number,
                recipient_name: t.recipient_name,
                status: t.status,
                balance_before: parseFloat(t.balance_before),
                balance_after: parseFloat(t.balance_after),
                created_at: t.created_at
            }))
        });
    } catch (err) {
        console.error('Get transactions error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.json({
            balance: parseFloat(user.balance),
            account_number: user.account_number,
            currency: 'RWF'
        });
    } catch (err) {
        console.error('Get balance error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getTotalDeposits = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await Transaction.getTransactionStats(userId);
        res.json({
            total_deposits: parseFloat(stats.total_deposits) || 0,
            total_deposits_count: parseInt(stats.total_transactions) || 0
        });
    } catch (err) {
        console.error('Get total deposits error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deposit = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid deposit amount' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get or create account
        let account = await Account.findByUserId(userId);
        if (!account) {
            account = await Account.create({
                user_id: userId,
                balance: 0,
                currency: 'RWF'
            });
        }

        const balanceBefore = parseFloat(account.balance);
        
        // Deposit to account
        await Account.deposit(userId, amount);
        
        // Create transaction record
        const transaction = await Transaction.create({
            user_id: userId,
            type: 'deposit',
            amount,
            description: description || 'Deposit',
            status: 'completed',
            balance_before: balanceBefore,
            balance_after: balanceBefore + parseFloat(amount)
        });

        res.status(201).json({
            msg: 'Deposit successful',
            transaction: {
                id: transaction.id,
                reference_number: transaction.reference_number,
                type: transaction.type,
                amount: parseFloat(transaction.amount),
                status: transaction.status,
                balance_after: parseFloat(transaction.balance_after),
                created_at: transaction.created_at
            }
        });
    } catch (err) {
        console.error('Deposit error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.withdraw = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid withdrawal amount' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get account
        const account = await Account.findByUserId(userId);
        if (!account) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        const balanceBefore = parseFloat(account.balance);
        
        if (balanceBefore < amount) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        // Withdraw from account
        await Account.withdraw(userId, amount);
        
        // Create transaction record
        const transaction = await Transaction.create({
            user_id: userId,
            type: 'withdraw',
            amount,
            description: description || 'Withdrawal',
            status: 'completed',
            balance_before: balanceBefore,
            balance_after: balanceBefore - parseFloat(amount)
        });

        res.status(201).json({
            msg: 'Withdrawal successful',
            transaction: {
                id: transaction.id,
                reference_number: transaction.reference_number,
                type: transaction.type,
                amount: parseFloat(transaction.amount),
                status: transaction.status,
                balance_after: parseFloat(transaction.balance_after),
                created_at: transaction.created_at
            }
        });
    } catch (err) {
        console.error('Withdrawal error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

module.exports = exports;
