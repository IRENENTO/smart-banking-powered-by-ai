import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import { paymentService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  FileText, Calendar, TrendingUp, TrendingDown,
  DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Clock,
  BarChart3, PieChart, ChevronRight, Eye, Printer, FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  balance_after?: number;
  recipient_name?: string;
  recipient_account_number?: string;
}

interface ReportRow {
  period: string;
  dateRange: string;
  income: number;
  expenses: number;
  count: number;
  transactions: Transaction[];
}

const formatRWF = (v: number) =>
  'RWF ' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const getPeriodStart = (date: Date, period: Period): Date => {
  const d = new Date(date);
  if (period === 'daily') {
    d.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
};

const formatPeriod = (start: Date, period: Period): string => {
  if (period === 'daily') return start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  if (period === 'weekly') {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  if (period === 'monthly') return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return start.getFullYear().toString();
};

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'deposit': case 'credit': return '#10b981';
    case 'withdrawal': case 'withdraw': case 'debit': return '#ef4444';
    case 'transfer': return '#f59e0b';
    case 'payment': case 'send': return '#3b82f6';
    default: return '#64748b';
  }
};

const toNum = (v: any) => Number(v) || 0;

const Statements: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const cardBg = isDark ? 'rgba(15, 23, 42, 0.6)' : 'white';
  const borderColor = isDark ? 'rgba(148, 163, 184, 0.15)' : '#e2e8f0';

  const loadData = async () => {
    setLoading(true);
    try {
      const [txRes] = await Promise.all([
        paymentService.getTransactionHistory()
      ]);
      const txData = txRes?.data?.transactions || txRes?.data?.data || txRes?.data || [];
      setTransactions(Array.isArray(txData) ? txData.slice(0, 500) : []);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const reportRows = useMemo((): ReportRow[] => {
    const groups = new Map<string, Transaction[]>();
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    for (const tx of sorted) {
      const start = getPeriodStart(new Date(tx.created_at), selectedPeriod);
      const key = start.toISOString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tx);
    }

    return Array.from(groups.entries())
      .map(([key, txs]) => {
        const start = new Date(key);
        const income = txs.filter(t => ['deposit', 'credit'].includes(t.type?.toLowerCase()))
          .reduce((s, t) => s + toNum(t.amount), 0);
        const expenses = txs.filter(t => ['withdrawal', 'withdraw', 'debit', 'payment', 'send'].includes(t.type?.toLowerCase()))
          .reduce((s, t) => s + toNum(t.amount), 0);
        return {
          period: formatPeriod(start, selectedPeriod),
          dateRange: key,
          income,
          expenses,
          count: txs.length,
          transactions: txs.slice(0, 50)
        };
      })
      .slice(0, 52);
  }, [transactions, selectedPeriod]);

  const totals = useMemo(() => ({
    income: reportRows.reduce((s, r) => s + r.income, 0),
    expenses: reportRows.reduce((s, r) => s + r.expenses, 0),
    count: reportRows.reduce((s, r) => s + r.count, 0),
  }), [reportRows]);

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deposit': case 'credit': return <ArrowDownRight size={14} color="#10b981" />;
      case 'withdrawal': case 'withdraw': case 'debit': return <ArrowUpRight size={14} color="#ef4444" />;
      case 'transfer': return <BarChart3 size={14} color="#f59e0b" />;
      case 'payment': case 'send': return <DollarSign size={14} color="#3b82f6" />;
      default: return <DollarSign size={14} color={mutedColor} />;
    }
  };

  const handleDownloadPeriodPDF = (row: ReportRow) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const colW = (pageWidth - margin * 2) / 3;

    const generatedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    doc.setFontSize(18);
    doc.setTextColor(11, 31, 58);
    doc.text('Account Activity Report', margin, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${row.period} — Generated ${generatedDate}`, margin, 30);
    doc.text(`Period: ${row.period}`, margin, 36);

    const summaryY = 44;
    doc.setFillColor(10, 147, 150);
    doc.rect(margin, summaryY, colW - 4, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Total Income', margin + 4, summaryY + 7);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRWF(row.income), margin + 4, summaryY + 18);
    doc.setFont('helvetica', 'normal');

    doc.setFillColor(239, 68, 68);
    doc.rect(margin + colW - 4, summaryY, colW - 4, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Total Expenses', margin + colW, summaryY + 7);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRWF(row.expenses), margin + colW, summaryY + 18);
    doc.setFont('helvetica', 'normal');

    const netColor = row.income >= row.expenses ? [10, 147, 150] : [239, 68, 68];
    doc.setFillColor(netColor[0], netColor[1], netColor[2]);
    doc.rect(margin + (colW - 4) * 2, summaryY, colW - 4, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Net Balance', margin + (colW - 4) * 2 + 4, summaryY + 7);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRWF(row.income - row.expenses), margin + (colW - 4) * 2 + 4, summaryY + 18);
    doc.setFont('helvetica', 'normal');

    let yPos = summaryY + 30;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPos, pageWidth - margin * 2, 12, 'F');
    doc.rect(margin, yPos, pageWidth - margin * 2, 12, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(row.period, margin + 4, yPos + 8);

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Income: ${formatRWF(row.income)}`, pageWidth - margin - 80, yPos + 5);

    doc.setTextColor(239, 68, 68);
    doc.text(`Expenses: ${formatRWF(row.expenses)}`, pageWidth - margin - 80, yPos + 11);

    yPos += 14;

    const txRows = row.transactions.map(tx => [
      tx.description || tx.type || '-',
      new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tx.type,
      formatRWF(toNum(tx.amount)),
      ['deposit', 'credit'].includes(tx.type?.toLowerCase()) ? 'Credit' : 'Debit'
    ]);

    if (txRows.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Date', 'Type', 'Amount', 'Sign']],
        body: txRows,
        theme: 'plain',
        styles: { fontSize: 7, textColor: [51, 65, 85] },
        headStyles: { fontSize: 7, textColor: [148, 163, 184], fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 28 },
          2: { cellWidth: 24 },
          3: { cellWidth: 32 },
          4: { cellWidth: 18 },
        },
        margin: { left: margin, right: margin },
        tableLineColor: [241, 245, 249],
        tableLineWidth: 0.1,
      });
    }

    const safeName = row.period.replace(/[^a-zA-Z0-9]/g, '-');
    doc.save(`account-activity-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const periods: { value: Period; label: string; icon: any }[] = [
    { value: 'daily', label: 'Daily', icon: Clock },
    { value: 'weekly', label: 'Weekly', icon: Calendar },
    { value: 'monthly', label: 'Monthly', icon: BarChart3 },
    { value: 'yearly', label: 'Yearly', icon: PieChart },
  ];

  return (
    <AppShell
      title="Statements & Reports"
      subtitle="Track your finances"
      headerRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
            color: '#059669'
          }}>
            Available
          </span>
          <button
            onClick={loadData}
            style={{
              padding: '8px', borderRadius: 8, border: `1px solid ${borderColor}`,
              background: 'transparent', color: mutedColor, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12
            }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      }
    >
      <div className="grid gap-6">

        {/* Error toast */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
            color: isDark ? '#fca5a5' : '#dc2626', fontSize: 14
          }}>
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>&times;</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Income', value: formatRWF(totals.income), color: '#10b981', icon: TrendingUp },
            { label: 'Total Expenses', value: formatRWF(totals.expenses), color: '#ef4444', icon: TrendingDown },
            { label: 'Net Balance', value: formatRWF(totals.income - totals.expenses), color: totals.income >= totals.expenses ? '#0A9396' : '#ef4444', icon: DollarSign },
            { label: 'Transactions', value: totals.count.toLocaleString(), color: '#3b82f6', icon: BarChart3 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: '18px 20px', borderRadius: 16,
                background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'white',
                border: `1px solid ${borderColor}`,
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDark ? `${stat.color}20` : `${stat.color}10`,
                  color: stat.color
                }}>
                  <stat.icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: textColor, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: mutedColor }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Period Selector & Report Table */}
        <SectionCard
          title="Activity Reports"
          subtitle="View and download your account activity by period"
          headerRight={<span />}
        >
          {/* Period Dropdown */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 220 }}>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value as Period)}
                style={{
                  width: '100%', padding: '10px 36px 10px 14px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
                  background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'white',
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  outline: 'none',
                }}
              >
                {periods.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <div style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                pointerEvents: 'none', color: mutedColor, display: 'flex', alignItems: 'center'
              }}>
                <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: mutedColor }}>
              <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <div>Loading activity data...</div>
            </div>
          ) : reportRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <FileText size={40} style={{ margin: '0 auto 12px', color: mutedColor }} />
              <div style={{ color: mutedColor, marginBottom: 16 }}>
                No transactions found for the selected period
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {reportRows.map((row) => {
                const isExpanded = expandedPeriod === row.dateRange;
                return (
                  <motion.div
                    key={row.dateRange}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      background: cardBg,
                      border: `1px solid ${borderColor}`,
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Period Header */}
                    <div
                      onClick={() => setExpandedPeriod(isExpanded ? null : row.dateRange)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px', cursor: 'pointer',
                        flexWrap: 'wrap', gap: 8
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: isDark ? 'rgba(10, 147, 150, 0.15)' : 'rgba(10, 147, 150, 0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A9396'
                        }}>
                          <Calendar size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: textColor }}>{row.period}</div>
                          <div style={{ fontSize: 12, color: mutedColor }}>{row.count} transaction{row.count !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>+{formatRWF(row.income)}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>-{formatRWF(row.expenses)}</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleDownloadPeriodPDF(row); }}
                          title={`Download ${row.period} report`}
                          style={{
                            padding: '6px', borderRadius: 8, border: `1px solid ${borderColor}`,
                            background: 'transparent', color: '#0A9396', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                            opacity: 0.7
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                        >
                          <FileDown size={14} />
                        </button>
                        <ChevronRight
                          size={16}
                          style={{
                            color: mutedColor,
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded Transaction List */}
                    {isExpanded && (
                      <div style={{
                        borderTop: `1px solid ${borderColor}`,
                        padding: '8px 0'
                      }}>
                        {row.transactions.map((tx, idx) => (
                          <div
                            key={tx.id || idx}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 18px', gap: 12,
                              flexWrap: 'wrap'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                              {getTypeIcon(tx.type)}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {tx.description || tx.type}
                                </div>
                                <div style={{ fontSize: 11, color: mutedColor }}>
                                  {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  {tx.recipient_name ? ` · ${tx.recipient_name}` : ''}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              fontSize: 13, fontWeight: 600,
                              color: ['deposit', 'credit'].includes(tx.type?.toLowerCase()) ? '#10b981' : '#ef4444',
                              whiteSpace: 'nowrap'
                            }}>
                              {['deposit', 'credit'].includes(tx.type?.toLowerCase()) ? '+' : '-'}{formatRWF(toNum(tx.amount))}
                            </div>
                          </div>
                        ))}
                        {row.transactions.length === 50 && (
                          <div style={{ padding: '10px 18px', fontSize: 12, color: mutedColor, textAlign: 'center' }}>
                            Showing 50 of {row.count} transactions
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard
          title="Quick Actions"
          subtitle="Access more financial tools"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginTop: 8 }}>
            {[
              { label: 'View Transactions', icon: Eye, path: '/transactions', color: '#3b82f6' },
              { label: 'AI Insights', icon: TrendingUp, path: '/ai-insights', color: '#0A9396' },
              { label: 'Market Insights', icon: PieChart, path: '/market-insights', color: '#f59e0b' },
              { label: 'Settings', icon: Printer, path: '/settings', color: '#64748b' },
            ].map(item => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px', borderRadius: 12, border: `1px solid ${borderColor}`,
                  background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
                  color: textColor, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: isDark ? `${item.color}20` : `${item.color}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color
                }}>
                  <item.icon size={16} />
                </div>
                {item.label}
              </motion.button>
            ))}
          </div>
        </SectionCard>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppShell>
  );
};

export default Statements;
