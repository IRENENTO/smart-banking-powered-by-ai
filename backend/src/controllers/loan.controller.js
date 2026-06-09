const Loan = require('../models/Loan');
const aiService = require('../services/ai.service');

exports.applyForLoan = async (req, res) => {
    const { amount, purpose, duration, monthlyIncome, existingDebt, deductionAmount, deductionPeriod } = req.body;
    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid loan amount' });
        }

        if (!duration || duration <= 0) {
            return res.status(400).json({ msg: 'Invalid loan duration' });
        }

        const aiResult = await aiService.analyzeLoanRisk({
            amount,
            duration,
            monthlyIncome: monthlyIncome || 0,
            existingDebt: existingDebt || 0
        });

        const isApproved = aiResult.approval_status === 'APPROVED';
        let nextDeductionDate = null;
        if (isApproved && deductionAmount && deductionPeriod) {
            const d = new Date();
            switch (deductionPeriod) {
                case 'daily': d.setDate(d.getDate() + 1); break;
                case 'weekly': d.setDate(d.getDate() + 7); break;
                case 'monthly': d.setMonth(d.getMonth() + 1); break;
            }
            nextDeductionDate = d.toISOString().split('T')[0];
        }

        const loan = await Loan.create({
            user_id: req.user.id,
            amount,
            purpose: purpose || 'General',
            duration,
            status: isApproved ? 'approved' : 
                    aiResult.approval_status === 'REJECTED' ? 'rejected' : 'pending',
            risk_score: aiResult.risk_score,
            monthly_income: monthlyIncome || 0,
            existing_debt: existingDebt || 0,
            ai_decision: aiResult,
            deduction_amount: isApproved ? (deductionAmount || null) : null,
            deduction_period: isApproved ? (deductionPeriod || null) : null,
            paid_amount: 0,
            next_deduction_date: nextDeductionDate
        });

        res.status(201).json({
            msg: 'Loan application submitted successfully',
            loan: {
                id: loan.id,
                user_id: loan.user_id,
                amount: parseFloat(loan.amount),
                purpose: loan.purpose,
                duration: loan.duration,
                status: loan.status,
                risk_score: parseFloat(loan.risk_score),
                ai_decision: loan.ai_decision,
                deduction_amount: loan.deduction_amount ? parseFloat(loan.deduction_amount) : null,
                deduction_period: loan.deduction_period,
                next_deduction_date: loan.next_deduction_date,
                created_at: loan.created_at
            }
        });
    } catch (err) {
        console.error('Loan application error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getLoans = async (req, res) => {
    try {
        const loans = await Loan.findByUserId(req.user.id);
        
        res.json({
            loans: loans.map(loan => ({
                id: loan.id,
                user_id: loan.user_id,
                amount: parseFloat(loan.amount),
                purpose: loan.purpose,
                duration: loan.duration,
                status: loan.status,
                risk_score: parseFloat(loan.risk_score),
                ai_decision: loan.ai_decision,
                deduction_amount: loan.deduction_amount ? parseFloat(loan.deduction_amount) : null,
                deduction_period: loan.deduction_period,
                paid_amount: parseFloat(loan.paid_amount || 0),
                next_deduction_date: loan.next_deduction_date,
                total_amount: parseFloat(loan.total_amount || (parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate || 10) / 100))),
                interest_rate: parseFloat(loan.interest_rate || 10),
                due_date: loan.due_date,
                created_at: loan.created_at
            }))
        });
    } catch (err) {
        console.error('Get loans error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getLoanById = async (req, res) => {
    try {
        const { loanId } = req.params;
        const loan = await Loan.findById(loanId);

        if (!loan || loan.user_id !== req.user.id) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        res.json({
            loan: {
                id: loan.id,
                user_id: loan.user_id,
                amount: parseFloat(loan.amount),
                purpose: loan.purpose,
                duration: loan.duration,
                status: loan.status,
                risk_score: parseFloat(loan.risk_score),
                ai_decision: loan.ai_decision,
                deduction_amount: loan.deduction_amount ? parseFloat(loan.deduction_amount) : null,
                deduction_period: loan.deduction_period,
                paid_amount: parseFloat(loan.paid_amount || 0),
                next_deduction_date: loan.next_deduction_date,
                total_amount: parseFloat(loan.total_amount || (parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate || 10) / 100))),
                interest_rate: parseFloat(loan.interest_rate || 10),
                due_date: loan.due_date,
                created_at: loan.created_at
            }
        });
    } catch (err) {
        console.error('Get loan error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.updateLoanStatus = async (req, res) => {
    try {
        const { loanId, status, riskScore } = req.body;

        if (!loanId || !status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid request parameters' });
        }

        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        await Loan.updateStatus(loanId, status, riskScore);

        res.json({ msg: 'Loan status updated successfully', status });
    } catch (err) {
        console.error('Update loan error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const userId = req.user.id;

        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        if (loan.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized to delete this loan' });
        }

        if (loan.status !== 'pending') {
            return res.status(400).json({ msg: 'Can only delete pending loan applications' });
        }

        const deleted = await Loan.delete(loanId, userId);

        if (!deleted) {
            return res.status(404).json({ msg: 'Loan not found or already deleted' });
        }

        res.json({ msg: 'Loan application deleted successfully' });
    } catch (err) {
        console.error('Delete loan error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.checkEligibility = async (req, res) => {
    try {
        const { monthlyIncome, existingDebt } = req.body;
        const income = Number(monthlyIncome);
        const debt = Number(existingDebt);
        
        const eligible = debt < income * 0.5;
        const eligibleAmount = Math.min(income * 6, 500000);
        
        res.json({
            eligible,
            eligibleAmount: eligible ? Math.round(eligibleAmount) : 0,
            riskScore: Math.max(10, Math.min(90, 75 - (debt / income) * 20)),
            interestRate: 12.5,
            monthlyPayment: Math.round(eligibleAmount / 24),
            message: eligible
              ? 'Great news! You qualify for a loan based on your financial profile.'
              : 'Your existing debt is too high. Reduce it to improve eligibility.'
        });
    } catch (err) {
        console.error('Check eligibility error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.requestExtension = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { extraDays } = req.body;

        if (!extraDays || extraDays <= 0 || extraDays > 365) {
            return res.status(400).json({ msg: 'Invalid extension days (1-365)' });
        }

        const loan = await Loan.findById(loanId);
        if (!loan || loan.user_id !== req.user.id) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        if (loan.status !== 'approved' && loan.status !== 'disbursed') {
            return res.status(400).json({ msg: 'Can only extend active loans' });
        }

        const result = await Loan.requestExtension(loanId, extraDays);

        res.json({
            msg: result.approved ? 'Extension approved' : 'Extension denied',
            data: result
        });
    } catch (err) {
        console.error('Request extension error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getLoanProgress = async (req, res) => {
    try {
        const { loanId } = req.params;
        const loan = await Loan.getWithProgress(loanId);

        if (!loan || loan.user_id !== req.user.id) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        res.json({ data: loan });
    } catch (err) {
        console.error('Get loan progress error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.makePayment = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid payment amount' });
        }

        const loan = await Loan.findById(loanId);
        if (!loan || loan.user_id !== req.user.id) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        if (loan.status !== 'approved' && loan.status !== 'active' && loan.status !== 'disbursed') {
            return res.status(400).json({ msg: 'Can only pay active loans' });
        }

        const User = require('../models/User');
        const currentBalance = await User.getBalance(req.user.id);
        const amountNum = parseFloat(amount);

        if (currentBalance < amountNum) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        const newBalance = currentBalance - amountNum;
        await User.updateBalance(req.user.id, newBalance);

        const result = await Loan.recordPayment(loanId, amountNum);

        const connection = global.dbConnection;
        const refNumber = 'LP' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
        await connection.execute(
            `INSERT INTO transactions (user_id, type, amount, description, status, reference_number, balance_before, balance_after, created_at)
             VALUES (?, 'loan_repayment', ?, ?, 'completed', ?, ?, ?, NOW())`,
            [req.user.id, amountNum, `Loan repayment for Loan #${loanId}`, refNumber, currentBalance, newBalance]
        );

        await connection.execute(
            `INSERT INTO loan_repayments (loan_id, user_id, amount, method, status)
             VALUES (?, ?, ?, 'bank_transfer', 'completed')`,
            [loanId, req.user.id, amountNum]
        );

        res.json({
            msg: result.isCompleted ? 'Loan fully paid!' : 'Payment recorded successfully',
            data: result
        });
    } catch (err) {
        console.error('Loan payment error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.setDeduction = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { deductionAmount, deductionPeriod } = req.body;

        if (!deductionAmount || deductionAmount <= 0) {
            return res.status(400).json({ msg: 'Invalid deduction amount' });
        }

        if (!['daily', 'weekly', 'monthly'].includes(deductionPeriod)) {
            return res.status(400).json({ msg: 'Invalid deduction period. Use daily, weekly, or monthly' });
        }

        const loan = await Loan.findById(loanId);
        if (!loan || loan.user_id !== req.user.id) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        if (loan.status !== 'approved' && loan.status !== 'active' && loan.status !== 'disbursed') {
            return res.status(400).json({ msg: 'Can only set deduction for active loans' });
        }

        await Loan.setDeductionSchedule(loanId, deductionAmount, deductionPeriod);

        res.json({ msg: 'Deduction schedule set successfully' });
    } catch (err) {
        console.error('Set deduction error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const { loanId } = req.params;
        const loan = await Loan.findById(loanId);

        if (!loan || loan.user_id !== req.user.id) {
            return res.status(404).json({ msg: 'Loan not found' });
        }

        const connection = global.dbConnection;
        const [payments] = await connection.execute(`
            SELECT id, amount, type, status, description, reference_number, created_at
            FROM transactions
            WHERE user_id = ? AND type = 'loan_repayment' AND description LIKE ?
            ORDER BY created_at DESC
        `, [req.user.id, `%Loan #${loanId}%`]);

        const [repayments] = await connection.execute(`
            SELECT id, amount, payment_date AS created_at, method, status
            FROM loan_repayments
            WHERE loan_id = ?
            ORDER BY payment_date DESC
        `, [loanId]);

        res.json({
            data: {
                transactions: payments,
                repayments: repayments
            }
        });
    } catch (err) {
        console.error('Get payment history error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

module.exports = exports;
