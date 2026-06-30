import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import { aiService, marketService } from '../services/api';
import * as aiEngine from '../services/aiService';
import { profileService } from '../services/api';
import { TrendingUp, AlertTriangle, Target, Sparkles, Brain, RefreshCw, Shield, DollarSign, Zap, ThumbsUp, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useBanking } from '../context/BankingContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

import MarketPredictionCard from '../components/MarketPredictionCard';
import InvestmentRecommendation from '../components/InvestmentRecommendation';
import SectorGrowthChart from '../components/SectorGrowthChart';
import RiskAnalyticsCard from '../components/RiskAnalyticsCard';
import AITrendCard from '../components/AITrendCard';
import FraudAlertCard from '../components/FraudAlertCard';
import MarketHeatmap from '../components/MarketHeatmap';
import AIInsightBanner from '../components/AIInsightBanner';
import FinancialHealthCard from '../components/FinancialHealthCard';
import SectorPerformanceTable from '../components/SectorPerformanceTable';

const AIInsights: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [insights, setInsights] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aiEngineOnline, setAiEngineOnline] = useState(false);

    const [modelAccuracy, setModelAccuracy] = useState<any>(null);

    const [marketData, setMarketData] = useState<any>(null);
    const [predictionInput, setPredictionInput] = useState({ sector: '', region: 'kigali', amount: 500000 });
    const [predictionResult, setPredictionResult] = useState<any>(null);
    const [predicting, setPredicting] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'predict' | 'insights' | 'fraud'>('dashboard');
    const [demoInvestments, setDemoInvestments] = useState<any[]>([]);
    const [investing, setInvesting] = useState(false);
    const { deposit, withdraw, refresh: refreshBankData } = useBanking();
    const toast = useToast();

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [insightsRes, modelStatus] = await Promise.all([
                aiService.getInsights().catch(() => ({ data: [] })),
                aiEngine.getModelStatus().catch(() => null),
            ]);

            const isOnline = modelStatus?.success && modelStatus?.status !== 'offline';
            setAiEngineOnline(isOnline);
            setModelAccuracy(modelStatus?.accuracy || null);

            const rawInsights = insightsRes?.data;
            const insightList: any[] = Array.isArray(rawInsights) ? rawInsights
                : Array.isArray(rawInsights?.insights) ? rawInsights.insights
                : rawInsights ? [rawInsights] : [];
            const seen = new Set<string>();
            const unique = insightList.filter(i => {
                const key = i.detail || i.message || '';
                if (seen.has(key) || !key) return false;
                seen.add(key);
                return true;
            });
            setInsights(unique.slice(0, 6));

            let healthData = { score: 60, rating: 'Fair', totalIncome: 0, totalExpenses: 0, savingsRate: 0, recommendations: ['Enable AI for personalized insights.'] as string[] };

            if (isOnline) {
                const [savingsData, recsData, fraudRes] = await Promise.all([
                    aiEngine.predictSavings({ income: 300000, expenses: 150000 }).catch(() => null),
                    aiEngine.getRecommendations({ income: 300000, expenses: 150000 }).catch(() => null),
                    marketService.getFraudAlerts().catch(() => ({ data: { data: null } })),
                ]);

                if (savingsData) {
                    healthData = {
                        score: savingsData.financial_health_score || 60,
                        rating: savingsData.financial_health_rating || 'Fair',
                        totalIncome: 300000,
                        totalExpenses: 150000,
                        savingsRate: savingsData.savings_rate_pct || 20,
                        recommendations: savingsData.recommendations || ['Maintain consistent savings habits.'],
                    };
                }

                const fraudData = fraudRes?.data?.data || fraudRes?.data;
                setMarketData({
                    trends: recsData?.sector_recommendations ? generateTrendData(recsData) : [],
                    sectors: generateSectors(recsData),
                    recommendations: recsData || null,
                    riskAnalysis: { sectors: generateRiskSectors(recsData), overall_market_risk: 'moderate', ai_insight: 'AI analysis available.' },
                    fraudAlerts: fraudData || DEMO_FRAUD_ALERTS,
                    economicIndicators: { inflation_rate: 2.5, gdp_growth: 3.2, market_sentiment: 'positive' },
                });
            } else {
                const fallbackSectors = generateSectors(null);
                setMarketData({
                    trends: generateTrendData(null),
                    sectors: fallbackSectors,
                    recommendations: null,
                    riskAnalysis: { sectors: generateRiskSectors(null), overall_market_risk: 'moderate', ai_insight: 'Connect AI Engine for detailed market analysis.' },
                    fraudAlerts: DEMO_FRAUD_ALERTS,
                    economicIndicators: { inflation_rate: 2.5, gdp_growth: 3.2, market_sentiment: 'positive' },
                });
            }

            setSummary(healthData);
        } catch (err) {
            console.error('Error fetching AI data:', err);
            setError('Some AI services are unavailable. Showing limited data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
        profileService.getProfile().then(res => {
            const addr = (res.data?.profile?.address || '').toLowerCase();
            const matched = Object.keys(RWANDA_DISTRICTS).find(d => addr.includes(d));
            if (matched) setPredictionInput(p => ({ ...p, region: matched }));
        }).catch(() => {});
    }, []);

    const generateTrendData = (recs: any) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const sectors = recs?.sector_recommendations || [];
        const data = months.map((month, i) => {
            const entry: any = { month };
            sectors.forEach((s: any, idx: number) => {
                const name = (s.sector_name || s.sector || '').toLowerCase().replace(/\s+/g, '');
                entry[name || `sector${idx}`] = 5 + Math.random() * 20 + i * 1.5;
            });
            if (sectors.length === 0) {
                entry.agriculture = 10 + Math.random() * 8 + i * 1.2;
                entry.technology = 15 + Math.random() * 10 + i * 1.8;
                entry.energy = 12 + Math.random() * 6 + i * 1.0;
            }
            return entry;
        });
        return data;
    };

    const SECTOR_DATA: Record<string, { risk: string; growth: number; trend: string; volatility: string; factors: string[]; recommendation: string }> = {
        agriculture: { risk: 'low', growth: 16, trend: 'up', volatility: 'Low', factors: ['Weather dependency', 'Seasonal demand', 'Export prices'], recommendation: 'Consider allocating 30-40% of portfolio' },
        technology: { risk: 'medium', growth: 22, trend: 'up', volatility: 'Medium', factors: ['Rapid obsolescence', 'Talent retention', 'Regulatory changes'], recommendation: 'Limit exposure to 15-25% of portfolio with monitoring' },
        transport: { risk: 'medium', growth: 8, trend: 'stable', volatility: 'Medium', factors: ['Fuel price volatility', 'Infrastructure gaps', 'Informal competition'], recommendation: 'Limit exposure to 15-25% of portfolio with monitoring' },
        retail: { risk: 'high', growth: 5, trend: 'down', volatility: 'High', factors: ['Import competition', 'Thin margins', 'Supply chain disruptions'], recommendation: 'Limit to 5-10% of portfolio; consider hedging' },
        realestate: { risk: 'low', growth: 12, trend: 'up', volatility: 'Low', factors: ['Interest rate sensitivity', 'Construction delays', 'Valuation risks'], recommendation: 'Consider allocating 30-40% of portfolio' },
        energy: { risk: 'low', growth: 18, trend: 'up', volatility: 'Low', factors: ['Regulatory approvals', 'Capital intensity', 'Technology transition'], recommendation: 'Consider allocating 30-40% of portfolio' },
        healthcare: { risk: 'low', growth: 14, trend: 'up', volatility: 'Low', factors: ['Regulatory compliance', 'Equipment costs', 'Insurance penetration'], recommendation: 'Consider allocating 30-40% of portfolio' },
        manufacturing: { risk: 'medium', growth: 10, trend: 'stable', volatility: 'Medium', factors: ['Raw material costs', 'Energy reliability', 'Skilled labor shortage'], recommendation: 'Limit exposure to 15-25% of portfolio with monitoring' },
        'government bonds': { risk: 'low', growth: 8, trend: 'stable', volatility: 'Low', factors: ['Interest rate changes', 'Inflation impact', 'Currency risk'], recommendation: 'Consider allocating 30-40% of portfolio' },
        'fixed deposits': { risk: 'low', growth: 6, trend: 'stable', volatility: 'Low', factors: ['Inflation erosion', 'Opportunity cost', 'Liquidity constraints'], recommendation: 'Consider allocating 30-40% of portfolio' },
        'real estate (reits)': { risk: 'low', growth: 12, trend: 'up', volatility: 'Low', factors: ['Property market cycles', 'Interest rate sensitivity', ' occupancy rates'], recommendation: 'Consider allocating 30-40% of portfolio' },
        'blue-chip stocks': { risk: 'low', growth: 14, trend: 'up', volatility: 'Low', factors: ['Market corrections', 'Sector downturns', 'Dividend cuts'], recommendation: 'Consider allocating 30-40% of portfolio' },
        'equity mutual funds': { risk: 'medium', growth: 16, trend: 'up', volatility: 'Medium', factors: ['Market volatility', 'Fund management risk', 'Expense ratios'], recommendation: 'Limit exposure to 15-25% of portfolio with monitoring' },
        'real estate': { risk: 'low', growth: 12, trend: 'up', volatility: 'Low', factors: ['Interest rate sensitivity', 'Construction delays', 'Valuation risks'], recommendation: 'Consider allocating 30-40% of portfolio' },
        'corporate bonds': { risk: 'low', growth: 9, trend: 'stable', volatility: 'Low', factors: ['Credit default risk', 'Interest rate changes', 'Liquidity risk'], recommendation: 'Consider allocating 30-40% of portfolio' },
        'tech & innovation': { risk: 'medium', growth: 22, trend: 'up', volatility: 'Medium', factors: ['Rapid obsolescence', 'Competition', 'Funding cycles'], recommendation: 'Limit exposure to 15-25% of portfolio with monitoring' },
        'tech startups': { risk: 'high', growth: 28, trend: 'up', volatility: 'High', factors: ['High burn rate', 'Market adoption', 'Regulatory hurdles'], recommendation: 'Limit to 5-10% of portfolio; consider hedging' },
        'emerging markets': { risk: 'high', growth: 18, trend: 'up', volatility: 'High', factors: ['Currency fluctuations', 'Political instability', 'Liquidity constraints'], recommendation: 'Limit to 5-10% of portfolio; consider hedging' },
        cryptocurrency: { risk: 'high', growth: 35, trend: 'up', volatility: 'High', factors: ['Regulatory uncertainty', 'Market manipulation', 'Security risks'], recommendation: 'Limit to 5-10% of portfolio; consider hedging' },
        'small-cap stocks': { risk: 'high', growth: 20, trend: 'up', volatility: 'High', factors: ['Low liquidity', 'Earnings volatility', 'Limited coverage'], recommendation: 'Limit to 5-10% of portfolio; consider hedging' },
        'real estate development': { risk: 'high', growth: 15, trend: 'up', volatility: 'High', factors: ['Construction delays', 'Financing risks', 'Market demand shifts'], recommendation: 'Limit to 5-10% of portfolio; consider hedging' },
    };

    const DEMO_FRAUD_ALERTS = {
        alerts: [
            ...Array.from({ length: 8 }, (_, i) => ({
                id: `fraud-demo-${i + 2}`,
                type: 'large_transaction',
                severity: 'medium' as const,
                status: 'pending',
                amount: 1000000,
                description: 'Large transaction of RWF 1,000,000 detected',
                timestamp: '2026-05-31T00:00:00.000Z',
                user_email: 'Unknown',
                region: 'Kigali',
            })),
            {
                id: 'fraud-demo-1',
                type: 'large_transaction',
                severity: 'high' as const,
                status: 'pending',
                amount: 5000001,
                description: 'Large transaction of RWF 5,000,001 detected',
                timestamp: '2026-06-01T00:00:00.000Z',
                user_email: 'Unknown',
                region: 'Kigali',
            },
        ],
        total: 9,
        critical_count: 1,
    };

    const RWANDA_DISTRICTS: Record<string, { businesses: string[]; description: string }> = {
        kigali: { businesses: ['Technology & Innovation', 'Financial Services', 'Real Estate', 'Retail & E-commerce', 'Hospitality & Tourism'], description: 'Capital city — the economic hub with a thriving tech and business ecosystem.' },
        gasabo: { businesses: ['Real Estate Development', 'Education & Training', 'Healthcare Services', 'Light Manufacturing'], description: 'Northern Kigali district with rapid residential and commercial expansion.' },
        kicukiro: { businesses: ['Logistics & Transport', 'Manufacturing', 'Trade & Commerce', 'Housing Development'], description: 'Southern Kigali — key industrial zone with airport proximity.' },
        nyarugenge: { businesses: ['Banking & Insurance', 'Wholesale Trade', 'Hospitality', 'Construction'], description: 'Central business district — heart of Kigali\'s commerce and government.' },
        bugesera: { businesses: ['Agri-processing', 'Logistics & Warehousing', 'Energy (Solar)', 'Lake Tourism'], description: 'Home to Bugesera International Airport — emerging logistics hub.' },
        gatsibo: { businesses: ['Crop Farming (Maize, Rice)', 'Livestock & Dairy', 'Agri-processing', 'Trade'], description: 'Agricultural powerhouse with large-scale farming initiatives.' },
        kayonza: { businesses: ['Agri-business', 'Tourism (Akagera Park)', 'Mining', 'Real Estate'], description: 'Gateway to Akagera National Park — tourism and agriculture blend.' },
        kirehe: { businesses: ['Cross-border Trade', 'Agriculture (Coffee, Maize)', 'Livestock', 'Mining'], description: 'Eastern district with strong cross-border trade with Tanzania.' },
        ngoma: { businesses: ['Agriculture (Bananas, Beans)', 'Livestock Farming', 'Small-scale Manufacturing', 'Trade'], description: 'Agrarian district with growing agro-processing potential.' },
        nyagatare: { businesses: ['Cattle Ranching', 'Dairy Processing', 'Mining (Tungsten)', 'Cross-border Trade'], description: 'Rwanda\'s largest district — premier cattle and dairy region.' },
        rwamagana: { businesses: ['Manufacturing & Industry', 'Agri-processing', 'Real Estate', 'Education'], description: 'Eastern province capital — industrial park and urban growth center.' },
        burera: { businesses: ['Lake Tourism (Lakes Burera & Ruhondo)', 'Potato Farming', 'Eco-tourism', 'Energy (Hydro)'], description: 'Stunning lake district — eco-tourism and high-altitude farming.' },
        gakenke: { businesses: ['Pyrethrum Farming', 'Potato & Wheat Production', 'Eco-tourism', 'Handicrafts'], description: 'High-altitude district known for pyrethrum and scenic landscapes.' },
        gicumbi: { businesses: ['Tea Plantations', 'Forestry', 'Tourism (Caves & Waterfalls)', 'Agriculture'], description: 'Northern district with tea estates and natural attractions.' },
        musanze: { businesses: ['Tourism (Volcanoes National Park)', 'Hospitality & Lodging', 'Gorilla Trekking', 'Agriculture (Irish Potatoes)'], description: 'Tourism capital — gateway to mountain gorillas and volcanoes.' },
        rulindo: { businesses: ['Real Estate (Kigali Commuter Belt)', 'Agriculture', 'Small-scale Manufacturing', 'Trade'], description: 'Growing commuter district adjacent to Kigali — residential boom.' },
        gisagara: { businesses: ['Irrigation Farming (Rice, Maize)', 'Mining (Cassiterite)', 'Cross-border Trade', 'Education'], description: 'Southern district with large irrigation schemes and mining.' },
        huye: { businesses: ['Education & Research', 'Technology (Innovation Hub)', 'Healthcare', 'Tea & Coffee Processing'], description: 'Home to University of Rwanda — education and research hub.' },
        kamonyi: { businesses: ['Agri-processing', 'Real Estate', 'Trade & Commerce', 'Forestry'], description: 'Central district benefiting from Kigali spillover growth.' },
        muhanga: { businesses: ['Agriculture (Maize, Beans)', 'Trade', 'Handicrafts', 'Agri-processing'], description: 'Southern province capital — growing service and trade center.' },
        nyamagabe: { businesses: ['Tea Plantations', 'Forestry & Timber', 'Tourism (Nyungwe Forest)', 'Horticulture'], description: 'Forest-rich district — gateway to Nyungwe National Park.' },
        nyanza: { businesses: ['Culture & Heritage Tourism', 'Dairy Farming', 'Handicrafts', 'Agriculture'], description: 'Historic royal capital — cultural tourism and dairy hub.' },
        nyaruguru: { businesses: ['Tea Growing', 'Eco-tourism', 'Agriculture (Maize, Wheat)', 'Cross-border Trade'], description: 'Southernmost district with tea estates and border trade.' },
        ruhango: { businesses: ['Trade & Commerce', 'Agriculture', 'Small-scale Industry', 'Healthcare'], description: 'Central district along the main Kigali-Huye corridor.' },
        karongi: { businesses: ['Lake Kivu Tourism', 'Coffee Plantations', 'Fishing', 'Eco-lodges'], description: 'Lake Kivu shoreline — tourism and coffee-growing district.' },
        ngororero: { businesses: ['Mining (Coltan, Cassiterite)', 'Agriculture (Maize, Beans)', 'Forestry', 'Handicrafts'], description: 'Mineral-rich district with significant mining operations.' },
        nyabihu: { businesses: ['Potato & Wheat Farming', 'Livestock', 'Cross-border Trade (DRC)', 'Mining'], description: 'Western highlands — potato belt with DRC border trade.' },
        nyamasheke: { businesses: ['Coffee Plantations (Specialty)', 'Lake Kivu Tourism', 'Fishing', 'Eco-tourism'], description: 'Renowned for specialty coffee — pristine Lake Kivu shoreline.' },
        rubavu: { businesses: ['Cross-border Trade (DRC/Goma)', 'Hospitality & Tourism', 'Real Estate', 'Transport & Logistics'], description: 'Busy border city — commercial hub for DRC trade.' },
        rusizi: { businesses: ['Trade (DRC/Burundi Border)', 'Tea & Coffee Processing', 'Tourism (Lake Kivu)', 'Energy (Methane)'], description: 'Tri-border district — strategic trade and energy hub.' },
        rutsiro: { businesses: ['Tea Plantations', 'Fishing', 'Eco-tourism', 'Agriculture'], description: 'Western district with tea estates and Lake Kivu access.' },
    };

    const lookupSectorData = (name: string) => {
        const key = name.toLowerCase().trim();
        return SECTOR_DATA[key] || SECTOR_DATA[key.replace(/[^a-z0-9 ]/g, '').trim()] || null;
    };

    const generateSectors = (recs: any) => {
        const sectors = recs?.sector_recommendations || [];
        if (sectors.length > 0) {
            return sectors.map((s: any, idx: number) => {
                const name = s.sector_name || s.sector || `Sector ${idx + 1}`;
                const lookup = lookupSectorData(name);
                return {
                    id: name.toLowerCase().replace(/\s+/g, '_') || `sector_${idx}`,
                    name,
                    risk: s.risk_level || lookup?.risk || 'medium',
                    growth: s.growth_rate || lookup?.growth || 10,
                    trend: s.trend || lookup?.trend || 'stable',
                };
            });
        }
        return [
            { id: 'agriculture', name: 'Agriculture', risk: 'low', growth: 16, trend: 'up' },
            { id: 'technology', name: 'Technology', risk: 'medium', growth: 22, trend: 'up' },
            { id: 'transport', name: 'Transport', risk: 'medium', growth: 8, trend: 'stable' },
            { id: 'retail', name: 'Retail', risk: 'high', growth: 5, trend: 'down' },
            { id: 'realestate', name: 'Real Estate', risk: 'low', growth: 12, trend: 'up' },
            { id: 'energy', name: 'Energy', risk: 'low', growth: 18, trend: 'up' },
        ];
    };

    let riskSectorCounter = 0;
    const generateRiskSectors = (recs: any) => {
        const sectors = recs?.sector_recommendations || [];
        if (sectors.length > 0) {
            return sectors.map((s: any) => {
                const name = s.sector_name || s.sector || `Sector ${++riskSectorCounter}`;
                const lookup = lookupSectorData(name);
                const risk = s.risk_level || lookup?.risk || 'medium';
                return {
                    name,
                    risk_level: risk,
                    risk_score: risk === 'low' ? 20 : risk === 'medium' ? 50 : 75,
                    volatility: s.volatility || lookup?.volatility || 'Medium',
                    factors: s.factors || lookup?.factors || [],
                    recommendation: s.recommendation || lookup?.recommendation || 'Monitor market conditions.',
                };
            });
        }
        return [];
    };

    useEffect(() => {
        if (!predictionInput.sector || !predictionInput.region) { setPredictionResult(null); return; }
        const timer = setTimeout(() => {
            setPredicting(true);
            try {
                const lookup = lookupSectorData(predictionInput.sector);
                setPredictionResult({
                    sector: predictionInput.sector,
                    region: RWANDA_DISTRICTS[predictionInput.region]?.description || predictionInput.region,
                    investment_amount: predictionInput.amount,
                    risk_level: lookup?.risk || 'medium',
                    expected_return: (lookup?.growth || 10) + '%',
                    trend: lookup?.trend || 'up',
                    growth_probability: lookup ? (lookup.risk === 'low' ? 85 : lookup.risk === 'medium' ? 65 : 45) : 72,
                    recommendation: lookup?.recommendation || 'GOOD INVESTMENT',
                    risk_score: lookup ? (lookup.risk === 'low' ? 20 : lookup.risk === 'medium' ? 50 : 75) : 40,
                    ai_confidence: aiEngineOnline ? 'HIGH' : 'MEDIUM',
                    insight: lookup?.recommendation || 'AI analysis indicates favorable conditions.',
                    ai_powered: aiEngineOnline,
                    districtBusinesses: RWANDA_DISTRICTS[predictionInput.region]?.businesses || [],
                });
            } catch { setPredictionResult(null); }
            finally { setPredicting(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [predictionInput.sector, predictionInput.amount, predictionInput.region]);

    const handleInvestNow = async () => {
        if (!predictionResult || investing) return;
        setInvesting(true);
        try {
            await withdraw(predictionInput.amount, `Investment: ${predictionResult.sector} in ${predictionInput.region}`);
            const returnPct = parseInt(predictionResult.expected_return) || 10;
            const newInvest = {
                id: 'demo-inv-' + Date.now(),
                sector: predictionResult.sector,
                amount: predictionInput.amount,
                expectedReturn: returnPct,
                duration: 12,
                risk: predictionResult.risk_level,
                createdAt: Date.now(),
                earned: 0,
                status: 'active',
            };
            setDemoInvestments(prev => [...prev, newInvest]);
            setPredictionResult(null);
            setPredictionInput(p => ({ ...p, sector: '' }));
            toast.success(`Invested RWF ${predictionInput.amount.toLocaleString()} in ${predictionResult.sector}`);
            await refreshBankData();
        } catch {
            toast.error('Investment failed. Check your balance.');
        } finally { setInvesting(false); }
    };

    useEffect(() => {
        if (demoInvestments.length === 0) return;
        const interval = setInterval(async () => {
            let totalPayout = 0;
            const updated = demoInvestments.map(inv => {
                if (inv.status !== 'active') return inv;
                const dailyReturn = inv.amount * (inv.expectedReturn / 100) / (inv.duration * 30);
                const newEarned = (inv.earned || 0) + dailyReturn;
                totalPayout += dailyReturn;
                const totalExpected = inv.amount * (inv.expectedReturn / 100);
                if (newEarned >= totalExpected) return { ...inv, earned: totalExpected, status: 'matured' };
                return { ...inv, earned: newEarned };
            });
            setDemoInvestments(updated);
            if (totalPayout > 0) {
                await deposit(totalPayout, 'Investment returns');
                await refreshBankData();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [demoInvestments.length]);

    const sectors = marketData?.sectors || [];
    const chartData = marketData?.trends || [];
    const aiPowered = marketData?.recommendations?.ai_powered || false;

    const sectorList = marketData?.riskAnalysis?.sectors || [];

    const bgStyle = isDark ? '#0B1F3A' : '#f8fafc';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const mutedColor = isDark ? '#94a3b8' : '#64748b';

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        background: isDark ? '#0f172a' : 'white', color: textColor, fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: 13, fontWeight: 600, color: mutedColor, marginBottom: 6,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: 24, background: bgStyle }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div>
                        <h1 style={{ color: textColor, margin: 0 }}>Rwanda Market Intelligence</h1>
                        <p style={{ color: mutedColor, marginTop: 8 }}>
                            AI-powered financial analytics and investment intelligence platform
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{
                            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                            background: aiEngineOnline ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: aiEngineOnline ? '#10b981' : '#f59e0b',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Brain size={14} />
                            AI Engine: {aiEngineOnline ? 'Online' : 'Fallback'}
                        </div>
                        {modelAccuracy && (
                            <div style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Target size={14} /> Accuracy: {modelAccuracy}%
                            </div>
                        )}
                        <button onClick={fetchAllData} style={{
                            padding: '8px 12px', borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                            background: isDark ? '#0f172a' : 'white', color: mutedColor, cursor: 'pointer',
                        }}>
                            <RefreshCw size={16} />
                        </button>
                        {(['dashboard', 'predict', 'insights', 'fraud'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
                                    background: activeTab === tab ? 'linear-gradient(135deg, #0A9396, #4ECDC4)' : isDark ? '#0f172a' : 'white',
                                    color: activeTab === tab ? 'white' : mutedColor,
                                    boxShadow: activeTab === tab ? '0 4px 15px rgba(10,147,150,0.3)' : 'none',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {tab === 'dashboard' && <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
                                {tab === 'predict' && <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
                                {tab === 'insights' && <Target size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
                                {tab === 'fraud' && <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div style={{
                        marginBottom: 20, padding: '14px 20px', borderRadius: 12,
                        background: isDark ? '#3b1c1c' : '#fef2f2',
                        border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}`,
                        color: isDark ? '#fca5a5' : '#991b1b', fontSize: 13, fontWeight: 500,
                    }}>
                        {error}
                    </div>
                )}

                <AIInsightBanner insights={
                    aiEngineOnline
                        ? (marketData?.recommendations?.priority_actions || ['AI insights available. Use the Predict tab for analysis.'])
                        : ['AI Engine offline. Showing estimated market data.', 'Connect to AI Engine for real-time predictions.']
                } />

                {activeTab === 'dashboard' && (
                    <>
                        <div style={{ display: 'grid', gap: 24, marginBottom: 24 }}>
                            <AITrendCard
                                indicators={marketData?.economicIndicators || { inflation_rate: 2.5, gdp_growth: 3.2, market_sentiment: 'positive' }}
                                aiPowered={aiPowered}
                                loading={loading}
                            />
                        </div>

                        {sectors.length > 0 && (
                            <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 24 }}>
                                <SectionCard title="Prediction Confidence">
                                    <div style={{ width: '100%', height: 200, marginTop: 8 }}>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                            <BarChart data={sectors.map((s: any) => ({ name: s.name, confidence: s.risk === 'low' ? 85 : s.risk === 'medium' ? 65 : 40 }))} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                                                <XAxis type="number" domain={[0, 100]} stroke={mutedColor} fontSize={12} />
                                                <YAxis dataKey="name" type="category" stroke={isDark ? '#cbd5e1' : '#334155'} width={140} fontSize={12} tickLine={false} />
                                                <Tooltip />
                                                <Bar dataKey="confidence" name="Confidence %">
                                                    {sectors.map((_: any, idx: number) => (<Cell key={idx} fill={['#0A9396', '#4ECDC4', '#F4A261', '#E76F51', '#2EC4B6', '#8B5CF6'][idx]} />))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </SectionCard>
                                <SectionCard title="Investment Opportunities">
                                    <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                                        {sectors.slice(0, 4).map((s: any, idx: number) => (
                                            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: isDark ? '#0f172a' : '#f8fafc' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.risk === 'low' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <DollarSign size={16} color={s.risk === 'low' ? '#10b981' : '#f59e0b'} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{s.name}</div>
                                                    <div style={{ fontSize: 12, color: mutedColor }}>Growth: +{s.growth}% &bull; {s.trend === 'up' ? 'Upward' : 'Stable'}</div>
                                                </div>
                                                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: s.risk === 'low' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: s.risk === 'low' ? '#10b981' : '#f59e0b' }}>{s.risk}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </SectionCard>
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', marginBottom: 24 }}>
                            <SectorGrowthChart data={chartData} loading={loading} />
                            <MarketHeatmap sectors={sectors} loading={loading} />
                        </div>

                        {sectors.length > 0 && (
                            <div style={{ display: 'grid', gap: 24, marginBottom: 24 }}>
                                <SectorPerformanceTable sectors={sectors} loading={loading} />
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
                            <RiskAnalyticsCard
                                sectors={sectorList}
                                overallMarketRisk={marketData?.riskAnalysis?.overall_market_risk || 'moderate'}
                                aiInsight={marketData?.riskAnalysis?.ai_insight || 'Market analysis pending AI connection.'}
                                loading={loading}
                            />
                            <InvestmentRecommendation
                                recommendations={marketData?.recommendations?.savings_recommendations || [
                                    'Save at least 20% of your monthly income.',
                                    'Build an emergency fund for 3-6 months of expenses.',
                                ]}
                                sectorAllocations={marketData?.recommendations?.sector_allocations || []}
                                priorityActions={marketData?.recommendations?.priority_actions || [
                                    'Enable AI Engine for personalized recommendations.',
                                    'Track your expenses to identify savings opportunities.',
                                ]}
                                marketOutlook={marketData?.recommendations?.financial_health_summary?.rating || 'neutral'}
                                loading={loading}
                            />
                        </div>
                    </>
                )}

                {activeTab === 'predict' && (
                    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                        <SectionCard title="Investment Prediction">
                            <div style={{ display: 'grid', gap: 16, marginTop: 8 }}>
                                <div>
                                    <label style={labelStyle}>District</label>
                                    <select
                                        value={predictionInput.region}
                                        onChange={e => { setPredictionInput(prev => ({ ...prev, region: e.target.value, sector: '' })); setPredictionResult(null); }}
                                        style={inputStyle}
                                    >
                                        <option value="">Select a district...</option>
                                        {Object.entries(RWANDA_DISTRICTS).map(([key, info]) => (
                                            <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Business Sector</label>
                                    <select
                                        value={predictionInput.sector}
                                        onChange={e => setPredictionInput(prev => ({ ...prev, sector: e.target.value }))}
                                        style={inputStyle}
                                        disabled={!predictionInput.region}
                                    >
                                        {!predictionInput.region ? (
                                            <option value="">Select a district first...</option>
                                        ) : (
                                            <>
                                                <option value="">Choose a business...</option>
                                                {(RWANDA_DISTRICTS[predictionInput.region]?.businesses || []).map((b: string) => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Investment Amount (RWF)</label>
                                    <input
                                        type="number"
                                        value={predictionInput.amount}
                                        onChange={e => setPredictionInput(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                        style={inputStyle}
                                    />
                                </div>
                                {predicting && <div style={{ fontSize: 12, color: mutedColor, textAlign: 'center' }}>AI analyzing market...</div>}
                            </div>
                        </SectionCard>

                        <div>
                            {predictionResult && (
                                <>
                                    <MarketPredictionCard
                                        sector={predictionResult.sector}
                                        region={predictionResult.region}
                                        riskLevel={predictionResult.risk_level}
                                        expectedReturn={predictionResult.expected_return}
                                        trend={predictionResult.trend}
                                        growthProbability={predictionResult.growth_probability}
                                        recommendation={predictionResult.recommendation}
                                        insight={predictionResult.insight}
                                    />
                                    <button
                                        onClick={handleInvestNow}
                                        disabled={investing}
                                        style={{
                                            marginTop: 16, width: '100%', padding: '14px 24px', borderRadius: 12, border: 'none',
                                            cursor: investing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 15,
                                            background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                                            opacity: investing ? 0.6 : 1, boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                                        }}
                                    >
                                        <ThumbsUp size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                        {investing ? 'Processing...' : `Invest RWF ${predictionInput.amount.toLocaleString()}`}
                                    </button>
                                </>
                            )}
                            {!predictionResult && !predicting && (
                                <SectionCard title="AI Prediction Engine">
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: mutedColor }}>
                                        <Sparkles size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                        <div style={{ fontWeight: 600, marginBottom: 8, color: textColor }}>
                                            Select a sector and amount to get started
                                        </div>
                                        <div style={{ fontSize: 13 }}>
                                            The AI will analyze market conditions, sector performance, and economic indicators to provide real investment predictions.
                                        </div>
                                    </div>
                                </SectionCard>
                            )}
                            {demoInvestments.length > 0 && (
                                <SectionCard title="Active Investments" style={{ marginTop: 16 }}>
                                    <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                                        {demoInvestments.map(inv => {
                                            const totalExpected = inv.amount * (inv.expectedReturn / 100);
                                            const progress = Math.min(100, ((inv.earned || 0) / totalExpected) * 100);
                                            return (
                                                <div key={inv.id} style={{
                                                    padding: 14, borderRadius: 12,
                                                    background: isDark ? '#0f172a' : '#f8fafc',
                                                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                        <div>
                                                            <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{inv.sector}</span>
                                                            <span style={{
                                                                marginLeft: 8, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                                                background: inv.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                                                                color: inv.status === 'active' ? '#10b981' : '#3b82f6',
                                                            }}>
                                                                {inv.status === 'active' ? 'Growing' : 'Matured'}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: 12, color: mutedColor }}>
                                                            <Calendar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                                            {inv.duration}mo
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                                        <span style={{ color: mutedColor }}>Invested: RWF {inv.amount.toLocaleString()}</span>
                                                        <span style={{ color: '#10b981', fontWeight: 600 }}>Earned: RWF {Math.round(inv.earned || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div style={{ height: 4, borderRadius: 2, background: isDark ? '#1e293b' : '#e2e8f0', overflow: 'hidden' }}>
                                                        <div style={{
                                                            height: '100%', borderRadius: 2, width: `${progress}%`,
                                                            background: progress >= 100 ? '#3b82f6' : '#10b981',
                                                            transition: 'width 1s',
                                                        }} />
                                                    </div>
                                                    <div style={{ fontSize: 11, color: mutedColor, textAlign: 'right', marginTop: 4 }}>
                                                        {progress >= 100 ? 'Fully matured' : `${Math.round(progress)}% of target`}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </SectionCard>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 24 }}>
                            <FinancialHealthCard
                                score={summary?.score || 60}
                                rating={summary?.rating || 'Fair'}
                                totalIncome={summary?.totalIncome || 0}
                                totalExpenses={summary?.totalExpenses || 0}
                                savingsRate={summary?.savingsRate || 0}
                                recommendations={summary?.recommendations || ['Enable AI for personalized insights.']}
                                loading={loading}
                            />
                            <SectionCard title="Risk Assessment">
                                <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0A9396' }}>
                                    {summary?.score ? Math.max(0, 100 - summary.score) : 40}/100
                                </div>
                                <div style={{ marginTop: 12, padding: 12, background: isDark ? '#0f2f1c' : '#f0fdf4', borderRadius: 12 }}>
                                    <span style={{ color: isDark ? '#a7f3d0' : '#16a34a', fontWeight: 600, fontSize: 13 }}>
                                        {summary?.score >= 70 ? 'Low Risk' : summary?.score >= 40 ? 'Medium Risk' : 'High Risk'}
                                    </span>
                                </div>
                                <div style={{ marginTop: 12, color: mutedColor, fontSize: 13 }}>
                                    {aiEngineOnline ? 'AI risk assessment active' : 'Based on limited data'}
                                </div>
                            </SectionCard>
                            <SectionCard title="Key Metrics">
                                <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: isDark ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
                                        <span style={{ color: mutedColor }}>Income</span>
                                        <span style={{ fontWeight: 700, color: textColor }}>RWF {(summary?.totalIncome || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: isDark ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
                                        <span style={{ color: mutedColor }}>Expenses</span>
                                        <span style={{ fontWeight: 700, color: textColor }}>RWF {(summary?.totalExpenses || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: isDark ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
                                        <span style={{ color: mutedColor }}>AI Score</span>
                                        <span style={{ fontWeight: 700, color: '#0A9396' }}>{aiEngineOnline ? 'Live' : 'Standard'}</span>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {summary?.recommendations && summary.recommendations.length > 0 && (
                            <SectionCard title="AI Recommendations" style={{ marginBottom: 24 }}>
                                <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                                    {summary.recommendations.map((rec: string, idx: number) => (
                                        <div key={idx} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            padding: 14, borderRadius: 12,
                                            background: isDark ? '#0f172a' : '#f8fafc',
                                        }}>
                                            <div style={{
                                                width: 24, height: 24, borderRadius: 6,
                                                background: 'linear-gradient(135deg, #0A9396, #4ECDC4)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0,
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <span style={{ fontSize: 13, color: mutedColor, flex: 1 }}>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                            {loading ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: mutedColor }}>
                                    Loading insights...
                                </div>
                            ) : insights.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: mutedColor }}>
                                    No insights available at the moment.
                                </div>
                            ) : (
                                insights.map((insight: any) => (
                                    <SectionCard key={insight.id} title={insight.title || 'AI Insight'}>
                                        <div style={{ marginTop: 12, color: mutedColor, lineHeight: 1.6 }}>
                                            {insight.detail || insight.message}
                                        </div>
                                        <div style={{
                                            marginTop: 16, display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', paddingTop: 12,
                                            borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                        }}>
                                            <span style={{ fontSize: 12, color: mutedColor }}>
                                                {insight.category ? insight.category.charAt(0).toUpperCase() + insight.category.slice(1) : 'Insight'}
                                            </span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#7dd3fc' : '#0A9396' }}>
                                                {insight.impact || 'Actionable'}
                                            </span>
                                        </div>
                                    </SectionCard>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'fraud' && (
                    <div style={{ display: 'grid', gap: 24 }}>
                        <FraudAlertCard
                            alerts={marketData?.fraudAlerts?.alerts || []}
                            total={marketData?.fraudAlerts?.total || 0}
                            criticalCount={marketData?.fraudAlerts?.critical_count || 0}
                            loading={loading}
                        />
                        <SectionCard title="Security Recommendations">
                            <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
                                {[
                                    'Enable two-factor authentication on your account',
                                    'Review and update your security questions regularly',
                                    'Monitor your transaction history for unauthorized activity',
                                    'Set transaction limits to prevent large unauthorized transfers',
                                    'Use unique passwords and change them periodically',
                                ].map((rec, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: 14, borderRadius: 12,
                                        background: isDark ? '#0f172a' : '#f8fafc',
                                    }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: 6,
                                            background: 'linear-gradient(135deg, #0A9396, #4ECDC4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <span style={{ fontSize: 13, color: mutedColor, flex: 1 }}>{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AIInsights;
