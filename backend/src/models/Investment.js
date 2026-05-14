const db = require('../config/db');

class Investment {
    static async create(data) {
        const query = `
            INSERT INTO investments (
                user_id, type, amount, duration, risk_level, 
                expected_return, actual_return, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const values = [
            data.user_id,
            data.type,
            data.amount,
            data.duration,
            data.risk_level,
            data.expected_return,
            data.actual_return || 0,
            data.status || 'active'
        ];

        try {
            const result = await db.execute(query, values);
            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM investments WHERE id = ?';
        try {
            const rows = await db.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        const query = 'SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC';
        try {
            const rows = await db.execute(query, [userId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findByIdAndUserId(id, userId) {
        const query = 'SELECT * FROM investments WHERE id = ? AND user_id = ?';
        try {
            const rows = await db.execute(query, [id, userId]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
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

        const query = `UPDATE investments SET ${fields.join(', ')} WHERE id = ?`;
        
        try {
            await db.execute(query, values);
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM investments WHERE id = ?';
        try {
            const result = await db.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getInvestmentStats(userId) {
        const query = `
            SELECT 
                COUNT(*) as total_investments,
                SUM(amount) as total_invested,
                SUM(expected_return) as total_expected_returns,
                SUM(actual_return) as total_actual_returns,
                AVG(expected_return) as avg_expected_return,
                AVG(actual_return) as avg_actual_return
            FROM investments 
            WHERE user_id = ? AND status = 'active'
        `;
        
        try {
            const rows = await db.execute(query, [userId]);
            return rows[0] || {};
        } catch (error) {
            throw error;
        }
    }

    static async getInvestmentsByType(userId) {
        const query = `
            SELECT 
                type,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                AVG(expected_return) as avg_return
            FROM investments 
            WHERE user_id = ? AND status = 'active'
            GROUP BY type
        `;
        
        try {
            const rows = await db.execute(query, [userId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Investment;
