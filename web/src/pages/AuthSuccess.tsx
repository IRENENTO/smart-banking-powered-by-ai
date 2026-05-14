import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            localStorage.setItem('token', token);
            const user = JSON.parse(decodeURIComponent(userStr));
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } else {
            const error = searchParams.get('error');
            navigate(`/login?error=${error || 'unknown_error'}`);
        }
    }, [searchParams, navigate]);

    return <div>Authenticating...</div>;
};

export default AuthSuccess;
