const aiService = require('../services/ai.service');

const RWANA_SECTORS = [
    { id: 'agriculture', name: 'Agriculture', risk: 'low', growth: 16, trend: 'up' },
    { id: 'technology', name: 'Technology', risk: 'medium', growth: 22, trend: 'up' },
    { id: 'transport', name: 'Transport', risk: 'medium', growth: 8, trend: 'stable' },
    { id: 'retail', name: 'Retail', risk: 'high', growth: 5, trend: 'down' },
    { id: 'realestate', name: 'Real Estate', risk: 'low', growth: 12, trend: 'up' },
    { id: 'manufacturing', name: 'Manufacturing', risk: 'medium', growth: 10, trend: 'stable' },
    { id: 'energy', name: 'Energy', risk: 'low', growth: 18, trend: 'up' },
    { id: 'healthcare', name: 'Healthcare', risk: 'low', growth: 14, trend: 'up' },
];

const MARKET_TRENDS_HISTORY = [
    { month: 'Jan', agriculture: 12, technology: 18, transport: 5, retail: 8, realestate: 10 },
    { month: 'Feb', agriculture: 14, technology: 20, transport: 6, retail: 6, realestate: 11 },
    { month: 'Mar', agriculture: 13, technology: 21, transport: 7, retail: 7, realestate: 12 },
    { month: 'Apr', agriculture: 15, technology: 19, transport: 5, retail: 5, realestate: 10 },
    { month: 'May', agriculture: 16, technology: 22, transport: 8, retail: 5, realestate: 12 },
    { month: 'Jun', agriculture: 16, technology: 22, transport: 8, retail: 5, realestate: 12 },
];

exports.predictMarket = async (req, res) => {
    try {
        const { sector, region, amount } = req.body;
        const sectorInfo = RWANA_SECTORS.find(s => s.id === sector || s.name.toLowerCase() === (sector || '').toLowerCase());

        let aiPrediction = null;
        try {
            const loanResult = await aiService.analyzeLoanRisk({
                amount: amount || 500000,
                monthlyIncome: region === 'kigali' ? 500000 : region === 'urban' ? 350000 : 200000,
                duration: 12,
                existingDebt: 0,
                age: 30,
                num_dependents: 2,
                employment_type: 'employed',
                credit_history: 1,
            });
            aiPrediction = {
                risk_score: loanResult.risk_score,
                approval_status: loanResult.approval_status,
                ai_powered: loanResult.ai_powered,
            };
        } catch (e) {
            aiPrediction = { risk_score: 35, approval_status: 'APPROVED', ai_powered: false };
        }

        const sectorGrowth = sectorInfo ? sectorInfo.growth : 10 + Math.round(Math.random() * 15);
        const trendDirection = sectorInfo ? sectorInfo.trend : 'stable';
        const growthProbability = sectorInfo?.risk === 'low' ? 85 : sectorInfo?.risk === 'medium' ? 65 : 45;

        res.json({
            success: true,
            data: {
                sector: sectorInfo?.name || sector || 'General',
                region: region || 'Rwanda',
                investment_amount: amount || 0,
                risk_level: sectorInfo?.risk || 'medium',
                expected_return: `${sectorGrowth > 0 ? '+' : ''}${sectorGrowth}%`,
                trend: trendDirection,
                growth_probability: growthProbability,
                recommendation: growthProbability >= 70 ? 'GOOD INVESTMENT' : growthProbability >= 50 ? 'CONSIDER WITH CAUTION' : 'HIGH RISK',
                risk_score: aiPrediction?.risk_score || 35,
                ai_confidence: aiPrediction?.ai_powered ? 'HIGH' : 'MEDIUM',
                insight: sectorInfo
                    ? `${sectorInfo.name} sector in ${region || 'Rwanda'} shows ${trendDirection === 'up' ? 'strong' : trendDirection === 'stable' ? 'steady' : 'declining'} momentum with ${sectorGrowth}% expected returns.`
                    : `Market analysis for ${sector || 'selected sector'} indicates growth potential.`,
                ai_powered: aiPrediction?.ai_powered || false,
            }
        });
    } catch (error) {
        console.error('Market prediction error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate market prediction' });
    }
};

exports.getMarketTrends = async (req, res) => {
    try {
        let forecastData = null;
        try {
            forecastData = await aiService.getEconomicForecast();
        } catch (e) {
            forecastData = null;
        }

        res.json({
            success: true,
            data: {
                trends: MARKET_TRENDS_HISTORY,
                economic_indicators: {
                    inflation_rate: forecastData?.inflation_rate ?? 2.5,
                    gdp_growth: forecastData?.gdp_growth ?? 3.2,
                    market_sentiment: forecastData?.market_sentiment || 'positive',
                },
                sectors: RWANA_SECTORS.map(s => ({
                    id: s.id,
                    name: s.name,
                    risk: s.risk,
                    growth: s.growth,
                    trend: s.trend,
                })),
                ai_powered: forecastData?.ai_powered || false,
            }
        });
    } catch (error) {
        console.error('Market trends error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch market trends' });
    }
};

exports.getSectors = async (req, res) => {
    res.json({
        success: true,
        data: RWANA_SECTORS.map(s => ({
            ...s,
            description: getSectorDescription(s.id),
            opportunities: getSectorOpportunities(s.id),
        }))
    });
};

exports.getRecommendations = async (req, res) => {
    try {
        let aiRecs = null;
        try {
            aiRecs = await aiService.getRecommendations({
                monthly_income: 500000,
                monthly_expenses: 250000,
                existing_savings: 1000000,
                risk_tolerance: 'moderate',
                age: 30,
            });
        } catch (e) {
            aiRecs = null;
        }

        res.json({
            success: true,
            data: {
                investment_recommendations: aiRecs?.investment_recommendations || [
                    'Agriculture sector offers stable returns with low risk',
                    'Technology startups show high growth potential in Kigali',
                    'Real estate in developing zones provides long-term value',
                ],
                sector_allocations: [
                    { sector: 'Agriculture', allocation: 35, rationale: 'Stable demand and government support' },
                    { sector: 'Technology', allocation: 25, rationale: 'High growth potential in fintech' },
                    { sector: 'Real Estate', allocation: 20, rationale: 'Steady appreciation in urban areas' },
                    { sector: 'Energy', allocation: 20, rationale: 'Renewable energy initiatives gaining traction' },
                ],
                priority_actions: aiRecs?.priority_actions || [
                    'Diversify across at least 3 sectors to minimize risk',
                    'Monitor agriculture seasonal trends for optimal entry',
                    'Consider government-backed investment incentives',
                ],
                market_outlook: 'positive',
                ai_powered: aiRecs?.ai_powered || false,
            }
        });
    } catch (error) {
        console.error('Market recommendations error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
    }
};

exports.getRiskAnalysis = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                sectors: RWANA_SECTORS.map(s => ({
                    name: s.name,
                    risk_level: s.risk,
                    risk_score: s.risk === 'low' ? Math.round(15 + Math.random() * 15) : s.risk === 'medium' ? Math.round(40 + Math.random() * 20) : Math.round(65 + Math.random() * 20),
                    volatility: s.risk === 'low' ? 'Low' : s.risk === 'medium' ? 'Medium' : 'High',
                    factors: getRiskFactors(s.id),
                    recommendation: getRiskRecommendation(s.risk),
                })),
                overall_market_risk: 'moderate',
                ai_insight: 'Market conditions favor low-risk sectors. Consider agriculture and energy for stable returns.',
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch risk analysis' });
    }
};

exports.getFraudAlerts = async (req, res) => {
    try {
        const alerts = [];
        const types = ['suspicious_transaction', 'abnormal_spending', 'new_device_login', 'large_withdrawal', 'international_transfer'];
        const severities = ['low', 'medium', 'high', 'critical'];
        const statuses = ['pending_review', 'investigating', 'resolved'];

        for (let i = 0; i < 5; i++) {
            alerts.push({
                id: `alert_${i + 1}`,
                type: types[Math.floor(Math.random() * types.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                amount: Math.round(50000 + Math.random() * 2000000),
                description: getFraudDescription(types[Math.floor(Math.random() * types.length)]),
                timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
                user_email: `user${i + 1}@example.com`,
                region: ['Kigali', 'Eastern', 'Western', 'Northern', 'Southern'][Math.floor(Math.random() * 5)],
            });
        }

        res.json({
            success: true,
            data: { alerts, total: alerts.length, critical_count: alerts.filter(a => a.severity === 'critical').length }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch fraud alerts' });
    }
};

function getSectorDescription(id) {
    const map = {
        agriculture: 'Crop farming, livestock, and agri-processing value chains',
        technology: 'Fintech, software, and digital services innovation hub',
        transport: 'Logistics, public transport, and supply chain operations',
        retail: 'Wholesale and retail trade across urban and rural markets',
        realestate: 'Residential and commercial property development',
        manufacturing: 'Food processing, textiles, and light manufacturing',
        energy: 'Renewable energy, hydroelectric, and solar initiatives',
        healthcare: 'Medical services, pharmaceuticals, and health tech',
    };
    return map[id] || 'Emerging sector with growth potential';
}

function getSectorOpportunities(id) {
    const map = {
        agriculture: ['Food processing plants', 'Export-oriented farming', 'Cold chain logistics'],
        technology: ['Mobile payment solutions', 'E-learning platforms', 'Agri-tech innovations'],
        transport: ['Electric vehicle adoption', 'Last-mile delivery', 'Smart logistics'],
        retail: ['E-commerce platforms', 'Niche product stores', 'Rural distribution networks'],
        realestate: ['Affordable housing', 'Commercial hubs in developing zones', 'Smart city projects'],
        manufacturing: ['Packaging industry', 'Textile production', 'Construction materials'],
        energy: ['Solar home systems', 'Mini-grid development', 'Energy efficient appliances'],
        healthcare: ['Telemedicine', 'Diagnostic centers', 'Health insurance tech'],
    };
    return map[id] || ['Market research', 'Strategic partnerships', 'Innovation hubs'];
}

function getRiskFactors(id) {
    const map = {
        agriculture: ['Weather dependency', 'Seasonal demand fluctuations', 'Export market prices'],
        technology: ['Rapid obsolescence', 'Talent retention', 'Regulatory changes'],
        transport: ['Fuel price volatility', 'Infrastructure gaps', 'Competition from informal sector'],
        retail: ['Import competition', 'Thin profit margins', 'Supply chain disruptions'],
        realestate: ['Interest rate sensitivity', 'Construction delays', 'Property valuation risks'],
        manufacturing: ['Raw material costs', 'Energy reliability', 'Skilled labor shortage'],
        energy: ['Regulatory approvals', 'Capital intensity', 'Technology transition'],
        healthcare: ['Regulatory compliance', 'Equipment costs', 'Insurance penetration'],
    };
    return map[id] || ['Market volatility', 'Economic conditions', 'Competitive pressures'];
}

function getRiskRecommendation(risk) {
    if (risk === 'low') return 'Consider allocating 30-40% of portfolio';
    if (risk === 'medium') return 'Limit exposure to 15-25% of portfolio with monitoring';
    return 'Limit to 5-10% of portfolio; consider hedging strategies';
}

function getFraudDescription(type) {
    const map = {
        suspicious_transaction: 'Unusual transaction pattern detected from new device',
        abnormal_spending: 'Spending volume significantly exceeds user historical average',
        new_device_login: 'Account accessed from unrecognized device',
        large_withdrawal: 'Large withdrawal amount exceeds typical user behavior',
        international_transfer: 'International transfer from atypical location',
    };
    return map[type] || 'Suspicious activity detected';
}
