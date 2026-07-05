import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar } from 'lucide-react';
import { savingsService } from '../services/api';
import Modal from './Modal';
import ThreeBody from './ThreeBody';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    current: '',
    deadline: ''
  });
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.target || !formData.deadline) return;

    setLoading(true);
    try {
      await savingsService.createGoal({
        name: formData.name,
        target: Number(formData.target),
        current: Number(formData.current) || 0,
        deadline: formData.deadline
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', target: '', current: '', deadline: '' });
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error: any) {
      const msg = error.response?.data?.msg || error.response?.data?.message || 'Failed to create goal. Make sure the backend server is running.';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Savings Goal" subtitle="Set a new goal and track your progress" size="md">
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Target size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Goal Created!</h3>
          <p className="text-gray-600 dark:text-gray-400">Your savings goal has been added successfully. Keep saving!</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {errorMsg}
            </div>
          )}
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Goal Name *
            </span>
            <div className="relative">
              <Target size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., New Phone, Vacation, Car"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A2E4A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Target Amount (RWF) *
              </span>
              <input
                type="text" inputMode="decimal"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="500000"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A2E4A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Current Amount (RWF)
              </span>
              <input
                type="text" inputMode="decimal"
                value={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A2E4A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Target Deadline *
            </span>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={today}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A2E4A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A9396]"
              />
            </div>
          </label>

          {/* Progress Preview */}
          {formData.target && (
            <div className="p-4 bg-gradient-to-r from-[#0A9396]/10 to-[#0A9396]/5 dark:from-[#0A9396]/20 dark:to-[#0A9396]/10 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Progress Preview</p>
              <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0A9396] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (Number(formData.current) / Number(formData.target)) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 font-medium">
                RWF {Number(formData.current).toLocaleString()} / {Number(formData.target).toLocaleString()}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#0A9396] text-white rounded-xl font-medium hover:bg-[#087a7d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? <><ThreeBody size={16} color="#fff" /> Creating Goal...</> : 'Create Goal'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default SavingsGoalModal;
