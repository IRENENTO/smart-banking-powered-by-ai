import React from 'react';
import Navbar from './Navbar';
import { useTranslation } from 'react-i18next';

type AppShellProps = {
  title: string;
  subtitle?: string;
  videoSrc?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
};

const AppShell: React.FC<AppShellProps> = ({ title, subtitle, children, headerRight }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#061428] transition-colors duration-300">
      <Navbar authenticated={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t(title)}</h1>
            {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t(subtitle)}</p>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
        <div className="grid gap-6">
            {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;
