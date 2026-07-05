import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, TrendingUp, Calculator } from 'lucide-react';
import { loanService } from '../services/api';
import Modal from './Modal';
import ThreeBody from './ThreeBody';
import { useNavigate } from 'react-router-dom';
import { calculateSimpleInterest, calculateCompoundEMI, generateYearlyBreakdown } from '../utils/interestCalculations';

interface LoanEligibilityProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EligibilityResult {
  eligible: boolean;
  eligibleAmount: number;
  riskScore: number;
  message: string;
  interestRate?: number;
  monthlyPayment?: number;
}

const LoanEligibility: React.FC<LoanEligibilityProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [existingDebt, setExistingDebt] = useState('');

  const checkEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthlyIncome || !existingDebt) return;

    setLoading(true);
    try {
      const response = await loanService.checkEligibility({
        monthlyIncome: Number(monthlyIncome),
        existingDebt: Number(existingDebt)
      });
      setResult(response.data);
    } catch (error) {
      // Fallback result
      const income = Number(monthlyIncome);
      const debt = Number(existingDebt);
      const eligible = debt < income * 0.5;
      const eligibleAmount = Math.min(income * 6, 500000);

      const amount = eligible ? Math.round(eligibleAmount) : 0;
      const rate = 12.5;
      const months = 24;
      const simple = calculateSimpleInterest(amount, rate, months);
      const compound = calculateCompoundEMI(amount, rate, months);

      setResult({
        eligible,
        eligibleAmount: amount,
        riskScore: Math.max(10, Math.min(90, 75 - (debt / income) * 20)),
        interestRate: rate,
        monthlyPayment: compound.emi || simple.monthlyPayment,
        message: eligible
          ? 'Great news! You qualify for a loan based on your financial profile.'
          : 'Your existing debt is too high. Reduce it to improve eligibility.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check Loan Eligibility" size="md">
      {!result ? (
        <form onSubmit={checkEligibility} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Monthly Income (RWF)
            </span>
            <input
              type="text" inputMode="decimal"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="Enter your monthly income"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A2E4A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Existing Monthly Debt (RWF)
            </span>
            <input
              type="text" inputMode="decimal"
              value={existingDebt}
              onChange={(e) => setExistingDebt(e.target.value)}
              placeholder="Enter your existing debt"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A2E4A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#0A9396] text-white rounded-xl font-medium hover:bg-[#087a7d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? <><ThreeBody size={16} color="#fff" /> Checking...</> : 'Check Eligibility'}
          </button>
        </form>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Status */}
          <div className={`p-4 rounded-2xl ${result.eligible ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.eligible ? (
                <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
              )}
              <span className={`font-bold ${result.eligible ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {result.eligible ? 'Eligible' : 'Not Eligible'}
              </span>
            </div>
            <p className={result.eligible ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
              {result.message}
            </p>
          </div>

          {/* Details Grid */}
          {result.eligible && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-[#0A9396]/10 to-[#0A9396]/5 dark:from-[#0A9396]/20 dark:to-[#0A9396]/10 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Eligible Amount</p>
                <p className="text-xl font-bold text-[#0A9396] dark:text-[#4ECDC4]">RWF {result.eligibleAmount.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Risk Score</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{Math.round(result.riskScore)}/100</p>
              </div>

              {result.interestRate && (
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10 rounded-xl">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Interest Rate</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{result.interestRate}% p.a.</p>
                </div>
              )}

            </div>
          )}

          {result.eligible && (() => {
            const p = result.eligibleAmount;
            const r = result.interestRate || 12.5;
            const n = 24;
            const simple = calculateSimpleInterest(p, r, n);
            const compound = calculateCompoundEMI(p, r, n);
            const yearly = generateYearlyBreakdown(p, r, n);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10 rounded-xl">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                      <Calculator size={14} /> Simple Interest
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">RWF {simple.monthlyPayment.toLocaleString()}<span className="text-xs font-normal text-gray-500">/mo</span></p>
                    <p className="text-xs text-gray-500 mt-1">Interest: RWF {simple.totalInterest.toLocaleString()} &middot; Total: RWF {simple.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 rounded-xl">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                      <Calculator size={14} /> Compound (EMI)
                    </p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">RWF {compound.emi.toLocaleString()}<span className="text-xs font-normal text-gray-500">/mo</span></p>
                    <p className="text-xs text-gray-500 mt-1">Interest: RWF {compound.totalInterest.toLocaleString()} &middot; Total: RWF {compound.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
                {yearly.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Yearly Breakdown (EMI)</p>
                    <div className="grid gap-1">
                      <div className="grid grid-cols-5 gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 pb-1 border-b border-gray-200 dark:border-gray-700">
                        <span>Year</span><span>Payments</span><span>Interest</span><span>Principal</span><span>Balance</span>
                      </div>
                      {yearly.map(row => (
                        <div key={row.year} className="grid grid-cols-5 gap-2 text-xs text-gray-700 dark:text-gray-300 py-1 border-b border-gray-100 dark:border-gray-700/50">
                          <span>{row.year}</span>
                          <span>RWF {row.totalPaid.toLocaleString()}</span>
                          <span className="text-red-600">RWF {row.interestPaid.toLocaleString()}</span>
                          <span className="text-green-600">RWF {row.principalPaid.toLocaleString()}</span>
                          <span>RWF {row.remainingBalance.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {result.eligible && (
              <>
                <button
                  onClick={() => { onClose(); navigate('/loans', { state: { eligibleAmount: result.eligibleAmount, monthlyIncome, existingDebt } }); }}
                  className="flex-1 px-4 py-3 bg-[#0A9396] text-white rounded-xl font-medium hover:bg-[#087a7d] transition-colors"
                >
                  Allow — RWF {result.eligibleAmount.toLocaleString()}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Deny
                </button>
              </>
            )}
            <button
              onClick={() => { setResult(null); setMonthlyIncome(''); setExistingDebt(''); }}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${result.eligible ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600' : 'w-full bg-[#0A9396] text-white hover:bg-[#087a7d]'}`}
            >
              {result.eligible ? 'Check Again' : 'Try Again'}
            </button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
};

export default LoanEligibility;
