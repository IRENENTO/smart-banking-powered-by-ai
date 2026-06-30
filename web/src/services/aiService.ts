import api from './api';

export interface LoanPredictionRequest {
    income?: number;
    expenses?: number;
    savings?: number;
    loan_amount: number;
    credit_score?: number;
    employment_status?: string;
    transaction_history?: any[];
}

export interface LoanPredictionResponse {
    success: boolean;
    risk_score: number;
    approval_status: 'APPROVED' | 'REJECTED' | 'REVIEW';
    approved?: boolean;
    prediction?: string;
    confidence?: number;
    risk?: string;
    default_probability: number;
    approval_probability: number;
    explanation: string;
    suggested_action?: string;
    ai_powered: boolean;
}

export interface FraudDetectionRequest {
    amount: number;
    location?: string;
    device?: string;
    frequency?: number;
    transaction_time?: string;
    time?: number;
}

export interface FraudDetectionResponse {
    success: boolean;
    fraud_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    risk_percentage: number;
    fraud_score?: number;
    risk_level?: string;
    confidence?: number;
    color?: string;
    is_anomaly: boolean;
    is_fraudulent?: boolean;
    reason?: string;
    action_required: boolean;
    risk_flags: string[];
    suggested_action?: string;
    location?: string;
    ai_powered: boolean;
}

export interface SavingsPredictionRequest {
    income?: number;
    expenses?: number;
    savings?: number;
    age?: number;
    dependents?: number;
    employment_type?: string;
}

export interface SavingsPredictionResponse {
    success: boolean;
    financial_health_score: number;
    financial_health_rating: string;
    recommended_monthly_saving: number;
    disposable_income: number;
    savings_rate_pct: number;
    recommendations: string[];
    ai_powered: boolean;
}

export interface RecommendationRequest {
    income?: number;
    expenses?: number;
    savings?: number;
    age?: number;
    risk_tolerance?: string;
    goals?: string[];
    dependents?: number;
    employment_type?: string;
}

export interface RecommendationResponse {
    success: boolean;
    financial_health_summary: any;
    savings_recommendations: string[];
    investment_recommendations: string[];
    budgeting_advice: string[];
    sector_recommendations: Array<{
        sector?: string;
        sector_name?: string;
        allocation?: string;
        reason?: string;
        expected_return?: string | number;
        risk_level?: string;
        growth_rate?: number;
    }>;
    priority_actions: string[];
    all_recommendations?: Array<{ title: string; confidence: number; priority: string; reason: string; expected_impact: string }>;
    total_predictions?: number;
    ai_powered: boolean;
}

export interface SpendingAnalysisResponse {
    success: boolean;
    category_breakdown: Array<{ name: string; value: number; category?: string; amount?: number; percentage?: number; transaction_count?: number }>;
    total_spent: number;
    total_income: number;
    savings_rate: number;
    top_spending_category: string;
    spending_insights: string[];
    recommendations: string[];
    insight?: string;
    summary?: string;
    ai_powered: boolean;
}

export interface MarketIntelligenceResponse {
    success: boolean;
    sector_predictions: Array<{
        sector: string;
        trend: string;
        expected_return: number;
        risk_level: string;
        growth_potential: string;
        recommendation: string;
    }>;
    market_summary: string;
    investment_advice: string[];
    ai_powered: boolean;
}

export interface AIDashboardResponse {
    success: boolean;
    models: Array<{
        model_name: string;
        available: boolean;
        size_kb: number;
        accuracy: number;
        precision: number;
        recall: number;
        f1_score: number;
        training_date: string;
        dataset_size: number;
        algorithm: string;
    }>;
    engine_status: string;
    model_version: string;
    total_predictions: number;
    ai_powered: boolean;
}

// ==================== FALLBACKS ====================

const getFallbackLoanResponse = (data: LoanPredictionRequest): LoanPredictionResponse => {
    const income = data.income || 0;
    const loanAmount = data.loan_amount || 0;
    let riskScore = 50;
    if (income > 0) {
        const dti = loanAmount / income;
        if (dti > 2) riskScore += 20;
        else if (dti > 1) riskScore += 10;
        else riskScore -= 10;
    }
    riskScore = Math.max(0, Math.min(100, riskScore));
    return {
        success: false,
        risk_score: riskScore,
        approval_status: riskScore < 60 ? 'APPROVED' : riskScore < 75 ? 'REVIEW' : 'REJECTED',
        approved: riskScore < 60,
        prediction: riskScore < 60 ? 'Approved' : 'Rejected',
        confidence: 100 - riskScore,
        risk: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High',
        default_probability: riskScore,
        approval_probability: 100 - riskScore,
        explanation: riskScore < 60 ? 'Based on your financial profile, you have good approval chances.' : 'High risk detected. Consider reducing loan amount.',
        suggested_action: riskScore < 60 ? 'Loan Approved' : 'Manual review recommended',
        ai_powered: false
    };
};

const getFallbackFraudResponse = (data: FraudDetectionRequest): FraudDetectionResponse => {
    const amount = data.amount || 0;
    let riskPct = 10;
    if (amount > 500000) riskPct += 20;
    if (data.frequency && data.frequency > 10) riskPct += 15;
    const hour = new Date().getHours();
    if (hour < 4 || hour > 23) riskPct += 10;
    riskPct = Math.min(100, riskPct);
    return {
        success: false,
        fraud_risk: riskPct < 25 ? 'LOW' : riskPct < 55 ? 'MEDIUM' : 'HIGH',
        risk_percentage: riskPct,
        fraud_score: riskPct,
        risk_level: riskPct < 25 ? 'LOW' : riskPct < 55 ? 'MEDIUM' : 'HIGH',
        confidence: riskPct,
        color: riskPct < 25 ? 'Green' : riskPct < 55 ? 'Yellow' : 'Red',
        is_anomaly: riskPct > 50,
        action_required: riskPct > 70,
        risk_flags: riskPct > 50 ? ['unusual_amount'] : [],
        suggested_action: riskPct > 70 ? 'Block transaction' : 'No action needed',
        ai_powered: false
    };
};

const getFallbackSavingsResponse = (data: SavingsPredictionRequest): SavingsPredictionResponse => {
    const income = data.income || 0;
    const expenses = data.expenses || 0;
    const disposable = Math.max(0, income - expenses);
    return {
        success: false,
        financial_health_score: 60,
        financial_health_rating: 'Fair',
        recommended_monthly_saving: Math.round(disposable * 0.2),
        disposable_income: disposable,
        savings_rate_pct: income > 0 ? Math.round((disposable / income) * 100) : 0,
        recommendations: ['Save at least 20% of your income monthly.'],
        ai_powered: false
    };
};

const getFallbackRecommendationsResponse = (data: RecommendationRequest): RecommendationResponse => {
    const income = data.income || 0;
    const expenses = data.expenses || 0;
    return {
        success: false,
        financial_health_summary: { score: 60, rating: 'Fair' },
        savings_recommendations: [`Save at least 20% (${Math.round(income * 0.2)} RWF) monthly.`],
        investment_recommendations: ['Consider low-risk options like savings accounts.'],
        budgeting_advice: ['Track expenses to identify savings opportunities.'],
        sector_recommendations: [],
        priority_actions: ['Build an emergency fund for 3-6 months of expenses.'],
        ai_powered: false
    };
};

const getFallbackSpendingResponse = (transactions: any[], monthlyIncome?: number): SpendingAnalysisResponse => {
    const isExpense = (t: any) => {
        if (t.balance_before != null && t.balance_after != null) return Number(t.balance_after) < Number(t.balance_before);
        return ['payment', 'withdrawal', 'withdraw', 'expense'].includes(t.type);
    };
    const expenses = (transactions || []).filter(t => isExpense(t));
    const totalSpent = expenses.reduce((s, t) => s + Number(t.amount || 0), 0);
    const income = monthlyIncome || 1;
    const catMap: Record<string, number> = {};
    expenses.forEach(t => {
        const cat = t.category || t.type || 'other';
        catMap[cat] = (catMap[cat] || 0) + Number(t.amount || 0);
    });
    const category_breakdown = Object.entries(catMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    return {
        success: false,
        category_breakdown,
        total_spent: totalSpent,
        total_income: income,
        savings_rate: income > 0 ? Math.max(0, Math.round((1 - totalSpent / income) * 100)) : 0,
        top_spending_category: category_breakdown[0]?.name || 'N/A',
        spending_insights: ['Connect to AI Engine for detailed analysis.'],
        recommendations: ['Enable AI Engine for personalized spending insights.'],
        ai_powered: false
    };
};

// ==================== API FUNCTIONS ====================

export const predictLoan = async (data: LoanPredictionRequest): Promise<LoanPredictionResponse> => {
    try {
        const response = await api.post('/ai/predict-loan', data);
        return response.data;
    } catch (error) {
        console.error('Loan prediction failed, using fallback:', error);
        return getFallbackLoanResponse(data);
    }
};

export const detectFraud = async (data: FraudDetectionRequest): Promise<FraudDetectionResponse> => {
    try {
        const response = await api.post('/ai/detect-fraud', data);
        return response.data;
    } catch (error) {
        console.error('Fraud detection failed, using fallback:', error);
        return getFallbackFraudResponse(data);
    }
};

export const predictSavings = async (data: SavingsPredictionRequest): Promise<SavingsPredictionResponse> => {
    try {
        const response = await api.post('/ai/predict-savings', data);
        return response.data;
    } catch (error) {
        console.error('Savings prediction failed, using fallback:', error);
        return getFallbackSavingsResponse(data);
    }
};

export const analyzeSpending = async (transactions: any[], monthlyIncome?: number): Promise<SpendingAnalysisResponse> => {
    try {
        const response = await api.post('/ai/spending-analysis', { transactions, monthly_income: monthlyIncome });
        return response.data;
    } catch (error) {
        console.error('Spending analysis failed, using fallback:', error);
        return getFallbackSpendingResponse(transactions, monthlyIncome);
    }
};

export const getRecommendations = async (data: RecommendationRequest): Promise<RecommendationResponse> => {
    try {
        const response = await api.post('/ai/recommendations', data);
        return response.data;
    } catch (error) {
        console.error('Failed to get recommendations, using fallback:', error);
        return getFallbackRecommendationsResponse(data);
    }
};

export const getModelStatus = async () => {
    try {
        const response = await api.get('/ai/model-status');
        return response.data;
    } catch (error) {
        console.error('Failed to get model status:', error);
        return { success: false, status: 'offline', ai_powered: false, models: [] };
    }
};

export const retrainModel = async (model?: string) => {
    try {
        const response = await api.post('/ai/retrain', { model });
        return response.data;
    } catch (error) {
        console.error('Failed to retrain model:', error);
        return { success: false, message: 'AI Engine unavailable.', status: 'failed', ai_powered: false };
    }
};

export const getMarketIntelligence = async (): Promise<MarketIntelligenceResponse> => {
    try {
        const response = await api.post('/ai/market-intelligence', {});
        return response.data;
    } catch (error) {
        console.error('Failed to get market intelligence:', error);
        return {
            success: false,
            sector_predictions: [],
            market_summary: 'Market intelligence unavailable.',
            investment_advice: ['Connect to AI Engine for market intelligence.'],
            ai_powered: false
        };
    }
};

export const getAIDashboard = async (): Promise<AIDashboardResponse> => {
    try {
        const response = await api.get('/ai/ai-dashboard');
        return response.data;
    } catch (error) {
        console.error('Failed to get AI dashboard:', error);
        return {
            success: false,
            models: [],
            engine_status: 'offline',
            model_version: 'unknown',
            total_predictions: 0,
            ai_powered: false
        };
    }
};

export const getMarketPredictions = async () => {
    try {
        const response = await api.get('/admin/ai/analytics');
        return response.data;
    } catch (error) {
        console.error('Failed to get market predictions:', error);
        return { success: false, predictions: [], ai_powered: false };
    }
};

export const getSectorAnalytics = async () => {
    try {
        const response = await api.get('/admin/ai/risk-analysis');
        return response.data;
    } catch (error) {
        console.error('Failed to get sector analytics:', error);
        return { success: false, sectors: [], ai_powered: false };
    }
};

export const testAIConnection = async () => {
    try {
        const response = await api.get('/test-ai-connection');
        return response.data;
    } catch (error) {
        console.error('AI Engine connection test failed:', error);
        return { success: false, message: 'AI Engine unavailable', ai_powered: false };
    }
};

export const getAIEngineHealth = async () => {
    try {
        const response = await api.get('/ai-engine/status');
        return response.data;
    } catch (error) {
        console.error('AI Engine health check failed:', error);
        return { success: false, status: 'unhealthy', ai_powered: false };
    }
};
