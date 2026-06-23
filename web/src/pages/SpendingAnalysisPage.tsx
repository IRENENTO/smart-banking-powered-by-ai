import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart as PieIcon, ArrowLeft, Sparkles, Send, Bot, User, MessageSquare, X, Clock, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { bankService, aiService } from '../services/api';
import Navbar from '../components/Navbar';

const CATEGORY_BASES = [
  { name: 'Food & Dining', color: '#0A9396' },
  { name: 'Transport & Fuel', color: '#005F73' },
  { name: 'Housing & Rent', color: '#94D2BD' },
  { name: 'Utilities & Bills', color: '#E9C46A' },
  { name: 'Healthcare', color: '#F4A261' },
  { name: 'Education', color: '#E76F51' },
  { name: 'Entertainment & Leisure', color: '#CA6702' },
  { name: 'Shopping & Retail', color: '#9B2226' },
  { name: 'Mobile & Communication', color: '#6A4C93' },
  { name: 'Insurance', color: '#1982C4' },
  { name: 'Savings & Investments', color: '#8AC926' },
  { name: 'Other', color: '#6C757D' },
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function getUserSeed(): number {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      const id = user.id || user.email || user.account_number || user.name || 'default';
      let hash = 0;
      for (let i = 0; i < String(id).length; i++) {
        hash = ((hash << 5) - hash) + String(id).charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash) || Date.now();
    }
  } catch {}
  return Date.now();
}

function generateUserCategories(userSeed: number) {
  const rng = seededRandom(userSeed);
  const categories = CATEGORY_BASES.map((base, i) => {
    const baseValue = [385000, 245000, 450000, 198000, 120000, 165000, 95000, 210000, 78000, 85000, 52000, 32000][i] || 100000;
    const variance = 0.6 + rng() * 0.8;
    const value = Math.round(baseValue * variance);
    return { name: base.name, value, color: base.color, percentage: 0 };
  });
  const total = categories.reduce((s, c) => s + c.value, 0);
  categories.forEach(c => { c.percentage = Math.round((c.value / total) * 1000) / 10; });
  return categories;
}

function generateUserTrends(userSeed: number) {
  const rng = seededRandom(userSeed + 999);
  return MONTH_LABELS.map((month, i) => {
    const baseSpending = [1680000, 1720000, 1950000, 1830000, 1740000, 2110000, 1890000, 2450000, 1620000, 1580000, 1860000, 2115000][i] || 1800000;
    const baseIncome = [2100000, 2100000, 2200000, 2200000, 2200000, 2300000, 2300000, 2500000, 2300000, 2300000, 2300000, 2400000][i] || 2200000;
    return {
      month,
      spending: Math.round(baseSpending * (0.75 + rng() * 0.5)),
      income: Math.round(baseIncome * (0.85 + rng() * 0.3)),
    };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0B1F3A] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
        {label && <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-medium">
            {entry.name}: RWF {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function generateDemoTransactions(userSeed: number) {
  const rng = seededRandom(userSeed + 111);
  const types = ['food_dining', 'transport_fuel', 'housing_rent', 'utilities_bills', 'healthcare', 'education', 'entertainment_leisure', 'shopping_retail', 'mobile_communication', 'insurance', 'savings_investments', 'other'];
  const entries: Record<string, { desc: string[]; amt: number[] }> = {
    food_dining: { desc: ['Groceries at Nakumatt', 'Restaurant dinner', 'Monthly meal prep service', 'Weekly groceries'], amt: [12500, 8500, 18000, 9500] },
    transport_fuel: { desc: ['Bus pass monthly', 'Taxi fare', 'Fuel at Shell Station'], amt: [5000, 3000, 25000] },
    housing_rent: { desc: ['Monthly rent payment'], amt: [150000] },
    utilities_bills: { desc: ['Electricity bill', 'Water bill', 'Internet subscription'], amt: [25000, 15000, 25000] },
    healthcare: { desc: ['Pharmacy - prescription', 'Clinic consultation'], amt: [12000, 35000] },
    education: { desc: ['Online course fee', 'Tuition payment'], amt: [45000, 80000] },
    entertainment_leisure: { desc: ['Concert tickets', 'Cinema outing'], amt: [15000, 8000] },
    shopping_retail: { desc: ['Clothing store', 'Electronics accessory'], amt: [35000, 22000] },
    mobile_communication: { desc: ['Airtime & data bundle', 'Mobile money fees'], amt: [10000, 5000] },
    insurance: { desc: ['Health insurance premium'], amt: [25000] },
    savings_investments: { desc: ['Savings deposit', 'Stock purchase'], amt: [50000, 30000] },
    other: { desc: ['Miscellaneous', 'ATM service fee'], amt: [7000, 2500] },
  };
  let id = 1;
  const txns: any[] = [];
  const baseDate = new Date('2026-04-15');
  types.forEach(type => {
    const e = entries[type];
    e.desc.forEach((desc, i) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - Math.floor(rng() * 30));
      txns.push({ id: id++, type, amount: e.amt[i % e.amt.length], description: desc, created_at: d.toISOString() });
    });
  });
  return txns;
}

const SpendingAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  type Tab = 'overview' | 'category' | 'trend';
  const [tab, setTab] = useState<Tab>('overview');
  const [categoryData, setCategoryData] = useState<any[]>(() => generateUserCategories(getUserSeed()));
  const [monthlyData, setMonthlyData] = useState<any[]>(() => generateUserTrends(getUserSeed()));
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [marketGuide, setMarketGuide] = useState('');
  const [marketInsights, setMarketInsights] = useState<string[]>([]);
  const [fetchedGuidance, setFetchedGuidance] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  const userSeed = useMemo(() => getUserSeed(), []);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: 'Hi! I\'m your AI spending assistant. Ask me anything about your finances!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userCategories = useMemo(() => generateUserCategories(userSeed), [userSeed]);
  const userTrends = useMemo(() => generateUserTrends(userSeed), [userSeed]);
  const userDemoTransactions = useMemo(() => generateDemoTransactions(userSeed), [userSeed]);

  const userName = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        return u.name || u.email || 'User';
      }
    } catch {}
    return 'User';
  }, []);

  const chartCategories = useMemo(() => {
    const sorted = [...categoryData].sort((a, b) => b.value - a.value);
    const top6 = sorted.slice(0, 6).filter(c => c.value > 0).map(c => ({ ...c }));
    const rest = sorted.slice(6).filter(c => c.value > 0);
    if (rest.length > 0) {
      const otherValue = rest.reduce((s, c) => s + c.value, 0);
      top6.push({ name: 'Others', value: otherValue, color: '#6C757D', percentage: 0 });
    }
    const total = top6.reduce((s, c) => s + c.value, 0);
    top6.forEach(c => { c.percentage = total > 0 ? Math.round((c.value / total) * 1000) / 10 : 0; });
    return top6;
  }, [categoryData]);

  const isExpense = (tx: any) => {
    if (tx.balance_before != null && tx.balance_after != null) return Number(tx.balance_after) < Number(tx.balance_before);
    return ['payment', 'withdrawal', 'withdraw'].includes(tx.type);
  };
  const isIncome = (tx: any) => {
    if (tx.balance_before != null && tx.balance_after != null) return Number(tx.balance_after) > Number(tx.balance_before);
    return ['deposit'].includes(tx.type);
  };
  const activeCategories = new Set(categoryData.map(c => c.name.toLowerCase()));
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\b\w+\b)/g);
    return parts.map((part, i) => {
      const lower = part.toLowerCase();
      const color = COLORS_MAP[lower];
      if (color && activeCategories.has(lower)) {
        return (
          <span key={i} style={{ color, fontWeight: 600 }}>{part}</span>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Data initializes with DEFAULT_CATEGORIES / DEFAULT_MONTHLY — no blocking API call needed

  useEffect(() => {
    loadSpendingData().then(() => {
      setTimeout(() => fetchMarketGuidance(), 500);
    });
  }, []);

  const COLORS_MAP: Record<string, string> = {
    payment: '#E76F51',
    withdraw: '#CA6702',
    withdrawal: '#CA6702',
    transfer: '#0A9396',
    deposit: '#005F73',
    food: '#0A9396',
    food_dining: '#0A9396',
    transport: '#005F73',
    transport_fuel: '#005F73',
    bills: '#94D2BD',
    utilities_bills: '#E9C46A',
    housing_rent: '#94D2BD',
    healthcare: '#F4A261',
    education: '#E76F51',
    entertainment: '#F4A261',
    entertainment_leisure: '#CA6702',
    shopping_retail: '#9B2226',
    mobile_money: '#E9C46A',
    mobile_communication: '#6A4C93',
    insurance: '#1982C4',
    savings_investments: '#8AC926',
    other: '#6C757D',
  };

  const DESC_TO_CAT: { keywords: string[]; cat: string }[] = [
    { keywords: ['grocery', 'groceries', 'restaurant', 'dinner', 'lunch', 'breakfast', 'meal', 'food', 'cafe', 'pizza', 'supermarket', 'shoprite', 'nakumatt'], cat: 'food_dining' },
    { keywords: ['bus', 'taxi', 'fuel', 'gas', 'petrol', 'transport', 'fare', 'shell', 'uber', 'ride'], cat: 'transport_fuel' },
    { keywords: ['rent', 'housing', 'apartment', 'mortgage', 'lease', 'maintenance'], cat: 'housing_rent' },
    { keywords: ['electricity', 'water', 'internet', 'utility', 'bill', 'power'], cat: 'utilities_bills' },
    { keywords: ['pharmacy', 'clinic', 'hospital', 'doctor', 'medical', 'prescription', 'medicine', 'health'], cat: 'healthcare' },
    { keywords: ['tuition', 'school', 'course', 'class', 'training', 'education', 'books', 'university'], cat: 'education' },
    { keywords: ['cinema', 'concert', 'movie', 'ticket', 'entertainment', 'game', 'sport', 'show', 'theatre'], cat: 'entertainment_leisure' },
    { keywords: ['clothing', 'electronics', 'store', 'shop', 'retail', 'mall', 'fashion', 'shoe'], cat: 'shopping_retail' },
    { keywords: ['airtime', 'data', 'mobile', 'phone', 'recharge', 'mtn', 'airtel'], cat: 'mobile_communication' },
    { keywords: ['insurance', 'premium', 'policy', 'coverage'], cat: 'insurance' },
    { keywords: ['savings', 'deposit', 'investment', 'stock', 'bond', 'contribution', 'pension'], cat: 'savings_investments' },
  ];

  function inferCategory(tx: any): string {
    const raw = (tx.category || tx.type || 'other').toLowerCase();
    if (raw !== 'other' && raw !== 'payment' && raw !== 'withdrawal' && raw !== 'transfer' && raw !== 'withdraw') {
      return raw;
    }
    const desc = (tx.description || '').toLowerCase();
    for (const entry of DESC_TO_CAT) {
      if (entry.keywords.some(kw => desc.includes(kw))) {
        return entry.cat;
      }
    }
    return 'other';
  }

  const TYPE_TO_CAT: Record<string, string> = {
    food_dining: 'Food & Dining', food: 'Food & Dining', groceries: 'Food & Dining', restaurant: 'Food & Dining', dining: 'Food & Dining',
    transport_fuel: 'Transport & Fuel', transport: 'Transport & Fuel', fuel: 'Transport & Fuel',
    housing_rent: 'Housing & Rent', housing: 'Housing & Rent', rent: 'Housing & Rent',
    utilities_bills: 'Utilities & Bills', utilities: 'Utilities & Bills', bills: 'Utilities & Bills', electricity: 'Utilities & Bills', water: 'Utilities & Bills',
    healthcare: 'Healthcare', health: 'Healthcare', medical: 'Healthcare', pharmacy: 'Healthcare',
    education: 'Education', tuition: 'Education', course: 'Education', school: 'Education',
    entertainment_leisure: 'Entertainment & Leisure', entertainment: 'Entertainment & Leisure', leisure: 'Entertainment & Leisure',
    shopping_retail: 'Shopping & Retail', shopping: 'Shopping & Retail', retail: 'Shopping & Retail',
    mobile_communication: 'Mobile & Communication', mobile: 'Mobile & Communication', communication: 'Mobile & Communication', airtime: 'Mobile & Communication',
    insurance: 'Insurance',
    savings_investments: 'Savings & Investments', savings: 'Savings & Investments', investments: 'Savings & Investments', investment: 'Savings & Investments',
    payment: 'Other', withdraw: 'Other', withdrawal: 'Other', transfer: 'Other', deposit: 'Other', other: 'Other',
  };

  const loadSpendingData = async () => {
    setLoading(true);
    try {
      const txResponse = await bankService.getTransactions();
      let transactions = txResponse.data?.transactions || [];

      // Always start with all 12 demo categories as the base
      const merged = userCategories.map(c => ({ ...c }));
      let spent = 0;
      let income = 0;

      if (transactions.length > 0) {
        // Zero out demo values — only show real transaction amounts
        merged.forEach(c => { c.value = 0; });

        const rawMap: Record<string, number> = {};
        transactions.forEach((tx: any) => {
          const amt = Number(tx.amount || 0);
          const raw = inferCategory(tx);
          if (isExpense(tx)) {
            rawMap[raw] = (rawMap[raw] || 0) + amt;
            spent += amt;
          } else if (isIncome(tx)) {
            income += amt;
          }
        });

        // Overlay real transaction amounts onto matching demo categories
        Object.entries(rawMap).forEach(([rawType, totalAmt]) => {
          const catName = TYPE_TO_CAT[rawType];
          const match = merged.find(c => c.name === catName);
          if (match) {
            match.value = totalAmt;
          } else {
            // Unknown type -> add into "Other"
            const other = merged.find(c => c.name === 'Other');
            if (other) other.value += totalAmt;
          }
        });

        // Recalculate percentages
        const grandTotal = merged.reduce((s, c) => s + c.value, 0);
        merged.forEach(c => { c.percentage = grandTotal > 0 ? Math.round((c.value / grandTotal) * 1000) / 10 : 0; });
        merged.sort((a, b) => b.value - a.value);
      }

      setCategoryData(merged);
      setTotalSpent(spent || merged.reduce((s, c) => s + c.value, 0));
      setTotalIncome(income || 2800000);

      // Build monthly trend data (real if available, else demo)
      if (transactions.length > 0) {
        const monthMap: Record<string, { spending: number; income: number }> = {};
        transactions.forEach((tx: any) => {
          const amt = Number(tx.amount || 0);
          const date = tx.created_at ? new Date(tx.created_at) : new Date();
          const key = date.toLocaleString('en-US', { month: 'short' });
          if (!monthMap[key]) monthMap[key] = { spending: 0, income: 0 };
          if (isExpense(tx)) monthMap[key].spending += amt;
          else if (isIncome(tx)) monthMap[key].income += amt;
        });
        const months = Object.entries(monthMap).map(([month, data]) => ({ month, ...data }));
        setMonthlyData(months.length ? months : userTrends);
      } else {
        setMonthlyData(userTrends);
      }

      // Generate personalized advice
      if (merged.length > 0) {
        const topCat = merged[0];
        const total = spent || merged.reduce((s, c) => s + c.value, 0);
        const advice = generateCategoryAdvice(merged, total);
        if (advice.length > 0) setMarketInsights(advice);
        if (!marketGuide) setMarketGuide(`Your top spending category is ${topCat.name} (RWF ${topCat.value.toLocaleString()}). ${advice[0] || ''}`);
      }
    } catch {
      const total = userCategories.reduce((s, c) => s + c.value, 0);
      setCategoryData(userCategories);
      setMonthlyData(userTrends);
      setTotalSpent(total);
      setTotalIncome(2800000);
    } finally {
      setLoading(false);
    }
  };

  const generateCategoryAdvice = (cats: { name: string; value: number }[], total: number): string[] => {
    const advice: string[] = [];
    const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;
    cats.forEach(cat => {
      const percent = pct(cat.value);
      const key = cat.name.toLowerCase();
      if (key.includes('food') || key === 'groceries') {
        advice.push(`Food & Dining takes ${percent}% of your spending — buy seasonal local produce and meal prep to cut costs by up to 18%.`);
      } else if (key.includes('transport') || key.includes('fuel')) {
        advice.push(`Transport & Fuel is ${percent}% of your spending — consider shared rides or public transport to save.`);
      } else if (key.includes('bills') || key.includes('utilities')) {
        advice.push(`Utilities & Bills account for ${percent}% — prepay annual subscriptions for 5-15% discounts.`);
      } else if (key.includes('housing') || key.includes('rent')) {
        advice.push(`Housing & Rent takes ${percent}% of your budget — aim to keep housing under 30% of income.`);
      } else if (key.includes('mobile') || key.includes('communication')) {
        advice.push(`Mobile & Communication is ${percent}% of spending — bundle purchases to reduce fees.`);
      } else if (key.includes('entertainment') || key.includes('leisure')) {
        advice.push(`Entertainment & Leisure at ${percent}% — look for package deals and loyalty programs.`);
      } else if (key.includes('shopping') || key.includes('retail')) {
        advice.push(`Shopping & Retail is ${percent}% of your spending — compare prices and avoid impulse buys.`);
      } else if (key.includes('health')) {
        advice.push(`Healthcare spending at ${percent}% — consider a health insurance plan to manage costs.`);
      } else if (key.includes('education')) {
        advice.push(`Education is ${percent}% of your spending — explore scholarships and online resources.`);
      } else if (key.includes('insurance')) {
        advice.push(`Insurance at ${percent}% — review your coverage for potential savings.`);
      } else if (key.includes('savings') || key.includes('investment')) {
        advice.push(`Savings & Investments at ${percent}% — great habit! Consider diversifying your portfolio.`);
      }
    });
    if (advice.length === 0) {
      advice.push('Track your daily expenses to identify saving opportunities and set a monthly budget.');
    }
    return advice;
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const history = chatMessages.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
      const response = await aiService.chat(userMsg, history);
      const reply = response.data?.reply || response.data?.message || "I'm analyzing your spending patterns. Based on your transactions, I recommend tracking your daily expenses to identify saving opportunities.";
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "I couldn't fetch real-time analysis right now. Here's a tip: try categorizing your expenses to better understand your spending habits. Would you like me to help you set a budget?" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchMarketGuidance = async () => {
    if (guidanceLoading) return;
    setGuidanceLoading(true);

    try {
      // First try ML-powered spending analysis with real transactions
      const txResponse = await bankService.getTransactions();
      let transactions = txResponse.data?.transactions || [];
      if (!transactions.length) transactions = userDemoTransactions;

      // Map transactions to the format the AI engine expects
      const mappedTx = transactions.map((tx: any) => ({
        amount: tx.amount,
        category: tx.category || tx.type || 'other',
        description: tx.description || '',
        date: tx.created_at ? new Date(tx.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: isExpense(tx) ? 'expense' : isIncome(tx) ? 'income' : 'expense'
      }));

      let totalIncomeVal = totalIncome || 0;
      mappedTx.forEach((tx: any) => {
        if (tx.type === 'income') totalIncomeVal += Number(tx.amount || 0);
      });
      const estimatedMonthlyIncome = totalIncomeVal || totalSpent * 1.5 || 500000;

      let mlInsights: string[] = [];
      try {
        const mlResult = await aiService.analyzeSpending(mappedTx, estimatedMonthlyIncome);
        if (mlResult?.recommendations) {
          mlInsights = mlResult.recommendations;
        }
        if (mlResult?.spending_insights) {
          setMarketGuide(mlResult.spending_insights);
        }
        if (mlResult?.ai_powered) {
          setAnalysisCompleted(true);
        }
      } catch {
        // ML endpoint unavailable, fall through to insights service
      }

      // Combine ML insights with AI-generated guidance
      const response = await aiService.generateInsights();
      const generated = response.data?.insights || [];
      const aiMessages = generated.map((insight: any) => insight.message).filter(Boolean);

      const allMessages = Array.from(new Set([...mlInsights, ...aiMessages]));

      if (allMessages.length > 0) {
        if (!marketGuide) setMarketGuide('AI has analyzed your spending and market trends to help you cut costs.');
        setMarketInsights(allMessages);
      } else {
        setMarketGuide('Try these market-smart spending tips to keep costs low.');
        setMarketInsights([
          'Buy seasonal groceries and local products at market prices to reduce food costs by up to 18%.',
          'Choose cheaper transport options like shared rides or public buses to lower your transport spend.',
          'Group your purchases and avoid impulse buys when prices are high.',
        ]);
      }
    } catch (error) {
      console.error('Error generating market guidance:', error);
      setMarketGuide('Try these market-smart spending tips to keep costs low.');
      setMarketInsights([
        'Buy seasonal groceries and local products at market prices to reduce food costs by up to 18%.',
        'Choose cheaper transport options like shared rides or public buses to lower your transport spend.',
        'Group your purchases and avoid impulse buys when prices are high.',
        'Set a monthly budget for each spending category and track it weekly.',
        'Consider prepaying annual bills (insurance, subscriptions) for discounts of 5-15%.',
      ]);
    } finally {
      setGuidanceLoading(false);
      setFetchedGuidance(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A1628]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Analysis</h1>
              {analysisCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700">
                  <Sparkles size={12} />
                  AI Analysis Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                  <Clock size={12} />
                  Dataset Pending Analysis
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered breakdown of <strong>{userName}'s</strong> finances · {categoryData.length} categories loaded</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1F3A] rounded-3xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
          <div className="flex gap-2 px-6 pt-5 pb-0 border-b border-gray-100 dark:border-gray-800">
            {[
              { key: 'overview', label: 'AI-Powered Financial Intelligence', icon: <Sparkles size={14} /> },
              { key: 'category', label: 'Spending by Category', icon: <PieIcon size={14} /> },
              { key: 'trend', label: 'Spending Trend', icon: <TrendingUp size={14} /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as Tab)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl text-xs sm:text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-[#0A9396] text-white shadow-md shadow-teal-500/30'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="px-6 py-6">
            {tab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-teal-50 dark:bg-[#0A9396]/10 rounded-xl p-4 border border-teal-100 dark:border-[#0A9396]/20">
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">Total Spending</p>
                    <p className="text-2xl font-bold text-teal-700 dark:text-teal-300 mt-1">RWF {totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-[#005F73]/10 rounded-xl p-4 border border-blue-100 dark:border-[#005F73]/20">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Categories Tracked</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{categoryData.length}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-[#E9C46A]/10 rounded-xl p-4 border border-amber-100 dark:border-[#E9C46A]/20">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Data Period</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{monthlyData.length} mo</p>
                  </div>
                </div>

                {categoryData.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Spending Summary</h4>
                    {marketInsights.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {marketInsights.slice(0, 4).map((insight, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">◆</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tracked <strong>{categoryData.length} categories</strong> with total spending of{' '}
                        <strong>RWF {totalSpent.toLocaleString()}</strong>.{' '}
                        {categoryData[0] && (
                          <>Top category: <strong>{categoryData[0].name}</strong> (RWF {categoryData[0].value.toLocaleString()}).</>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {marketGuide && (
                  <div className="mt-4 p-3 bg-teal-50 dark:bg-[#0A9396]/10 rounded-xl border border-teal-100 dark:border-[#0A9396]/20">
                    <p className="text-sm text-teal-700 dark:text-teal-300">{marketGuide}</p>
                  </div>
                )}
              </motion.div>
            ) : tab === 'category' ? (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Total spent: <strong className="text-red-500">RWF {totalSpent.toLocaleString()}</strong>
                  {totalIncome > 0 && (
                    <> &nbsp;|&nbsp; Total received: <strong className="text-teal-500">RWF {totalIncome.toLocaleString()}</strong></>
                  )}
                </p>
                {loading ? (
                  <div className="flex items-center justify-center h-[350px]">
                    <div className="text-gray-500 dark:text-gray-400">Loading chart data...</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: '100%', height: 350, minWidth: 300, minHeight: 350, position: 'relative' }}>
                      <ResponsiveContainer width="100%" height={350} minWidth={300} minHeight={350}>
                        <PieChart>
                          <Pie
                            data={chartCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={130}
                            paddingAngle={4}
                            dataKey="value"
                            isAnimationActive={false}
                          >
                            {chartCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            formatter={(value) => (
                              <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {categoryData.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                        {categoryData.map((cat) => {
                          const pct = totalSpent > 0 ? ((cat.value / totalSpent) * 100).toFixed(1) : '0';
                          return (
                            <div key={cat.name} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                              <span style={{ width: 14, height: 14, borderRadius: 4, background: cat.color, flexShrink: 0 }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{cat.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  RWF {cat.value.toLocaleString()} ({pct}%)
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="trend"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {monthlyData.length}-month income vs spending comparison
                </p>
                {loading ? (
                  <div className="flex items-center justify-center h-[350px]">
                    <div className="text-gray-500 dark:text-gray-400">Loading trend data...</div>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 350, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="incomeGradPage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0A9396" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0A9396" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="spendGradPage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E76F51" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#E76F51" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="income" name="Income" stroke="#0A9396" strokeWidth={2.5} fill="url(#incomeGradPage)" dot={{ r: 4, fill: '#0A9396' }} isAnimationActive={false} />
                        <Area type="monotone" dataKey="spending" name="Spending" stroke="#E76F51" strokeWidth={2.5} fill="url(#spendGradPage)" dot={{ r: 4, fill: '#E76F51' }} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Dataset Pending Analysis Info */}
        {!analysisCompleted && (
        <div className="mt-6 p-4 rounded-2xl border border-dashed border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Database size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Dataset Pending AI Analysis
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                <strong>12 categories</strong> · <strong>{userDemoTransactions.length} demo transactions</strong> · 
                <strong>12-month trend</strong> · RWF {userCategories.reduce((s, c) => s + c.value, 0).toLocaleString()} total spending · <strong>{userName}</strong>
              </p>
              <p className="text-xs text-amber-500 dark:text-amber-500 mt-1">
                This categorized dataset is ready for ML-powered analysis. Categories clearly defined for research and dissertation presentation.
              </p>
            </div>
          </div>
        </div>
        )}

        <div className="mt-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F3A] shadow-xl shadow-black/10 dark:shadow-black/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 dark:bg-[#0A9396]/20 rounded-xl text-[#0A9396]">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart spending guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use market-aware recommendations to spend less without sacrificing value.
                </p>
              </div>
            </div>
            <button
              onClick={fetchMarketGuidance}
              className="inline-flex items-center justify-center rounded-xl bg-[#0A9396] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#04786c] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={guidanceLoading}
            >
              {guidanceLoading ? 'Fetching advice...' : fetchedGuidance ? 'Refresh guidance' : 'See market price guidance'}
            </button>
          </div>
          {marketGuide && (
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{marketGuide}</p>
          )}
          {marketInsights.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              {marketInsights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          )}
        </div>

        {marketInsights.length > 0 && (
          <div className="mt-6 p-5 bg-teal-50 dark:bg-[#0A9396]/10 rounded-2xl flex items-start gap-3 border border-teal-100 dark:border-[#0A9396]/20">
            <span className="text-lg flex-shrink-0">🤖</span>
            <div>
              <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">AI Recommendation</p>
              <p className="text-sm text-teal-700 dark:text-teal-400 mt-1">
                {marketInsights[0]}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#0A9396] dark:hover:text-[#0A9396] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* AI Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-[1001] p-3.5 rounded-full bg-[#0A9396] text-white shadow-xl shadow-teal-500/30 hover:bg-[#04786c] transition-all hover:scale-110"
      >
        {chatOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* AI Chat Window */}
      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-6 z-[1001] w-80 sm:w-96 bg-white dark:bg-[#0B1F3A] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
          style={{ maxHeight: '500px' }}
        >
          <div className="px-4 py-3 bg-[#0A9396] text-white flex items-center gap-2">
            <Bot size={18} />
            <span className="font-semibold text-sm">AI Spending Assistant</span>
          </div>
          {categoryData.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Spending by Category</p>
              <div className="flex flex-wrap gap-1">
                {categoryData.map(cat => (
                  <span
                    key={cat.name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: cat.color + '18', color: cat.color, border: `1px solid ${cat.color}30` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}: RWF {cat.value.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: '300px', maxHeight: '350px' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${msg.role === 'user' ? 'bg-[#0A9396]/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {msg.role === 'user' ? <User size={14} className="text-[#0A9396]" /> : <Bot size={14} className="text-gray-600 dark:text-gray-300" />}
                  </div>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#0A9396] text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant' ? renderMessageText(msg.text) : msg.text}
                  </div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#0A9396] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#0A9396] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#0A9396] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask about your spending..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 rounded-xl bg-[#0A9396] text-white disabled:opacity-50 hover:bg-[#04786c] transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SpendingAnalysisPage;
