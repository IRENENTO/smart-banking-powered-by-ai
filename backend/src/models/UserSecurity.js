const bcrypt = require('bcryptjs');
const db = require('../config/db');

class UserSecurity {
    constructor() {
        this.table = 'user_security';
    }

    async getOrCreate(userId) {
        const result = await db.query(
            'SELECT * FROM user_security WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        await db.query(
            'INSERT INTO user_security (user_id, transaction_pin) VALUES ($1, $2)',
            [userId, '']
        );

        const newResult = await db.query(
            'SELECT * FROM user_security WHERE user_id = $1',
            [userId]
        );

        return newResult.rows[0];
    }

    async setTransactionPin(userId, hashedPin) {
        await this.getOrCreate(userId);

        await db.query(
            'UPDATE user_security SET transaction_pin = $1, pin_attempts = 0, pin_locked_until = NULL WHERE user_id = $2',
            [hashedPin, userId]
        );

        return this.getOrCreate(userId);
    }

    async getPinByUserId(userId) {
        const result = await db.query(
            'SELECT transaction_pin FROM user_security WHERE user_id = $1',
            [userId]
        );

        return result.rows[0] ? result.rows[0].transaction_pin : null;
    }

    async incrementPinAttempts(userId) {
        await db.query(
            'UPDATE user_security SET pin_attempts = pin_attempts + 1 WHERE user_id = $1',
            [userId]
        );
    }

    async lockPin(userId, lockedUntil) {
        await db.query(
            'UPDATE user_security SET pin_locked_until = $1 WHERE user_id = $2',
            [lockedUntil, userId]
        );
    }

    async resetPinAttempts(userId) {
        await db.query(
            'UPDATE user_security SET pin_attempts = 0, pin_locked_until = NULL WHERE user_id = $1',
            [userId]
        );
    }

    async getSecurityInfo(userId) {
        const result = await db.query(
            'SELECT * FROM user_security WHERE user_id = $1',
            [userId]
        );

        return result.rows[0] || null;
    }

    async isPinSet(userId) {
        const result = await db.query(
            'SELECT transaction_pin FROM user_security WHERE user_id = $1 AND transaction_pin IS NOT NULL',
            [userId]
        );

        return result.rows.length > 0;
    }

    async isPinLocked(userId) {
        const result = await db.query(
            "SELECT pin_locked_until FROM user_security WHERE user_id = $1 AND pin_locked_until > NOW()",
            [userId]
        );

        return result.rows.length > 0;
    }

    async getLockedUntil(userId) {
        const result = await db.query(
            'SELECT pin_locked_until FROM user_security WHERE user_id = $1',
            [userId]
        );

        return result.rows[0] ? result.rows[0].pin_locked_until : null;
    }
}

module.exports = new UserSecurity();
