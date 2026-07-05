import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { otpService } from '../services/otpService';
import { useTheme } from '../context/ThemeContext';
import styles from './Auth.module.css';
import ThreeBody from '../components/ThreeBody';

const parseJSON = (value: string | null) => {
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const VerifyOTP: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [sendStatus, setSendStatus] = useState('');
    const [fallbackOtp, setFallbackOtp] = useState('');
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'EN');
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = (location.state as any)?.from || '/dashboard';
    const locationOtp = (location.state as any)?.otp;

    useEffect(() => {
        document.body.style.backgroundColor = isDark ? '#0f172a' : '#e6f7ff';
    }, [isDark]);

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    useEffect(() => {
        // Get email from location state or localStorage
        const stateEmail = (location.state as any)?.email;
        const storedEmail = localStorage.getItem('userEmail');
        const storedUser = parseJSON(localStorage.getItem('user'));
        const userEmail = storedEmail || storedUser?.email;
        if (stateEmail) {
            setEmail(stateEmail);
            localStorage.setItem('userEmail', stateEmail);
        } else if (userEmail) {
            setEmail(userEmail);
            localStorage.setItem('userEmail', userEmail);
        } else {
            navigate('/register');
        }

        // Use OTP from location state (passed from Register) or restore from localStorage
        if (locationOtp) {
            setFallbackOtp(locationOtp);
            localStorage.setItem('otpData', JSON.stringify({ email: stateEmail || userEmail, otp: locationOtp }));
        } else {
            const storedOtpData = parseJSON(localStorage.getItem('otpData'));
            if (storedOtpData?.otp && storedOtpData?.email === (stateEmail || userEmail)) {
                setFallbackOtp(storedOtpData.otp);
            }
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (!email) return;

        const storedUser = parseJSON(localStorage.getItem('user'));
        if (storedUser?.email_verified) {
            navigate(returnPath);
            return;
        }

        const storedAutoSend = localStorage.getItem('otpAutoSend');
        const hasSentOTP = localStorage.getItem('otpSent') === 'true';
        const shouldAutoSend = !hasSentOTP && (location.state as any)?.autoSend !== false && storedAutoSend !== 'false';
        if (!shouldAutoSend) {
            setSendStatus('Verification code has already been sent to your email.');
            return;
        }

        const sendInitialOTP = async () => {
            setSendStatus('Sending code...');
            try {
                const result = await otpService.sendOTP(email);
                if (result.emailSent === false) {
                    setSendStatus('Email delivery failed. Use the code below to verify.');
                    setFallbackOtp(result.otp || '');
                    localStorage.setItem('otpData', JSON.stringify({ email, otp: result.otp }));
                } else {
                    localStorage.setItem('otpSent', 'true');
                    setSendStatus('A new verification code was sent to your email.');
                }
            } catch (err: any) {
                setSendStatus('Unable to send code automatically. Please use resend.');
                console.error('VerifyOTP auto-send error:', err);
            }
        };

        sendInitialOTP();
    }, [email, location.state, navigate, returnPath]);

    const translations: any = {
        EN: {
            title: 'Verify Email',
            subtitle: 'We sent a 6-digit code to your email',
            emailHintPrefix: 'Please check your inbox for',
            instruction: 'Enter the code below to verify your email',
            otpPlaceholder: 'Enter 6-digit code',
            verifyButton: 'Verify Email',
            resendCode: 'Resend Code',
            didntReceive: "Didn't receive the code?",
            backToRegister: 'Back to Register'
        },
        FR: {
            title: 'Vérifier l\'email',
            subtitle: 'Nous avons envoyé un code à 6 chiffres à votre email',
            emailHintPrefix: 'Vérifiez votre boîte de réception pour',
            instruction: 'Entrez le code ci-dessous pour vérifier votre email',
            otpPlaceholder: 'Entrez le code à 6 chiffres',
            verifyButton: 'Vérifier l\'email',
            resendCode: 'Renvoyer le code',
            didntReceive: 'Vous n\'avez pas reçu le code?',
            backToRegister: 'Retour à l\'inscription'
        },
        RW: {
            title: 'Kugenzana imeri',
            subtitle: 'Twaremye code y\'imibare 6 ku imeri yawe',
            emailHintPrefix: 'Reba mu gasanduku kawe ka email kuri',
            instruction: 'Andika code munsi kugirango ukemure imeri yawe',
            otpPlaceholder: 'Andika code y\'imibare 6',
            verifyButton: 'Kugenzura imeri',
            resendCode: 'Ohereza code nanone',
            didntReceive: 'Ntabwo wabonye code?',
            backToRegister: 'Garuka kuri iyandikishe'
        }
    };

    const t = translations[lang] || translations['EN'];

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError(lang === 'EN' ? 'Please enter a valid 6-digit code' : 
                    lang === 'FR' ? 'Veuillez entrer un code valide à 6 chiffres' : 
                    'Wongere code idukanye y\'imibare 6');
            return;
        }

        setLoading(true);
        try {
            const response = await otpService.verifyOTP(email, otp);
            
            // Store token and user info
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Clear stored email and OTP session state
            localStorage.removeItem('userEmail');
            localStorage.removeItem('otpAutoSend');
            localStorage.removeItem('otpSent');
            
            // Redirect based on user verification status
            if (response.user.profile_completed) {
                if (response.user.pin_set) {
                    navigate(returnPath);
                } else {
                    navigate('/set-security', { state: { from: returnPath } });
                }
            } else {
                navigate('/complete-profile', { state: { from: returnPath } });
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.msg || 
                           (lang === 'EN' ? 'Verification failed' : 
                            lang === 'FR' ? 'La vérification a échoué' : 
                            'Kugenzura byanze');
            if (errorMsg.toLowerCase().includes('already verified')) {
                setSendStatus('Email already verified. Redirecting...');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('otpAutoSend');
                navigate(returnPath);
                return;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSendStatus('Sending code...');
        setResendLoading(true);
        setFallbackOtp('');
        
        try {
            const result = await otpService.sendOTP(email);
            if (result.emailSent === false) {
                setSendStatus('Email delivery failed. Use the code below to verify.');
                setFallbackOtp(result.otp || '');
                localStorage.setItem('otpData', JSON.stringify({ email, otp: result.otp }));
            } else {
                localStorage.setItem('otpSent', 'true');
                setSendStatus('A new verification code was sent to your email.');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.msg || 
                           (lang === 'EN' ? 'Failed to resend code' : 
                            lang === 'FR' ? 'Échec du renvoi du code' : 
                            'Kongera gutanga code byanze');
            setError(errorMsg);
            setSendStatus('');
        } finally {
            setResendLoading(false);
        }
    };

    const cycleLang = () => {
        if (lang === 'EN') setLang('FR');
        else if (lang === 'FR') setLang('RW');
        else setLang('EN');
    };

    return (
            <div className={styles.authContainer}>
                <div className={styles.toggles}>
                    <button onClick={cycleLang} className={styles.toggleBtn}>
                        {lang}
                    </button>
                    <button onClick={toggleTheme} className={styles.toggleBtn}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                </div>
                <div className={styles.container}>
                    <div className={styles.heading}>{t.title}</div>
                    <p className={styles.subtitle}>{t.subtitle}</p>
                    {email && (
                        <p className={styles.emailHint}>
                            {t.emailHintPrefix} <strong>{email}</strong>
                        </p>
                    )}
                    <p className={styles.instruction}>{t.instruction}</p>
                    
                    <form onSubmit={handleVerify} className={styles.form}>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type="text"
                                name="otp"
                                id="otp"
                                placeholder={t.otpPlaceholder}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }}
                            />
                        </div>
                        
                        {sendStatus && !error && <div className={styles.infoMsg}>{sendStatus}</div>}
                        {fallbackOtp && (
                            <div className={styles.fallbackOtp}>
                                Your verification code: <strong>{fallbackOtp}</strong>
                            </div>
                        )}
                        {error && <div className={styles.errorMsg}>{error}</div>}
                        
                        <button 
                            className={styles.loginButton} 
                            type="submit"
                            disabled={loading}
                            style={{ opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loading ? <><ThreeBody size={18} color="#fff" /> Verifying...</> : t.verifyButton}
                        </button>
                    </form>
                    
                    <div className={styles.resendSection}>
                        <span className={styles.resendText}>{t.didntReceive}</span>
                        <button
                            onClick={handleResend}
                            className={styles.resendButton}
                            disabled={resendLoading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            {resendLoading ? <><ThreeBody size={14} color="#0ea5e9" /> Sending...</> : t.resendCode}
                        </button>
                    </div>
                    
                    <div className={styles.backSection}>
                        <button 
                            onClick={() => navigate('/register')}
                            className={styles.backButton}
                        >
                            {t.backToRegister}
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default VerifyOTP;
