const db = require('../config/db');

class AIInsight {
    constructor() {
        this.table = 'ai_insights';
    }

    async create(insightData) {
        const type = insightData.type || 'recommendation';

        const result = await db.query(
            `INSERT INTO ai_insights (user_id, message, type, is_read)
            VALUES (?, ?, ?, ?)`,
            [
                insightData.user_id,
                insightData.message,
                type,
                insightData.is_read || false
            ]
        );

        return this.findById(result.rows[0].id);
    }

    async findById(id) {
        const result = await db.query('SELECT * FROM ai_insights WHERE id = ?', [id]);
        return result.rows[0] || null;
    }

    async findByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM ai_insights WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    async markAsRead(id) {
        const result = await db.query(
            `UPDATE ai_insights 
            SET is_read = TRUE 
            WHERE id = ?`,
            [id]
        );
        return result.rowCount > 0;
    }

    async delete(id) {
        const result = await db.query(
            'DELETE FROM ai_insights WHERE id = ?',
            [id]
        );
        return result.rowCount > 0;
    }

    async getUnreadCount(userId) {
        const result = await db.query(
            `SELECT CAST(COUNT(*) AS SIGNED) as count FROM ai_insights 
            WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );
        return result.rows[0].count || 0;
    }
}

module.exports = new AIInsight();
