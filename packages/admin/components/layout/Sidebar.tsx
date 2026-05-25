'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/devices', label: 'Devices', icon: '📱' },
  { href: '/users', label: 'Users', icon: '👥' },
  { href: '/alerts', label: 'Alerts', icon: '🔔' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/gallery', label: 'Gallery', icon: '📸' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-[#13131A] border-r border-glass-border p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-lg">🛡️</span>
        </div>
        <div>
          <h1 className="text-primary font-bold text-lg">Sentinel</h1>
          <p className="text-gray-500 text-xs">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-glass-light'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-glass-border pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-accent hover:bg-accent/10 w-full transition-colors"
        >
          <span>🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
