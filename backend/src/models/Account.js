const db = require('../config/db');

class Account {
    constructor() {
        this.table = 'accounts';
    }

    async create(accountData) {
        const result = await db.query(
            `INSERT INTO accounts (user_id, balance, currency, account_type)
            VALUES (?, ?, ?, ?)`,
            [
                accountData.user_id,
                accountData.balance || 0.00,
                accountData.currency || 'RWF',
                accountData.account_type || 'savings'
            ]
        );

        return this.findById(result.rows[0].id);
    }

    async findById(id) {
        const result = await db.query('SELECT * FROM accounts WHERE id = ?', [id]);
        return result.rows[0] || null;
    }

    async findByUserId(userId) {
        const result = await db.query('SELECT * FROM accounts WHERE user_id = ?', [userId]);
        return result.rows[0] || null;
    }

    async updateBalance(userId, newBalance) {
        const result = await db.query(
            `UPDATE accounts 
            SET balance = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?`,
            [newBalance, userId]
        );

        return result.rowCount > 0;
    }

    async getBalance(userId) {
        const account = await this.findByUserId(userId);
        return account ? account.balance : null;
    }

    async deposit(userId, amount) {
        const result = await db.query(
            `UPDATE accounts 
            SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?`,
            [amount, userId]
        );

        return result.rowCount > 0;
    }

    async withdraw(userId, amount) {
        const account = await this.findByUserId(userId);

        if (!account || Number(account.balance) < amount) {
            throw new Error('Insufficient balance');
        }

        const result = await db.query(
            `UPDATE accounts 
            SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?`,
            [amount, userId]
        );

        return result.rowCount > 0;
    }

    async deleteByUserId(userId) {
        const result = await db.query('DELETE FROM accounts WHERE user_id = ?', [userId]);
        return result.rowCount > 0;
    }

    async delete(id) {
        const result = await db.query('DELETE FROM accounts WHERE id = ?', [id]);
        return result.rowCount > 0;
    }
}

module.exports = new Account();
