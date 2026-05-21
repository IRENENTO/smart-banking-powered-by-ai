const db = require('../config/db');

class Payment {
    constructor() {
        this.table = 'payments';
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
        return `PAY${timestamp}${random}`;
    }

    async create(paymentData) {
        const referenceNumber = this.generateReferenceNumber();

        const result = await db.query(
            `INSERT INTO payments (user_id, payment_type, provider, provider_reference, account_or_phone, amount, currency, status, description, metadata, transaction_reference, balance_before, balance_after)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
            [
                paymentData.user_id,
                paymentData.payment_type,
                paymentData.provider,
                paymentData.provider_reference || null,
                paymentData.account_or_phone || null,
                paymentData.amount,
                paymentData.currency || 'RWF',
                paymentData.status || 'pending',
                paymentData.description || null,
                paymentData.metadata ? JSON.stringify(paymentData.metadata) : null,
                paymentData.transaction_reference || null,
                paymentData.balance_before || 0,
                paymentData.balance_after || 0
            ]
        );

        return this.findById(result.rows[0].id);
    }

    async findById(id) {
        const result = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
        const payment = result.rows[0] || null;
        if (payment && payment.metadata) {
            try {
                payment.metadata = JSON.parse(payment.metadata);
            } catch (e) {}
        }
        return payment;
    }

    async findByTransactionReference(reference) {
        const result = await db.query('SELECT * FROM payments WHERE transaction_reference = $1', [reference]);
        const payment = result.rows[0] || null;
        if (payment && payment.metadata) {
            try {
                payment.metadata = JSON.parse(payment.metadata);
            } catch (e) {}
        }
        return payment;
    }

    async findByUserId(userId, limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT * FROM payments 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3`,
            [userId, lim, off]
        );
        return result.rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    async findByUserIdAndType(userId, paymentType, limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT * FROM payments 
            WHERE user_id = $1 AND payment_type = $2 
            ORDER BY created_at DESC 
            LIMIT $3 OFFSET $4`,
            [userId, paymentType, lim, off]
        );
        return result.rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    async findByUserIdAndStatus(userId, status, limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT * FROM payments 
            WHERE user_id = $1 AND status = $2 
            ORDER BY created_at DESC 
            LIMIT $3 OFFSET $4`,
            [userId, status, lim, off]
        );
        return result.rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    async findPendingPaypackByUserId(userId, limit = 50, offset = 0) {
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const result = await db.query(
            `SELECT * FROM payments
            WHERE user_id = $1 AND status = 'pending' AND provider = 'paypack'
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3`,
            [userId, lim, off]
        );
        return result.rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    async updateStatus(id, status, userId) {
        const result = await db.query(
            `UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP, paid_at = CASE WHEN $2 = 'completed' AND paid_at IS NULL THEN CURRENT_TIMESTAMP ELSE paid_at END WHERE id = $3 AND user_id = $4`,
            [status, status, id, userId]
        );
        return result.rowCount > 0;
    }

    async delete(id, userId) {
        const result = await db.query(
            `DELETE FROM payments WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'failed', 'cancelled')`,
            [id, userId]
        );
        return result.rowCount > 0;
    }

    async getPaymentStats(userId) {
        const result = await db.query(
            `SELECT 
                COUNT(*)::int as total_payments,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN payment_type = 'bill' AND status = 'completed' THEN amount ELSE 0 END) as total_bills,
                SUM(CASE WHEN payment_type = 'merchant' AND status = 'completed' THEN amount ELSE 0 END) as total_merchant,
                SUM(CASE WHEN payment_type = 'subscription' AND status = 'completed' THEN amount ELSE 0 END) as total_subscriptions,
                SUM(CASE WHEN payment_type = 'top_up' AND status = 'completed' THEN amount ELSE 0 END) as total_top_ups,
                COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending_payments,
                COUNT(CASE WHEN status = 'failed' THEN 1 END)::int as failed_payments
            FROM payments 
            WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0] || {};
    }

    async getRecentPayments(userId, limit = 10) {
        const lim = this._clampLimit(limit, 10, 100);
        const result = await db.query(
            `SELECT * FROM payments 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2`,
            [userId, lim]
        );
        return result.rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }
}

module.exports = new Payment();
