import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { getGreeting } from '../utils/notifications';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { error: toastError, info: toastInfo, success: toastSuccess, warning: toastWarning } = useToast();
    const { addNotification } = useNotifications();
    const location = useLocation();
    const savedRoute = localStorage.getItem('saved_route');
    const returnPath = (location.state as any)?.from || savedRoute || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Try regular user login first
            const res = await authService.login({ email, password });
            
            // Store token and user data
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.removeItem('isAdmin');
            window.dispatchEvent(new Event('auth-change'));

            const userName = res.data.user?.name || 'there';
            addNotification({
              title: `${getGreeting()}, ${userName}!`,
              message: 'You have successfully signed in to your account.',
              type: 'success',
              link: '/dashboard',
            });
            
            const user = res.data.user;
            if (!user.email_verified) {
                localStorage.setItem('userEmail', user.email);
                localStorage.removeItem('otpAutoSend');
                localStorage.removeItem('otpSent');
                navigate('/verify-otp', { state: { email: user.email, from: returnPath } });
            } else if (!user.profile_completed) {
                navigate('/complete-profile', { state: { from: returnPath } });
            } else {
                localStorage.removeItem('saved_route');
                navigate(returnPath);
            }
        } catch (userErr: any) {
            // If user login fails, try admin login
            const errMsg = userErr.response?.data?.msg || userErr.response?.data?.message || '';
            if (errMsg.toLowerCase().includes('invalid credentials') || errMsg.toLowerCase().includes('invalid email')) {
                try {
                    const adminRes = await authService.adminLogin({ email, password });
                    localStorage.setItem('admin_token', adminRes.data.token);
                    localStorage.setItem('admin', JSON.stringify(adminRes.data.admin));
                    localStorage.setItem('isAdmin', 'true');
                    toastSuccess('Admin login successful');
                    navigate('/admin');
                    return;
                } catch (adminErr: any) {
                    const finalMsg = adminErr.response?.data?.error || adminErr.response?.data?.msg || t('Invalid email or password. Please try again.');
                    setError(finalMsg);
                    toastError(finalMsg);
                }
            } else {
                setError(errMsg);
                toastError(errMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#061428] transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    title="Toggle theme"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-[#0B1F3A] rounded-3xl p-8 shadow-xl shadow-blue-500/5 dark:shadow-[#0A9396]/5 border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl group-hover:bg-blue-100 dark:group-hover:bg-[#0A9396]/10 transition-colors pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('Sign In')}</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('Welcome back to AI Smart Banking')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition-all"
                                    type="email"
                                    placeholder={t('E-mail')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    required
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition-all"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('Password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm font-medium text-[#0A9396] hover:text-[#087F82] transition-colors">{t('Forgot Password ?')}</Link>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" variant="primary" className="w-full py-3.5 text-base" isLoading={isLoading}>
                                {t('Sign In')}
                            </Button>
                        </form>

                        <div className="mt-8 text-center space-y-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("Don't have an account?")} <Link to="/register" className="font-bold text-[#0A9396] hover:text-[#087F82] transition-colors">{t('Create Account')}</Link>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                <a href="#" className="hover:underline">{t('Learn user licence agreement')}</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
