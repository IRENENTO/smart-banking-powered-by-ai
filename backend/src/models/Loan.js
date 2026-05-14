class Loan {
    constructor() {
        this.table = 'loans';
    }

    // Get database connection
    getConnection() {
        return global.dbConnection;
    }

    // Create new loan application
    async create(loanData) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO loans (user_id, amount, purpose, duration_months, status, risk_score, monthly_income, existing_debt, ai_decision)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            loanData.user_id,
            loanData.amount,
            loanData.purpose || null,
            loanData.duration || null,
            loanData.status || 'pending',
            loanData.risk_score || null,
            loanData.monthly_income || null,
            loanData.existing_debt || null,
            loanData.ai_decision ? JSON.stringify(loanData.ai_decision) : null
        ]);

        return this.findById(result.insertId);
    }

    // Find loan by ID
    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT *, duration_months AS duration
            FROM loans
            WHERE id = ?
        `, [id]);
        if (rows[0] && rows[0].ai_decision) {
            try {
                rows[0].ai_decision = JSON.parse(rows[0].ai_decision);
            } catch (e) {
                // Leave as string if parsing fails
            }
        }
        return rows[0] || null;
    }

    // Find loans by user ID
    async findByUserId(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT *, duration_months AS duration
            FROM loans
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);
        return rows.map(row => {
            if (row.ai_decision) {
                try {
                    row.ai_decision = JSON.parse(row.ai_decision);
                } catch (e) {
                    // Leave as string if parsing fails
                }
            }
            return row;
        });
    }

    // Update loan status
    async updateStatus(id, status, riskScore = null) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            UPDATE loans 
            SET status = ?, risk_score = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, riskScore, id]);

        return result.affectedRows > 0;
    }

    // Get all loans
    async findAll() {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT *, duration_months AS duration
            FROM loans
            ORDER BY created_at DESC
        `);
        return rows.map(row => {
            if (row.ai_decision) {
                try {
                    row.ai_decision = JSON.parse(row.ai_decision);
                } catch (e) {
                    // Leave as string if parsing fails
                }
            }
            return row;
        });
    }

    // Delete loan by ID (only if pending)
    async delete(id, userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute(
            'DELETE FROM loans WHERE id = ? AND user_id = ? AND status = ?',
            [id, userId, 'pending']
        );
        return result.affectedRows > 0;
    }
}

module.exports = new Loan();
