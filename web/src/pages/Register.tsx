import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { calculateProfileLevel, getGreeting } from '../utils/notifications';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';

const Register: React.FC = () => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = (location.state as any)?.from || '/dashboard';
    const { theme, toggleTheme } = useTheme();
    const { addNotification } = useNotifications();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.register({ name, email, phone, password });
            const returned = response.data || {};
            if (returned.token && returned.user) {
                localStorage.setItem('token', returned.token);
                localStorage.setItem('user', JSON.stringify(returned.user));
                window.dispatchEvent(new Event('auth-change'));
                localStorage.setItem('userEmail', returned.user.email || email);
                localStorage.setItem('otpAutoSend', 'false');
                localStorage.removeItem('otpSent');
                const profileLevel = calculateProfileLevel(returned.user);
                addNotification({
                    title: `${getGreeting()}, ${returned.user.name || 'there'}!`,
                    message: `Account created successfully. Profile level: ${profileLevel.label} (${profileLevel.level}/4). Please verify your email to continue.`,
                    type: 'success',
                    link: '/dashboard',
                });
                const navState: any = { email: returned.user.email || email, from: returnPath, autoSend: false };
                if (returned.emailSent === false && returned.otp) navState.otp = returned.otp;
                navigate('/verify-otp', { state: navState });
            } else {
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
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
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('Create Account')}</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('Join AI Smart Banking today')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Full Name */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <User size={20} />
                                </div>
                                <input
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition-all"
                                    type="text"
                                    placeholder={t('Full Name')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* Email */}
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

                            {/* Phone */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Phone size={20} />
                                </div>
                                <input
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition-all"
                                    type="tel"
                                    placeholder={t('Phone Number')}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            {/* Password */}
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

                            {/* Confirm Password */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    required
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0A9396] focus:border-transparent outline-none transition-all"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder={t('Confirm Password')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" variant="primary" className="w-full py-3.5 text-base mt-1" isLoading={isLoading}>
                                {t('Create Account')}
                            </Button>
                        </form>

                        <div className="mt-8 text-center space-y-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('Already have an account?')} <Link to="/login" className="font-bold text-[#0A9396] hover:text-[#087F82] transition-colors">{t('Sign In')}</Link>
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

export default Register;
