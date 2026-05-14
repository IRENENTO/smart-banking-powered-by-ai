import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import styles from './Auth.module.css';

const parseJSON = (value: string | null) => {
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const SetSecurity: React.FC = () => {
    const [transactionPin, setTransactionPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'EN');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.backgroundColor = isDark ? '#0f172a' : '#e6f7ff';
    }, [isDark]);

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = parseJSON(localStorage.getItem('user'));
        
        if (!token || !user?.email_verified) {
            navigate('/verify-otp');
            return;
        }

        if (!user.profile_completed) {
            navigate('/complete-profile');
            return;
        }

        if (user.pin_set) {
            if (user.kyc_status === 'verified') {
                navigate('/dashboard');
            } else {
                navigate('/upload-kyc');
            }
        }
    }, [navigate]);

    const translations: any = {
        EN: {
            title: 'Set Transaction PIN',
            subtitle: 'Create a 4-digit PIN for your transactions',
            instruction: 'This PIN will be used for all your banking transactions',
            pin: 'Transaction PIN',
            pinPlaceholder: 'Enter 4-digit PIN',
            confirmPin: 'Confirm PIN',
            confirmPinPlaceholder: 'Re-enter 4-digit PIN',
            button: 'Set PIN',
            skipForNow: 'Skip for now'
        },
        FR: {
            title: 'Définir le PIN de transaction',
            subtitle: 'Créez un PIN à 4 chiffres pour vos transactions',
            instruction: 'Ce PIN sera utilisé pour toutes vos transactions bancaires',
            pin: 'PIN de transaction',
            pinPlaceholder: 'Entrez le PIN à 4 chiffres',
            confirmPin: 'Confirmer le PIN',
            confirmPinPlaceholder: 'Ressaisissez le PIN à 4 chiffres',
            button: 'Définir le PIN',
            skipForNow: 'Passer pour le moment'
        },
        RW: {
            title: 'Guhindura PIN y\'ibikorwa',
            subtitle: 'Remere PIN y\'imibare 4 ku mibikorwa yawe',
            instruction: 'Iyi PIN izakoreshwa muri ibikorwa byose bwa banki',
            pin: 'PIN y\'ibikorwa',
            pinPlaceholder: 'Andika PIN y\'imibare 4',
            confirmPin: 'Emeza PIN',
            confirmPinPlaceholder: 'Subiramo nanone PIN y\'imibare 4',
            button: 'Guhindura PIN',
            skipForNow: 'Kureka nonaha'
        }
    };

    const t = translations[lang] || translations['EN'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!transactionPin || !confirmPin) {
            setError(lang === 'EN' ? 'Both PIN fields are required' : 
                    lang === 'FR' ? 'Les deux champs PIN sont requis' : 
                    'Amaro mapi ya PIN arakenewe');
            return;
        }

        if (transactionPin.length !== 4) {
            setError(lang === 'EN' ? 'PIN must be exactly 4 digits' : 
                    lang === 'FR' ? 'Le PIN doit comporter exactement 4 chiffres' : 
                    'PIN igomba kugira imibare 4 gusa');
            return;
        }

        if (!/^\d{4}$/.test(transactionPin)) {
            setError(lang === 'EN' ? 'PIN must contain only numbers' : 
                    lang === 'FR' ? 'Le PIN doit contenir uniquement des chiffres' : 
                    'PIN igira imibare gusa');
            return;
        }

        if (transactionPin !== confirmPin) {
            setError(lang === 'EN' ? 'PINs do not match' : 
                    lang === 'FR' ? 'Les PIN ne correspondent pas' : 
                    'Amagambo banga ntabwo ahura');
            return;
        }

        // Avoid common PINs
        const commonPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234'];
        if (commonPins.includes(transactionPin)) {
            setError(lang === 'EN' ? 'Please choose a more secure PIN' : 
                    lang === 'FR' ? 'Veuillez choisir un PIN plus sécurisé' : 
                    'Hitamo PIN yizira ibyabangamire');
            return;
        }

        setLoading(true);
        try {
            const response = await securityService.setPin(transactionPin);

            const currentUser = parseJSON(localStorage.getItem('user')) || {};
            const updatedUser = { ...currentUser, pin_set: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            navigate('/upload-kyc');
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError(lang === 'EN' ? 'Session expired. Please log in again.' : 
                         lang === 'FR' ? 'Session expirée. Veuillez vous reconnecter.' : 
                         'Igihe cyarangiriye. Nyamuneka winjire ukundi.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            const errorMsg = err.response?.data?.msg || 
                           (lang === 'EN' ? 'Failed to set PIN' : 
                            lang === 'FR' ? 'Échec de la définition du PIN' : 
                            'Guhindura PIN byanze');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/upload-kyc');
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
                    <p className={styles.instruction}>{t.instruction}</p>
                    
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type={showPin ? 'text' : 'password'}
                                name="transactionPin"
                                id="transactionPin"
                                placeholder={t.pinPlaceholder}
                                value={transactionPin}
                                onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }}
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={() => setShowPin(!showPin)}
                            >
                                {showPin ? (
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
                                type={showConfirmPin ? 'text' : 'password'}
                                name="confirmPin"
                                id="confirmPin"
                                placeholder={t.confirmPinPlaceholder}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }}
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={() => setShowConfirmPin(!showConfirmPin)}
                            >
                                {showConfirmPin ? (
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
                        
                        {error && <div className={styles.errorMsg}>{error}</div>}
                        
                        <input 
                            className={styles.loginButton} 
                            type="submit" 
                            value={loading ? 'Setting PIN...' : t.button}
                            disabled={loading}
                        />
                    </form>
                    
                    <div className={styles.resendSection}>
                        <button
                            onClick={handleSkip}
                            className={styles.resendButton}
                            disabled={loading}
                        >
                            {t.skipForNow}
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default SetSecurity;
