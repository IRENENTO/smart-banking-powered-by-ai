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

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Generate reference number
    generateReferenceNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PAY${timestamp}${random}`;
    }

    // Create new payment
    async create(paymentData) {
        const connection = this.getConnection();
        const referenceNumber = this.generateReferenceNumber();

        const [result] = await connection.execute(`
            INSERT INTO payments (user_id, payment_type, provider, provider_reference, account_or_phone, amount, currency, status, description, metadata, transaction_reference, balance_before, balance_after)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
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
        ]);

        return this.findById(result.insertId);
    }

    // Find payment by ID
    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM payments WHERE id = ?', [id]);
        const payment = rows[0] || null;
        if (payment && payment.metadata) {
            try {
                payment.metadata = JSON.parse(payment.metadata);
            } catch (e) {}
        }
        return payment;
    }

    // Find payment by transaction reference
    async findByTransactionReference(reference) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM payments WHERE transaction_reference = ?', [reference]);
        const payment = rows[0] || null;
        if (payment && payment.metadata) {
            try {
                payment.metadata = JSON.parse(payment.metadata);
            } catch (e) {}
        }
        return payment;
    }

    // Get payments by user ID
    async findByUserId(userId, limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const [rows] = await connection.query(
            `SELECT * FROM payments 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ${lim} OFFSET ${off}`,
            [userId]
        );
        return rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    // Get payments by user ID and type
    async findByUserIdAndType(userId, paymentType, limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const [rows] = await connection.query(
            `SELECT * FROM payments 
            WHERE user_id = ? AND payment_type = ? 
            ORDER BY created_at DESC 
            LIMIT ${lim} OFFSET ${off}`,
            [userId, paymentType]
        );
        return rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    // Get payments by user ID and status
    async findByUserIdAndStatus(userId, status, limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const [rows] = await connection.query(
            `SELECT * FROM payments 
            WHERE user_id = ? AND status = ? 
            ORDER BY created_at DESC 
            LIMIT ${lim} OFFSET ${off}`,
            [userId, status]
        );
        return rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    // Get pending PayPack payments for a user
    async findPendingPaypackByUserId(userId, limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const [rows] = await connection.query(
            `SELECT * FROM payments
            WHERE user_id = ? AND status = 'pending' AND provider = 'paypack'
            ORDER BY created_at DESC
            LIMIT ${lim} OFFSET ${off}`,
            [userId]
        );
        return rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }

    // Update payment status
    async updateStatus(id, status, userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute(
            'UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP, paid_at = CASE WHEN ? = "completed" AND paid_at IS NULL THEN CURRENT_TIMESTAMP ELSE paid_at END WHERE id = ? AND user_id = ?',
            [status, status, id, userId]
        );
        return result.affectedRows > 0;
    }

    // Delete payment by ID (only if not completed)
    async delete(id, userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute(
            'DELETE FROM payments WHERE id = ? AND user_id = ? AND status IN ("pending", "failed", "cancelled")',
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    // Get payment statistics for user
    async getPaymentStats(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN payment_type = 'bill' AND status = 'completed' THEN amount ELSE 0 END) as total_bills,
                SUM(CASE WHEN payment_type = 'merchant' AND status = 'completed' THEN amount ELSE 0 END) as total_merchant,
                SUM(CASE WHEN payment_type = 'subscription' AND status = 'completed' THEN amount ELSE 0 END) as total_subscriptions,
                SUM(CASE WHEN payment_type = 'top_up' AND status = 'completed' THEN amount ELSE 0 END) as total_top_ups,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
            FROM payments 
            WHERE user_id = ?
        `, [userId]);
        return rows[0] || {};
    }

    // Get recent payments
    async getRecentPayments(userId, limit = 10) {
        const connection = this.getConnection();
        const lim = this._clampLimit(limit, 10, 100);
        const [rows] = await connection.query(
            `SELECT * FROM payments 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ${lim}`,
            [userId]
        );
        return rows.map(row => {
            if (row.metadata) {
                try { row.metadata = JSON.parse(row.metadata); } catch (e) {}
            }
            return row;
        });
    }
}

module.exports = new Payment();
