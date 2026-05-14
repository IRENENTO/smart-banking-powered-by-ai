import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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

const UploadKYC: React.FC = () => {
    const [idFile, setIdFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [idPreview, setIdPreview] = useState<string>('');
    const [selfiePreview, setSelfiePreview] = useState<string>('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ id: 0, selfie: 0 });
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

        if (user.kyc_status === 'verified') {
            navigate('/dashboard');
        }
    }, [navigate]);

    const translations: any = {
        EN: {
            title: 'Upload KYC Documents',
            subtitle: 'Complete your identity verification',
            instruction: 'Please upload your ID document and a recent selfie',
            idTitle: 'ID Document',
            idPlaceholder: 'Click to upload ID (PDF, JPG, PNG)',
            idFormats: 'Accepted formats: PDF, JPG, PNG (Max 5MB)',
            selfieTitle: 'Selfie Photo',
            selfiePlaceholder: 'Click to upload selfie (JPG, PNG)',
            selfieFormats: 'Accepted formats: JPG, PNG (Max 5MB)',
            button: 'Upload Documents',
            skipForNow: 'Skip for now'
        },
        FR: {
            title: 'Télécharger les documents KYC',
            subtitle: 'Terminez votre vérification d\'identité',
            instruction: 'Veuillez télécharger votre pièce d\'identité et un selfie récent',
            idTitle: 'Pièce d\'identité',
            idPlaceholder: 'Cliquez pour télécharger la pièce d\'identité (PDF, JPG, PNG)',
            idFormats: 'Formats acceptés: PDF, JPG, PNG (Max 5Mo)',
            selfieTitle: 'Photo selfie',
            selfiePlaceholder: 'Cliquez pour télécharger le selfie (JPG, PNG)',
            selfieFormats: 'Formats acceptés: JPG, PNG (Max 5Mo)',
            button: 'Télécharger les documents',
            skipForNow: 'Passer pour le moment'
        },
        RW: {
            title: 'Kohereza inyandiko KYC',
            subtitle: 'Kuzamura kugenzura imibare yawe',
            instruction: 'Nyamunyeshe inyandiko y\'indangamuntu n\'ifoto yawe ya hafi',
            idTitle: 'Inyandiko y\'indangamuntu',
            idPlaceholder: 'Kanda kuri kohereza indangamuntu (PDF, JPG, PNG)',
            idFormats: 'Formats zemewe: PDF, JPG, PNG (Max 5MB)',
            selfieTitle: 'Ifoto ya selfie',
            selfiePlaceholder: 'Kanda kuri kohereza selfie (JPG, PNG)',
            selfieFormats: 'Formats zemewe: JPG, PNG (Max 5MB)',
            button: 'Kohereza inyandiko',
            skipForNow: 'Kureka nonaha'
        }
    };

    const t = translations[lang] || translations['EN'];

    const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setError(lang === 'EN' ? 'Please upload a valid file (PDF, JPG, PNG)' : 
                        lang === 'FR' ? 'Veuillez télécharger un fichier valide (PDF, JPG, PNG)' : 
                        'Kohereza idosiye idukanye (PDF, JPG, PNG)');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError(lang === 'EN' ? 'File size must be less than 5MB' : 
                        lang === 'FR' ? 'La taille du fichier doit être inférieure à 5Mo' : 
                        'Ingano y\'idosiye igira kuri munsi ya 5MB');
                return;
            }

            setIdFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setIdPreview(e.target?.result as string);
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setError(lang === 'EN' ? 'Please upload a valid image file (JPG, PNG)' : 
                        lang === 'FR' ? 'Veuillez télécharger une image valide (JPG, PNG)' : 
                        'Kohereza ifoto idukanye (JPG, PNG)');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError(lang === 'EN' ? 'File size must be less than 5MB' : 
                        lang === 'FR' ? 'La taille du fichier doit être inférieure à 5Mo' : 
                        'Ingano y\'idosiye igira kuri munsi ya 5MB');
                return;
            }

            setSelfieFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setSelfiePreview(e.target?.result as string);
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!idFile || !selfieFile) {
            setError(lang === 'EN' ? 'Both ID document and selfie are required' : 
                    lang === 'FR' ? 'La pièce d\'identité et le selfie sont requis' : 
                    'Indangamuntu n\'ifoto ya selfie byombi arakenewe');
            return;
        }

        setLoading(true);
        setUploadProgress({ id: 0, selfie: 0 });

        try {
            const formData = new FormData();
            formData.append('idDocument', idFile);
            formData.append('selfie', selfieFile);

            const response = await api.post('/kyc/upload', 
                formData,
                { 
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress({ 
                                id: progress < 50 ? progress * 2 : 100, 
                                selfie: progress >= 50 ? (progress - 50) * 2 : 0 
                            });
                        }
                    }
                }
            );

            const currentUser = parseJSON(localStorage.getItem('user')) || {};
            const updatedUser = { ...currentUser, kyc_status: 'pending' };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            const errorMsg = err.response?.data?.msg || 
                           (lang === 'EN' ? 'Failed to upload documents' : 
                            lang === 'FR' ? 'Échec du téléchargement des documents' : 
                            'Kohereza inyandiko byanze');
            setError(errorMsg);
        } finally {
            setLoading(false);
            setUploadProgress({ id: 0, selfie: 0 });
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
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
                        <div className={styles.uploadSection}>
                            <div className={styles.uploadTitle}>{t.idTitle}</div>
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    id="idFile"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleIdFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="idFile" className={styles.uploadLabel}>
                                    {idPreview ? (
                                        <img src={idPreview} alt="ID Preview" className={styles.previewImage} />
                                    ) : (
                                        <div className={styles.uploadPlaceholder}>
                                            <svg viewBox="0 0 24 24" className={styles.uploadIcon}>
                                                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                                            </svg>
                                            <span>{t.idPlaceholder}</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                            <p className={styles.formatsText}>{t.idFormats}</p>
                            {loading && uploadProgress.id > 0 && (
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progressFill} 
                                        style={{ width: `${uploadProgress.id}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className={styles.uploadSection}>
                            <div className={styles.uploadTitle}>{t.selfieTitle}</div>
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    id="selfieFile"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleSelfieFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="selfieFile" className={styles.uploadLabel}>
                                    {selfiePreview ? (
                                        <img src={selfiePreview} alt="Selfie Preview" className={styles.previewImage} />
                                    ) : (
                                        <div className={styles.uploadPlaceholder}>
                                            <svg viewBox="0 0 24 24" className={styles.uploadIcon}>
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            <span>{t.selfiePlaceholder}</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                            <p className={styles.formatsText}>{t.selfieFormats}</p>
                            {loading && uploadProgress.selfie > 0 && (
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progressFill} 
                                        style={{ width: `${uploadProgress.selfie}%` }}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {error && <div className={styles.errorMsg}>{error}</div>}
                        
                        <input 
                            className={styles.loginButton} 
                            type="submit" 
                            value={loading ? 'Uploading...' : t.button}
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

export default UploadKYC;
