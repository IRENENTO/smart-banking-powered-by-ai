import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, options?: ToastOptions & { variant?: ToastVariant }) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const variantConfig: Record<ToastVariant, { icon: JSX.Element; className: string }> = {
  success: {
    icon: <CheckCircle size={18} className="toast-icon" />,
    className: 'toast-success'
  },
  error: {
    icon: <XCircle size={18} className="toast-icon" />,
    className: 'toast-error'
  },
  warning: {
    icon: <AlertTriangle size={18} className="toast-icon" />,
    className: 'toast-warning'
  },
  info: {
    icon: <Info size={18} className="toast-icon" />,
    className: 'toast-info'
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options?: ToastOptions & { variant?: ToastVariant }) => {
      const variant = options?.variant ?? 'info';
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const duration = options?.duration ?? 4000;

      setToasts((current) => [
        ...current,
        {
          id,
          title: options?.title,
          message,
          variant,
          duration
        }
      ]);

      window.setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const success = useCallback((message: string, options?: ToastOptions) => toast(message, { ...options, variant: 'success' }), [toast]);
  const error = useCallback((message: string, options?: ToastOptions) => toast(message, { ...options, variant: 'error' }), [toast]);
  const warning = useCallback((message: string, options?: ToastOptions) => toast(message, { ...options, variant: 'warning' }), [toast]);
  const info = useCallback((message: string, options?: ToastOptions) => toast(message, { ...options, variant: 'info' }), [toast]);

  const value = useMemo(
    () => ({ toast, success, error, warning, info }),
    [toast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {toasts.map((toastItem) => {
            const config = variantConfig[toastItem.variant];
            return (
              <motion.div
                key={toastItem.id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`toast-item ${config.className}`}
              >
                <div className="toast-content">
                  <div className="toast-icon-wrapper">{config.icon}</div>
                  <div className="toast-text">
                    {toastItem.title && <div className="toast-title">{toastItem.title}</div>}
                    <div className="toast-message">{toastItem.message}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
