const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserSecurity = require('../models/UserSecurity');

exports.setTransactionPin = async (req, res) => {
    const { transactionPin } = req.body;
    
    try {
        if (!transactionPin) {
            return res.status(400).json({ msg: 'Transaction PIN is required' });
        }

        // Validation
        if (transactionPin.length !== 4) {
            return res.status(400).json({ msg: 'PIN must be exactly 4 digits' });
        }

        if (!/^\d{4}$/.test(transactionPin)) {
            return res.status(400).json({ msg: 'PIN must contain only numbers' });
        }

        // Avoid common PINs
        const commonPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234'];
        if (commonPins.includes(transactionPin)) {
            return res.status(400).json({ msg: 'Please choose a more secure PIN' });
        }

        // Find user by ID from token
        const userId = req.user.id;
        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Hash the PIN
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(transactionPin, salt);

        // Update user security PIN
        await UserSecurity.setTransactionPin(userId, hashedPin);

        // Update user pin_set status
        await User.update(userId, { pin_set: true });
        const updatedUser = await User.findById(userId);

        res.json({ 
            msg: 'Transaction PIN set successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                email_verified: updatedUser.email_verified,
                profile_completed: updatedUser.profile_completed,
                pin_set: updatedUser.pin_set
            }
        });
    } catch (err) {
        console.error('Set PIN error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.verifyTransactionPin = async (req, res) => {
    const { transactionPin } = req.body;
    
    try {
        if (!transactionPin) {
            return res.status(400).json({ msg: 'Transaction PIN is required' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.pin_set) {
            return res.status(400).json({ msg: 'Transaction PIN not set' });
        }

        // Get security info
        const security = await UserSecurity.getSecurityInfo(userId);
        
        if (!security) {
            return res.status(400).json({ msg: 'Security info not found' });
        }

        // Check if PIN is locked
        if (security.pin_locked_until && new Date() < new Date(security.pin_locked_until)) {
            return res.status(400).json({ 
                msg: 'PIN is locked. Please try again later.',
                lockedUntil: security.pin_locked_until
            });
        }

        // Verify PIN
        const isMatch = await bcrypt.compare(transactionPin, security.transaction_pin);
        
        if (!isMatch) {
            // Increment failed attempts
            const newAttempts = (security.pin_attempts || 0) + 1;
            
            // Lock PIN after 3 failed attempts for 30 minutes
            if (newAttempts >= 3) {
                const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                await UserSecurity.lockPin(userId, lockedUntil);
            } else {
                await UserSecurity.incrementPinAttempts(userId);
            }
            
            return res.status(400).json({ 
                msg: 'Invalid PIN',
                attemptsRemaining: Math.max(0, 3 - newAttempts),
                locked: newAttempts >= 3
            });
        }

        // Reset failed attempts on successful verification
        await UserSecurity.resetPinAttempts(userId);

        res.json({ 
            msg: 'PIN verified successfully',
            verified: true
        });
    } catch (err) {
        console.error('Verify PIN error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
