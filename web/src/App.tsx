import React from 'react';
import './imigongo.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { BankingProvider } from './context/BankingContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import CompleteProfile from './pages/CompleteProfile';
import SetSecurity from './pages/SetSecurity';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';
import RouteGuard from './components/RouteGuard';
import LoanApplication from './pages/LoanApplication';
import LoanStatus from './pages/LoanStatus';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import RiskResult from './pages/RiskResult';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Reports from './pages/Reports';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Payments from './pages/Payments';
import Savings from './pages/Savings';
import AIInsights from './pages/AIInsights';
import AIChatbot from './components/AIChatbot';
import About from './pages/About';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Security from './pages/Security';
import ApiDocs from './pages/ApiDocs';
import Careers from './pages/Careers';
import PersonalBanking from './pages/PersonalBanking';
import BusinessBanking from './pages/BusinessBanking';
import Loans from './pages/Loans';
import Investments from './pages/Investments';
import Insurance from './pages/Insurance';
import MarketInsightsPage from './pages/MarketInsightsPage';
import CreditCards from './pages/CreditCards';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <ToastProvider>
                    <NotificationProvider>
                        <BankingProvider>
                            <Router>
                <div className="imigongo-strip-top"></div>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />
                        <Route path="/complete-profile" element={<CompleteProfile />} />
                        <Route path="/set-security" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <SetSecurity />
                            </RouteGuard>
                        } />
                        <Route path="/auth-success" element={<AuthSuccess />} />
                        <Route path="/dashboard" element={
                            <RouteGuard 
                                requireAuth={true} 
                                requireVerification={false} 
                                requireProfile={false} 
                                requirePin={false} 
                            >
                                <Dashboard />
                            </RouteGuard>
                        } />
                        <Route path="/apply-loan" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <LoanApplication />
                            </RouteGuard>
                        } />
                        <Route path="/loan-status" element={<LoanStatus />} />
                        <Route path="/profile" element={
                            <RouteGuard requireAuth={true}>
                                <Profile />
                            </RouteGuard>
                        } />
                        <Route path="/settings" element={
                            <RouteGuard requireAuth={true}>
                                <Settings />
                            </RouteGuard>
                        } />
                        <Route path="/risk-result" element={<RiskResult />} />
                        <Route path="/accounts" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <Accounts />
                            </RouteGuard>
                        } />
                        <Route path="/transactions" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <Transactions />
                            </RouteGuard>
                        } />
                        <Route path="/payments" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <Payments />
                            </RouteGuard>
                        } />
                        <Route path="/savings" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <Savings />
                            </RouteGuard>
                        } />
                        <Route path="/ai-insights" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <AIInsights />
                            </RouteGuard>
                        } />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/security" element={<Security />} />
                        <Route path="/api-docs" element={<ApiDocs />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/personal-banking" element={<PersonalBanking />} />
                        <Route path="/business-banking" element={<BusinessBanking />} />
                        <Route path="/loans" element={<Loans />} />
                        <Route path="/investments" element={<Investments />} />
                        <Route path="/market-insights" element={
                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                <MarketInsightsPage />
                            </RouteGuard>
                        } />
                        <Route path="/insurance" element={<Insurance />} />
                        <Route path="/credit-cards" element={<CreditCards />} />
                        <Route path="/" element={<Landing />} />
                    </Routes>
                    <AIChatbot />
                </div>
                <div className="imigongo-strip-bottom"></div>
            </Router>
                    </BankingProvider>
                </NotificationProvider>
            </ToastProvider>
        </LanguageProvider>
    </ThemeProvider>
    );
}

export default App;
