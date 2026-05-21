import React from 'react';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ArrowLeftRight, HandCoins, Shield, BrainCircuit,
    LogOut, ChevronRight, Globe
} from 'lucide-react';

export type AdminTab = 'overview' | 'users' | 'transactions' | 'loans' | 'security' | 'ai-analytics' | 'website';

interface AdminLayoutProps {
    selectedTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
    adminName?: string;
    adminEmail?: string;
    adminRole?: string;
    onLogout: () => void;
    children: React.ReactNode;
}

const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { key: 'users', label: 'Users', icon: <Users size={18} /> },
    { key: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
    { key: 'loans', label: 'Loans', icon: <HandCoins size={18} /> },
    { key: 'security', label: 'Security', icon: <Shield size={18} /> },
    { key: 'ai-analytics', label: 'AI Analytics', icon: <BrainCircuit size={18} /> },
    { key: 'website', label: 'Website', icon: <Globe size={18} /> },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({
    selectedTab, onTabChange, adminName, adminEmail, adminRole, onLogout, children
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B1F3A] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#0B1F3A] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden shadow-md">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white">Admin Panel</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">AI Smart Banking</div>
                        </div>
                    </div>
                </div>

                {/* Admin Info */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {adminName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{adminName || 'Admin'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{adminEmail || ''}</div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                            {adminRole === 'super_admin' ? 'Super' : adminRole || 'Admin'}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTab === tab.key
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            {tab.icon}
                            <span className="flex-1 text-left">{tab.label}</span>
                            {selectedTab === tab.key && <ChevronRight size={14} />}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="bg-white dark:bg-[#0B1F3A] border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                            {tabs.find(t => t.key === selectedTab)?.label || 'Dashboard'}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Real-time banking analytics and control center</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        Back to Website
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
};

export default AdminLayout;
