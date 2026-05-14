const Account = require('../models/Account');
const User = require('../models/User');

exports.getAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        let account = await Account.findByUserId(userId);
        
        // Create account if it doesn't exist
        if (!account) {
            account = await Account.create({
                user_id: userId,
                balance: user.balance || 0,
                currency: 'RWF',
                account_type: 'savings'
            });
        }

        res.json({
            account: {
                id: account.id,
                user_id: account.user_id,
                balance: parseFloat(account.balance),
                currency: account.currency,
                account_type: account.account_type,
                created_at: account.created_at,
                user: {
                    name: user.name,
                    email: user.email,
                    account_number: user.account_number
                }
            }
        });
    } catch (err) {
        console.error('Get account error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        const balance = await Account.getBalance(userId);
        
        if (balance === null) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        res.json({
            balance: parseFloat(balance),
            currency: 'RWF'
        });
    } catch (err) {
        console.error('Get balance error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const account = await Account.findByUserId(userId);
        
        if (!account) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        if (parseFloat(account.balance) > 0) {
            return res.status(400).json({ msg: 'Account balance must be zero before deletion' });
        }

        await Account.deleteByUserId(userId);

        res.json({ msg: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

module.exports = exports;
