import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Zap, Heart, Star, Rocket, Gem, Phone, Mail, MapPin, MessageCircle, Globe, Share2, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
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
                    background: 'linear-gradient(135deg, #071B2F 0%, #0B1F3A 50%, #0A9396 100%)',
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
                        {isAuthenticated ? (
                            <div style={{ width: '100%', maxWidth: 920, borderRadius: 28, overflow: 'hidden', boxShadow: '0 35px 80px rgba(0, 0, 0, 0.2)' }}>
                                <img
                                    src="/banner.png"
                                    alt="AI Banking banner"
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', minHeight: 260 }}
                                />
                            </div>
                        ) : (
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
                style={{ padding: '80px 20px', background: 'linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%)' }}
            >
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: 60 }}
                    >
                        <h2 style={{ fontSize: '36px', margin: 0, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Why Choose AI Smart Banking?
                        </h2>
                        <p style={{ color: '#475569', fontSize: '18px', marginTop: 16 }}>
                            Experience the future of banking with our innovative features
                        </p>
                    </motion.div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, marginBottom: 60 }}>
                        <Link to={isAuthenticated ? "/accounts" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <SectionCard title="Smart Accounts" subtitle="Manage your checking and savings with guaranteed clarity and AI-powered insights.">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}
                                >
                                    <Shield size={48} style={{ color: '#0A9396' }} />
                                </motion.div>
                            </SectionCard>
                        </Link>
                        <Link to={isAuthenticated ? "/payments" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <SectionCard title="Instant Payments" subtitle="Fast transfers, mobile money, and scheduled payments from one beautiful dashboard.">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}
                                >
                                    <Zap size={48} style={{ color: '#F4A261' }} />
                                </motion.div>
                            </SectionCard>
                        </Link>
                        <Link to={isAuthenticated ? "/ai-insights" : "/login"} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <SectionCard title="AI Insights" subtitle="Get intelligent spending guidance and personalised financial alerts that learn from you.">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}
                                >
                                    <Star size={48} style={{ color: '#0A9396' }} />
                                </motion.div>
                            </SectionCard>
                        </Link>
                    </div>
                    
                    {/* Additional artistic cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20, marginBottom: 60 }}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .9fr', gap: 24, alignItems: 'stretch' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            viewport={{ once: true }}
                            style={{ 
                                background: 'linear-gradient(135deg, #0B1F3A, #0A9396)', 
                                padding: 40, 
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
                                style={{ fontSize: '28px', margin: 0, position: 'relative', zIndex: 1 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                viewport={{ once: true }}
                            >
                                🤖 AI-powered benefits
                            </motion.h2>
                            <motion.p 
                                style={{ marginTop: 20, lineHeight: 1.75, color: '#cfeff5', fontSize: '16px', position: 'relative', zIndex: 1 }}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Use AI to uncover better saving opportunities, protect your money, and make smarter decisions with every transaction.
                            </motion.p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 32, position: 'relative', zIndex: 1 }}>
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
                                    padding: 28, 
                                    borderRadius: 20, 
                                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.5)'
                                }}
                            >
                                <h3 style={{ fontSize: '20px', margin: 0, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💡 Financial Insight</h3>
                                <p style={{ color: '#475569', marginTop: 12, lineHeight: 1.5 }}>Your latest spending snapshot with AI guidance.</p>
                                <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
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
                                                padding: 16, 
                                                background: insight.type === 'warning' ? '#fef2f2' : '#f0fdf4', 
                                                borderRadius: 16,
                                                border: `1px solid ${insight.type === 'warning' ? '#fecaca' : '#bbf7d0'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: '14px', color: insight.type === 'warning' ? '#dc2626' : '#059669' }}>
                                                {insight.title}
                                            </div>
                                            <div style={{ marginTop: 6, color: '#64748b', fontSize: '12px' }}>{insight.subtitle}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                            
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                style={{ 
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))', 
                                    padding: 28, 
                                    borderRadius: 20, 
                                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.5)'
                                }}
                            >
                                <h3 style={{ fontSize: '20px', margin: 0, background: 'linear-gradient(135deg, #0A9396, #0B1F3A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💳 Financial Overview</h3>
                                <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
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
                                                padding: 16, 
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
                                                <div style={{ fontSize: '20px' }}>{stat.icon}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>{stat.label}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '16px', color: stat.color }}>{stat.value}</div>
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
                    style={{ padding: '80px 20px', background: '#f8fafc' }}
                >
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '60px' }}
                        >
                            <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#0B1F3A', marginBottom: '20px' }}>
                                {aboutData.title}
                            </h2>
                            <p style={{ fontSize: '20px', color: '#64748b', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
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
                                        background: 'white', 
                                        padding: '40px', 
                                        borderRadius: '20px', 
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0A9396', marginBottom: '16px' }}>
                                        {value.title}
                                    </h3>
                                    <p style={{ color: '#64748b', lineHeight: 1.6 }}>
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
                                    <div style={{ color: '#64748b', fontSize: '16px' }}>
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Services Section */}
            {servicesData && (
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    style={{ padding: '80px 20px', background: 'white' }}
                >
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '60px' }}
                        >
                            <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#0B1F3A', marginBottom: '20px' }}>
                                {servicesData.title}
                            </h2>
                            <p style={{ fontSize: '20px', color: '#64748b', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                                {servicesData.description}
                            </p>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                            {servicesData.services?.map((service: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02, y: -8 }}
                                    style={{ 
                                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
                                        padding: '40px', 
                                        borderRadius: '20px', 
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0B1F3A', marginBottom: '16px' }}>
                                        {service.title}
                                    </h3>
                                    <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                                        {service.description}
                                    </p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {service.features?.map((feature: string, idx: number) => (
                                            <li key={idx} style={{ color: '#059669', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '8px' }}>✓</span> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

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

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                            {contactData.contactMethods?.map((method: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.05, y: -8 }}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.1)', 
                                        padding: '40px', 
                                        borderRadius: '20px', 
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                                        {method.icon === 'phone' && <Phone size={48} />}
                                        {method.icon === 'email' && <Mail size={48} />}
                                        {method.icon === 'whatsapp' && <MessageCircle size={48} />}
                                        {method.icon === 'location' && <MapPin size={48} />}
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                                        {method.type}
                                    </h3>
                                    <p style={{ color: '#cfeff5', fontSize: '18px', marginBottom: '8px' }}>
                                        {method.value}
                                    </p>
                                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                        {method.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

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
                                            {social.platform === 'Facebook' && <Share2 size={24} />}
                                            {social.platform === 'Twitter' && <MessageSquare size={24} />}
                                            {social.platform === 'LinkedIn' && <Globe size={24} />}
                                            {social.platform === 'Instagram' && <Globe size={24} />}
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
