const AIInsight = require('../models/AiInsight');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const aiService = require('../services/ai.service');

// Generate AI-enhanced insights based on transaction data
const generateDummyInsights = async (userId) => {
    const insights = [];

    try {
        const stats = await Transaction.getTransactionStats(userId);
        const balance = await User.getBalance(userId);

        const monthlyIncome = Math.max(1000, stats.total_deposits || 0);
        const monthlyExpenses = Math.max(0, (stats.total_withdrawals || 0) + (stats.total_payments || 0) + (stats.total_transfers || 0));

        const savingsPrediction = await aiService.predictSavings({
            monthly_income: monthlyIncome,
            monthly_expenses: monthlyExpenses || Math.max(1, monthlyIncome * 0.6),
            existing_savings: balance,
            debt_payments: 0,
            num_dependents: 0,
            employment_type: 'employed'
        });

        const forecast = await aiService.getEconomicForecast();

        insights.push({
            message: `AI says your financial health score is ${savingsPrediction.financial_health_score}. ${savingsPrediction.recommendations?.[0] || 'Keep your savings steady.'}`,
            type: 'recommendation'
        });

        if (monthlyExpenses > monthlyIncome * 0.75) {
            insights.push({
                message: 'Your spending is high this month. Trim discretionary costs to avoid pressure on your budget.',
                type: 'alert'
            });
        } else {
            insights.push({
                message: 'Expenses are under control. Continue using smart budgeting to keep your balance healthy.',
                type: 'recommendation'
            });
        }

        if (stats.pending_transactions > 0) {
            insights.push({
                message: `You have ${stats.pending_transactions} pending transactions. Review them to ensure there are no duplicates.`,
                type: 'alert'
            });
        }

        if (forecast.recommendations && forecast.recommendations.length > 0) {
            insights.push({
                message: `Market forecast: ${forecast.market_sentiment}. ${forecast.recommendations[0]}`,
                type: 'investment'
            });
        }

        if (balance < 10000) {
            insights.push({
                message: 'Your account balance is low. A small deposit today can improve your financial flexibility.',
                type: 'alert'
            });
        }

        insights.push({
            message: 'Build an emergency reserve equal to 3 months of expenses to reduce risk.',
            type: 'recommendation'
        });
    } catch (err) {
        console.error('Error generating insights:', err);
        insights.push({
            message: 'Welcome! Start making transactions to receive personalized insights.',
            type: 'recommendation'
        });
    }

    return insights;
};

exports.getInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const insights = await AIInsight.findByUserId(userId);

        res.json({
            insights: insights.map(insight => ({
                id: insight.id,
                message: insight.message,
                type: insight.type,
                is_read: insight.is_read,
                created_at: insight.created_at
            }))
        });
    } catch (err) {
        console.error('Get insights error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.generateInsights = async (req, res) => {
    try {
        const userId = req.user.id;

        // Generate dummy insights
        const generatedInsights = await generateDummyInsights(userId);

        // Save insights to database
        const savedInsights = [];
        for (const insight of generatedInsights) {
            const savedInsight = await AIInsight.create({
                user_id: userId,
                message: insight.message,
                type: insight.type
            });
            savedInsights.push(savedInsight);
        }

        res.json({
            msg: 'Insights generated successfully',
            insights: savedInsights.map(insight => ({
                id: insight.id,
                message: insight.message,
                type: insight.type,
                is_read: insight.is_read,
                created_at: insight.created_at
            }))
        });
    } catch (err) {
        console.error('Generate insights error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { insightId } = req.params;
        const userId = req.user.id;

        const insight = await AIInsight.findById(insightId);
        if (!insight || insight.user_id !== userId) {
            return res.status(404).json({ msg: 'Insight not found' });
        }

        await AIInsight.markAsRead(insightId);

        res.json({ msg: 'Insight marked as read' });
    } catch (err) {
        console.error('Mark as read error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.deleteInsight = async (req, res) => {
    try {
        const { insightId } = req.params;
        const userId = req.user.id;

        const insight = await AIInsight.findById(insightId);
        if (!insight || insight.user_id !== userId) {
            return res.status(404).json({ msg: 'Insight not found' });
        }

        await AIInsight.delete(insightId);

        res.json({ msg: 'Insight deleted successfully' });
    } catch (err) {
        console.error('Delete insight error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

module.exports = exports;
