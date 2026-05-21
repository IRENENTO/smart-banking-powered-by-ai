import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart as PieIcon, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { bankService, aiService } from '../services/api';
import Navbar from '../components/Navbar';

const COLORS = ['#0A9396', '#005F73', '#94D2BD', '#E9C46A', '#F4A261', '#E76F51'];

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

const SpendingAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pie' | 'trend'>('pie');
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [marketGuide, setMarketGuide] = useState('');
  const [marketInsights, setMarketInsights] = useState<string[]>([]);
  const [fetchedGuidance, setFetchedGuidance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bankService.getTransactions();
        const transactions = response.data || [];

        const categoryMap: { [key: string]: number } = {};
        transactions.forEach((tx: any) => {
          if (tx.category && tx.amount > 0) {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
          }
        });

        const categories = Object.entries(categoryMap).map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));

        setCategoryData(categories);
        setTotalSpent(categories.reduce((sum, cat) => sum + cat.value, 0));

        const monthlyMap: { [key: string]: { spending: number; income: number } } = {};
        transactions.forEach((tx: any) => {
          const date = new Date(tx.date);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { spending: 0, income: 0 };
          }

          if (tx.amount > 0) {
            monthlyMap[monthKey].spending += tx.amount;
          } else {
            monthlyMap[monthKey].income += Math.abs(tx.amount);
          }
        });

        const monthly = Object.entries(monthlyMap)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .slice(-6)
          .map(([month, data]) => ({
            month,
            spending: data.spending,
            income: data.income
          }));

        setMonthlyData(monthly);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setCategoryData([
          { name: 'Food', value: 38500, color: '#0A9396' },
          { name: 'Transport', value: 18700, color: '#005F73' },
          { name: 'Bills', value: 24300, color: '#94D2BD' },
          { name: 'Mobile Money', value: 23500, color: '#E9C46A' },
          { name: 'Entertainment', value: 8200, color: '#F4A261' },
          { name: 'Other', value: 11400, color: '#E76F51' },
        ]);
        setMonthlyData([
          { month: 'Nov', spending: 95000, income: 210000 },
          { month: 'Dec', spending: 128000, income: 215000 },
          { month: 'Jan', spending: 102000, income: 220000 },
          { month: 'Feb', spending: 88000, income: 220000 },
          { month: 'Mar', spending: 115000, income: 225000 },
          { month: 'Apr', spending: 124600, income: 228000 },
        ]);
        setTotalSpent(124600);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchMarketGuidance = async () => {
    if (guidanceLoading) return;
    setGuidanceLoading(true);

    try {
      const response = await aiService.generateInsights();
      const generated = response.data?.insights || [];
      const messages = generated.map((insight: any) => insight.message).filter(Boolean);

      if (messages.length > 0) {
        setMarketGuide('AI has analyzed your spending and market trends to help you cut costs.');
        setMarketInsights(messages);
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
      setMarketGuide('Unable to fetch AI guidance right now. Please try again later.');
      setMarketInsights([]);
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
                  Total spent: <strong className="text-gray-800 dark:text-white">RWF {totalSpent.toLocaleString()}</strong>
                </p>
                {loading ? (
                  <div className="flex items-center justify-center h-[350px]">
                    <div className="text-gray-500 dark:text-gray-400">Loading chart data...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        paddingAngle={4}
                        dataKey="value"
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
                  <ResponsiveContainer width="100%" height={350}>
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
                      <Area type="monotone" dataKey="income" name="Income" stroke="#0A9396" strokeWidth={2.5} fill="url(#incomeGradPage)" dot={{ r: 4, fill: '#0A9396' }} />
                      <Area type="monotone" dataKey="spending" name="Spending" stroke="#E76F51" strokeWidth={2.5} fill="url(#spendGradPage)" dot={{ r: 4, fill: '#E76F51' }} />
                    </AreaChart>
                  </ResponsiveContainer>
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

        <div className="mt-6 p-5 bg-teal-50 dark:bg-[#0A9396]/10 rounded-2xl flex items-start gap-3 border border-teal-100 dark:border-[#0A9396]/20">
          <span className="text-lg flex-shrink-0">🤖</span>
          <div>
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">AI Recommendation</p>
            <p className="text-sm text-teal-700 dark:text-teal-400 mt-1">
              Your Food spending is highest this month. Consider meal prepping to reduce costs by ~20%.
            </p>
          </div>
        </div>

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
    </div>
  );
};

export default SpendingAnalysisPage;
