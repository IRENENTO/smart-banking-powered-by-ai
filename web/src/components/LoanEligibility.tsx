import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { loanService } from '../services/api';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

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

      setResult({
        eligible,
        eligibleAmount: eligible ? Math.round(eligibleAmount) : 0,
        riskScore: Math.max(10, Math.min(90, 75 - (debt / income) * 20)),
        interestRate: 12.5,
        monthlyPayment: Math.round(eligibleAmount / 24),
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
              type="number"
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
              type="number"
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
            {loading ? 'Checking...' : 'Check Eligibility'}
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

              {result.monthlyPayment && (
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 rounded-xl">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Est. Monthly (24mo)</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">RWF {result.monthlyPayment.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {result.eligible && (
              <button 
                onClick={() => navigate('/apply-loan', { state: { eligibleAmount: result.eligibleAmount, monthlyIncome, existingDebt } })}
                className="flex-1 px-4 py-3 bg-[#0A9396] text-white rounded-xl font-medium hover:bg-[#087a7d] transition-colors"
              >
                Apply Now
              </button>
            )}
            <button
              onClick={() => { setResult(null); setMonthlyIncome(''); setExistingDebt(''); }}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Check Again
            </button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
};

export default LoanEligibility;
