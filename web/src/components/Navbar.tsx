import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Moon, Sun, Bell, User, Settings, LogOut, CreditCard, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import LanguageToggle from './LanguageToggle';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC<{ authenticated?: boolean }> = ({ authenticated }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const { unreadCount } = useNotifications();
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === 'dark';
    const isAuthenticated = authenticated || !!localStorage.getItem('token');
    const location = useLocation();

    const parseJSON = (value: string | null) => {
        if (!value || value === 'undefined' || value === 'null') return null;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const userData = parseJSON(userStr);
        if (userData) {
            setUser(userData);
        } else if (userStr) {
            console.error('Error parsing user data:', userStr);
            localStorage.removeItem('user');
        }
    }, []);

    return (
        <>
        <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 32px',
                background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.95))'
                    : 'linear-gradient(135deg, rgba(11, 31, 58, 0.95), rgba(10, 147, 150, 0.15))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                position: 'relative',
                zIndex: 100,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(10, 147, 150, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                </motion.div>
                <div className="navbar-brand-text">
                    <motion.div 
                        style={{ fontWeight: 700, fontSize: '20px', background: 'linear-gradient(135deg, #ffffff, #e0f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                        whileHover={{ scale: 1.05 }}
                    >
                        AI Smart Banking
                    </motion.div>
                    <motion.div 
                        style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginTop: 2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Banking Reimagined
                    </motion.div>
                </div>

                {/* Hamburger Menu Button (mobile) */}
                <button
                    className="navbar-hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    title="Toggle menu"
                    style={{ marginLeft: 8 }}
                >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </motion.div>

            {/* Desktop Nav Links */}
            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="navbar-desktop-links"
                style={{ alignItems: 'center', gap: 6 }}
            >
                {[
                    { to: '/dashboard', label: t('nav.dashboard') },
                    { to: '/transactions', label: t('nav.transactions') },
                    { to: '/payments', label: t('nav.payments') },
                    { to: '/savings', label: t('nav.savings') },
                    { to: '/loans', label: t('nav.loans') },
                    { to: '/ai-insights', label: t('nav.aiInsights') },
                    { to: '/market-insights', label: t('nav.marketInsights') }
                ].map((item, index) => (
                    <motion.div
                        key={item.to}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Link 
                            to={item.to} 
                            className="navbar-link"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onHoverStart={() => {}}
                                onHoverEnd={() => {}}
                            >
                                <span>{item.label}</span>
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        height: '2px',
                                        background: 'linear-gradient(90deg, #0A9396, #4ECDC4)',
                                        width: '0%'
                                    }}
                                    whileHover={{ width: '100%' }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Right-side Actions (always visible) */}
            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Notifications - only when authenticated */}
                {isAuthenticated && (
                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '12px',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                        }}
                        title={t('nav.notifications')}
                    >
                        <motion.div
                            animate={unreadCount > 0 ? { rotate: [0, 10, -10, 0] } : {}}
                            transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
                        >
                            <Bell size={20} />
                        </motion.div>
                        {unreadCount > 0 && (
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                                }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </motion.span>
                        )}
                    </motion.button>
                    <NotificationDropdown
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                </div>

                )}
                {/* User Profile Menu */}
                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            background: 'linear-gradient(135deg, rgba(10, 147, 150, 0.2), rgba(78, 205, 196, 0.2))',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                        }}
                        title={t('nav.profile')}
                    >
                        <User size={20} />
                    </motion.button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <motion.div
                                    key="profile-backdrop"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowProfileMenu(false)}
                                    style={{
                                        position: 'fixed',
                                        inset: 0,
                                        background: 'transparent',
                                        zIndex: 999
                                    }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: '0',
                                        background: darkMode 
                                            ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(26, 32, 44, 0.95))'
                                            : 'linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(11, 31, 58, 0.95))',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        padding: '8px 0',
                                        minWidth: '220px',
                                        zIndex: 1000,
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                    }}>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                                >
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                        {isAuthenticated ? (user?.name || user?.email || t('nav.user')) : 'Guest'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: 4 }}>
                                        {isAuthenticated ? (user?.email || 'No email available') : 'Not signed in'}
                                    </div>
                                </motion.div>
                                
                                {/* Language Toggle */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                    style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                                >
                                    <LanguageToggle />
                                </motion.div>
                                
                                {isAuthenticated ? (
                                    <>
                                        {user && (!user.profile_completed || !user.pin_set) && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                style={{
                                                    padding: '12px 20px',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <div style={{ fontSize: '12px', color: '#fbbf24', marginBottom: 8, fontWeight: 600 }}>
                                                    {!user.profile_completed ? 'Profile not completed' : 'PIN not set'}
                                                </div>
                                                <Link
                                                    to={!user.profile_completed ? '/complete-profile' : '/set-security'}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        padding: '8px 12px',
                                                        color: 'white',
                                                        background: 'rgba(251, 191, 36, 0.15)',
                                                        border: '1px solid rgba(251, 191, 36, 0.3)',
                                                        borderRadius: 8,
                                                        textDecoration: 'none',
                                                        fontSize: '13px',
                                                        fontWeight: 500,
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.25)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)';
                                                    }}
                                                >
                                                    {t('auth.continueSetup')} →
                                                </Link>
                                            </motion.div>
                                        )}
                                        {[
                                            { to: '/profile', icon: User, label: t('nav.profile') },
                                            { to: '/settings', icon: Settings, label: t('nav.settings') },
                                            { to: '/cards', icon: CreditCard, label: t('nav.cards') }
                                        ].map((item, index) => (
                                            <motion.div
                                                key={item.to}
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 + index * 0.05 }}
                                            >
                                                <Link 
                                                    to={item.to} 
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '12px 20px',
                                                        color: 'rgba(255, 255, 255, 0.9)',
                                                        textDecoration: 'none',
                                                        fontSize: '14px',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                                                    }}
                                                >
                                                    <item.icon size={16} />
                                                    {item.label}
                                                </Link>
                                            </motion.div>
                                        ))}
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} 
                                        />
                                        <motion.button 
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.35 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => {
                                                localStorage.removeItem('token');
                                                localStorage.removeItem('user');
                                                localStorage.removeItem('saved_route');
                                                window.dispatchEvent(new Event('auth-change'));
                                                window.location.href = '/login';
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px 20px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                width: '100%',
                                                textAlign: 'left',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <LogOut size={16} />
                                            {t('auth.signOut')}
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 20px' }}
                                        >
                                            <Link
                                                to="/login"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px 16px',
                                                    color: 'white',
                                                    background: '#0A9396',
                                                    borderRadius: '12px',
                                                    textDecoration: 'none',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <LogIn size={16} />
                                                {t('auth.login')}
                                            </Link>
                                            <Link
                                                to="/register"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px 16px',
                                                    color: 'white',
                                                    background: 'rgba(255,255,255,0.08)',
                                                    borderRadius: '12px',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                }}
                                            >
                                                <UserPlus size={16} />
                                                {t('auth.register')}
                                            </Link>
                                        </motion.div>
                                    </>
                                )}
                            </motion.div>
                        </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.nav>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 999,
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            style={{
                                position: 'fixed',
                                top: '72px',
                                left: '12px',
                                right: '12px',
                                zIndex: 1000,
                                borderRadius: 18,
                                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                                background: darkMode
                                    ? 'linear-gradient(135deg, rgba(26,32,44,0.96), rgba(45,55,72,0.96))'
                                    : 'linear-gradient(135deg, rgba(11,31,58,0.96), rgba(10,147,150,0.15))',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                padding: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ display: 'grid', gap: '6px' }}>
                                {[
                                    { to: '/dashboard', label: t('nav.dashboard') },
                                    { to: '/transactions', label: t('nav.transactions') },
                                    { to: '/payments', label: t('nav.payments') },
                                    { to: '/savings', label: t('nav.savings') },
                                    { to: '/loans', label: t('nav.loans') },
                                    { to: '/ai-insights', label: t('nav.aiInsights') },
                                    { to: '/market-insights', label: t('nav.marketInsights') }
                                ].map((item, index) => {
                                    const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                                    return (
                                        <motion.div
                                            key={item.to}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.03 * index }}
                                        >
                                            <Link
                                                to={item.to}
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 10,
                                                    padding: '12px 14px',
                                                    borderRadius: 14,
                                                    border: `1px solid ${isActive ? 'rgba(10,147,150,0.45)' : 'rgba(255,255,255,0.08)'}`,
                                                    background: isActive ? 'rgba(10,147,150,0.16)' : 'rgba(255,255,255,0.03)',
                                                    color: isActive ? '#2dcece' : 'rgba(255,255,255,0.85)',
                                                    textDecoration: 'none',
                                                    fontSize: 15,
                                                    fontWeight: isActive ? 600 : 500,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <span>{item.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="mobile-active-dot"
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            background: '#0A9396',
                                                        }}
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Mobile Menu - Theme & Auth Actions */}
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button
                                    onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '12px 14px',
                                        borderRadius: 14,
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'rgba(255,255,255,0.85)',
                                        cursor: 'pointer',
                                        fontSize: 15,
                                        fontWeight: 500,
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        width: '100%',
                                    }}
                                >
                                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                    <span>{darkMode ? t('nav.lightMode') : t('nav.darkMode')}</span>
                                </button>
                                {isAuthenticated ? (
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            localStorage.removeItem('admin_token');
                                            localStorage.removeItem('admin');
                                            localStorage.removeItem('saved_route');
                                            window.dispatchEvent(new Event('auth-change'));
                                            setMobileMenuOpen(false);
                                            window.location.href = '/login';
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '12px 14px',
                                            borderRadius: 14,
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            background: 'rgba(239,68,68,0.08)',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: 15,
                                            fontWeight: 500,
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                            width: '100%',
                                        }}
                                    >
                                        <LogOut size={18} />
                                        <span>{t('auth.signOut')}</span>
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                padding: '12px 14px',
                                                borderRadius: 14,
                                                color: 'white',
                                                background: '#0A9396',
                                                textDecoration: 'none',
                                                fontSize: 15,
                                                fontWeight: 600,
                                            }}
                                        >
                                            <LogIn size={18} />
                                            {t('auth.login')}
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                padding: '12px 14px',
                                                borderRadius: 14,
                                                color: 'rgba(255,255,255,0.85)',
                                                background: 'rgba(255,255,255,0.08)',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                textDecoration: 'none',
                                                fontSize: 15,
                                                fontWeight: 500,
                                            }}
                                        >
                                            <UserPlus size={18} />
                                            {t('auth.register')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
    </>
    );
};

export default Navbar;
