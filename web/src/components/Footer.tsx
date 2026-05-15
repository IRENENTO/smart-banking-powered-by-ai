import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Mail, Phone, Globe, MessageCircle, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const { t } = useLanguage();

    return (
        <motion.footer
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{
                background: 'linear-gradient(135deg, #0B1F3A 0%, #0A9396 100%)',
                color: 'white',
                padding: '60px 20px 30px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated background elements */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-20%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                }}
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-20%',
                    width: '50%',
                    height: '50%',
                    background: 'radial-gradient(circle, rgba(244,162,97,0.05) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    pointerEvents: 'none'
                }}
            />

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 40, marginBottom: 40 }}>
                    {/* Company Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: 'linear-gradient(135deg, #4ECDC4, #94D3AC)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(78, 205, 196, 0.3)'
                                }}
                            >
                                <Sparkles size={20} className="text-white" />
                            </motion.div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{t('footer.company')}</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{t('footer.tagline')}</p>
                            </div>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontSize: '14px' }}>
                            {t('footer.description')}
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            {[
                                { icon: Globe, label: 'Website' },
                                { icon: MessageCircle, label: 'Social' },
                                { icon: Users, label: 'Community' }
                            ].map((social, index) => (
                                <motion.button
                                    key={social.label}
                                    whileHover={{ scale: 1.1, y: -4 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    title={social.label}
                                >
                                    <social.icon size={16} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600 }}>{t('footer.quickLinks')}</h4>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {[
                                { label: 'About Us', path: '/about' },
                                { label: 'Features', path: '/features' },
                                { label: 'Pricing', path: '/pricing' },
                                { label: 'Security', path: '/security' },
                                { label: 'API Docs', path: '/api-docs' },
                                { label: 'Careers', path: '/careers' }
                            ].map((link) => (
                                <motion.div
                                    key={link.label}
                                    whileHover={{ x: 8 }}
                                >
                                    <Link
                                        to={link.path}
                                        style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                        }}
                                    >
                                        <span style={{ fontSize: '10px' }}>»</span>
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Services */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600 }}>{t('footer.services')}</h4>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {[
                                { label: 'Personal Banking', path: '/personal-banking' },
                                { label: 'Business Banking', path: '/business-banking' },
                                { label: 'Loans', path: '/loans' },
                                { label: 'Investments', path: '/investments' },
                                { label: 'Insurance', path: '/insurance' },
                                { label: 'Credit Cards', path: '/credit-cards' }
                            ].map((service) => (
                                <motion.div
                                    key={service.label}
                                    whileHover={{ x: 8 }}
                                >
                                    <Link
                                        to={service.path}
                                        style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                        }}
                                    >
                                        <span style={{ fontSize: '10px' }}>»</span>
                                        {service.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600 }}>{t('footer.contact')}</h4>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                            >
                                <Mail size={16} />
                                <a
                                    href="mailto:smartbankingpoweredbyai@gmail.com"
                                    style={{
                                        color: 'rgba(255,255,255,0.8)',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                    }}
                                >
                                    smartbankingpoweredbyai@gmail.com
                                </a>
                            </motion.div>
                            <motion.div
                                whileHover={{ x: 4 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                            >
                                <Phone size={16} />
                                <a
                                    href="tel:0787427123"
                                    style={{
                                        color: 'rgba(255,255,255,0.8)',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                    }}
                                >
                                    0787427123
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    viewport={{ once: true }}
                    style={{
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: 30,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 20
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                        <span> {currentYear} AI Smart Banking. {t('footer.rights')}.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                        <span>{t('footer.madeWith')}</span>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Heart size={14} style={{ color: '#ef4444' }} />
                            </motion.div>
                            <span>{t('footer.in')}</span>
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;
