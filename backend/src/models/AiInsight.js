class AIInsight {
    constructor() {
        this.table = 'ai_insights';
    }

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Create new AI insight
    async create(insightData) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO ai_insights (user_id, message, type, is_read)
            VALUES (?, ?, ?, ?)
        `, [
            insightData.user_id,
            insightData.message,
            insightData.type || 'recommendation',
            insightData.is_read || false
        ]);

        return this.findById(result.insertId);
    }

    // Find insight by ID
    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM ai_insights WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Find insights by user ID
    async findByUserId(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute('SELECT * FROM ai_insights WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    }

    // Mark insight as read
    async markAsRead(id) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            UPDATE ai_insights 
            SET is_read = TRUE 
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }

    // Delete insight
    async delete(id) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            DELETE FROM ai_insights 
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0;
    }

    // Get unread insights count
    async getUnreadCount(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT COUNT(*) as count FROM ai_insights 
            WHERE user_id = ? AND is_read = FALSE
        `, [userId]);

        return rows[0].count || 0;
    }
}

module.exports = new AIInsight();
