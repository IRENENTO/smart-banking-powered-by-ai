import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api';
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

const CompleteProfile: React.FC = () => {
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
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

        if (user.profile_completed) {
            if (user.pin_set) {
                if (user.kyc_status === 'verified') {
                    navigate('/dashboard');
                } else {
                    navigate('/upload-kyc');
                }
            } else {
                navigate('/set-security');
            }
        }
    }, [navigate]);

    const translations: any = {
        EN: {
            title: 'Complete Your Profile',
            subtitle: 'Please provide your personal information',
            dob: 'Date of Birth',
            dobPlaceholder: 'YYYY-MM-DD',
            address: 'Address',
            addressPlaceholder: 'Enter your full address',
            nationalId: 'National ID',
            nationalIdPlaceholder: 'Enter your national ID number',
            profilePicPlaceholder: 'Profile Picture URL (optional)',
            button: 'Complete Profile',
            skipForNow: 'Skip for now'
        },
        FR: {
            title: 'Compléter votre profil',
            subtitle: 'Veuillez fournir vos informations personnelles',
            dob: 'Date de naissance',
            dobPlaceholder: 'JJ-MM-AAAA',
            address: 'Adresse',
            addressPlaceholder: 'Entrez votre adresse complète',
            nationalId: 'Carte d\'identité nationale',
            nationalIdPlaceholder: 'Entrez votre numéro de carte d\'identité nationale',
            profilePicPlaceholder: 'URL de la photo de profil (optionnel)',
            button: 'Compléter le profil',
            skipForNow: 'Passer pour le moment'
        },
        RW: {
            title: 'Kuzamura profil yawe',
            subtitle: 'Nyamunyeshe amakuru yawe yo muri bwite',
            dob: 'Itariki yavutse',
            dobPlaceholder: 'AAAA-MM-YY',
            address: 'Aderesi',
            addressPlaceholder: 'Andika aderesi yawe yose',
            nationalId: 'Indangamuntu',
            nationalIdPlaceholder: 'Andika nomero y\'indangamuntu yawe',
            profilePicPlaceholder: 'URL y\'ifoto (sitingombwa)',
            button: 'Kuzamura profil',
            skipForNow: 'Kureka nonaha'
        }
    };

    const t = translations[lang] || translations['EN'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!dateOfBirth || !address || !nationalId) {
            setError(lang === 'EN' ? 'All fields are required' : 
                    lang === 'FR' ? 'Tous les champs sont requis' : 
                    'Amaro mapi arakenewe');
            return;
        }

        // Date validation
        const dobDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        
        if (age < 18 || age > 120) {
            setError(lang === 'EN' ? 'You must be between 18 and 120 years old' : 
                    lang === 'FR' ? 'Vous devez avoir entre 18 et 120 ans' : 
                    'Ugira hagati y\'imyaka 18 na 120');
            return;
        }

        // National ID validation (basic)
        if (nationalId.length < 6) {
            setError(lang === 'EN' ? 'Please enter a valid national ID' : 
                    lang === 'FR' ? 'Veuillez entrer une carte d\'identité nationale valide' : 
                    'Wongere indangamuntu idukanye neza');
            return;
        }

        setLoading(true);
        try {
            const response = await profileService.completeProfile({ dateOfBirth, address, nationalId, profilePicture });
            const returned = response.data || {};
            const currentUser = parseJSON(localStorage.getItem('user')) || {};
            const updatedUser = {
                ...currentUser,
                ...(returned.user || {}),
                profile_completed: true
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            navigate('/set-security');
        } catch (err: any) {
            const errorMsg = err.response?.data?.msg || 
                           (lang === 'EN' ? 'Failed to complete profile' : 
                            lang === 'FR' ? 'Échec de la complétion du profil' : 
                            'Kuzamura profil byanze');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/set-security');
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
                    
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type="date"
                                name="dateOfBirth"
                                id="dateOfBirth"
                                placeholder={t.dobPlaceholder}
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <input
                                required
                                className={styles.input}
                                type="text"
                                name="address"
                                id="address"
                                placeholder={t.addressPlaceholder}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
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
                                type="text"
                                name="nationalId"
                                id="nationalId"
                                placeholder={t.nationalIdPlaceholder}
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                            />
                        </div>
                        
                        <div className={styles.inputWrapper}>
                            <div className={styles.inputIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <input
                                className={styles.input}
                                type="text"
                                name="profilePicture"
                                id="profilePicture"
                                placeholder={t.profilePicPlaceholder}
                                value={profilePicture}
                                onChange={(e) => setProfilePicture(e.target.value)}
                            />
                        </div>
                        
                        {error && <div className={styles.errorMsg}>{error}</div>}
                        
                        <input 
                            className={styles.loginButton} 
                            type="submit" 
                            value={loading ? 'Saving...' : t.button}
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

export default CompleteProfile;
