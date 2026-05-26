import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '80px', margin: '0', color: '#0A9396' }}>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/" style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#0A9396',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px'
            }}>
                Go to Dashboard
            </Link>
        </div>
    );
};

export default NotFound;