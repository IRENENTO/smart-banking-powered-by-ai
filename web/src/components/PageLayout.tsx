import React from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer';
import Navbar from './Navbar';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 40 }}
        >
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            margin: 0,
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              color: '#64748b',
              marginTop: 12,
              fontSize: '16px',
              lineHeight: 1.6
            }}>
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PageLayout;
