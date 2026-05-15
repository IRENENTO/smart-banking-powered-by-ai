class Loan {
    constructor() {
        this.table = 'loans';
    }

    getConnection() {
        return global.dbConnection;
    }

    async create(loanData) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO loans (user_id, amount, purpose, duration_months, status, risk_score, monthly_income, existing_debt, ai_decision, deduction_amount, deduction_period, paid_amount, next_deduction_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            loanData.user_id,
            loanData.amount,
            loanData.purpose || null,
            loanData.duration || null,
            loanData.status || 'pending',
            loanData.risk_score || null,
            loanData.monthly_income || null,
            loanData.existing_debt || null,
            loanData.ai_decision ? JSON.stringify(loanData.ai_decision) : null,
            loanData.deduction_amount || null,
            loanData.deduction_period || null,
            loanData.paid_amount || 0,
            loanData.next_deduction_date || null
        ]);

        return this.findById(result.insertId);
    }

    async findById(id) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT *, duration_months AS duration
            FROM loans
            WHERE id = ?
        `, [id]);
        if (rows[0]) {
            rows[0] = this._parseFields(rows[0]);
        }
        return rows[0] || null;
    }

    async findByUserId(userId) {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT *, duration_months AS duration
            FROM loans
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);
        return rows.map(row => this._parseFields(row));
    }

    async updateStatus(id, status, riskScore = null) {
        const connection = this.getConnection();
        const [result] = await connection.execute(`
            UPDATE loans 
            SET status = ?, risk_score = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, riskScore, id]);

        return result.affectedRows > 0;
    }

    async findAll() {
        const connection = this.getConnection();
        const [rows] = await connection.execute(`
            SELECT *, duration_months AS duration
            FROM loans
            ORDER BY created_at DESC
        `);
        return rows.map(row => this._parseFields(row));
    }

    async delete(id, userId) {
        const connection = this.getConnection();
        const [result] = await connection.execute(
            'DELETE FROM loans WHERE id = ? AND user_id = ? AND status = ?',
            [id, userId, 'pending']
        );
        return result.affectedRows > 0;
    }

    async setDeductionSchedule(id, deductionAmount, deductionPeriod) {
        const connection = this.getConnection();
        const loan = await this.findById(id);
        if (!loan) return null;

        const nextDate = this._calculateNextDate(new Date(), deductionPeriod);
        const [result] = await connection.execute(`
            UPDATE loans
            SET deduction_amount = ?, deduction_period = ?, next_deduction_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [deductionAmount, deductionPeriod, nextDate, id]);

        return result.affectedRows > 0;
    }

    async recordPayment(id, amount) {
        const connection = this.getConnection();
        const loan = await this.findById(id);
        if (!loan) return null;

        const newPaidAmount = parseFloat(loan.paid_amount) + parseFloat(amount);
        const totalAmount = parseFloat(loan.total_amount) || parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate || 10) / 100);
        const isCompleted = newPaidAmount >= totalAmount;

        let nextDate = null;
        let newStatus = loan.status;
        if (!isCompleted && loan.deduction_period) {
            nextDate = this._calculateNextDate(new Date(), loan.deduction_period);
        }
        if (isCompleted) {
            newStatus = 'completed';
        }

        await connection.execute(`
            UPDATE loans
            SET paid_amount = ?, next_deduction_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [newPaidAmount, nextDate, newStatus, id]);

        return { paidAmount: newPaidAmount, isCompleted, newStatus };
    }

    async requestExtension(id, extraDays) {
        const connection = this.getConnection();
        const loan = await this.findById(id);
        if (!loan) return null;

        const extensions = loan.extensions || [];
        const newExtension = {
            requested_at: new Date().toISOString(),
            extra_days: extraDays,
            approved: null
        };

        const paidRatio = loan.total_amount > 0
            ? parseFloat(loan.paid_amount) / parseFloat(loan.total_amount)
            : 0;

        const paidOnSchedule = paidRatio > 0.5;
        newExtension.approved = paidOnSchedule;

        if (paidOnSchedule && loan.due_date) {
            const currentDue = new Date(loan.due_date);
            currentDue.setDate(currentDue.getDate() + extraDays);
            newExtension.new_due_date = currentDue.toISOString().split('T')[0];

            await connection.execute(`
                UPDATE loans
                SET due_date = ?, extensions = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [newExtension.new_due_date, JSON.stringify([...extensions, newExtension]), id]);
        } else {
            await connection.execute(`
                UPDATE loans
                SET extensions = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [JSON.stringify([...extensions, newExtension]), id]);
        }

        return {
            approved: newExtension.approved,
            extension: newExtension,
            reason: paidOnSchedule
                ? 'Extension approved based on good payment history (>50% paid)'
                : 'Extension denied: less than 50% of loan has been paid'
        };
    }

    async getWithProgress(id) {
        const loan = await this.findById(id);
        if (!loan) return null;

        const totalAmount = parseFloat(loan.total_amount) || parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate || 10) / 100);
        const paidAmount = parseFloat(loan.paid_amount) || 0;
        const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

        let daysRemaining = null;
        if (loan.due_date) {
            const due = new Date(loan.due_date);
            const now = new Date();
            daysRemaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
        }

        return {
            ...loan,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            paid_percentage: Math.min(100, Math.round(paidPercentage * 100) / 100),
            remaining_amount: Math.max(0, totalAmount - paidAmount),
            days_remaining: daysRemaining,
            next_deduction: loan.next_deduction_date
        };
    }

    _parseFields(row) {
        if (row.ai_decision) {
            try {
                row.ai_decision = JSON.parse(row.ai_decision);
            } catch (e) {}
        }
        if (row.extensions) {
            try {
                row.extensions = JSON.parse(row.extensions);
            } catch (e) {}
        }
        return row;
    }

    _calculateNextDate(fromDate, period) {
        const d = new Date(fromDate);
        switch (period) {
            case 'daily':
                d.setDate(d.getDate() + 1);
                break;
            case 'weekly':
                d.setDate(d.getDate() + 7);
                break;
            case 'monthly':
                d.setMonth(d.getMonth() + 1);
                break;
        }
        return d.toISOString().split('T')[0];
    }
}

module.exports = new Loan();
