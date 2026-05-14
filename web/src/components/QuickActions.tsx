import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Send,
  CreditCard,
  Smartphone,
  QrCode,
  Target,
  TrendingUp,
  X
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
  anchor?: 'bottom-left' | 'bottom-right';
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction, anchor = 'bottom-right' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'send-money', label: 'Send Money', icon: <Send size={20} />, color: '#0A9396' },
    { id: 'save-money', label: 'Save Money', icon: <Target size={20} />, color: '#27AE60' },
    { id: 'invest', label: 'Invest', icon: <TrendingUp size={20} />, color: '#9B59B6' },
    { id: 'request-loan', label: 'Request Loan', icon: <CreditCard size={20} />, color: '#F4A261' },
  ];

  const anchorStyle = anchor === 'bottom-left' ? { left: '24px' } : { right: '24px' };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0A9396, #4ECDC4)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(10, 147, 150, 0.3)',
          zIndex: 1000,
          ...anchorStyle
        }}
        title="Quick Actions"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999
              }}
            />

            <div
              style={{
                position: 'fixed',
                bottom: '100px',
                zIndex: 1000,
                ...anchorStyle
              }}
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    y: 20,
                    transition: { delay: (actions.length - index - 1) * 0.05 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onAction(action.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#1a202c',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    minWidth: '160px',
                    justifyContent: 'flex-start'
                  }}
                  title={action.label}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: action.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    {action.icon}
                  </div>
                  {action.label}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickActions;
