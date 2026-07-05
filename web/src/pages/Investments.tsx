import React, { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import PinModal from '../components/PinModal';
import MarketPredictionCard from '../components/MarketPredictionCard';
import InvestmentRecommendation from '../components/InvestmentRecommendation';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calculator, Brain, TrendingUp, Sparkles, RefreshCw, Zap, DollarSign } from 'lucide-react';
import ThreeBody from '../components/ThreeBody';
import { investmentService, profileService, securityService } from '../services/api';
import * as aiEngine from '../services/aiService';
import { useTheme } from '../context/ThemeContext';
import { useBanking } from '../context/BankingContext';
import { useToast } from '../context/ToastContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface Investment {
  id: number; type: string; amount: number; duration: number;
  risk_level: string; expected_return: number; actual_return: number;
  status: string; created_at: string; updated_at: string;
}
interface InvestmentType { id: string; name: string; description: string; min_amount: number; risk_levels: string[]; expected_returns: { [key: string]: number }; }

const riskColors: Record<string, string> = { low: 'chip-green', medium: 'chip-gold', high: 'chip-red' };

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

const lookupBusinessSector = (name: string): { risk: string; growth: number; trend: string } => {
    const key = name.toLowerCase().trim();
    if (key.includes('technology') || key.includes('tech') || key.includes('innovation')) return { risk: 'medium', growth: 22, trend: 'up' };
    if (key.includes('finance') || key.includes('banking') || key.includes('insurance')) return { risk: 'low', growth: 14, trend: 'up' };
    if (key.includes('real estate') || key.includes('housing') || key.includes('construction')) return { risk: 'low', growth: 12, trend: 'up' };
    if (key.includes('retail') || key.includes('e-commerce') || key.includes('trade') || key.includes('wholesale') || key.includes('commerce')) return { risk: 'medium', growth: 10, trend: 'stable' };
    if (key.includes('hospitality') || key.includes('tourism') || key.includes('tours') || key.includes('eco-lodge') || key.includes('lodging') || key.includes('hotel')) return { risk: 'medium', growth: 15, trend: 'up' };
    if (key.includes('agriculture') || key.includes('agri') || key.includes('farming') || key.includes('crop') || key.includes('ranching') || key.includes('dairy') || key.includes('livestock') || key.includes('plantation') || key.includes('coffee') || key.includes('tea') || key.includes('horticulture') || key.includes('potato') || key.includes('fishing')) return { risk: 'low', growth: 16, trend: 'up' };
    if (key.includes('manufacturing') || key.includes('industry')) return { risk: 'medium', growth: 10, trend: 'stable' };
    if (key.includes('energy') || key.includes('solar') || key.includes('hydro') || key.includes('methane')) return { risk: 'low', growth: 18, trend: 'up' };
    if (key.includes('logistics') || key.includes('transport') || key.includes('warehousing')) return { risk: 'medium', growth: 8, trend: 'stable' };
    if (key.includes('mining')) return { risk: 'high', growth: 14, trend: 'stable' };
    if (key.includes('education') || key.includes('training') || key.includes('research')) return { risk: 'low', growth: 11, trend: 'up' };
    if (key.includes('healthcare') || key.includes('health')) return { risk: 'low', growth: 14, trend: 'up' };
    if (key.includes('forestry') || key.includes('timber')) return { risk: 'low', growth: 10, trend: 'stable' };
    if (key.includes('handicrafts')) return { risk: 'low', growth: 8, trend: 'stable' };
    return { risk: 'medium', growth: 12, trend: 'up' };
};

const sectorToInvestmentType = (sector: string): string => {
    const key = sector.toLowerCase();
    if (key.includes('real estate') || key.includes('housing') || key.includes('property')) return 'realestate';
    if (key.includes('startup') || key.includes('innovation') || key.includes('technology') || key.includes('tech')) return 'startups';
    if (key.includes('bond') || key.includes('fixed income')) return 'bonds';
    return 'stocks';
};

const Investments: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [localInvestments, setLocalInvestments] = useState<any[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const [formData, setFormData] = useState({ type: 'stocks', amount: '', duration: '', risk_level: 'medium', expected_return: '' });
  const [calculatorData, setCalculatorData] = useState({ type: 'stocks', amount: '', duration: '', risk_level: 'medium' });
  const [calculatorResult, setCalculatorResult] = useState<any>(null);

  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiOnline, setAiOnline] = useState(false);
  const [predictionInput, setPredictionInput] = useState({ sector: '', amount: 500000, region: '' });
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);
  const [demoInvestments, setDemoInvestments] = useState<any[]>([]);
  const [investing, setInvesting] = useState(false);
  const [localBalanceOffset, setLocalBalanceOffset] = useState(0);
  const [pinAction, setPinAction] = useState<{ cb: () => void } | null>(null);
  const { balance, deposit, withdraw, refresh: refreshBankData } = useBanking();
  const effectiveBalance = balance !== null ? balance + localBalanceOffset : null;
  const toast = useToast();

  useEffect(() => {
    loadInvestments(); loadInvestmentTypes(); loadAIRecommendations();
    profileService.getProfile().then(res => {
      const addr = (res.data?.profile?.address || '').toLowerCase();
      const matched = Object.keys(RWANDA_DISTRICTS).find(d => addr.includes(d));
      if (matched) setPredictionInput(p => ({ ...p, region: matched }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!predictionInput.sector || !predictionInput.region) { setPredictionResult(null); return; }
    const timer = setTimeout(() => {
      setPredicting(true);
      try {
        const lookup = lookupBusinessSector(predictionInput.sector);
        setPredictionResult({
          sector: predictionInput.sector,
          region: RWANDA_DISTRICTS[predictionInput.region]?.description || predictionInput.region,
          investment_amount: predictionInput.amount,
          risk_level: lookup.risk,
          expected_return: '+' + lookup.growth + '%',
          trend: lookup.trend,
          growth_probability: lookup.risk === 'low' ? 85 : lookup.risk === 'medium' ? 65 : 45,
          recommendation: lookup.risk === 'low' ? 'STRONG INVESTMENT' : lookup.risk === 'medium' ? 'GOOD INVESTMENT' : 'SPECULATIVE',
          risk_score: lookup.risk === 'low' ? 20 : lookup.risk === 'medium' ? 50 : 75,
          ai_confidence: aiOnline ? 'HIGH' : 'MEDIUM',
          insight: 'Look based on ' + predictionInput.sector + ' in ' + (RWANDA_DISTRICTS[predictionInput.region]?.description || predictionInput.region) + '.',
          ai_powered: aiOnline,
        });
      } catch { setPredictionResult(null); }
      finally { setPredicting(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [predictionInput.sector, predictionInput.amount, predictionInput.region]);

  const handleInvestNow = async () => {
    if (!predictionResult || investing) return;
    setPinAction({
      cb: async () => {
        setInvesting(true);
        try {
          await withdraw(predictionInput.amount, `Investment: ${predictionInput.sector} in ${predictionInput.region}`);
        } catch {
          setLocalBalanceOffset(prev => prev - predictionInput.amount);
        }
        try {
          const lookup = lookupBusinessSector(predictionInput.sector);
          const invType = sectorToInvestmentType(predictionInput.sector);
          await investmentService.createInvestment({
            type: invType,
            amount: predictionInput.amount,
            duration: 12,
            risk_level: lookup.risk,
            expected_return: lookup.growth,
          });
          await loadInvestments();
          setPredictionResult(null);
          setPredictionInput(p => ({ ...p, sector: '' }));
          toast.success(`Invested RWF ${predictionInput.amount.toLocaleString()} in ${predictionInput.sector}`);
          try { await refreshBankData(); } catch {}
        } catch {
          toast.error('Investment did not work.');
        } finally { setInvesting(false); }
      }
    });
  };

  useEffect(() => {
    const hasActive = demoInvestments.some(inv => inv.status === 'active') || investments.some(inv => inv.status === 'active');
    if (!hasActive) return;
    const interval = setInterval(async () => {
      let totalPayout = 0;
      const updatedDemo = demoInvestments.map(inv => {
        if (inv.status !== 'active') return inv;
        const dailyReturn = inv.amount * (inv.expectedReturn / 100) / (inv.duration * 30);
        const newEarned = (inv.earned || 0) + dailyReturn;
        totalPayout += dailyReturn;
        const totalExpected = inv.amount * (inv.expectedReturn / 100);
        if (newEarned >= totalExpected) return { ...inv, earned: totalExpected, status: 'matured' };
        return { ...inv, earned: newEarned };
      });
      setDemoInvestments(updatedDemo);
      const updatedServer = investments.map(inv => {
        if (inv.status !== 'active') return inv;
        const dailyReturn = inv.amount * ((inv.expected_return || 10) / 100) / ((inv.duration || 12) * 30);
        const newActual = (inv.actual_return || 0) + dailyReturn;
        totalPayout += dailyReturn;
        const totalExpected = inv.amount * ((inv.expected_return || 10) / 100);
        if (newActual >= totalExpected) return { ...inv, actual_return: totalExpected, status: 'matured' };
        return { ...inv, actual_return: newActual };
      });
      setInvestments(updatedServer);
      if (totalPayout > 0) {
        try { await deposit(totalPayout, 'Investment returns'); } catch { setLocalBalanceOffset(prev => prev + totalPayout); }
        try { await refreshBankData(); } catch {}
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [demoInvestments.length, investments.length]);

  const loadAIRecommendations = async () => {
    try {
      const [modelStatus, recs] = await Promise.all([
        aiEngine.getModelStatus().catch(() => null),
        aiEngine.getRecommendations({ income: 300000, expenses: 150000, risk_tolerance: 'moderate', goals: ['investment', 'growth'] }).catch(() => null),
      ]);
      setAiOnline(modelStatus?.status && modelStatus?.status !== 'offline');
      setAiRecommendations(recs?.sector_recommendations?.length ? recs : generateFallbackRecs());
    } catch { setAiRecommendations(generateFallbackRecs()); }
    finally { setAiLoading(false); }
  };

  const generateFallbackRecs = () => ({
    sector_recommendations: [
      { sector_name: 'Farming', expected_return: '+16%', risk_level: 'low', growth_rate: 16, recommendation: 'Strong growth in Rwandan farming.', insight: 'Export demand growing.' },
      { sector_name: 'Tech', expected_return: '+22%', risk_level: 'medium', growth_rate: 22, recommendation: 'Money-tech boom continues.', insight: 'Kigali tech hub growing.' },
      { sector_name: 'Property', expected_return: '+12%', risk_level: 'low', growth_rate: 12, recommendation: 'Steady growth in homes.', insight: 'City growth driving demand.' },
      { sector_name: 'Power', expected_return: '+18%', risk_level: 'low', growth_rate: 18, recommendation: 'Clean power opportunities.', insight: 'Government help ready.' },
    ],
    savings_recommendations: ['Spread your money across different areas', 'Think about long-term goals', 'Watch market changes often'],
    sector_allocations: [{ sector: 'Farming', allocation: 30, rationale: 'Steady growth' }, { sector: 'Tech', allocation: 25, rationale: 'Fast growth' }, { sector: 'Power', allocation: 25, rationale: 'Clean' }, { sector: 'Property', allocation: 20, rationale: 'Steady profit' }],
    priority_actions: ['Turn on AI for live guesses', 'Start with safe areas', 'Set up regular check-ups'],
    financial_health_summary: { rating: 'positive', score: 70 },
    ai_powered: false,
  });

  const loadInvestments = async () => {
    try {
      const response = await investmentService.getInvestments();
      const serverInvestments = response.data || [];
      setInvestments(serverInvestments.length > 0 ? [...serverInvestments, ...localInvestments] : [...localInvestments]);
    } catch {
      setInvestments([...localInvestments]);
    }
    finally { setLoading(false); }
  };

  const loadInvestmentTypes = async () => {
    try { const response = await investmentService.getInvestmentTypes(); setInvestmentTypes(response.data || []); }
    catch (err: any) { console.error('Failed to load investment types:', err); }
  };

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy('create'); setError(''); setMessage('');
    try {
      const response = await investmentService.createInvestment({ type: formData.type, amount: Number(formData.amount), duration: Number(formData.duration), risk_level: formData.risk_level, expected_return: formData.expected_return ? Number(formData.expected_return) : undefined });
      setMessage('Investment created successfully'); setShowCreateForm(false); resetForm(); loadInvestments();
      try { await refreshBankData(); } catch {}
    } catch (err: any) {
      const msg = err.response?.data?.msg || 'Failed to create investment';
      setError(msg);
    }
    finally { setBusy(null); }
  };

  const handleUpdateInvestment = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingInvestment) return;
    setBusy('update'); setError(''); setMessage('');
    try {
      await investmentService.updateInvestment(editingInvestment.id, { amount: Number(formData.amount), duration: Number(formData.duration), risk_level: formData.risk_level, expected_return: formData.expected_return ? Number(formData.expected_return) : undefined });
      setMessage('Investment updated successfully'); setEditingInvestment(null); resetForm(); loadInvestments();
    } catch {
      setLocalInvestments(prev => prev.map(inv => inv.id === editingInvestment.id ? { ...inv, amount: Number(formData.amount), duration: Number(formData.duration), risk_level: formData.risk_level, expected_return: Number(formData.expected_return) || 0 } : inv));
      setMessage('Investment updated (offline)'); setEditingInvestment(null); resetForm(); loadInvestments();
    }
    finally { setBusy(null); }
  };

  const handleDeleteInvestment = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to remove this investment?')) return;
    setBusy(`delete-${id}`); setError(''); setMessage('');
    if (typeof id === 'string' && id.startsWith('demo-inv-')) {
      setDemoInvestments(prev => prev.filter(inv => inv.id !== id));
      setMessage('Investment removed');
      setBusy(null);
      return;
    }
    try {
      await investmentService.deleteInvestment(id as number);
      setMessage('Investment deleted successfully'); loadInvestments();
    } catch {
      setLocalInvestments(prev => prev.filter(inv => inv.id !== id));
      setMessage('Investment deleted (offline)'); loadInvestments();
    }
    finally { setBusy(null); }
  };

  const handleCalculateReturns = async () => {
    if (!calculatorData.amount || !calculatorData.duration) { setError('Please enter amount and time'); return; }
    try {
      const response = await investmentService.calculateReturns({ type: calculatorData.type, amount: Number(calculatorData.amount), duration: Number(calculatorData.duration), risk_level: calculatorData.risk_level });
      setCalculatorResult(response.data);
    } catch (err: any) { setError(err.response?.data?.msg || 'Could not figure out profit'); }
  };

  const resetForm = () => { setFormData({ type: 'stocks', amount: '', duration: '', risk_level: 'medium', expected_return: '' }); };

  const startEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({ type: investment.type, amount: investment.amount.toString(), duration: investment.duration.toString(), risk_level: investment.risk_level, expected_return: investment.expected_return.toString() });
    setShowCreateForm(true);
  };

  const typeInfo = (typeId: string) => investmentTypes.find(t => t.id === typeId);

  const fieldBase = { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const inputStyle: React.CSSProperties = isDark ? { ...fieldBase, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9' } : { ...fieldBase, background: '#ffffff', border: '1px solid #d1d5db', color: '#111827' };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: isDark ? '#94c5d4' : '#374151' };
  const cardBg: React.CSSProperties = isDark ? {} : { background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))', border: '1px solid rgba(0,0,0,0.08)' };
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';

  const sectorData = (predictionInput.region && RWANDA_DISTRICTS[predictionInput.region]
    ? RWANDA_DISTRICTS[predictionInput.region].businesses.map(name => {
        const info = lookupBusinessSector(name);
        return { name, growth: info.growth, risk: info.risk };
      })
    : aiRecommendations?.sector_recommendations?.map((s: any) => ({
        name: s.sector_name, growth: s.growth_rate || 10, risk: s.risk_level
      })) || []
  ).filter((s: any) => s.name);

  const allInvestments: Investment[] = [
    ...investments,
    ...demoInvestments.map(d => ({
      id: d.id,
      type: d.sector || 'Business',
      amount: d.amount,
      duration: d.duration,
      risk_level: d.risk || 'medium',
      expected_return: d.expectedReturn,
      actual_return: d.earned || 0,
      status: d.status,
      created_at: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  ];

  if (loading) {
    return (
      <PageLayout title="Investments" subtitle="Loading your investments...">
        <div className="flex items-center justify-center py-20"><div className="shimmer" style={{ width: 300, height: 20 }} /></div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Investments" subtitle="Handle your investments with AI help">
      <div className="space-y-6" style={{ display: 'grid', gap: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: aiOnline ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: aiOnline ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4,
            }}><Brain size={12} /> AI {aiOnline ? 'On' : 'Off'}</span>
            {effectiveBalance !== null && (
              <span style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: 'rgba(16,185,129,0.15)', color: '#10b981',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <DollarSign size={12} />
                Cash: RWF {effectiveBalance.toLocaleString()}
                {localBalanceOffset !== 0 && <span style={{ opacity: 0.6 }}>(test)</span>}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <LoadingButton onClick={() => setShowCreateForm(!showCreateForm)} variant="primary"><Plus size={16} />{showCreateForm ? 'Stop' : 'Start Investment'}</LoadingButton>
            <LoadingButton onClick={() => setShowCalculator(!showCalculator)} variant="secondary"><Calculator size={16} />{showCalculator ? 'Hide Tool' : 'See Profit'}</LoadingButton>
          </div>
        </div>

        {error && (
          <div className={`glass-card ${isDark ? 'card-danger' : ''}`} style={{ padding: '14px 20px', ...(!isDark ? { background: '#fef2f2', border: '1px solid #fecaca' } : {}) }}>
            <span style={{ color: isDark ? '#f87171' : '#dc2626', fontSize: 14, fontWeight: 600 }}>{error}</span>
          </div>
        )}
        {message && (
          <div className={`glass-card ${isDark ? 'card-accent' : ''}`} style={{ padding: '14px 20px', ...(!isDark ? { background: '#f0fdf4', border: '1px solid #bbf7d0' } : {}) }}>
            <span style={{ color: isDark ? '#4ade80' : '#16a34a', fontSize: 14, fontWeight: 600 }}>{message}</span>
          </div>
        )}

        {!aiLoading && aiRecommendations && (
          <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {sectorData.length > 0 && (
                <SectionCard title={predictionInput.region ? `Sector Growth — ${predictionInput.region.charAt(0).toUpperCase() + predictionInput.region.slice(1)}` : 'Sector Growth'}>
                  <div style={{ width: '100%', height: 260, marginTop: 8 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={sectorData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                        <XAxis type="number" stroke={mutedColor} />
                        <YAxis dataKey="name" type="category" stroke={mutedColor} width={140} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="growth" name="Growth Rate %">
                          {sectorData.map((_: any, idx: number) => (
                            <Cell key={idx} fill={['#0A9396', '#4ECDC4', '#F4A261', '#E76F51', '#2EC4B6', '#8B5CF6', '#EC4899', '#14B8A6'][idx % 8]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {!predictionInput.region && (
                    <div style={{ marginTop: 8, fontSize: 12, color: mutedColor, textAlign: 'center', fontStyle: 'italic' }}>
                      Pick a district above to see local area growth.
                    </div>
                  )}
                </SectionCard>
              )}

              <SectionCard title="Investment Guess">
                <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
                  <div>
                    <label style={labelStyle}>Area</label>
                    <select value={predictionInput.region} onChange={e => { setPredictionInput(p => ({ ...p, region: e.target.value, sector: '' })); setPredictionResult(null); }} style={inputStyle}>
                      <option value="">Pick an area...</option>
                      {Object.entries(RWANDA_DISTRICTS).map(([key]) => (
                        <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Business Sector</label>
                    <select value={predictionInput.sector} onChange={e => setPredictionInput(p => ({ ...p, sector: e.target.value }))} style={inputStyle} disabled={!predictionInput.region}>
                      {!predictionInput.region ? (
                        <option value="">Pick a district first...</option>
                      ) : (
                        <>
                          <option value="">Pick a business...</option>
                          {(RWANDA_DISTRICTS[predictionInput.region]?.businesses || []).map((b: string) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Amount to Invest (RWF)</label>
                    <input type="text" inputMode="decimal" value={predictionInput.amount} onChange={e => setPredictionInput(p => ({ ...p, amount: e.target.value === '' ? 0 : Number(e.target.value) }))} style={inputStyle} />
                  </div>
                  {predicting && <div style={{ fontSize: 12, color: mutedColor, textAlign: 'center' }}>AI thinking...</div>}
                </div>
              </SectionCard>
            </div>

            {predictionResult && (
              <>
                <MarketPredictionCard
                  sector={predictionResult.sector} region={predictionResult.region}
                  riskLevel={predictionResult.risk_level} expectedReturn={predictionResult.expected_return}
                  trend={predictionResult.trend} growthProbability={predictionResult.growth_probability}
                  recommendation={predictionResult.recommendation} insight={predictionResult.insight}
                />
                <button onClick={handleInvestNow} disabled={investing}
                  style={{
                    width: '100%', padding: '14px 24px', borderRadius: 12, border: 'none',
                    cursor: investing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 15,
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                    opacity: investing ? 0.6 : 1, boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                  }}
                >
                  {investing ? <><ThreeBody size={16} color="#fff" /> Working...</> : <><Zap size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Invest</>}
                </button>
              </>
            )}

            <InvestmentRecommendation
              recommendations={[
                ...(aiRecommendations.savings_recommendations || []),
                ...(predictionInput.region && RWANDA_DISTRICTS[predictionInput.region]
                  ? ['Popular: ' + RWANDA_DISTRICTS[predictionInput.region].businesses[0] + ' in ' + predictionInput.region.charAt(0).toUpperCase() + predictionInput.region.slice(1)]
                  : []),
                ...(predictionInput.region && RWANDA_DISTRICTS[predictionInput.region]
                  ? ['Look at ' + RWANDA_DISTRICTS[predictionInput.region].businesses[1] + ' — growing need in this area']
                  : []),
              ]}
              sectorAllocations={aiRecommendations.sector_allocations || []}
              priorityActions={aiRecommendations.priority_actions || []}
              marketOutlook={aiRecommendations.financial_health_summary?.rating}
              loading={aiLoading}
            />

            {demoInvestments.length > 0 && (
              <SectionCard title="Live Investments">
                <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                  {demoInvestments.map(inv => {
                    const totalExpected = inv.amount * (inv.expectedReturn / 100);
                    const progress = Math.min(100, ((inv.earned || 0) / totalExpected) * 100);
                    return (
                      <div key={inv.id} style={{ padding: 14, borderRadius: 12, background: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{inv.sector}</span>
                            <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: inv.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: inv.status === 'active' ? '#10b981' : '#3b82f6' }}>
                              {inv.status === 'active' ? 'Active' : 'Done'}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: mutedColor }}>
                            <DollarSign size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            {inv.duration}mo
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ color: mutedColor }}>Invested: RWF {Number(inv.amount).toLocaleString()}</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>Earned: RWF {Math.round(inv.earned || 0).toLocaleString()}</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: isDark ? '#1e293b' : '#e2e8f0', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: `${progress}%`, background: progress >= 100 ? '#3b82f6' : '#10b981', transition: 'width 1s' }} />
                        </div>
                        <div style={{ fontSize: 11, color: mutedColor, textAlign: 'right', marginTop: 4 }}>
                          {progress >= 100 ? 'Fully done' : `${Math.round(progress)}% of goal`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {showCalculator && (
          <SectionCard title="Investment Tool" subtitle="See possible profits for different plans" style={cardBg}>
            <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={labelStyle}>Type</span>
                  <select value={calculatorData.type} onChange={(e) => setCalculatorData({ ...calculatorData, type: e.target.value })} style={inputStyle}>
                    {investmentTypes.length === 0 ? (<option value="stocks">Stocks</option>) : investmentTypes.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Sum (RWF)</span><input type="text" inputMode="decimal" value={calculatorData.amount} onChange={(e) => setCalculatorData({ ...calculatorData, amount: e.target.value })} placeholder="10000" className="input-field" style={inputStyle} /></label>
                <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Time (months)</span><input type="text" inputMode="numeric" value={calculatorData.duration} onChange={(e) => setCalculatorData({ ...calculatorData, duration: e.target.value })} placeholder="12" className="input-field" style={inputStyle} /></label>
                <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Risk</span>
                  <select value={calculatorData.risk_level} onChange={(e) => setCalculatorData({ ...calculatorData, risk_level: e.target.value })} style={inputStyle}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </label>
              </div>
              <button onClick={handleCalculateReturns} className="btn btn-primary" style={{ justifySelf: 'start' }}>See Profit</button>
            </div>
            {calculatorResult && (
              <div className={`glass-card ${isDark ? 'card-accent' : ''}`} style={{ marginTop: 20, padding: 20, ...(!isDark ? { background: '#f0f9ff', border: '1px solid #bae6fd' } : {}) }}>
                <h4 style={{ color: isDark ? '#2dcece' : '#0A9396', margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Expected Profit</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div><div className="card-title" style={{ color: isDark ? undefined : '#64748b' }}>Main Amount</div><div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>{Number(calculatorResult.principal || 0).toLocaleString()} RWF</div></div>
                  <div><div className="card-title" style={{ color: isDark ? undefined : '#64748b' }}>Expected Profit</div><div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#4ade80' : '#059669' }}>{Number(calculatorResult.total_returns || 0).toLocaleString()} RWF</div></div>
                  <div><div className="card-title" style={{ color: isDark ? undefined : '#64748b' }}>Total at End</div><div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#2dcece' : '#0A9396' }}>{Number(calculatorResult.final_amount || 0).toLocaleString()} RWF</div></div>
                  <div><div className="card-title" style={{ color: isDark ? undefined : '#64748b' }}>Profit Rate</div><div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>{calculatorResult.expected_return_rate}%</div></div>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {showCreateForm && (
          <SectionCard title={editingInvestment ? 'Change Investment' : 'Start New Investment'} subtitle={editingInvestment ? 'Change your current investment info' : 'Start a new investment with AI help'} style={cardBg}>
            <form onSubmit={editingInvestment ? handleUpdateInvestment : handleCreateInvestment} style={{ display: 'grid', gap: 20, marginTop: 20 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {!editingInvestment && (
                  <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Type</span>
                    <select value={formData.type} onChange={(e) => { const t = typeInfo(e.target.value); setFormData({ ...formData, type: e.target.value, risk_level: t?.risk_levels[0] || 'medium', expected_return: '' }); }} required style={inputStyle}>
                      {investmentTypes.length === 0 ? (<option value="stocks">Stock Market</option>) : investmentTypes.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                    </select>
                  </label>
                )}
                <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Sum (RWF)</span><input type="text" inputMode="decimal" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="10000" required className="input-field" style={inputStyle} />
                  {typeInfo(formData.type) && <span style={{ fontSize: 11, color: isDark ? '#5f8fa6' : '#6b7280' }}>At least: {typeInfo(formData.type)!.min_amount.toLocaleString()} RWF</span>}
                </label>
                <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Time (months)</span><input type="text" inputMode="numeric" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="12" required className="input-field" style={inputStyle} /></label>
                <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Risk</span>
                  <select value={formData.risk_level} onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })} required style={inputStyle}>
                    {(typeInfo(formData.type)?.risk_levels || ['low', 'medium', 'high']).map(level => (<option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}><span style={labelStyle}>Expected Profit % (not needed)</span><input type="text" inputMode="decimal" value={formData.expected_return} onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })} placeholder={typeInfo(formData.type)?.expected_returns[formData.risk_level]?.toString()} className="input-field" style={inputStyle} /></label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn-primary" disabled={busy !== null} aria-busy={busy !== null} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{busy === 'create' || busy === 'update' ? <><ThreeBody size={16} color="#fff" /> Working...</> : (editingInvestment ? 'Change Investment' : 'Start Investment')}</button>
                <button type="button" className={isDark ? 'btn btn-ghost' : 'btn btn-outline'}
                  style={!isDark ? { background: '#ffffff', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' } : undefined}
                  onClick={() => { setShowCreateForm(false); setEditingInvestment(null); resetForm(); }} disabled={busy !== null}>Stop</button>
              </div>
            </form>
          </SectionCard>
        )}

        <SectionCard title="Your Investments" subtitle={allInvestments.length === 0 ? 'Start building your investments' : 'Handle your current investments'} style={cardBg}>
          {allInvestments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ color: mutedColor, marginBottom: 16 }}>No investments yet. Start your first one!</div>
              <LoadingButton onClick={() => setShowCreateForm(true)} variant="primary">Start Your First Investment</LoadingButton>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {allInvestments.map((investment) => {
                const info = typeInfo(investment.type);
                return (
                  <motion.div key={investment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card" style={{ padding: '24px 26px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center', ...(!isDark ? { background: '#ffffff', border: '1px solid #e5e7eb' } : {}) }}>
                    <div>
                      <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: 14 }}>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: isDark ? '#e2f0f5' : '#111827' }}>{info?.name || investment.type}</h4>
                        <span className={`chip ${investment.status === 'active' ? 'chip-teal' : 'chip-gold'}`}>{investment.status}</span>
                        <span className={`chip ${riskColors[investment.risk_level] || 'chip-teal'}`}>{investment.risk_level} risk</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div><div className="card-title" style={{ color: isDark ? undefined : '#6b7280' }}>Sum</div><div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827' }}>{investment.amount.toLocaleString()} RWF</div></div>
                        <div><div className="card-title" style={{ color: isDark ? undefined : '#6b7280' }}>Time</div><div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827' }}>{investment.duration} months</div></div>
                        <div><div className="card-title" style={{ color: isDark ? undefined : '#6b7280' }}>Expected Profit</div><div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#4ade80' : '#059669' }}>{investment.expected_return}%</div></div>
                        <div><div className="card-title" style={{ color: isDark ? undefined : '#6b7280' }}>Actual Profit</div><div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#2dcece' : '#0A9396' }}>{investment.actual_return.toLocaleString()} RWF</div></div>
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: mutedColor }}>Created: {new Date(investment.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {investment.status === 'active' && typeof investment.id !== 'string' && (<LoadingButton onClick={() => startEditInvestment(investment)} disabled={busy !== null} variant="outline" size="sm"><Edit2 size={14} /> Edit</LoadingButton>)}
                      <LoadingButton onClick={() => handleDeleteInvestment(investment.id)} disabled={busy === `delete-${investment.id}` || investment.status !== 'active'} variant="ghost" size="sm"><Trash2 size={14} /> Delete</LoadingButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
      {pinAction && (
        <PinModal
          action="OK investment"
          onSuccess={() => { const cb = pinAction.cb; setPinAction(null); cb(); }}
          onCancel={() => setPinAction(null)}
        />
      )}
    </PageLayout>
  );
};

export default Investments;
