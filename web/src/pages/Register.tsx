import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { calculateProfileLevel, getGreeting } from '../utils/notifications';
import styles from './Auth.module.css';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'EN');
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = (location.state as any)?.from || '/dashboard';
    const { theme, toggleTheme } = useTheme();
    const { addNotification } = useNotifications();

    const translations: any = {
        EN: {
            title: 'Create Account',
            name: 'Full Name',
            email: 'E-mail',
            password: 'Password',
            phone: 'Phone Number',
            button: 'Sign Up',
            hasAccount: 'Already have an account?',
            signIn: 'Sign In',
            agreement: 'Learn user licence agreement'
        },
        FR: {
            title: 'Créer un compte',
            name: 'Nom Complet',
            email: 'E-mail',
            password: 'Mot de passe',
            confirm: 'Confirmer le mot de passe',
            phone: 'Numéro de téléphone',
            button: "S'inscrire",
            hasAccount: 'Vous avez déjà un compte ?',
            signIn: 'Se Connecter',
            agreement: "En savoir plus sur l'accord de licence utilisateur"
        },
        RW: {
            title: 'Kora konti',
            name: 'Amazina yose',
            email: 'Imeri',
            password: "Ijambo ry'ibanga",
            confirm: "Mwemeze ijambo ry'ibanga",
            phone: 'Nomero ya telephone',
            button: 'Iyandikishe',
            hasAccount: 'Usanzwe ufite konti?',
            signIn: 'Injira',
            agreement: "Menya amasezerano y'ukoresha"
        }
    };

    const t = translations[lang] || translations['EN'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(lang === 'EN' ? 'Passwords do not match' : lang === 'FR' ? 'Les mots de passe ne correspondent pas' : 'Amagambo banga ntabwo ahura');
            return;
        }

        if (password.length < 8) {
            setError(lang === 'EN' ? 'Password must be at least 8 characters' : lang === 'FR' ? 'Le mot de passe doit comporter au moins 8 caractères' : 'Ijambo banga rigomba kugira inyuguti 8');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(lang === 'EN' ? 'Please enter a valid email address' : lang === 'FR' ? 'Veuillez entrer une adresse e-mail valide' : 'Wongere imeri idukanye neza');
            return;
        }

        // Phone validation
        if (!phone || phone.length < 10) {
            setError(lang === 'EN' ? 'Please enter a valid phone number' : lang === 'FR' ? 'Veuillez entrer un numéro de téléphone valide' : 'Wongere nomero ya telephone idukanye neza');
            return;
        }

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
                navigate('/verify-otp', { state: { email: returned.user.email || email, from: returnPath, autoSend: false } });
            } else {
                navigate('/login');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.msg || 'Registration failed. Please try again.';
            setError(errorMsg);
        }
    };

    const cycleLang = () => {
        if (lang === 'EN') setLang('FR');
        else if (lang === 'FR') setLang('RW');
        else setLang('EN');
    };

    return (
        <div className={theme === 'dark' ? 'dark' : ''}>
            <div className={styles.authContainer}>
                <div className={styles.toggles}>
                    <button onClick={cycleLang} className={styles.toggleBtn}>
                        {lang}
                    </button>
                    <button onClick={toggleTheme} className={styles.toggleBtn}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
                <div className={styles.container}>
                    <div className={styles.heading}>{t.title}</div>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type="text"
                                name="name"
                                id="name"
                                placeholder={t.name}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type="email"
                                name="email"
                                id="email"
                                placeholder={t.email}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                placeholder={t.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder={t.confirm}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24">
                                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type="tel"
                                name="phone"
                                id="phone"
                                placeholder={t.phone}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        {error && <div className={styles.errorMsg}>{error}</div>}
                        <input className={styles.loginButton} type="submit" value={t.button} />
                    </form>
                    <span className={styles.agreement}>
                        {t.hasAccount} <Link to="/login">{t.signIn}</Link>
                    </span>
                    <span className={styles.agreement}>
                        <a href="#">{t.agreement}</a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Register;
