const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const router = express.Router();

const createToken = (user) => {
    const payload = { user: { id: user.id, role: user.role } };
    return new Promise((resolve, reject) => {
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) reject(err);
            resolve(token);
        });
    });
};

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=auth_failed' }),
    async (req, res) => {
        try {
            const token = await createToken(req.user);
            res.redirect(`http://localhost:3000/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                profilePicture: req.user.profilePicture,
                role: req.user.role
            }))}`);
        } catch (err) {
            res.redirect('http://localhost:3000/login?error=token_creation_failed');
        }
    }
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: 'http://localhost:3000/login?error=auth_failed' }),
    async (req, res) => {
        try {
            const token = await createToken(req.user);
            res.redirect(`http://localhost:3000/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                profilePicture: req.user.profilePicture,
                role: req.user.role
            }))}`);
        } catch (err) {
            res.redirect('http://localhost:3000/login?error=token_creation_failed');
        }
    }
);

router.get('/twitter', passport.authenticate('twitter'));

router.get(
    '/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: 'http://localhost:3000/login?error=auth_failed' }),
    async (req, res) => {
        try {
            const token = await createToken(req.user);
            res.redirect(`http://localhost:3000/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                profilePicture: req.user.profilePicture,
                role: req.user.role
            }))}`);
        } catch (err) {
            res.redirect('http://localhost:3000/login?error=token_creation_failed');
        }
    }
);

module.exports = router;
