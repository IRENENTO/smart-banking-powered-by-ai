import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Zap, Heart, Star, Rocket, Smartphone, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { publicService } from '../services/publicService';

const Landing: React.FC = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const [aboutData, setAboutData] = useState<any>(null);
    const [contactData, setContactData] = useState<any>(null);
    const [servicesData, setServicesData] = useState<any>(null);
    const [faqData, setFaqData] = useState<any>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));
    const { t } = useLanguage();
    const { info } = useToast();
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    
    useEffect(() => {
        const updateAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
        updateAuth();
        window.addEventListener('storage', updateAuth);
        return () => window.removeEventListener('storage', updateAuth);
    }, []);

    useEffect(() => {
        const loadPublicData = async () => {
            try {
                const [about, contact, services, faq] = await Promise.all([
                    publicService.getAboutUs(),
                    publicService.getContactUs(),
                    publicService.getServices(),
                    publicService.getFAQ()
                ]);
                setAboutData(about);
                setContactData(contact);
                setServicesData(services);
                setFaqData(faq);
            } catch (error) {
                console.error('Error loading public data:', error);
            } finally {
                setDataLoading(false);
            }
        };

        loadPublicData();
    }, []);

    const handleAction = async (action: string, path?: string) => {
        setLoading(action);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(null);
        if (path) {
            window.location.href = path;
        }
    };

    return (
        <div>
            <Navbar authenticated={isAuthenticated} />
            <motion.header 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0B1F3A 0%, #0B1F3A 50%, #0A9396 100%)',
                    color: 'white',
                    padding: '80px 20px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated background elements */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(10,147,150,0.2) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                    }}
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        right: '10%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(244,162,97,0.2) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(60px)'
                    }}
                />
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{ maxWidth: 1000, textAlign: 'center', position: 'relative', zIndex: 1 }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <h1 style={{ 
                            fontSize: 'clamp(36px, 5vw, 56px)', 
                            margin: 0,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #ffffff, #e0f2fe, #0A9396)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.2
                        }}>
                            {t('landing.title')}
                            <br />
                            <span style={{ fontSize: '0.8em' }}>Powered by AI</span>
                        </h1>
                    </motion.div>
                    <motion.p 
                        style={{ color: '#cfeff5', fontSize: '20px', marginTop: 20, lineHeight: 1.6 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {t('landing.subtitle')}
                    </motion.p>
                    <motion.div 
                        style={{ marginTop: 40, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {!isAuthenticated && (
                            <>
                                <LoadingButton
                                    loading={loading === 'register'}
                                    onClick={() => handleAction('register', '/register')}
                                    variant="primary"
                                    size="lg"
                                    style={{ minWidth: 240 }}
                                >
                                    <Rocket size={20} />
                                    {t('landing.openAccount')}
                                </LoadingButton>
                                <LoadingButton
                                    loading={loading === 'dashboard'}
                                    onClick={() => handleAction('dashboard', '/dashboard')}
                                    variant="secondary"
                                    size="lg"
                                    style={{ minWidth: 240 }}
                                >
                                    <TrendingUp size={20} />
                                    {t('landing.goToDashboard')}
                                </LoadingButton>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </motion.header>

            <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                style={{ padding: '80px 20px', background: darkMode ? 'linear-gradient(180deg, #0B1F3A 0%, #0B1F3A 100%)' : 'linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%)' }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: 60 }}
                    >
                        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', margin: 0, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Why Choose AI Smart Banking?
                        </h2>
                        <p style={{ color: darkMode ? '#cfeff5' : '#475569', fontSize: 'clamp(15px, 2vw, 18px)', marginTop: 16 }}>
                            Experience the future of banking with our innovative features
                        </p>
                    </motion.div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, marginBottom: 60 }}>
                        <Link to={isAuthenticated ? "/accounts" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px rgba(15, 23, 42, 0.15)' }}
                                style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.5)', padding: 'clamp(20px, 3vw, 28px)', borderRadius: 20, boxShadow: '0 18px 35px rgba(15, 23, 42, 0.08)', position: 'relative', overflow: 'hidden' }}
                            >
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                    <Shield size={48} style={{ color: '#0A9396' }} />
                                </motion.div>
                                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: 700, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>Smart Accounts</h3>
                                <p style={{ marginTop: 8, color: darkMode ? '#cfeff5' : '#475569', fontSize: 'clamp(13px, 1.5vw, 14px)', lineHeight: 1.5, textAlign: 'center' }}>Manage your checking and savings with guaranteed clarity and AI-powered insights.</p>
                            </motion.div>
                        </Link>
                        <Link to={isAuthenticated ? "/payments" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px rgba(15, 23, 42, 0.15)' }}
                                style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.5)', padding: 'clamp(20px, 3vw, 28px)', borderRadius: 20, boxShadow: '0 18px 35px rgba(15, 23, 42, 0.08)', position: 'relative', overflow: 'hidden' }}
                            >
                                <motion.div whileHover={{ scale: 1.1 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                    <Zap size={48} style={{ color: '#F4A261' }} />
                                </motion.div>
                                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: 700, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>Instant Payments</h3>
                                <p style={{ marginTop: 8, color: darkMode ? '#cfeff5' : '#475569', fontSize: 'clamp(13px, 1.5vw, 14px)', lineHeight: 1.5, textAlign: 'center' }}>Fast transfers, mobile money, and scheduled payments from one beautiful dashboard.</p>
                            </motion.div>
                        </Link>
                        <Link to={isAuthenticated ? "/ai-insights" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px rgba(15, 23, 42, 0.15)' }}
                                style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.5)', padding: 'clamp(20px, 3vw, 28px)', borderRadius: 20, boxShadow: '0 18px 35px rgba(15, 23, 42, 0.08)', position: 'relative', overflow: 'hidden' }}
                            >
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                    <Star size={48} style={{ color: '#0A9396' }} />
                                </motion.div>
                                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: 700, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>AI Insights</h3>
                                <p style={{ marginTop: 8, color: darkMode ? '#cfeff5' : '#475569', fontSize: 'clamp(13px, 1.5vw, 14px)', lineHeight: 1.5, textAlign: 'center' }}>Get intelligent spending guidance and personalised financial alerts that learn from you.</p>
                            </motion.div>
                        </Link>
                    </div>
                    
                    {/* Additional artistic cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 'clamp(16px, 2vw, 20px)', marginBottom: 60 }}
                    >
                        <Link to={isAuthenticated ? "/dashboard" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <SectionCard 
                                title="💎 Premium Features" 
                                subtitle="Exclusive benefits for premium members including priority support and advanced analytics."
                                style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', height: '100%' }}
                            >
                                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {['Priority Support', 'Advanced Analytics', 'Custom Reports'].map((feature, index) => (
                                        <motion.div
                                            key={feature}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                            viewport={{ once: true }}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'rgba(10, 147, 150, 0.1)',
                                                border: '1px solid rgba(10, 147, 150, 0.2)',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                color: '#0A9396'
                                            }}
                                        >
                                            {feature}
                                        </motion.div>
                                    ))}
                                </div>
                            </SectionCard>
                        </Link>
                        
                        <Link to={isAuthenticated ? "/dashboard" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <SectionCard 
                                title="❤️ Trusted by Thousands" 
                                subtitle="Join thousands of satisfied customers who trust us with their financial future."
                                style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', height: '100%' }}
                            >
                                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
                                    {[
                                        { number: '50K+', label: 'Users' },
                                        { number: '4.8★', label: 'Rating' },
                                        { number: '99.9%', label: 'Uptime' }
                                    ].map((stat, index) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            viewport={{ once: true }}
                                        >
                                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0A9396' }}>{stat.number}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </SectionCard>
                        </Link>
                        
                        <SectionCard 
                            title="🚀 Quick Start" 
                            subtitle="Get started in minutes with our simple onboarding process and intuitive interface."
                            style={{ background: 'linear-gradient(135deg, #f0f9fa, #e0f7fa)' }}
                        >
                            <LoadingButton
                                loading={loading === 'quickstart'}
                                onClick={() => handleAction('quickstart', '/register')}
                                variant="ghost"
                                size="sm"
                                style={{ marginTop: 16, width: '100%' }}
                            >
                                Start Now
                                <ArrowRight size={16} />
                            </LoadingButton>
                        </SectionCard>
                    </motion.div>

                    <div className="ai-benefits-grid">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            viewport={{ once: true }}
                                style={{ 
                                    background: 'linear-gradient(135deg, #0B1F3A, #0A9396)', 
                                    padding: 'clamp(24px, 4vw, 40px)', 
                                    borderRadius: 24, 
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                        >
                            {/* Animated background pattern */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
                                transition={{ duration: 8, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    top: '-20%',
                                    right: '-20%',
                                    width: '60%',
                                    height: '60%',
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                    borderRadius: '50%'
                                }}
                            />
                            
                            <motion.h2 
                                style={{ fontSize: 'clamp(22px, 3.5vw, 28px)', margin: 0, position: 'relative', zIndex: 1 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                viewport={{ once: true }}
                            >
                                🤖 AI-powered benefits
                            </motion.h2>
                            <motion.p 
                                style={{ marginTop: 20, lineHeight: 1.75, color: '#cfeff5', fontSize: 'clamp(14px, 1.8vw, 16px)', position: 'relative', zIndex: 1 }}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Use AI to uncover better saving opportunities, protect your money, and make smarter decisions with every transaction.
                            </motion.p>
                            <div className="ai-benefit-cards">
                                {[
                                    { icon: '⚡', title: 'Real-time alerts', desc: 'Stay ahead of suspicious activity and payment due dates.' },
                                    { icon: '📊', title: 'Smarter budgeting', desc: 'Understand how spending impacts your goals instantly.' },
                                    { icon: '💰', title: 'Loan prediction', desc: 'See your borrowing power before you apply.' },
                                    { icon: '🎯', title: 'Goal progress', desc: 'Keep your savings targets in view with progress tracking.' }
                                ].map((benefit, index) => (
                                    <motion.div
                                        key={benefit.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 + index * 0.1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.08)', 
                                            padding: 20, 
                                            borderRadius: 16,
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: 8 }}>{benefit.icon}</div>
                                        <strong style={{ fontSize: '14px', display: 'block' }}>{benefit.title}</strong>
                                        <p style={{ marginTop: 6, color: '#cfeff5', fontSize: '12px', lineHeight: 1.4 }}>{benefit.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            viewport={{ once: true }}
                            style={{ display: 'grid', gap: 24 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                style={{ 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))', 
                                    padding: 'clamp(20px, 3vw, 28px)', 
                                    borderRadius: 20, 
                                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.5)'
                                }}
                            >
                                <h3 style={{ fontSize: 'clamp(17px, 2.5vw, 20px)', margin: 0, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💡 Financial Insight</h3>
                                <p style={{ color: '#475569', marginTop: 12, lineHeight: 1.5, fontSize: 'clamp(13px, 1.5vw, 15px)' }}>Your latest spending snapshot with AI guidance.</p>
                                <div style={{ marginTop: 'clamp(16px, 2vw, 24px)', display: 'grid', gap: 16 }}>
                                    {[
                                        { title: '🚨 Spending alert', subtitle: 'You are spending too much on transport.', type: 'warning' },
                                        { title: '💰 Loan prediction', subtitle: 'You can borrow up to 500,000 RWF.', type: 'success' }
                                    ].map((insight, index) => (
                                        <motion.div
                                            key={insight.title}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + index * 0.1 }}
                                            viewport={{ once: true }}
                                            whileHover={{ scale: 1.02, x: 8 }}
                                            style={{ 
                                                padding: 'clamp(12px, 1.5vw, 16px)', 
                                                background: insight.type === 'warning' ? '#fef2f2' : '#f0fdf4', 
                                                borderRadius: 16,
                                                border: `1px solid ${insight.type === 'warning' ? '#fecaca' : '#bbf7d0'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: 'clamp(13px, 1.5vw, 14px)', color: insight.type === 'warning' ? '#dc2626' : '#059669' }}>
                                                {insight.title}
                                            </div>
                                            <div style={{ marginTop: 6, color: '#64748b', fontSize: 'clamp(11px, 1.3vw, 12px)' }}>{insight.subtitle}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                            
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                style={{ 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))', 
                                    padding: 'clamp(20px, 3vw, 28px)', 
                                    borderRadius: 20, 
                                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.5)'
                                }}
                            >
                                <h3 style={{ fontSize: 'clamp(17px, 2.5vw, 20px)', margin: 0, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💳 Financial Overview</h3>
                                <div style={{ marginTop: 'clamp(16px, 2vw, 24px)', display: 'grid', gap: 16 }}>
                                    {[
                                        { label: 'Account balance', value: 'RWF 452,800', icon: '💎', color: '#0A9396' },
                                        { label: 'AI score', value: '88/100 financial health', icon: '🤖', color: '#F4A261' },
                                        { label: 'Saved this month', value: 'RWF 92,000', icon: '📈', color: '#059669' }
                                    ].map((stat, index) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.9 + index * 0.1 }}
                                            viewport={{ once: true }}
                                            whileHover={{ scale: 1.05, x: 8 }}
                                            style={{ 
                                                padding: 'clamp(12px, 1.5vw, 16px)', 
                                                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                                                borderRadius: 16,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}>{stat.icon}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 'clamp(13px, 1.5vw, 14px)', color: '#334155' }}>{stat.label}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 'clamp(13px, 1.8vw, 16px)', color: stat.color }}>{stat.value}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* About Us Section */}
            {aboutData && (
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    style={{ padding: '80px 20px', background: darkMode ? '#0B1F3A' : '#f8fafc' }}
                >
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '60px' }}
                        >
                            <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: darkMode ? 'white' : '#0B1F3A', marginBottom: '20px' }}>
                                {aboutData.title}
                            </h2>
                            <p style={{ fontSize: '20px', color: darkMode ? '#cfeff5' : '#64748b', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                                {aboutData.description}
                            </p>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                            {aboutData.values?.map((value: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05, y: -8 }}
                                    style={{ 
                                        background: darkMode ? 'rgba(255,255,255,0.08)' : 'white', 
                                        padding: '40px', 
                                        borderRadius: '20px', 
                                        boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.1)',
                                        textAlign: 'center',
                                        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                    }}
                                >
                                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0A9396', marginBottom: '16px' }}>
                                        {value.title}
                                    </h3>
                                    <p style={{ color: darkMode ? '#cfeff5' : '#64748b', lineHeight: 1.6 }}>
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
                            {aboutData.stats?.map((stat: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    style={{ textAlign: 'center' }}
                                >
                                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0A9396', marginBottom: '8px' }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ color: darkMode ? '#cfeff5' : '#64748b', fontSize: '16px' }}>
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Our Services */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                style={{ padding: '80px 20px', background: darkMode ? '#0B1F3A' : 'white' }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: darkMode ? 'white' : '#0B1F3A', marginBottom: '20px' }}>
                            Our Services
                        </h2>
                        <p style={{ fontSize: '20px', color: darkMode ? '#cfeff5' : '#64748b', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                            Discover our comprehensive range of AI-powered banking services designed to meet your financial needs:
                        </p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(16px, 2vw, 28px)' }}>
                        {/* Smart Savings */}
                        <Link to={isAuthenticated ? "/savings" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'white', borderRadius: 20, padding: 'clamp(20px, 3vw, 32px)', boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(10,147,150,0.08)', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,147,150,0.1)', height: '100%' }}
                            >
                                <motion.div whileHover={{ scale: 1.1 }} style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                                    <TrendingUp size={40} style={{ color: '#10b981' }} />
                                </motion.div>
                                <h3 style={{ margin: '0 0 8px', fontSize: 'clamp(17px, 2.2vw, 20px)', fontWeight: 700, color: darkMode ? 'white' : '#0B1F3A', textAlign: 'center' }}>Smart Savings</h3>
                                <p style={{ color: darkMode ? '#cfeff5' : '#64748b', fontSize: 'clamp(13px, 1.5vw, 14px)', lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                                    AI-powered savings accounts that help you save smarter with personalized recommendations and automated savings goals.
                                </p>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {['AI Savings Insights', 'Goal-based Savings', 'Automated Transfers', 'Competitive Interest Rates'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: darkMode ? '#e0f2fe' : '#334155' }}>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </Link>

                        {/* Digital Loans */}
                        <Link to={isAuthenticated ? "/loans" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'white', borderRadius: 20, padding: 32, boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(10,147,150,0.08)', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,147,150,0.1)', height: '100%' }}
                            >
                                <motion.div whileHover={{ scale: 1.1 }} style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                                    <Zap size={40} style={{ color: '#0A9396' }} />
                                </motion.div>
                                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: darkMode ? 'white' : '#0B1F3A', textAlign: 'center' }}>Digital Loans</h3>
                                <p style={{ color: darkMode ? '#cfeff5' : '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                                    Quick and easy loan approvals powered by AI credit scoring. Get funds within minutes.
                                </p>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {['Instant Approval', 'Flexible Terms', 'Low Interest Rates', 'No Collateral Required'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: darkMode ? '#e0f2fe' : '#334155' }}>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </Link>

                        {/* Mobile Banking */}
                        <div onClick={() => info('Mobile banking is coming soon. Stay tuned!', { title: 'Mobile Banking' })} style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'white', borderRadius: 20, padding: 32, boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(10,147,150,0.08)', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,147,150,0.1)', height: '100%', position: 'relative' }}
                            >
                                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                                    <motion.div whileHover={{ scale: 1.1 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                        <Smartphone size={40} style={{ color: '#8b5cf6' }} />
                                    </motion.div>
                                    <span style={{ position: 'absolute', top: -20, right: 0, padding: '2px 8px', borderRadius: 999, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', fontSize: 10, fontWeight: 700, lineHeight: '18px' }}>
                                        Coming Soon
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: darkMode ? 'white' : '#0B1F3A', textAlign: 'center' }}>Mobile Banking</h3>
                                <p style={{ color: darkMode ? '#cfeff5' : '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                                    Complete banking services on your mobile device. Bank anytime, anywhere.
                                </p>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {['24/7 Access', 'Bill Payments', 'Money Transfers', 'Mobile Top-up'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: darkMode ? '#e0f2fe' : '#334155' }}>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Investment Services */}
                        <Link to={isAuthenticated ? "/investments" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.15 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'white', borderRadius: 20, padding: 32, boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(10,147,150,0.08)', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,147,150,0.1)', height: '100%' }}
                            >
                                <motion.div whileHover={{ scale: 1.1 }} style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                                    <TrendingUp size={40} style={{ color: '#F4A261' }} />
                                </motion.div>
                                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: darkMode ? 'white' : '#0B1F3A', textAlign: 'center' }}>Investment Services</h3>
                                <p style={{ color: darkMode ? '#cfeff5' : '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                                    AI-driven investment recommendations tailored to your risk profile and financial goals.
                                </p>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {['AI Portfolio Management', 'Risk Assessment', 'Market Insights', 'Diversified Options'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: darkMode ? '#e0f2fe' : '#334155' }}>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </Link>

                        {/* Business Banking */}
                        <Link to={isAuthenticated ? "/business-banking" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'white', borderRadius: 20, padding: 32, boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(10,147,150,0.08)', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,147,150,0.1)', height: '100%' }}
                            >
                                <motion.div whileHover={{ scale: 1.1 }} style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                                    <BarChart3 size={40} style={{ color: '#059669' }} />
                                </motion.div>
                                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: darkMode ? 'white' : '#0B1F3A', textAlign: 'center' }}>Business Banking</h3>
                                <p style={{ color: darkMode ? '#cfeff5' : '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                                    Comprehensive banking solutions for businesses of all sizes in Rwanda.
                                </p>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {['Business Accounts', 'Payroll Services', 'Trade Finance', 'Business Loans'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: darkMode ? '#e0f2fe' : '#334155' }}>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </Link>

                        {/* Insurance Products */}
                        <div onClick={() => info('Insurance products are coming soon. Stay tuned!', { title: 'Insurance Products' })} style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.25 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'white', borderRadius: 20, padding: 32, boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(10,147,150,0.08)', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,147,150,0.1)', height: '100%', position: 'relative' }}
                            >
                                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                                    <motion.div whileHover={{ scale: 1.1 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                        <Shield size={40} style={{ color: '#ef4444' }} />
                                    </motion.div>
                                    <span style={{ position: 'absolute', top: -20, right: 0, padding: '2px 8px', borderRadius: 999, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', fontSize: 10, fontWeight: 700, lineHeight: '18px' }}>
                                        Coming Soon
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: darkMode ? 'white' : '#0B1F3A', textAlign: 'center' }}>Insurance Products</h3>
                                <p style={{ color: darkMode ? '#cfeff5' : '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                                    Protect what matters most with our range of insurance products.
                                </p>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {['Life Insurance', 'Health Insurance', 'Property Insurance', 'Vehicle Insurance'].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: darkMode ? '#e0f2fe' : '#334155' }}>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Contact Us Section */}
            {contactData && (
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    style={{ padding: '80px 20px', background: '#0B1F3A', color: 'white' }}
                >
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '60px' }}
                        >
                            <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
                                {contactData.title}
                            </h2>
                            <p style={{ fontSize: '20px', color: '#cfeff5', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                                {contactData.description}
                            </p>
                        </motion.div>

                        {/* Social Media */}
                        {contactData.socialMedia && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                viewport={{ once: true }}
                                style={{ textAlign: 'center' }}
                            >
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                                    Follow Us
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    {contactData.socialMedia.map((social: any, index: number) => (
                                        <motion.a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.2, rotate: 5 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '50px',
                                                height: '50px',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '50%',
                                                color: 'white',
                                                textDecoration: 'none',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }}
                                        >
                                            {social.platform === 'Facebook' && (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                            )}
                                            {social.platform === 'Twitter' && (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                </svg>
                                            )}
                                            {social.platform === 'LinkedIn' && (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                </svg>
                                            )}
                                            {social.platform === 'Instagram' && (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                                </svg>
                                            )}
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            )}

            <Footer />
        </div>
    );
};

export default Landing;
