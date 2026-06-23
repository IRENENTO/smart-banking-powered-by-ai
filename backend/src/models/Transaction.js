const db = require('../config/db');
const { categorizeByDescription } = require('../utils/categorizer');

class Transaction {
    constructor() {
        this.table = 'transactions';
    }

    _clampLimitOffset(limit, offset, defaultLimit = 50, maxLimit = 500) {
        const limParsed = parseInt(String(limit), 10);
        const offParsed = parseInt(String(offset), 10);
        const lim = Number.isFinite(limParsed) && limParsed > 0 ? Math.min(maxLimit, limParsed) : defaultLimit;
        const off = Number.isFinite(offParsed) && offParsed >= 0 ? offParsed : 0;
        return [lim, off];
    }

    _clampLimit(limit, defaultLimit = 10, maxLimit = 100) {
        const limParsed = parseInt(String(limit), 10);
        return Number.isFinite(limParsed) && limParsed > 0 ? Math.min(maxLimit, limParsed) : defaultLimit;
    }

    generateReferenceNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TXN${timestamp}${random}`;
    }

    async create(transactionData) {
        const referenceNumber = this.generateReferenceNumber();

        const description = transactionData.description || null;
        const rawCategory = transactionData.category || 'other';
        const category = rawCategory === 'other' && description
            ? categorizeByDescription(description)
            : rawCategory;

        try {
            const result = await db.query(
                `INSERT INTO transactions (user_id, type, amount, description, reference_number, recipient_account_number, recipient_name, category, status, balance_before, balance_after)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
                [
                    transactionData.user_id,
                    transactionData.type,
                    transactionData.amount,
                    description,
                    referenceNumber,
                    transactionData.recipient_account_number || null,
                    transactionData.recipient_name || null,
                    category,
                    transactionData.status || 'completed',
                    transactionData.balance_before || 0,
                    transactionData.balance_after || 0
                ]
            );

            return this.findById(result.rows[0].id);
        } catch (err) {
            if (err.errno === 1054) {
                const result = await db.query(
                    `INSERT INTO transactions (user_id, type, amount, description, reference_number, recipient_account_number, recipient_name, status, balance_before, balance_after)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                    [
                        transactionData.user_id,
                        transactionData.type,
                        transactionData.amount,
                        transactionData.description || null,
                        referenceNumber,
                        transactionData.recipient_account_number || null,
                        transactionData.recipient_name || null,
                        transactionData.status || 'completed',
                        transactionData.balance_before || 0,
                        transactionData.balance_after || 0
                    ]
                );
                return this.findById(result.rows[0].id);
            }
            throw err;
        }
    }

    async findById(id) {
        const result = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findByReferenceNumber(referenceNumber) {
        const result = await db.query('SELECT * FROM transactions WHERE reference_number = $1', [referenceNumber]);
        return result.rows[0] || null;
    }

    async findByUserId(userId, limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT * FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3`,
            [userId, lim, off]
        );
        return result.rows;
    }

    async findByType(userId, type, limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT * FROM transactions 
            WHERE user_id = $1 AND type = $2 
            ORDER BY created_at DESC 
            LIMIT $3 OFFSET $4`,
            [userId, type, lim, off]
        );
        return result.rows;
    }

    async findByStatus(userId, status, limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT * FROM transactions 
            WHERE user_id = $1 AND status = $2 
            ORDER BY created_at DESC 
            LIMIT $3 OFFSET $4`,
            [userId, status, lim, off]
        );
        return result.rows;
    }

    async getTransactionStats(userId) {
        const result = await db.query(
            `SELECT 
                CAST(COUNT(*) AS SIGNED) as total_transactions,
                SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as total_deposits,
                SUM(CASE WHEN type = 'withdraw' AND status = 'completed' THEN amount ELSE 0 END) as total_withdrawals,
                SUM(CASE WHEN type = 'payment' AND status = 'completed' THEN amount ELSE 0 END) as total_payments,
                SUM(CASE WHEN type = 'transfer' AND status = 'completed' THEN amount ELSE 0 END) as total_transfers,
                CAST(COUNT(CASE WHEN status = 'pending' THEN 1 END) AS SIGNED) as pending_transactions
            FROM transactions 
            WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0] || {};
    }

    async getRecentTransactions(userId, limit = 10) {
        const lim = this._clampLimit(limit, 10, 100);
        const result = await db.query(
            `SELECT * FROM transactions 
            WHERE user_id = $1 AND status = 'completed'
            ORDER BY created_at DESC 
            LIMIT $2`,
            [userId, lim]
        );
        return result.rows;
    }

    async updateStatus(id, status) {
        await db.query(
            'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [status, id]
        );
        return this.findById(id);
    }

    async findAll(limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset, 50, 500);
        const result = await db.query(
            `SELECT t.*, u.name as user_name, u.email as user_email, u.account_number
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC 
            LIMIT $1 OFFSET $2`,
            [lim, off]
        );
        return result.rows;
    }
}

module.exports = new Transaction();
