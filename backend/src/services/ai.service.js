/**
 * ai.service.js
 * =============
 * Connects Node.js backend to the Python FastAPI AI Engine.
 * All predictions fall back to rule-based logic if the AI engine is offline.
 */

const axios = require('axios');
const { AI_ENGINE_URL } = require('../config/env');

const AI_BASE = AI_ENGINE_URL || 'http://localhost:8000';
const AI_TIMEOUT = 8000; // ms

const aiClient = axios.create({
    baseURL: AI_BASE,
    timeout: AI_TIMEOUT,
    headers: { 'Content-Type': 'application/json' }
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const safeAICall = async (fn, fallback) => {
    try {
        return await fn();
    } catch (err) {
        console.warn(`[AI Engine] Unavailable (${err.message}) — using fallback`);
        return fallback();
    }
};

// ─── LOAN RISK ANALYSIS ───────────────────────────────────────────────────────
const ruleBasedRisk = (loanData) => {
    let score = 50;
    if (loanData.monthlyIncome > 0) {
        const dti = loanData.existingDebt / loanData.monthlyIncome;
        if (dti > 0.5) score += 20;
        else if (dti > 0.3) score += 10;
        else if (dti < 0.1) score -= 10;

        const lti = loanData.amount / (loanData.monthlyIncome * loanData.duration + 1);
        if (lti > 2) score += 15;
        else if (lti > 1) score += 8;
        else score -= 5;
    }
    if (loanData.duration > 36) score += 5;
    else if (loanData.duration < 12) score -= 3;
    return Math.max(0, Math.min(100, score));
};

exports.analyzeLoanRisk = async (loanData) => {
    return safeAICall(
        async () => {
            const payload = {
                age:             loanData.age || 30,
                monthly_income:  loanData.monthlyIncome || loanData.monthly_income || 200000,
                loan_amount:     loanData.amount || loanData.loan_amount || 500000,
                duration_months: loanData.duration || loanData.duration_months || 12,
                existing_debt:   loanData.existingDebt || loanData.existing_debt || 0,
                num_dependents:  loanData.num_dependents || 0,
                employment_type: loanData.employment_type || 'employed',
                education:       loanData.education || 'secondary',
                credit_history:  loanData.credit_history ?? 1,
                collateral:      loanData.collateral ?? 0,
            };

            const { data } = await aiClient.post('/api/ai/predict-loan', payload);
            return {
                risk_score:      data.risk_score,
                approval_status: data.loan_approval ? 'APPROVED' : 'REJECTED',
                explanation:     data.reason,
                default_probability: data.default_probability,
                approval_probability: data.approval_probability,
                factors: {
                    debt_to_income: data.debt_to_income_ratio,
                    loan_amount:    payload.loan_amount,
                    monthly_income: payload.monthly_income,
                    duration:       payload.duration_months
                },
                ai_powered: true
            };
        },
        () => {
            const riskScore = ruleBasedRisk(loanData);
            const approved = riskScore < 60;
            return {
                risk_score: riskScore,
                approval_status: riskScore < 30 ? 'APPROVED' : riskScore < 60 ? 'APPROVED' : riskScore < 75 ? 'REVIEW' : 'REJECTED',
                explanation: approved ? 'Moderate risk. Approved with standard conditions.' : 'High risk. Please review manually.',
                default_probability: riskScore / 100,
                ai_powered: false
            };
        }
    );
};

// ─── FRAUD DETECTION ──────────────────────────────────────────────────────────
exports.detectFraud = async (transactionData) => {
    return safeAICall(
        async () => {
            const tx = transactionData;
            const payload = {
                amount:                 tx.amount || 0,
                hour_of_day:            tx.hour_of_day ?? new Date().getHours(),
                day_of_week:            tx.day_of_week ?? new Date().getDay(),
                transaction_count_24h:  tx.transaction_count_24h || 1,
                distance_from_home:     tx.distance_from_home || 0,
                is_international:       tx.is_international ? 1 : 0,
                account_age_days:       tx.account_age_days || 365,
                avg_tx_amount:          tx.avg_tx_amount || 40000,
                device_change:          tx.device_change ? 1 : 0,
            };

            const { data } = await aiClient.post('/api/ai/detect-fraud', payload);
            return {
                fraud_risk:        data.fraud_risk,
                risk_percentage:   data.risk_percentage,
                is_anomaly:        data.is_anomaly,
                action_required:   data.action_required,
                risk_flags:        data.risk_flags,
                ai_powered:        true
            };
        },
        () => {
            // Simple rule-based fallback
            const tx = transactionData;
            const hour = new Date().getHours();
            let riskPct = 10;
            if (hour < 4 || hour > 23) riskPct += 20;
            if (tx.amount > 500000) riskPct += 15;
            if (tx.is_international) riskPct += 15;
            const level = riskPct < 25 ? 'LOW' : riskPct < 55 ? 'MEDIUM' : 'HIGH';
            return { fraud_risk: level, risk_percentage: riskPct, ai_powered: false, action_required: level === 'HIGH' };
        }
    );
};

// ─── FINANCIAL HEALTH & SAVINGS ───────────────────────────────────────────────
exports.predictSavings = async (userData) => {
    return safeAICall(
        async () => {
            const payload = {
                age:              userData.age || 30,
                monthly_income:   userData.monthly_income || 300000,
                monthly_expenses: userData.monthly_expenses || 150000,
                num_dependents:   userData.num_dependents || 0,
                existing_savings: userData.existing_savings || 0,
                debt_payments:    userData.debt_payments || 0,
                investment_amount: userData.investment_amount || 0,
                employment_type:  userData.employment_type || 'employed',
                has_insurance:    userData.has_insurance ? 1 : 0,
            };

            const { data } = await aiClient.post('/api/ai/predict-savings', payload);
            return {
                financial_health_score:      data.financial_health_score,
                financial_health_rating:     data.financial_health_rating,
                recommended_monthly_saving:  data.recommended_monthly_saving,
                disposable_income:           data.disposable_income,
                savings_rate_pct:            data.savings_rate_pct,
                recommendations:             data.recommendations,
                ai_powered:                  true
            };
        },
        () => {
            const disposable = (userData.monthly_income || 300000) - (userData.monthly_expenses || 150000);
            return {
                financial_health_score: 60,
                financial_health_rating: 'Fair',
                recommended_monthly_saving: Math.max(0, Math.round(disposable * 0.20)),
                disposable_income: disposable,
                savings_rate_pct: 20,
                recommendations: ['Keep maintaining consistent savings habits.'],
                ai_powered: false
            };
        }
    );
};

// ─── ECONOMIC FORECAST (legacy) ───────────────────────────────────────────────
exports.getEconomicForecast = async () => {
    return safeAICall(
        async () => {
            const { data } = await aiClient.get('/economic-forecast');
            return data;
        },
        () => ({
            inflation_rate: 2.5,
            gdp_growth: 3.2,
            market_sentiment: 'positive',
            recommendations: [
                'Consider fixed-rate loans given current interest rate environment',
                'Strong market performance suggests good investment opportunities'
            ]
        })
    );
};

// ─── GENERATE INSIGHT MESSAGES ────────────────────────────────────────────────
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

// ─── LEGACY ALIAS ─────────────────────────────────────────────────────────────
exports.analyzeLoanRiskLegacy = exports.analyzeLoanRisk;

module.exports = exports;
