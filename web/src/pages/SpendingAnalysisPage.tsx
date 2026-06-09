import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart as PieIcon, ArrowLeft, Sparkles, Send, Bot, User, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { bankService, aiService } from '../services/api';
import Navbar from '../components/Navbar';

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

const DEMO_TRANSACTIONS = [
  { id: 1, type: 'food', amount: 12500, description: 'Groceries at Nakumatt', created_at: '2026-04-15T10:30:00Z' },
  { id: 2, type: 'transport', amount: 5000, description: 'Bus pass monthly', created_at: '2026-04-14T08:00:00Z' },
  { id: 3, type: 'bills', amount: 25000, description: 'Electricity bill', created_at: '2026-04-12T14:00:00Z' },
  { id: 4, type: 'food', amount: 8500, description: 'Restaurant dinner', created_at: '2026-04-10T19:30:00Z' },
  { id: 5, type: 'entertainment', amount: 15000, description: 'Concert tickets', created_at: '2026-04-08T20:00:00Z' },
  { id: 6, type: 'transport', amount: 3000, description: 'Taxi fare', created_at: '2026-04-06T09:15:00Z' },
  { id: 7, type: 'food', amount: 18000, description: 'Monthly meal prep service', created_at: '2026-04-05T11:00:00Z' },
  { id: 8, type: 'bills', amount: 15000, description: 'Water bill', created_at: '2026-04-03T13:00:00Z' },
  { id: 9, type: 'mobile_money', amount: 10000, description: 'Airtime & data bundle', created_at: '2026-04-01T07:00:00Z' },
  { id: 10, type: 'other', amount: 7000, description: 'Miscellaneous', created_at: '2026-03-28T16:00:00Z' },
  { id: 11, type: 'food', amount: 9500, description: 'Weekly groceries', created_at: '2026-03-25T10:00:00Z' },
  { id: 12, type: 'bills', amount: 25000, description: 'Internet subscription', created_at: '2026-03-22T12:00:00Z' },
];

const DEFAULT_CATEGORIES = [
  { name: 'Food', value: 38500, color: '#0A9396' },
  { name: 'Transport', value: 18700, color: '#005F73' },
  { name: 'Bills', value: 24300, color: '#94D2BD' },
  { name: 'Mobile Money', value: 23500, color: '#E9C46A' },
  { name: 'Entertainment', value: 8200, color: '#F4A261' },
  { name: 'Other', value: 11400, color: '#E76F51' },
];
const DEFAULT_MONTHLY = [
  { month: 'Nov', spending: 95000, income: 210000 },
  { month: 'Dec', spending: 128000, income: 215000 },
  { month: 'Jan', spending: 102000, income: 220000 },
  { month: 'Feb', spending: 88000, income: 220000 },
  { month: 'Mar', spending: 115000, income: 225000 },
  { month: 'Apr', spending: 124600, income: 228000 },
];

const SpendingAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pie' | 'trend'>('pie');
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [marketGuide, setMarketGuide] = useState('');
  const [marketInsights, setMarketInsights] = useState<string[]>([]);
  const [fetchedGuidance, setFetchedGuidance] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: 'Hi! I\'m your AI spending assistant. Ask me anything about your finances!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    loadSpendingData();
  }, []);

  const COLORS_PALETTE = ['#0A9396', '#005F73', '#94D2BD', '#E9C46A', '#F4A261', '#E76F51', '#CA6702', '#9B2226'];

  const COLORS_MAP: Record<string, string> = {
    payment: '#E76F51',
    withdraw: '#CA6702',
    withdrawal: '#CA6702',
    transfer: '#0A9396',
    deposit: '#005F73',
    food: '#0A9396',
    transport: '#005F73',
    bills: '#94D2BD',
    mobile_money: '#E9C46A',
    entertainment: '#F4A261',
    other: '#E76F51',
  };

  const loadSpendingData = async () => {
    setLoading(true);
    try {
      const txResponse = await bankService.getTransactions();
      let transactions = txResponse.data?.transactions || [];

      if (!transactions.length) {
        setCategoryData(DEFAULT_CATEGORIES);
        setMonthlyData(DEFAULT_MONTHLY);
        setTotalSpent(124600);
        setLoading(false);
        return;
      }

      // Build category breakdown from expense transactions
      const catMap: Record<string, number> = {};
      let spent = 0;
      let income = 0;
      transactions.forEach((tx: any) => {
        const amt = Number(tx.amount || 0);
        const cat = tx.category || tx.type || 'other';
        if (isExpense(tx)) {
          catMap[cat] = (catMap[cat] || 0) + amt;
          spent += amt;
        } else if (isIncome(tx)) {
          income += amt;
        }
      });

      const cats = Object.entries(catMap)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: COLORS_MAP[name] || '#94D2BD' }))
        .sort((a, b) => b.value - a.value);

      setCategoryData(cats.length ? cats : DEFAULT_CATEGORIES);
      setTotalSpent(spent);
      setTotalIncome(income);

      // Build monthly trend data
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
      setMonthlyData(months.length ? months : DEFAULT_MONTHLY);

      // Generate personalized advice from actual category breakdown
      if (cats.length > 0) {
        const topCat = cats[0];
        const total = spent;
        const advice = generateCategoryAdvice(cats, total);
        if (advice.length > 0) setMarketInsights(advice);
        if (!marketGuide) setMarketGuide(`Your top spending category is ${topCat.name} (RWF ${topCat.value.toLocaleString()}). ${advice[0] || ''}`);
      }
    } catch {
      setCategoryData(DEFAULT_CATEGORIES);
      setMonthlyData(DEFAULT_MONTHLY);
      setTotalSpent(124600);
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
      if (key === 'food' || key === 'groceries') {
        advice.push(`Food takes ${percent}% of your spending — buy seasonal local produce and meal prep to cut costs by up to 18%.`);
      } else if (key === 'transport') {
        advice.push(`Transport is ${percent}% of your spending — consider shared rides or public transport to save.`);
      } else if (key === 'bills' || key === 'utilities') {
        advice.push(`Bills account for ${percent}% — prepay annual subscriptions for 5-15% discounts.`);
      } else if (key === 'mobile_money' || key === 'airtime') {
        advice.push(`Mobile Money is ${percent}% of spending — bundle purchases to reduce transaction fees.`);
      } else if (key === 'entertainment') {
        advice.push(`Entertainment at ${percent}% — look for package deals and loyalty programs.`);
      } else if (key === 'shopping') {
        advice.push(`Shopping is ${percent}% of your spending — compare prices and avoid impulse buys.`);
      } else if (key === 'health') {
        advice.push(`Health spending at ${percent}% — consider a health insurance plan to manage costs.`);
      } else if (key === 'education') {
        advice.push(`Education is ${percent}% of your spending — explore scholarships and online resources.`);
      } else if (key === 'rent') {
        advice.push(`Rent takes ${percent}% of your budget — aim to keep housing under 30% of income.`);
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
      const response = await aiService.chat(userMsg);
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
      if (!transactions.length) transactions = DEMO_TRANSACTIONS;

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
        const mlData = mlResult?.data;
        if (mlData?.recommendations) {
          mlInsights = mlData.recommendations;
        }
        if (mlData?.spending_insights) {
          setMarketGuide(mlData.spending_insights);
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Analysis</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered breakdown of your finances</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1F3A] rounded-3xl shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
          <div className="flex gap-2 px-6 pt-5 pb-0 border-b border-gray-100 dark:border-gray-800">
            {[
              { key: 'pie', label: 'Category Breakdown', icon: <PieIcon size={14} /> },
              { key: 'trend', label: 'Monthly Trends', icon: <TrendingUp size={14} /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as 'pie' | 'trend')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
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
            {tab === 'pie' ? (
              <motion.div
                key="pie"
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
                  <div style={{ width: '100%', height: 350, minWidth: 300, minHeight: 350, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={350} minWidth={300} minHeight={350}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={130}
                          paddingAngle={4}
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {categoryData.map((entry, index) => (
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
                  6-month income vs spending comparison
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
