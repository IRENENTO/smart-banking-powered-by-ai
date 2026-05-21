const aiService = require('../services/ai.service');

exports.predictLoanController = async (req, res) => {
    try {
        const { income, expenses, savings, loan_amount, credit_score, employment_status, transaction_history } = req.body;

        if (!loan_amount || loan_amount <= 0) {
            return res.status(400).json({ msg: 'Invalid loan amount' });
        }

        const result = await aiService.predictLoan({
            income,
            expenses,
            savings,
            loan_amount,
            credit_score,
            employment_status,
            transaction_history
        });

        res.json(result);
    } catch (err) {
        console.error('[AI Controller] predictLoan error:', err);
        res.status(500).json({ success: false, message: 'AI Engine unavailable', error: err.message });
    }
};

exports.detectFraudController = async (req, res) => {
    try {
        const { amount, location, device, frequency, transaction_time } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid transaction amount' });
        }

        const result = await aiService.detectFraud({
            amount,
            location,
            device,
            frequency,
            transaction_time
        });

        res.json(result);
    } catch (err) {
        console.error('[AI Controller] detectFraud error:', err);
        res.status(500).json({ success: false, message: 'AI Engine unavailable', error: err.message });
    }
};

exports.predictSavingsController = async (req, res) => {
    try {
        const { income, expenses, savings, age, dependents, employment_type } = req.body;

        const result = await aiService.predictSavings({
            income,
            expenses,
            savings,
            age,
            dependents,
            employment_type
        });

        res.json(result);
    } catch (err) {
        console.error('[AI Controller] predictSavings error:', err);
        res.status(500).json({ success: false, message: 'AI Engine unavailable', error: err.message });
    }
};

exports.analyzeSpendingController = async (req, res) => {
    try {
        const { transactions, monthly_income } = req.body;

        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({ msg: 'Transactions array is required' });
        }

        const result = await aiService.analyzeSpending(transactions, monthly_income);

        res.json(result);
    } catch (err) {
        console.error('[AI Controller] analyzeSpending error:', err);
        res.status(500).json({ success: false, message: 'AI Engine unavailable', error: err.message });
    }
};

exports.recommendationController = async (req, res) => {
    try {
        const { income, expenses, savings, age, risk_tolerance, goals, dependents, employment_type } = req.body;

        const result = await aiService.getRecommendations({
            income,
            expenses,
            savings,
            age,
            risk_tolerance,
            goals,
            dependents,
            employment_type
        });

        res.json(result);
    } catch (err) {
        console.error('[AI Controller] getRecommendations error:', err);
        res.status(500).json({ success: false, message: 'AI Engine unavailable', error: err.message });
    }
};

exports.modelStatusController = async (req, res) => {
    try {
        const result = await aiService.getModelStatus();
        res.json(result);
    } catch (err) {
        console.error('[AI Controller] modelStatus error:', err);
        res.status(500).json({ success: false, message: 'AI Engine unavailable', error: err.message });
    }
};

exports.retrainModelController = async (req, res) => {
    try {
        const { model } = req.body;
        const result = await aiService.retrainModel(model);
        res.json(result);
    } catch (err) {
        console.error('[AI Controller] retrainModel error:', err);
        res.status(500).json({ success: false, message: 'AI Engine unavailable', error: err.message });
    }
};
