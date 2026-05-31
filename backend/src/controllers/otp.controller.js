const User = require('../models/User');
const sendOTPEmail = require('../services/email.service');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
exports.sendOTP = async (req, res) => {
    const email = req.body.email?.toString().trim().toLowerCase();
    
    try {
        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.email_verified) {
            return res.status(400).json({ msg: 'Email already verified' });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        await User.update(user.id, {
            otp_code: otpCode,
            otp_expires_at: expiresAt
        });

        // Send OTP email
        let emailSent = true;
        try {
            await sendOTPEmail(email, otpCode);
        } catch (emailError) {
            emailSent = false;
            console.error('Failed to send OTP email:', emailError);
            console.log(`[FALLBACK] OTP for ${email}: ${otpCode}`);
        }

        res.json({ 
            msg: emailSent ? 'OTP sent successfully' : 'Failed to send email. Please check server configuration or contact support.',
            emailSent,
            expiresAt: expiresAt
        });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const email = req.body.email?.toString().trim().toLowerCase();
    const otp = req.body.otp?.toString().trim();
    
    try {
        if (!email || !otp) {
            return res.status(400).json({ msg: 'Email and OTP are required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.email_verified) {
            const jwt = require('jsonwebtoken');
            const { JWT_SECRET } = require('../config/env');
            const payload = { user: { id: user.id, role: user.role } };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            return res.json({
                msg: 'Email already verified',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    email_verified: true,
                    profile_completed: user.profile_completed,
                    pin_set: user.pin_set,
                }
            });
        }

        if (!user.otp_code || !user.otp_expires_at) {
            return res.status(400).json({ msg: 'No OTP found. Please request a new one.' });
        }

        // Check if OTP is expired
        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
        }

        // Check if OTP matches (use string coercion to avoid type mismatch)
        if (String(user.otp_code).trim() !== String(otp).trim()) {
            console.error(`OTP mismatch for ${email}: stored="${String(user.otp_code).trim()}" length=${String(user.otp_code).trim().length}, provided="${String(otp).trim()}" length=${String(otp).trim().length}`);
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Mark email as verified
        await User.update(user.id, {
            email_verified: true,
            otp_code: null,
            otp_expires_at: null
        });

        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../config/env');
        const updatedUser = await User.findById(user.id);
        const payload = { user: { id: updatedUser.id, role: updatedUser.role } };
        
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                msg: 'Email verified successfully',
                token,
                user: { 
                    id: updatedUser.id, 
                    email: updatedUser.email, 
                    name: updatedUser.name,
                    email_verified: updatedUser.email_verified,
                    profile_completed: updatedUser.profile_completed,
                    pin_set: updatedUser.pin_set
                }
            });
        });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
