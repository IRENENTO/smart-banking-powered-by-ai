const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const { User } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return error(res, 'Email already registered', 409);
    }

    const user = await User.create({ email, password, name, phone });

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    logger.info('User registered', { userId: user.id, email });

    const tokens = generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return success(res, {
      user: user.toSafeJSON(),
      ...tokens,
      otp, // Remove in production, send via email
    }, 'Registration successful. Verify your email.', 201);
  } catch (err) {
    logger.error('Registration error', err);
    return error(res, 'Registration failed', 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return error(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return error(res, 'Account deactivated', 403);
    }

    const tokens = generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    logger.info('User logged in', { userId: user.id });

    return success(res, {
      user: user.toSafeJSON(),
      ...tokens,
    }, 'Login successful');
  } catch (err) {
    logger.error('Login error', err);
    return error(res, 'Login failed', 500);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return error(res, 'User not found', 404);
    }

    if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
      return error(res, 'Invalid or expired OTP', 400);
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return success(res, null, 'Email verified successfully');
  } catch (err) {
    logger.error('OTP verification error', err);
    return error(res, 'Verification failed', 500);
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return error(res, 'User not found', 404);
    }

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    return success(res, { otp }, 'OTP resent');
  } catch (err) {
    logger.error('Resend OTP error', err);
    return error(res, 'Failed to resend OTP', 500);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      return error(res, 'Invalid refresh token', 401);
    }

    const tokens = generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return success(res, tokens, 'Token refreshed');
  } catch (err) {
    logger.error('Token refresh error', err);
    return error(res, 'Token refresh failed', 500);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    return success(res, { user: user.toSafeJSON() });
  } catch (err) {
    return error(res, 'Failed to get profile', 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, preferredLanguage } = req.body;
    const user = await User.findByPk(req.userId);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    await user.save();

    return success(res, { user: user.toSafeJSON() }, 'Profile updated');
  } catch (err) {
    return error(res, 'Failed to update profile', 500);
  }
};

exports.registerBiometric = async (req, res) => {
  try {
    const { publicKey } = req.body;
    const user = await User.findByPk(req.userId);

    user.biometricPublicKey = publicKey;
    user.isMfaEnabled = true;
    await user.save();

    return success(res, null, 'Biometric key registered');
  } catch (err) {
    return error(res, 'Failed to register biometric', 500);
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    user.refreshToken = null;
    await user.save();

    return success(res, null, 'Logged out successfully');
  } catch (err) {
    return error(res, 'Logout failed', 500);
  }
};
