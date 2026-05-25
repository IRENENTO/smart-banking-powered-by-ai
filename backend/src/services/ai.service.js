const axios = require('axios');
const { AI_ENGINE_URL, AI_ENGINE_API_KEY } = require('../config/env');

const AI_TIMEOUT = 10000;

const aiClient = axios.create({
    baseURL: AI_ENGINE_URL,
    timeout: AI_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': AI_ENGINE_API_KEY,
    }
});

const safeAICall = async (fn, fallback) => {
    try {
        return await fn();
    } catch (err) {
        console.warn(`[AI Engine] Unavailable (${err.message}) — using fallback`);
        return fallback();
    }
};

exports.predictLoan = async (data) => {
    return safeAICall(
        async () => {
            const { data: result } = await aiClient.post('/predict-loan', {
                income: data.income || data.monthlyIncome || 0,
                expenses: data.expenses || data.monthlyExpenses || 0,
                savings: data.savings || data.existingSavings || 0,
                loan_amount: data.loan_amount || data.amount || 0,
                credit_score: data.credit_score || 650,
                employment_status: data.employment_status || 'employed',
                transaction_history: data.transaction_history || []
            });
            return {
                success: true,
                risk_score: result.risk_score,
                approval_status: result.loan_approval ? 'APPROVED' : 'REJECTED',
                default_probability: result.default_probability,
                approval_probability: result.approval_probability,
                explanation: result.reason,
                ai_powered: true
            };
        },
        () => {
            const riskScore = ruleBasedRisk(data);
            return {
                success: true,
                risk_score: riskScore,
                approval_status: riskScore < 60 ? 'APPROVED' : riskScore < 75 ? 'REVIEW' : 'REJECTED',
                default_probability: riskScore / 100,
                explanation: riskScore < 60 ? 'Low risk profile.' : 'High risk detected.',
                ai_powered: false
            };
        }
    );
};

exports.detectFraud = async (data) => {
    return safeAICall(
        async () => {
            const { data: result } = await aiClient.post('/detect-fraud', {
                amount: data.amount || 0,
                location: data.location || 'unknown',
                device: data.device || 'unknown',
                frequency: data.frequency || 1,
                transaction_time: data.transaction_time || new Date().toISOString()
            });
            return {
                success: true,
                fraud_risk: result.fraud_risk,
                risk_percentage: result.risk_percentage,
                is_anomaly: result.is_anomaly,
                action_required: result.action_required,
                risk_flags: result.risk_flags,
                ai_powered: true
            };
        },
        () => {
            const amount = data.amount || 0;
            let riskPct = 10;
            if (amount > 500000) riskPct += 20;
            if (data.frequency > 10) riskPct += 15;
            const hour = new Date().getHours();
            if (hour < 4 || hour > 23) riskPct += 10;
            return {
                success: true,
                fraud_risk: riskPct < 25 ? 'LOW' : riskPct < 55 ? 'MEDIUM' : 'HIGH',
                risk_percentage: riskPct,
                is_anomaly: riskPct > 50,
                action_required: riskPct > 70,
                risk_flags: riskPct > 50 ? ['unusual_amount'] : [],
                ai_powered: false
            };
        }
    );
};

exports.predictSavings = async (data) => {
    return safeAICall(
        async () => {
            const { data: result } = await aiClient.post('/predict-savings', {
                monthly_income: data.income || data.monthlyIncome || 0,
                monthly_expenses: data.expenses || data.monthlyExpenses || 0,
                existing_savings: data.savings || data.existingSavings || 0,
                age: data.age || 30,
                num_dependents: data.dependents || 0,
                employment_type: data.employment_type || 'employed'
            });
            return {
                success: true,
                financial_health_score: result.financial_health_score,
                financial_health_rating: result.financial_health_rating,
                recommended_monthly_saving: result.recommended_monthly_saving,
                disposable_income: result.disposable_income,
                savings_rate_pct: result.savings_rate_pct,
                recommendations: result.recommendations,
                ai_powered: true
            };
        },
        () => {
            const income = data.income || data.monthlyIncome || 0;
            const expenses = data.expenses || data.monthlyExpenses || 0;
            const disposable = Math.max(0, income - expenses);
            return {
                success: true,
                financial_health_score: 60,
                financial_health_rating: 'Fair',
                recommended_monthly_saving: Math.round(disposable * 0.2),
                disposable_income: disposable,
                savings_rate_pct: income > 0 ? Math.round((disposable / income) * 100) : 0,
                recommendations: ['Save at least 20% of your income monthly.'],
                ai_powered: false
            };
        }
    );
};

exports.analyzeSpending = async (transactions, monthlyIncome) => {
    return safeAICall(
        async () => {
            const { data: result } = await aiClient.post('/spending-analysis', {
                transactions: (transactions || []).map(tx => ({
                    amount: tx.amount,
                    category: tx.category || 'other',
                    description: tx.description || '',
                    date: tx.date || new Date().toISOString().split('T')[0],
                    type: tx.type || 'expense'
                })),
                monthly_income: monthlyIncome || 0
            });
            return {
                success: true,
                category_breakdown: result.category_breakdown || [],
                total_spent: result.total_spent || 0,
                total_income: result.monthly_income || result.total_income || 0,
                savings_rate: result.savings_rate || 0,
                top_spending_category: result.top_category || result.top_spending_category || 'N/A',
                spending_insights: result.spending_insight || result.spending_insights || 'No insights available.',
                recommendations: result.recommendations || [],
                ai_powered: true
            };
        },
        () => {
            const expenses = (transactions || []).filter(t => t.type === 'expense' || !t.type);
            const totalSpent = expenses.reduce((s, t) => s + Number(t.amount || 0), 0);
            const income = monthlyIncome || 0;
            return {
                success: true,
                category_breakdown: [],
                total_spent: totalSpent,
                total_income: income,
                savings_rate: income > 0 ? Math.max(0, Math.round((1 - totalSpent / income) * 100)) : 0,
                top_spending_category: 'N/A',
                spending_insights: ['Connect to AI Engine for detailed analysis.'],
                recommendations: ['Enable AI Engine for personalized spending insights.'],
                ai_powered: false
            };
        }
    );
};

exports.getRecommendations = async (data) => {
    return safeAICall(
        async () => {
            const { data: result } = await aiClient.post('/recommendations', {
                monthly_income: data.income || data.monthlyIncome || 0,
                monthly_expenses: data.expenses || data.monthlyExpenses || 0,
                existing_savings: data.savings || data.existingSavings || 0,
                age: data.age || 30,
                risk_tolerance: data.risk_tolerance || 'moderate',
                financial_goals: data.goals || data.financial_goals || ['savings'],
                employment_type: data.employment_type || 'employed'
            });
            const formatRecToStrings = (obj) => {
                if (!obj || typeof obj !== 'object') return [];
                const lines = [];
                if (obj.tips && Array.isArray(obj.tips)) lines.push(...obj.tips);
                if (obj.current_savings_rate) lines.push(`Current savings rate: ${obj.current_savings_rate}`);
                if (obj.recommended_savings_rate) lines.push(`Recommended savings rate: ${obj.recommended_savings_rate}`);
                if (obj.suggested_monthly_saving) lines.push(`Suggested monthly saving: RWF ${Number(obj.suggested_monthly_saving).toLocaleString()}`);
                if (obj.estimated_yearly_savings) lines.push(`Estimated yearly savings: RWF ${Number(obj.estimated_yearly_savings).toLocaleString()}`);
                return lines;
            };
            return {
                success: true,
                financial_health_summary: result.financial_health_summary,
                savings_recommendations: result.savings_recommendation ? formatRecToStrings(result.savings_recommendation) : [],
                investment_recommendations: result.investment_recommendation ? formatRecToStrings(result.investment_recommendation) : [],
                budgeting_advice: result.budgeting_recommendation ? formatRecToStrings(result.budgeting_recommendation) : [],
                sector_recommendations: result.sector_recommendations || [],
                priority_actions: result.priority_actions || [],
                ai_powered: true
            };
        },
        () => {
            const income = data.income || data.monthlyIncome || 0;
            const expenses = data.expenses || data.monthlyExpenses || 0;
            return {
                success: true,
                financial_health_summary: { score: 60, rating: 'Fair' },
                savings_recommendations: [`Save at least 20% (${Math.round(income * 0.2)} RWF) monthly.`],
                investment_recommendations: ['Consider low-risk options like savings accounts.'],
                budgeting_advice: ['Track expenses to identify savings opportunities.'],
                sector_recommendations: [],
                priority_actions: ['Build an emergency fund for 3-6 months of expenses.'],
                ai_powered: false
            };
        }
    );
};

exports.getModelStatus = async () => {
    return safeAICall(
        async () => {
            const { data } = await aiClient.get('/model-status');
            return {
                success: true,
                models: data.models || data,
                status: data.status || 'active',
                last_trained: data.last_trained,
                accuracy: data.accuracy,
                version: data.version,
                ai_powered: true
            };
        },
        () => ({
            success: true,
            models: [
                { name: 'loan_prediction', status: 'unavailable', message: 'AI Engine offline' },
                { name: 'fraud_detection', status: 'unavailable', message: 'AI Engine offline' },
                { name: 'savings_prediction', status: 'unavailable', message: 'AI Engine offline' },
                { name: 'spending_analysis', status: 'unavailable', message: 'AI Engine offline' }
            ],
            status: 'offline',
            ai_powered: false
        })
    );
};

exports.retrainModel = async (modelName) => {
    return safeAICall(
        async () => {
            const { data } = await aiClient.post('/retrain', {
                model: modelName || 'all'
            });
            return {
                success: true,
                message: data.message || 'Model retraining initiated',
                status: data.status || 'training',
                estimated_time: data.estimated_time || '5 minutes',
                ai_powered: true
            };
        },
        () => ({
            success: true,
            message: 'AI Engine unavailable. Cannot retrain models.',
            status: 'failed',
            ai_powered: false
        })
    );
};

exports.getEconomicForecast = async () => {
    return safeAICall(
        async () => {
            const { data } = await aiClient.get('/economic-forecast');
            return {
                inflation_rate: data.inflation_rate ?? 2.5,
                gdp_growth: data.gdp_growth ?? 3.2,
                market_sentiment: data.market_sentiment || 'positive',
                ai_powered: true,
                recommendations: data.recommendations || ['Market conditions stable.'],
            };
        },
        () => ({
            inflation_rate: 2.5,
            gdp_growth: 3.2,
            market_sentiment: 'positive',
            ai_powered: false,
            recommendations: ['Market conditions stable.'],
        })
    );
};

// ─── DEPRECATED ALIASES (backward compat) ──────────────────────────────────────

const ruleBasedRisk = (data) => {
    let score = 50;
    const income = data.monthlyIncome || data.income || 0;
    const debt = data.existingDebt || data.existing_debt || 0;
    const amount = data.amount || data.loan_amount || 0;
    const duration = data.duration || data.duration_months || 12;
    if (income > 0) {
        const dti = debt / income;
        if (dti > 0.5) score += 20;
        else if (dti > 0.3) score += 10;
        else if (dti < 0.1) score -= 10;
        const lti = amount / (income * duration + 1);
        if (lti > 2) score += 15;
        else if (lti > 1) score += 8;
        else score -= 5;
    }
    if (duration > 36) score += 5;
    else if (duration < 12) score -= 3;
    return Math.max(0, Math.min(100, score));
};

exports.analyzeLoanRisk = exports.predictLoan;
exports.analyzeLoanRiskLegacy = exports.predictLoan;
exports.generateInsightMessage = (transactionData, accountBalance) => {
    const messages = [];
    if (accountBalance > 50000) {
        messages.push({ type: 'investment', message: 'Your savings are growing! Consider exploring investment opportunities.' });
    }
    if (accountBalance < 5000) {
        messages.push({ type: 'alert', message: 'Your balance is getting low. Plan your next deposit.' });
    }
    if (transactionData && transactionData.total_withdrawals > transactionData.total_deposits * 0.9) {
        messages.push({ type: 'alert', message: 'Your spending is high relative to deposits. Consider budgeting.' });
    }
    return messages.length > 0 ? messages : [
        { type: 'recommendation', message: 'Keep up your savings habit to build financial security.' },
        { type: 'recommendation', message: 'Review your spending categories for savings opportunities.' }
    ];
};
