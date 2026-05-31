const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../config/env');
const sendOTPEmail = require("../services/email.service");

exports.register = async (req, res) => {
    const { name, email: rawEmail, phone, password } = req.body;
    const email = rawEmail?.toString().trim().toLowerCase();
    try {
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ msg: 'Name, email, phone, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Please enter a valid email address' });
        }

        if (phone.length < 10) {
            return res.status(400).json({ msg: 'Please enter a valid phone number' });
        }

        if (password.length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
        }

        let existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ msg: 'User with this email already exists' });

        existing = await User.findByPhone(phone);
        if (existing) return res.status(400).json({ msg: 'User with this phone number already exists' });

        const user = await User.create({ name, email, phone, password, balance: 100000.00, email_verified: false, profile_completed: false, pin_set: false });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await User.update(user.id, { otp_code: otpCode, otp_expires_at: otpExpiresAt });

        try {
            await sendOTPEmail(email, otpCode);
        } catch (emailError) {
            console.error('OTP email send error:', emailError);
            console.log(`[FALLBACK] OTP for ${email}: ${otpCode}`);
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            msg: 'Registration successful. Please verify your email to continue.',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                account_number: user.account_number,
                email_verified: user.email_verified || false,
                profile_completed: user.profile_completed || false,
                pin_set: user.pin_set || false,
                profile_picture: user.profile_picture || null
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.login = async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.toString().trim().toLowerCase();
    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email and password are required' });
        }

        const user = await User.findByEmail(email);
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                account_number: user.account_number,
                email_verified: user.email_verified || false,
                profile_completed: user.profile_completed || false,
                pin_set: user.pin_set || false,
                profile_picture: user.profile_picture || null
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};
