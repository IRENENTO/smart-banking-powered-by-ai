import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calculator, Shield, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, RotateCcw, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { loanService, profileService } from '../services/api';
import * as aiEngine from '../services/aiService';
import { useBanking } from '../context/BankingContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const LoanDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const darkMode = theme === 'dark';
    const toast = useToast();
    const { applyLoan, loading: applying } = useBanking();

    const [loans, setLoans] = useState<any[]>([]);
    const [loadingLoans, setLoadingLoans] = useState(false);
    const [profileCompleted, setProfileCompleted] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        purpose: '',
        duration: '12',
        monthlyIncome: '',
        existingDebt: '',
        sector: 'Employee'
    });
    const [aiPrediction, setAiPrediction] = useState<any>(null);
    const [predicting, setPredicting] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingLoans(true);
            try {
                const [profileRes, loansRes] = await Promise.all([
                    profileService.getProfile(),
                    loanService.getLoans()
                ]);
                setProfileCompleted(profileRes.data.user?.profile_completed || false);
                setLoans(loansRes.data.loans || []);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoadingLoans(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchPrediction = async () => {
        if (!formData.amount || !formData.monthlyIncome) return;
        setPredicting(true);
        try {
            const result = await aiEngine.predictLoan({
                loan_amount: Number(formData.amount),
                income: Number(formData.monthlyIncome),
                expenses: Number(formData.existingDebt) || 0,
            });
            setAiPrediction(result);
        } catch {
            setAiPrediction(null);
        } finally {
            setPredicting(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchPrediction, 800);
        return () => clearTimeout(timer);
    }, [formData.amount, formData.monthlyIncome]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileCompleted) {
            toast.error('Complete profile first');
            return;
        }
        try {
            await applyLoan(formData);
            toast.success('Applied!');
            const resp = await loanService.getLoans();
            setLoans(resp.data.loans || []);
        } catch {
            toast.error('Application failed');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: darkMode ? '#0f172a' : '#eef7fb' }}>
            <Navbar authenticated={!!localStorage.getItem('token')} />
            <div style={{ flex: 1, padding: 32, maxWidth: '1200px', margin: '0 auto' }}>
                <h1>Loan Dashboard</h1>
                {/* Simplified Merge: Apply form and History grid */}
                <SectionCard title="Apply for Loan">
                    <form onSubmit={handleSubmit}>
                        {/* Form fields here */}
                        <input placeholder="Amount" onChange={e => setFormData({...formData, amount: e.target.value})} />
                        <LoadingButton type="submit">Apply</LoadingButton>
                    </form>
                </SectionCard>
                <div style={{ marginTop: 32 }}>
                    <h2>Loan History</h2>
                    {loans.map(loan => (
                        <div key={loan.id}>{loan.purpose} - {loan.status}</div>
                    ))}
            <Footer />
        </div>
            </div>
        </div>
    );
};

export default LoanDashboard;
