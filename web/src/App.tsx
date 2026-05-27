import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './imigongo.css';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { BankingProvider } from './context/BankingContext';
import ErrorBoundary from './components/ErrorBoundary';
import RouteGuard from './components/RouteGuard';
import AIChatbot from './components/AIChatbot';
import AutoLogout from './components/AutoLogout';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const SetSecurity = lazy(() => import('./pages/SetSecurity'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
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

// Loading component
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        color: '#64748b' 
    }}>
        Loading...
    </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('admin_token');
    
    if (adminOnly) {
        if (!adminToken) {
            return <Navigate to="/admin/login" replace />;
        }
        return <>{children}</>;
    }
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};

function App() {
    return (
        <HashRouter>
            <ThemeProvider>
                <LanguageProvider>
                    <ToastProvider>
                        <NotificationProvider>
                            <BankingProvider>
                                <AutoLogout />
                                <div className="imigongo-strip-top"></div>
                                <div className="App">
                                    <ErrorBoundary>
                                        <Suspense fallback={<LoadingFallback />}>
                                            <Routes>
                                                {/* Public Routes */}
                                                <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
                                                <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
                                                <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
                                                <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
                                                <Route path="/verify-otp" element={<ErrorBoundary><VerifyOTP /></ErrorBoundary>} />
                                                <Route path="/complete-profile" element={<ErrorBoundary><CompleteProfile /></ErrorBoundary>} />
                                                <Route path="/admin/login" element={<ErrorBoundary><AdminLogin /></ErrorBoundary>} />
                                                
                                                {/* Protected Routes */}
                                                <Route path="/dashboard" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <Dashboard />
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/set-security" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <SetSecurity />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/profile" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <Profile />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/settings" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <Settings />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/risk-result" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RiskResult />
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/accounts" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <Accounts />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/transactions" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <Transactions />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/payments" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <Payments />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/savings" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <Savings />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/ai-insights" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <AIInsights />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/loans" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <Loans />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/investments" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <Investments />
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/market-insights" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <MarketInsightsPage />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/spending-analysis" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true} requireVerification={true} requireProfile={true}>
                                                                <SpendingAnalysisPage />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                {/* Public Pages */}
                                                <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
                                                <Route path="/features" element={<ErrorBoundary><Features /></ErrorBoundary>} />
                                                <Route path="/pricing" element={<ErrorBoundary><Pricing /></ErrorBoundary>} />
                                                <Route path="/security" element={<ErrorBoundary><Security /></ErrorBoundary>} />
                                                <Route path="/api-docs" element={<ErrorBoundary><ApiDocs /></ErrorBoundary>} />
                                                <Route path="/careers" element={<ErrorBoundary><Careers /></ErrorBoundary>} />
                                                <Route path="/personal-banking" element={<ErrorBoundary><PersonalBanking /></ErrorBoundary>} />
                                                <Route path="/business-banking" element={<ErrorBoundary><BusinessBanking /></ErrorBoundary>} />
                                                <Route path="/credit-cards" element={<ErrorBoundary><CreditCards /></ErrorBoundary>} />
                                                
                                                {/* Protected Settings Routes */}
                                                <Route path="/notifications" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <NotificationsSettings />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/privacy" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <PrivacySettings />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/limits" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <TransactionLimits />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/preferences" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <Preferences />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/cards" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <CardsManagement />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/statements" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <RouteGuard requireAuth={true}>
                                                                <Statements />
                                                            </RouteGuard>
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                {/* Admin Routes */}
                                                <Route path="/admin" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute adminOnly={true}>
                                                            <AdminDashboard />
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/admin/dashboard" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute adminOnly={true}>
                                                            <AdminDashboard />
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                <Route path="/reports" element={
                                                    <ErrorBoundary>
                                                        <ProtectedRoute>
                                                            <Reports />
                                                        </ProtectedRoute>
                                                    </ErrorBoundary>
                                                } />
                                                
                                                {/* Legacy Redirects */}
                                                <Route path="/apply-loan" element={<Navigate to="/loans" replace />} />
                                                <Route path="/loan-status" element={<Navigate to="/loans" replace />} />
                                                
                                                {/* 404 Page - Must be last */}
                                                <Route path="*" element={
                                                    <div style={{ 
                                                        minHeight: '100vh', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        textAlign: 'center',
                                                        padding: '20px'
                                                    }}>
                                                        <h1 style={{ fontSize: '80px', margin: '0', color: '#0A9396' }}>404</h1>
                                                        <h2>Page Not Found</h2>
                                                        <p>The page you're looking for doesn't exist or has been moved.</p>
                                                        <a href="/#/" style={{
                                                            marginTop: '20px',
                                                            padding: '12px 24px',
                                                            background: '#0A9396',
                                                            color: 'white',
                                                            textDecoration: 'none',
                                                            borderRadius: '8px'
                                                        }}>
                                                            Go to Home
                                                        </a>
                                                    </div>
                                                } />
                                            </Routes>
                                        </Suspense>
                                    </ErrorBoundary>
                                    <AIChatbot />
                                </div>
                                <div className="imigongo-strip-bottom"></div>
                            </BankingProvider>
                        </NotificationProvider>
                    </ToastProvider>
                </LanguageProvider>
            </ThemeProvider>
        </HashRouter>
    );
}

export default App;