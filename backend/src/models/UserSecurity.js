const bcrypt = require('bcryptjs');

class UserSecurity {
    constructor() {
        this.table = 'user_security';
    }

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Get or create security record for user
    async getOrCreate(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM user_security WHERE user_id = ?',
            [userId]
        );

        if (rows.length > 0) {
            return rows[0];
        }

        // Create new security record
        await connection.execute(
            'INSERT INTO user_security (user_id, transaction_pin) VALUES (?, ?)',
            [userId, '']
        );

        const [newRows] = await connection.execute(
            'SELECT * FROM user_security WHERE user_id = ?',
            [userId]
        );

        return newRows[0];
    }

    // Set transaction PIN
    async setTransactionPin(userId, hashedPin) {
        const connection = this.getConnection();
        
        let security = await this.getOrCreate(userId);
        
        await connection.execute(
            'UPDATE user_security SET transaction_pin = ?, pin_attempts = 0, pin_locked_until = NULL WHERE user_id = ?',
            [hashedPin, userId]
        );

        return this.getOrCreate(userId);
    }

    // Get PIN by user ID
    async getPinByUserId(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(
            'SELECT transaction_pin FROM user_security WHERE user_id = ?',
            [userId]
        );

        return rows[0] ? rows[0].transaction_pin : null;
    }

    // Increment PIN attempts
    async incrementPinAttempts(userId) {
        const connection = this.getConnection();
        await connection.execute(
            'UPDATE user_security SET pin_attempts = pin_attempts + 1 WHERE user_id = ?',
            [userId]
        );
    }

    // Lock PIN
    async lockPin(userId, lockedUntil) {
        const connection = this.getConnection();
        await connection.execute(
            'UPDATE user_security SET pin_locked_until = ? WHERE user_id = ?',
            [lockedUntil, userId]
        );
    }

    // Reset PIN attempts
    async resetPinAttempts(userId) {
        const connection = this.getConnection();
        await connection.execute(
            'UPDATE user_security SET pin_attempts = 0, pin_locked_until = NULL WHERE user_id = ?',
            [userId]
        );
    }

    // Get security info
    async getSecurityInfo(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM user_security WHERE user_id = ?',
            [userId]
        );

        return rows[0] || null;
    }

    // Check if PIN is set
    async isPinSet(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(
            'SELECT transaction_pin FROM user_security WHERE user_id = ? AND transaction_pin IS NOT NULL',
            [userId]
        );

        return rows.length > 0;
    }

    // Check if PIN is locked
    async isPinLocked(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(
            'SELECT pin_locked_until FROM user_security WHERE user_id = ? AND pin_locked_until > NOW()',
            [userId]
        );

        return rows.length > 0;
    }

    // Get locked until time
    async getLockedUntil(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(
            'SELECT pin_locked_until FROM user_security WHERE user_id = ?',
            [userId]
        );

        return rows[0] ? rows[0].pin_locked_until : null;
    }
}

module.exports = new UserSecurity();
