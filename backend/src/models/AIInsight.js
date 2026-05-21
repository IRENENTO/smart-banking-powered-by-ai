const db = require('../config/db');

class AIInsight {
    constructor() {
        this.table = 'ai_insights';
    }

    async create(insightData) {
        const type = insightData.type || 'recommendation';

        const result = await db.query(
            `INSERT INTO ai_insights (user_id, message, type, is_read)
            VALUES ($1, $2, $3, $4) RETURNING id`,
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
        const result = await db.query('SELECT * FROM ai_insights WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM ai_insights WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    async markAsRead(id) {
        const result = await db.query(
            `UPDATE ai_insights 
            SET is_read = TRUE 
            WHERE id = $1`,
            [id]
        );
        return result.rowCount > 0;
    }

    async delete(id) {
        const result = await db.query(
            'DELETE FROM ai_insights WHERE id = $1',
            [id]
        );
        return result.rowCount > 0;
    }

    async getUnreadCount(userId) {
        const result = await db.query(
            `SELECT COUNT(*)::int as count FROM ai_insights 
            WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        return result.rows[0].count || 0;
    }
}

module.exports = new AIInsight();
