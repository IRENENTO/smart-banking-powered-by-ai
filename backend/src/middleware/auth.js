const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/User');

const getUserFromToken = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
    if (!token) {
        res.status(401).json({ msg: 'No token, authorization denied' });
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.user.id);
        if (!user) {
            res.status(401).json({ msg: 'User not found' });
            return null;
        }
        return user;
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
        return null;
    }
};

const auth = async (req, res, next) => {
    const user = await getUserFromToken(req, res);
    if (!user) return;
    req.user = user;
    next();
};

const authWithUser = async (req, res, next) => {
    const user = await getUserFromToken(req, res);
    if (!user) return;
    req.user = user;
    next();
};

const requireEmailVerified = async (req, res, next) => {
    const user = await getUserFromToken(req, res);
    if (!user) return;

    if (!user.email_verified) {
        return res.status(403).json({ msg: 'Email verification is required to access this resource' });
    }

    req.user = user;
    next();
};

const requireProfileCompleted = async (req, res, next) => {
    const user = await getUserFromToken(req, res);
    if (!user) return;

    if (!user.profile_completed) {
        return res.status(403).json({ msg: 'Profile must be completed before performing this action' });
    }

    req.user = user;
    next();
};

const requirePinSet = async (req, res, next) => {
    const user = await getUserFromToken(req, res);
    if (!user) return;

    if (!user.pin_set) {
        return res.status(403).json({ msg: 'Transaction PIN must be set before performing this action' });
    }

    req.user = user;
    next();
};

const optionalAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
    if (!token) { req.user = null; return next(); }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.user.id);
    } catch (err) {
        req.user = null;
    }
    next();
};

module.exports = { auth, authWithUser, requireEmailVerified, requireProfileCompleted, requirePinSet, optionalAuth };
