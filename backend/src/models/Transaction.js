class Transaction {
    constructor() {
        this.table = 'transactions';
    }

    /** Safe integers for LIMIT/OFFSET (bound params break on some MySQL/mysql2 combos). */
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
        return `TXN${timestamp}${random}`;
    }

    // Create new transaction
    async create(transactionData) {
        const connection = this.getConnection();
        const referenceNumber = this.generateReferenceNumber();

        const [result] = await connection.execute(`
            INSERT INTO transactions (user_id, type, amount, description, reference_number, recipient_account_number, recipient_name, status, balance_before, balance_after)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
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
        ]);

        return this.findById(result.insertId);
    }

    // Find transaction by ID
    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM transactions WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Find transaction by reference number
    async findByReferenceNumber(referenceNumber) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM transactions WHERE reference_number = ?', [referenceNumber]);
        return rows[0] || null;
    }

    // Get transactions by user ID
    async findByUserId(userId, limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const [rows] = await connection.query(
            `SELECT * FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ${lim} OFFSET ${off}`,
            [userId]
        );
        return rows;
    }

    // Get transactions by type
    async findByType(userId, type, limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const [rows] = await connection.query(
            `SELECT * FROM transactions 
            WHERE user_id = ? AND type = ? 
            ORDER BY created_at DESC 
            LIMIT ${lim} OFFSET ${off}`,
            [userId, type]
        );
        return rows;
    }

    // Get transactions by status
    async findByStatus(userId, status, limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset);
        const [rows] = await connection.query(
            `SELECT * FROM transactions 
            WHERE user_id = ? AND status = ? 
            ORDER BY created_at DESC 
            LIMIT ${lim} OFFSET ${off}`,
            [userId, status]
        );
        return rows;
    }

    // Get transaction statistics for user
    async getTransactionStats(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as total_deposits,
                SUM(CASE WHEN type = 'withdraw' AND status = 'completed' THEN amount ELSE 0 END) as total_withdrawals,
                SUM(CASE WHEN type = 'payment' AND status = 'completed' THEN amount ELSE 0 END) as total_payments,
                SUM(CASE WHEN type = 'transfer' AND status = 'completed' THEN amount ELSE 0 END) as total_transfers,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions
            FROM transactions 
            WHERE user_id = ?
        `, [userId]);
        return rows[0] || {};
    }

    // Get recent transactions
    async getRecentTransactions(userId, limit = 10) {
        const connection = this.getConnection();
        const lim = this._clampLimit(limit, 10, 100);
        const [rows] = await connection.query(
            `SELECT * FROM transactions 
            WHERE user_id = ? AND status = 'completed'
            ORDER BY created_at DESC 
            LIMIT ${lim}`,
            [userId]
        );
        return rows;
    }

    // Update transaction status
    async updateStatus(id, status) {
        const connection = this.getConnection();
        await connection.execute('UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
        return this.findById(id);
    }

    // Get all transactions (admin)
    async findAll(limit = 50, offset = 0) {
        const connection = this.getConnection();
        const [lim, off] = this._clampLimitOffset(limit, offset, 50, 500);
        const [rows] = await connection.query(
            `SELECT t.*, u.name as user_name, u.email as user_email, u.account_number
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC 
            LIMIT ${lim} OFFSET ${off}`
        );
        return rows;
    }
}

module.exports = new Transaction();
