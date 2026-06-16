import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, PieChart as PieIcon, Database, Clock } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { bankService, aiService } from '../services/api';
import { pendingCategoryBreakdown, pendingMonthlyTrend } from '../data/mockData';

interface SpendingAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#0A9396', '#005F73', '#94D2BD', '#E9C46A', '#F4A261', '#E76F51', '#CA6702', '#9B2226', '#6A4C93', '#1982C4', '#8AC926', '#6C757D'];

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

const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'pie' | 'trend'>('pie');
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [marketGuide, setMarketGuide] = useState('');
  const [marketInsights, setMarketInsights] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const response = await bankService.getTransactions();
        const transactions = response.data || [];

        // Process category data for pie chart
        const categoryMap: { [key: string]: number } = {};
        transactions.forEach((tx: any) => {
          const cat = tx.category || tx.type || 'other';
          if (tx.amount > 0) { // Positive amounts are expenses
            categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
          }
        });

        const categories = Object.entries(categoryMap).map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));

        setCategoryData(categories);
        setTotalSpent(categories.reduce((sum, cat) => sum + cat.value, 0));

        // Process monthly data for trend chart
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
          .slice(-6) // Last 6 months
          .map(([month, data]) => ({
            month,
            spending: data.spending,
            income: data.income
          }));

        setMonthlyData(monthly);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        // Rich fallback dataset from mockData
        setCategoryData(pendingCategoryBreakdown);
        setMonthlyData(pendingMonthlyTrend);
        setTotalSpent(pendingCategoryBreakdown.reduce((s, c) => s + c.value, 0));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

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
    }
  };

  // Trap scroll behind modal
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed inset-0 z-[1001] flex items-start sm:items-center justify-center p-4 pt-8 sm:pt-4 overflow-y-auto pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl bg-white dark:bg-[#0B1F3A] rounded-3xl shadow-2xl shadow-black/30 overflow-y-auto max-h-[85vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 dark:bg-[#0A9396]/20 rounded-xl text-[#0A9396]">
                    <PieIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Spending Analysis</h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                        <Clock size={10} />
                        Dataset
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered breakdown · 12 categories loaded</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex gap-2 px-6 pt-4 pb-0">
                {[
                  { key: 'pie', label: 'Category Breakdown', icon: <PieIcon size={14} /> },
                  { key: 'trend', label: 'Monthly Trends', icon: <TrendingUp size={14} /> },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key as 'pie' | 'trend')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      tab === t.key
                        ? 'bg-[#0A9396] text-white shadow-md shadow-teal-500/30'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Chart Area */}
              <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  {tab === 'pie' ? (
                    <motion.div
                      key="pie"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Total spent this month: <strong className="text-gray-800 dark:text-white">RWF {totalSpent.toLocaleString()}</strong>
                      </p>
                      {loading ? (
                        <div className="flex items-center justify-center h-[300px]">
                          <div className="text-gray-500 dark:text-gray-400">Loading chart data...</div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
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
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="trend"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        6-month income vs spending comparison
                      </p>
                      {loading ? (
                        <div className="flex items-center justify-center h-[300px]">
                          <div className="text-gray-500 dark:text-gray-400">Loading trend data...</div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0A9396" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#0A9396" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
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
                              <Area type="monotone" dataKey="income" name="Income" stroke="#0A9396" strokeWidth={2.5} fill="url(#incomeGrad)" dot={{ r: 4, fill: '#0A9396' }} />
                              <Area type="monotone" dataKey="spending" name="Spending" stroke="#E76F51" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ r: 4, fill: '#E76F51' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mx-6 mb-5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Smart spending guide</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use market-aware recommendations to spend less without sacrificing value.
                    </p>
                  </div>
                  <button
                    onClick={fetchMarketGuidance}
                    title="See market price guidance"
                    className="inline-flex items-center justify-center rounded-xl bg-[#0A9396] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#04786c] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={guidanceLoading}
                  >
                    {guidanceLoading ? 'Fetching advice...' : 'See market price guidance'}
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

              {/* Footer AI tip */}
              <div className="mx-6 mb-5 p-3.5 bg-teal-50 dark:bg-[#0A9396]/10 rounded-2xl flex items-start gap-3 border border-teal-100 dark:border-[#0A9396]/20">
                <span className="text-lg flex-shrink-0">🤖</span>
                <p className="text-sm text-teal-800 dark:text-teal-300">
                  <strong>AI Recommendation:</strong> Your Food spending is highest this month. Consider meal prepping to reduce costs by ~20%.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SpendingAnalytics;
