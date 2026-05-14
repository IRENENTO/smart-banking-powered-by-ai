import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
    profile_completed: boolean;
    pin_set: boolean;
    kyc_status: 'pending' | 'verified' | 'rejected';
}

interface RouteGuardProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireVerification?: boolean;
    requireProfile?: boolean;
    requirePin?: boolean;
    requireKyc?: boolean;
}

const parseJSON = (value: string | null) => {
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const RouteGuard: React.FC<RouteGuardProps> = ({ 
    children, 
    requireAuth = true,
    requireVerification = false,
    requireProfile = false,
    requirePin = false,
    requireKyc = false
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            console.log('RouteGuard checking auth:', { token: !!token, userStr });
            
            if (!token && requireAuth) {
                console.log('No token found, redirecting to landing');
                navigate('/', { state: { from: location.pathname } });
                return;
            }

            if (userStr) {
                const userData = parseJSON(userStr);
                if (!userData) {
                    console.error('Error parsing user data: invalid JSON');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/', { state: { from: location.pathname } });
                    return;
                }

                console.log('User data parsed:', userData);
                setUser(userData);

                if (requireVerification && !userData.email_verified) {
                    console.log('Email not verified, redirecting to verify-otp');
                    navigate('/verify-otp', { state: { from: location.pathname } });
                    return;
                }

                if (requireProfile && !userData.profile_completed) {
                    console.log('Profile not completed, redirecting to complete-profile');
                    navigate('/complete-profile', { state: { from: location.pathname } });
                    return;
                }

                if (requirePin && !userData.pin_set) {
                    console.log('PIN not set, redirecting to set-security');
                    navigate('/set-security', { state: { from: location.pathname } });
                    return;
                }

                if (requireKyc && userData.kyc_status !== 'verified') {
                    console.log('KYC not verified, redirecting to upload-kyc');
                    navigate('/upload-kyc', { state: { from: location.pathname } });
                    return;
                }

                console.log('All checks passed, allowing access');
                setLoading(false);
                return;
            }

            if (requireAuth) {
                console.log('No user data found, redirecting to landing');
                navigate('/', { state: { from: location.pathname } });
                return;
            }

            setLoading(false);
        };

        checkAuth();
    }, [navigate, location, requireAuth, requireVerification, requireProfile, requirePin, requireKyc]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: '#666'
                }}>
                    <div>Loading...</div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RouteGuard;
