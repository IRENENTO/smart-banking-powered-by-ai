class Account {
    constructor() {
        this.table = 'accounts';
    }

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Create new account
    async create(accountData) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO accounts (user_id, balance, currency, account_type)
            VALUES (?, ?, ?, ?)
        `, [
            accountData.user_id,
            accountData.balance || 0.00,
            accountData.currency || 'RWF',
            accountData.account_type || 'savings'
        ]);

        return this.findById(result.insertId);
    }

    // Find account by ID
    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM accounts WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Find account by user ID
    async findByUserId(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM accounts WHERE user_id = ?', [userId]);
        return rows[0] || null;
    }

    // Update account balance
    async updateBalance(userId, newBalance) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            UPDATE accounts 
            SET balance = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
        `, [newBalance, userId]);

        return result.affectedRows > 0;
    }

    // Get account balance
    async getBalance(userId) {
        const account = await this.findByUserId(userId);
        return account ? account.balance : null;
    }

    // Increment balance (deposit)
    async deposit(userId, amount) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            UPDATE accounts 
            SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
        `, [amount, userId]);

        return result.affectedRows > 0;
    }

    // Decrement balance (withdraw)
    async withdraw(userId, amount) {
        const connection = this.getConnection();
        const account = await this.findByUserId(userId);
        
        if (!account || account.balance < amount) {
            throw new Error('Insufficient balance');
        }

        const [result] = await connection.execute(`
            UPDATE accounts 
            SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
        `, [amount, userId]);

        return result.affectedRows > 0;
    }

    // Delete account by user ID
    async deleteByUserId(userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute('DELETE FROM accounts WHERE user_id = ?', [userId]);
        return result.affectedRows > 0;
    }

    // Delete account by ID
    async delete(id) {
        const connection = this.getConnection();
        const [result] = await connection.execute('DELETE FROM accounts WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Account;
