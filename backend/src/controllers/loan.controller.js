const Loan = require('../models/Loan');
const aiService = require('../services/ai.service');

exports.applyForLoan = async (req, res) => {
    const { amount, purpose, duration, monthlyIncome, existingDebt } = req.body;
    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid loan amount' });
        }

        if (!duration || duration <= 0) {
            return res.status(400).json({ msg: 'Invalid loan duration' });
        }

        // Get AI Decision
        const aiResult = await aiService.analyzeLoanRisk({
            amount,
            duration,
            monthlyIncome: monthlyIncome || 0,
            existingDebt: existingDebt || 0
        });

        // Create loan application
        const loan = await Loan.create({
            user_id: req.user.id,
            amount,
            purpose: purpose || 'General',
            duration,
            status: aiResult.approval_status === 'APPROVED' ? 'approved' : 
                    aiResult.approval_status === 'REJECTED' ? 'rejected' : 'pending',
            risk_score: aiResult.risk_score,
            monthly_income: monthlyIncome || 0,
            existing_debt: existingDebt || 0,
            ai_decision: aiResult
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
                created_at: loan.created_at
            }
        });
    } catch (err) {
        console.error('Get loan error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

// Admin endpoint to update loan status
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

module.exports = exports;
