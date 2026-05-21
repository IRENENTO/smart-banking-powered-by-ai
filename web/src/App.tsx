import React, { Suspense, lazy } from 'react';
import './imigongo.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { BankingProvider } from './context/BankingContext';
import ErrorBoundary from './components/ErrorBoundary';
import RouteGuard from './components/RouteGuard';
import AIChatbot from './components/AIChatbot';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const SetSecurity = lazy(() => import('./pages/SetSecurity'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// const LoanDashboard = lazy(() => import('./pages/LoanDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Landing = lazy(() => import('./pages/Landing'));
const RiskResult = lazy(() => import('./pages/RiskResult'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Reports = lazy(() => import('./pages/Reports'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Payments = lazy(() => import('./pages/Payments'));
const Savings = lazy(() => import('./pages/Savings'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Security = lazy(() => import('./pages/Security'));
const NotificationsSettings = lazy(() => import('./pages/NotificationsSettings'));
const PrivacySettings = lazy(() => import('./pages/PrivacySettings'));
const TransactionLimits = lazy(() => import('./pages/TransactionLimits'));
const Preferences = lazy(() => import('./pages/Preferences'));
const CardsManagement = lazy(() => import('./pages/CardsManagement'));
const Statements = lazy(() => import('./pages/Statements'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const Careers = lazy(() => import('./pages/Careers'));
const PersonalBanking = lazy(() => import('./pages/PersonalBanking'));
const BusinessBanking = lazy(() => import('./pages/BusinessBanking'));
const Loans = lazy(() => import('./pages/Loans'));
const Investments = lazy(() => import('./pages/Investments'));
const MarketInsightsPage = lazy(() => import('./pages/MarketInsightsPage'));
const CreditCards = lazy(() => import('./pages/CreditCards'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const SpendingAnalysisPage = lazy(() => import('./pages/SpendingAnalysisPage'));

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
                    <ErrorBoundary>
                        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#64748b' }}>Loading...</div>}>
                            <Routes>
                                <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                                <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
                                <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
                                <Route path="/verify-otp" element={<ErrorBoundary><VerifyOTP /></ErrorBoundary>} />
                                <Route path="/complete-profile" element={<ErrorBoundary><CompleteProfile /></ErrorBoundary>} />
                                <Route path="/set-security" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                            <SetSecurity />
                                        </RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/auth-success" element={<ErrorBoundary><AuthSuccess /></ErrorBoundary>} />
                                <Route path="/dashboard" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={false} requireProfile={false} requirePin={false}>
                                            <Dashboard />
                                        </RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/apply-loan" element={<Navigate to="/loans" replace />} />
                                <Route path="/loan-status" element={<Navigate to="/loans" replace />} />
                                <Route path="/profile" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><Profile /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/settings" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><Settings /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/risk-result" element={<ErrorBoundary><RiskResult /></ErrorBoundary>} />
                                <Route path="/accounts" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}><Accounts /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/transactions" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}><Transactions /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/payments" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}><Payments /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/savings" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}><Savings /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/ai-insights" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}><AIInsights /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/admin/login" element={<ErrorBoundary><AdminLogin /></ErrorBoundary>} />
                                <Route path="/admin/dashboard" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                                <Route path="/admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                                <Route path="/reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
                                <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
                                <Route path="/features" element={<ErrorBoundary><Features /></ErrorBoundary>} />
                                <Route path="/pricing" element={<ErrorBoundary><Pricing /></ErrorBoundary>} />
                                <Route path="/security" element={<ErrorBoundary><Security /></ErrorBoundary>} />
                                <Route path="/notifications" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><NotificationsSettings /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/privacy" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><PrivacySettings /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/limits" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><TransactionLimits /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/preferences" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><Preferences /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/cards" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><CardsManagement /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/statements" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true}><Statements /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/api-docs" element={<ErrorBoundary><ApiDocs /></ErrorBoundary>} />
                                <Route path="/careers" element={<ErrorBoundary><Careers /></ErrorBoundary>} />
                                <Route path="/personal-banking" element={<ErrorBoundary><PersonalBanking /></ErrorBoundary>} />
                                <Route path="/business-banking" element={<ErrorBoundary><BusinessBanking /></ErrorBoundary>} />
                                <Route path="/loans" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                            <Loans />
                                        </RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/investments" element={<ErrorBoundary><Investments /></ErrorBoundary>} />
                                <Route path="/market-insights" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}><MarketInsightsPage /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/spending-analysis" element={
                                    <ErrorBoundary>
                                        <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}><SpendingAnalysisPage /></RouteGuard>
                                    </ErrorBoundary>
                                } />
                                <Route path="/credit-cards" element={<ErrorBoundary><CreditCards /></ErrorBoundary>} />
                                <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
                            </Routes>
                        </Suspense>
                    </ErrorBoundary>
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
