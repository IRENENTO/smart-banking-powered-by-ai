import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, AlertCircle, Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            style={{
              position: 'fixed',
              top: '72px',
              right: '24px',
              width: 'min(380px, calc(100vw - 48px))',
              maxHeight: '70vh',
              background: darkMode ? '#0F2844' : 'white',
              border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb',
              borderRadius: '16px',
              boxShadow: darkMode ? '0 25px 60px rgba(0,0,0,0.3)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 1100,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} className="text-gray-600" />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '16px', fontWeight: '500', color: darkMode ? '#e2e8f0' : '#111827' }}>No notifications</p>
                  <p style={{ fontSize: '14px', marginTop: '4px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                    You're all caught up!
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      padding: '16px 20px',
                      borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f3f4f6',
                      background: darkMode ? (notification.read ? '#0F2844' : '#132D4B') : notification.read ? 'white' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.link) {
                        navigate(notification.link);
                        onClose();
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ marginTop: '2px' }}>
                        {getIcon(notification.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px'
                        }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: darkMode ? '#e5e7eb' : '#111827',
                            margin: 0
                          }}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: darkMode ? '#cbd5e1' : '#6b7280',
                          margin: '4px 0',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>
                        <div style={{
                          fontSize: '12px',
                          color: darkMode ? '#9ca3af' : '#9ca3af',
                          marginTop: '8px'
                        }}>
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationDropdown;