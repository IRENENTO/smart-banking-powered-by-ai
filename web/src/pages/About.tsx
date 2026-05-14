import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const features = [
    { title: 'Financial Inclusion', description: 'Making banking accessible to everyone in Rwanda through AI and technology' },
    { title: 'Smart Technology', description: 'Using artificial intelligence to provide smarter financial decisions' },
    { title: 'Security First', description: 'Protecting your data with bank-grade encryption and security measures' }
  ];

  return (
    <PageLayout 
      title="About AI Smart Banking"
      subtitle="AI-powered financial inclusion in Rwanda"
    >
      <div style={{ display: 'grid', gap: 40 }}>
        {/* Vision & Mission */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: 12, boxShadow: '0 4px 15px rgba(10, 147, 150, 0.1)' }}>
            <h2 style={{ color: '#0A9396', marginTop: 0 }}>Our Mission</h2>
            <p style={{ lineHeight: 1.8, color: '#475569', fontSize: '16px' }}>
              AI Smart Banking is dedicated to revolutionizing banking for Rwandans by combining artificial intelligence with financial services. 
              Our platform makes it easy for individuals and businesses to access loans, manage savings, and gain financial insights through cutting-edge AI technology.
            </p>
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Why Choose AI Smart Banking?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: 12,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                  borderLeft: '4px solid #0A9396'
                }}
              >
                <h3 style={{ color: '#0A9396', marginTop: 0 }}>{feature.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform Overview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div style={{ background: 'linear-gradient(135deg, #0A9396 0%, #059669 100%)', color: 'white', padding: '30px', borderRadius: 12 }}>
            <h2 style={{ marginTop: 0 }}>Smart Banking for Everyone</h2>
            <p style={{ lineHeight: 1.8, fontSize: '16px' }}>
              Whether you're an individual looking for quick loans, a business seeking growth capital, or someone wanting to optimize your savings, 
              AI Smart Banking provides intelligent solutions tailored to your financial needs. Our AI evaluates your financial profile to provide 
              personalized recommendations and instant loan approvals.
            </p>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default About;
