class AIInsight {
    constructor() {
        this.table = 'ai_insights';
    }

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Create new AI insight (works with or without is_read column)
    async create(insightData) {
        const connection = this.getConnection();
        const type = insightData.type || 'recommendation';
        const paramsFull = [
            insightData.user_id,
            insightData.message,
            type,
            insightData.is_read || false
        ];
        const paramsMinimal = [insightData.user_id, insightData.message, type];

        try {
            const [result] = await connection.execute(`
                INSERT INTO ai_insights (user_id, message, type, is_read)
                VALUES (?, ?, ?, ?)
            `, paramsFull);
            return this.findById(result.insertId);
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR' && String(err.sqlMessage || '').includes('is_read')) {
                const [result] = await connection.execute(`
                    INSERT INTO ai_insights (user_id, message, type)
                    VALUES (?, ?, ?)
                `, paramsMinimal);
                return this.findById(result.insertId);
            }
            throw err;
        }
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

    // Mark insight as read (no-op if is_read column missing)
    async markAsRead(id) {
        const connection = this.getConnection();
        try {
            const [result] = await connection.execute(`
                UPDATE ai_insights 
                SET is_read = TRUE 
                WHERE id = ?
            `, [id]);
            return result.affectedRows > 0;
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR' && String(err.sqlMessage || '').includes('is_read')) {
                return false;
            }
            throw err;
        }
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

    // Get unread insights count (0 if is_read column missing)
    async getUnreadCount(userId) {
        const connection = this.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT COUNT(*) as count FROM ai_insights 
                WHERE user_id = ? AND is_read = FALSE
            `, [userId]);
            return rows[0].count || 0;
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR' && String(err.sqlMessage || '').includes('is_read')) {
                return 0;
            }
            throw err;
        }
    }
}

module.exports = new AIInsight();
