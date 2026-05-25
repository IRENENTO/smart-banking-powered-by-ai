const db = require('../config/db');

class Investment {
    static async create(data) {
        const result = await db.query(
            `INSERT INTO investments (
                user_id, type, amount, duration, risk_level, 
                expected_return, actual_return, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                data.user_id,
                data.type,
                data.amount,
                data.duration,
                data.risk_level,
                data.expected_return,
                data.actual_return || 0,
                data.status || 'active'
            ]
        );

        return await this.findById(result.rows[0].id);
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM investments WHERE id = ?', [id]);
        return result.rows[0] || null;
    }

    static async findByUserId(userId) {
        const result = await db.query('SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return result.rows;
    }

    static async findByIdAndUserId(id, userId) {
        const result = await db.query('SELECT * FROM investments WHERE id = ? AND user_id = ?', [id, userId]);
        return result.rows[0] || null;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        fields.push('updated_at = NOW()');
        values.push(id);

        await db.query(
            `UPDATE investments SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await this.findById(id);
    }

    static async delete(id) {
        const result = await db.query('DELETE FROM investments WHERE id = ?', [id]);
        return result.rowCount > 0;
    }

    static async getInvestmentStats(userId) {
        const result = await db.query(
            `SELECT 
                CAST(COUNT(*) AS SIGNED) as total_investments,
                SUM(amount) as total_invested,
                SUM(expected_return) as total_expected_returns,
                SUM(actual_return) as total_actual_returns,
                AVG(expected_return) as avg_expected_return,
                AVG(actual_return) as avg_actual_return
            FROM investments 
            WHERE user_id = ? AND status = 'active'`,
            [userId]
        );
        return result.rows[0] || {};
    }

    static async getInvestmentsByType(userId) {
        const result = await db.query(
            `SELECT 
                type,
                CAST(COUNT(*) AS SIGNED) as count,
                SUM(amount) as total_amount,
                AVG(expected_return) as avg_return
            FROM investments 
            WHERE user_id = ? AND status = 'active'
            GROUP BY type`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = Investment;
