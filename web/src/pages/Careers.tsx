import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Briefcase, Users, Code } from 'lucide-react';

const Careers: React.FC = () => {
  const jobs = [
    {
      icon: Code,
      title: 'Software Developer',
      description: 'Build scalable banking systems with modern tech stack',
      requirements: ['3+ years experience', 'React/Node.js', 'Database design']
    },
    {
      icon: Brain,
      title: 'Data Scientist',
      description: 'Develop AI models for loan approval and risk assessment',
      requirements: ['ML/AI expertise', 'Python/TensorFlow', 'Financial data experience']
    },
    {
      icon: Users,
      title: 'UI/UX Designer',
      description: 'Create intuitive interfaces for financial applications',
      requirements: ['Design portfolio', 'Figma expertise', 'Mobile design experience']
    }
  ];

  return (
    <PageLayout 
      title="Join Our Team"
      subtitle="Help us revolutionize banking in Rwanda"
    >
      <div style={{ display: 'grid', gap: 40 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, #0A9396, #059669)',
            color: 'white',
            padding: '30px',
            borderRadius: 12
          }}
        >
          <h2 style={{ marginTop: 0 }}>We're Hiring!</h2>
          <p style={{ lineHeight: 1.8, fontSize: '16px' }}>
            AI Smart Banking is growing fast and we're looking for talented individuals who are passionate about fintech and innovation. 
            Join our team and help us make banking more accessible and intelligent.
          </p>
        </motion.div>

        {/* Open Positions */}
        <div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 24 }}>Open Positions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {jobs.map((job, idx) => {
              const Icon = job.icon;
              return (
                <motion.div
                  key={job.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: 12,
                    boxShadow: '0 4px 15px rgba(10, 147, 150, 0.1)',
                    border: '1px solid rgba(10, 147, 150, 0.1)'
                  }}
                >
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #0A9396, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Icon size={24} color="white" />
                  </div>
                  <h3 style={{ color: '#0B1F3A', marginTop: 0, marginBottom: 12 }}>{job.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: 16 }}>
                    {job.description}
                  </p>
                  <h4 style={{ color: '#0B1F3A', fontSize: '13px', marginTop: 16, marginBottom: 8 }}>Requirements:</h4>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {job.requirements.map((req) => (
                      <li key={req} style={{ color: '#64748b', fontSize: '13px', marginBottom: 4 }}>{req}</li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: 12,
            border: '1px solid rgba(10, 147, 150, 0.1)',
            textAlign: 'center'
          }}
        >
          <h2 style={{ color: '#0B1F3A', marginTop: 0 }}>Ready to Apply?</h2>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.8, marginBottom: 24 }}>
            Send your CV and cover letter to <strong>careers@asmartlend.com</strong>
          </p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            We review applications on a rolling basis and will be in touch soon!
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
};

// Placeholder for missing Brain icon
const Brain = Briefcase;

export default Careers;
