const db = require('../config/db');

class Loan {
    constructor() {
        this.table = 'loans';
    }

    async create(loanData) {
        const result = await db.query(
            `INSERT INTO loans (user_id, amount, purpose, duration_months, status, risk_score, monthly_income, existing_debt, ai_decision, deduction_amount, deduction_period, paid_amount, next_deduction_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
            [
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
            ]
        );

        return this.findById(result.rows[0].id);
    }

    async findById(id) {
        const result = await db.query(
            `SELECT *, duration_months AS duration
            FROM loans
            WHERE id = $1`,
            [id]
        );
        if (result.rows[0]) {
            result.rows[0] = this._parseFields(result.rows[0]);
        }
        return result.rows[0] || null;
    }

    async findByUserId(userId) {
        const result = await db.query(
            `SELECT *, duration_months AS duration
            FROM loans
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows.map(row => this._parseFields(row));
    }

    async updateStatus(id, status, riskScore = null) {
        const result = await db.query(
            `UPDATE loans 
            SET status = $1, risk_score = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3`,
            [status, riskScore, id]
        );

        return result.rowCount > 0;
    }

    async findAll() {
        const result = await db.query(
            `SELECT *, duration_months AS duration
            FROM loans
            ORDER BY created_at DESC`
        );
        return result.rows.map(row => this._parseFields(row));
    }

    async delete(id, userId) {
        const result = await db.query(
            'DELETE FROM loans WHERE id = $1 AND user_id = $2 AND status = $3',
            [id, userId, 'pending']
        );
        return result.rowCount > 0;
    }

    async setDeductionSchedule(id, deductionAmount, deductionPeriod) {
        const loan = await this.findById(id);
        if (!loan) return null;

        const nextDate = this._calculateNextDate(new Date(), deductionPeriod);
        const result = await db.query(
            `UPDATE loans
            SET deduction_amount = $1, deduction_period = $2, next_deduction_date = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4`,
            [deductionAmount, deductionPeriod, nextDate, id]
        );

        return result.rowCount > 0;
    }

    async recordPayment(id, amount) {
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

        await db.query(
            `UPDATE loans
            SET paid_amount = $1, next_deduction_date = $2, status = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4`,
            [newPaidAmount, nextDate, newStatus, id]
        );

        return { paidAmount: newPaidAmount, isCompleted, newStatus };
    }

    async requestExtension(id, extraDays) {
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

            await db.query(
                `UPDATE loans
                SET due_date = $1, extensions = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3`,
                [newExtension.new_due_date, JSON.stringify([...extensions, newExtension]), id]
            );
        } else {
            await db.query(
                `UPDATE loans
                SET extensions = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2`,
                [JSON.stringify([...extensions, newExtension]), id]
            );
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
